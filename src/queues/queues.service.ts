import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { AuthService } from "src/auth/auth.service";
import { AddToQueueDto } from "src/dto/add-to-queue.dto";
import { QueuePlaceDto } from "src/dto/queue-place.dto";
import { QueueDto } from "src/dto/queue.dto";
import { Queue, QueueDocument } from "src/schemas/queue.schema";
import { UsersService } from "src/users/users.service";
import { v4 as uuid } from "uuid";

interface Place extends QueueUser {}

interface QueueUser {
  userId: string;
  username: string;
  email: string;
  queue: string;
  phone: string;
  roles: string;
  cancelled: boolean;
  approved: boolean;
  processed: boolean;
  key: string;
  appointment: Date | null;
}
@Injectable()
export class QueueService {
  constructor(
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
    private userService: UsersService,
    private authService: AuthService
  ) {}

  async addToQueue(addToQueueDto: AddToQueueDto) {
    const user = await this.userService.findOne(addToQueueDto.username);
    const queue = await this.queueModel.findById(addToQueueDto.queue).exec();
    if (!user || !queue) {
      throw new ForbiddenException("Queue or User isn`t exists");
    }
    // TODO: MAKE CHECK FOR REQUIRED ROLE (USER/CLIENT)
    const queueUser: QueueUser = {
      username: user.username,
      email: user.email,
      phone: user.phone,
      userId: user._id.toString(),
      queue: queue._id.toString(),
      roles: user.roles,
      cancelled: user.cancelled,
      approved: user.approved,
      processed: user.processed,
      key: user.key,
      appointment: user.appointment,
    };
    console.log(queueUser);
    const queueUsers: QueueUser[] = queue.usersQueue;
    this.isUserOrPlaceExists(
      queueUsers,
      queueUser,
      "This user already exists in this queue"
    );
    queueUsers.push(queueUser);
    const updatedQueue = await this.queueModel.findByIdAndUpdate(queue._id, {
      usersQueue: [...queueUsers],
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
    const queue = await this.queueModel.findById(queuePlaceDto.queue).exec();
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
      queue: queue._id.toString(),
      userId: employee._id.toString(),
      roles: employee.roles,
      cancelled: employee.cancelled,
      approved: employee.approved,
      processed: employee.processed,
      key: employee.key,
      appointment: employee.appointment,
    };
    place.queue = queue._id.toString();
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
    return this.queueModel.findById(id);
  }
}
