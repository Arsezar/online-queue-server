import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthService } from "src/auth/auth.service";
import { AddClientToQueueDto } from "src/dto/add-client-to-queue.dto";
import { AddPlaceToQueue } from "src/dto/add-place-to-queue.dto";
import { QueuePlaceDto } from "src/dto/queue-place.dto";
import { QueueDto } from "src/dto/queue.dto";
import { UserDeleteDto } from "src/dto/user-delete.dto";
import { RolesService } from "src/roles/roles.service";
import { Queue, QueueDocument } from "src/schemas/queue.schema";
import { UsersService } from "src/users/users.service";
import { v4 as uuid } from "uuid";

interface Place {
  username: string;
  email: string;
  phone: string;
  userId: string;
  queueId: string;
  roles: string;
  key: string;
}

interface Appointment {
  place: string;
  time: Date;
}

interface Client extends Place {
  cancelled: boolean;
  approved: boolean;
  processed: boolean;
  appointment: Appointment | null;
}
@Injectable()
export class QueueService {
  constructor(
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
    private userService: UsersService,
    private authService: AuthService,
    private rolesService: RolesService
  ) {}

  async addClientToQueue(addClientToQueueDto: AddClientToQueueDto) {
    const user = await this.userService.findOne(addClientToQueueDto.username);
    const queue = await this.queueModel
      .findById(addClientToQueueDto.queueId)
      .exec();
    if (!user || !queue) {
      throw new ForbiddenException("Queue or Client isn`t exists");
    }
    // TODO: MAKE CHECK FOR APPOINTMENT DATA (PLACE EXISTEMENT AND DATE CORRECTNESS)
    const client: Client = {
      username: user.username,
      email: user.email,
      phone: user.phone,
      userId: user._id.toString(),
      queueId: queue._id.toString(),
      roles: user.roles,
      cancelled: user.cancelled,
      approved: user.approved,
      processed: user.processed,
      key: user.key,
      appointment: {
        time: addClientToQueueDto.appointment.time,
        place: addClientToQueueDto.appointment.place,
      },
    };
    console.log(client);
    const clients: Client[] = queue.clients;
    this.isUserOrPlaceExists(
      clients,
      client,
      "This user already exists in this queue"
    );
    clients.push(client);
    const updatedQueue = await this.queueModel.findByIdAndUpdate(queue._id, {
      clients: [...clients],
    });
    return updatedQueue;
  }

  async addPlaceToQueue(addPlaceToQueue: AddPlaceToQueue) {
    const user = await this.userService.findOne(addPlaceToQueue.place);
    const userRole = await this.rolesService.findById(addPlaceToQueue.queueId);
    if (userRole.name !== "employee") {
      throw new ForbiddenException("This user is not an employee");
    }
    const queue = await this.queueModel
      .findById(addPlaceToQueue.queueId)
      .exec();
    if (!user || !queue) {
      throw new ForbiddenException("Queue or Place isn`t exists");
    }
    const place: Place = {
      username: user.username,
      email: user.email,
      phone: user.phone,
      userId: user._id.toString(),
      queueId: queue._id.toString(),
      roles: user.roles,
      key: user.key,
    };
    console.log(place);
    const places: Place[] = queue.clients;
    this.isUserOrPlaceExists(
      places,
      place,
      "This user already exists in this queue"
    );
    places.push(place);
    const updatedQueue = await this.queueModel.findByIdAndUpdate(queue._id, {
      places: [...places],
    });
    return updatedQueue;
  }

  async createQueue(queueDto: QueueDto): Promise<QueueDocument> {
    const isQueueExists = await this.queueModel
      .exists({ name: queueDto.name })
      .exec();
    if (isQueueExists) {
      throw new HttpException(
        "Queue with this name already exists",
        HttpStatus.BAD_REQUEST
      );
    }
    const createdQueue = new this.queueModel(queueDto);
    return createdQueue.save();
  }

  async createPlace(queuePlaceDto: QueuePlaceDto) {
    const queue = await this.queueModel.findById(queuePlaceDto.queueId).exec();
    if (!queue)
      throw new HttpException(
        "Queue with this id doesn`t exist",
        HttpStatus.BAD_REQUEST
      );
    // * ATTENTION: PLACE IS RIGHTFUL USER SO WE CAN USE CREATE METHOD FROM USERSSEVICE AND CHECK IT BY SIGNUP METHOD
    await this.authService.signUp({
      username: queuePlaceDto.username,
      email: queuePlaceDto.email,
      phone: queuePlaceDto.phone,
      roles: queuePlaceDto.roles,
      password: queuePlaceDto.password,
      refreshToken: null,
      cancelled: false,
      approved: false,
      processed: false,
      key: uuid(),
    });
    const employee = await this.authService.employ(queuePlaceDto.username);
    const place: Place = {
      username: employee.username,
      email: employee.email,
      phone: employee.phone,
      queueId: queue._id.toString(),
      userId: employee._id.toString(),
      roles: employee.roles,
      key: employee.key,
    };
    place.queueId = queue._id.toString();
    const places: Place[] = queue.places;
    this.isUserOrPlaceExists(places, place, "This place already exists");
    places.push(place);
    const updatedQueue = await this.queueModel.findByIdAndUpdate(queue._id, {
      places: [...places],
    });
    return updatedQueue;
  }

  isUserOrPlaceExists(array: any[], object: any, message: string) {
    array.forEach((placeObject) => {
      if (
        placeObject.email === object.email ||
        placeObject.phone === object.phone ||
        placeObject.username === object.username
      ) {
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
    });
  }

  async getAllQueues() {
    const queues = await this.queueModel.find();
    return queues;
  }

  async findById(id: string): Promise<QueueDocument> {
    return await this.queueModel.findById(id).exec();
  }

  // TODO: DEVELOP CORRECT CLEAR OF ALL QUEUE DATA FROM CLIENTS AND PLACES
  async deleteQueue(id: string) {
    return await this.queueModel.findByIdAndDelete(id).exec();
  }

  async deletePlace(userDeleteDto: UserDeleteDto) {
    console.log(userDeleteDto.queueId);
    // try {
    const queue = await this.queueModel.findById(userDeleteDto.queueId).exec();
    console.dir(queue);
    const places = queue.places;
    console.dir(places);
    const index = places.findIndex(
      (place) => place["userId"] === userDeleteDto.userId
    );
    if (index === -1) {
      throw new ForbiddenException("Place is not exist");
    }
    places.splice(index, 1);
    console.log(places);
    const updatedQueue = await this.queueModel.findByIdAndUpdate(queue._id, {
      places: [...places],
    });
    return updatedQueue;
    // } catch (error) {
    // console.dir(error);
    throw new ForbiddenException("Wrong credentials provided");
    // }
  }

  async deleteClient(userDeleteDto: UserDeleteDto) {
    try {
      const queue = await this.queueModel
        .findById(userDeleteDto.queueId)
        .exec();
      console.log(queue);
      const clients = queue.clients;
      const index = clients.findIndex(
        (client) => client["userId"] === userDeleteDto.userId
      );
      if (index === -1) {
        throw new ForbiddenException("Client is not exist");
      }
      clients.splice(index, 1);
      console.log(clients);
      const updatedQueue = await this.queueModel.findByIdAndUpdate(queue._id, {
        clients: [...clients],
      });
      return updatedQueue;
    } catch (error) {
      throw new ForbiddenException("Wrong credentials provided");
    }
  }
}
