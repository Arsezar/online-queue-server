import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { AddToQueueDto } from "src/dto/add-to-queue.dto";
import { QueuePlaceDto } from "src/dto/queue-place.dto";
import { QueueDto } from "src/dto/queue.dto";
import { RolesService } from "src/roles/roles.service";
import { Queue, QueueDocument } from "src/schemas/queue.schema";
import { UsersService } from "src/users/users.service";

interface Place {
  username: string;
  email: string;
  userId: ObjectId;
  queueName: string;
  phone: string;
}

interface QueueUser extends Place {}
@Injectable()
export class QueueService {
  constructor(
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
    private userService: UsersService
  ) {}

  async addToQueue(addToQueueDto: AddToQueueDto) {
    const user = await this.userService.findOne(addToQueueDto.username);
    const queue = await this.queueModel
      .findOne({
        name: addToQueueDto.queueName,
      })
      .exec();
    if (!user || !queue) {
      throw new ForbiddenException("Queue or User isn`t exists");
    }
    const queueUser: QueueUser = {
      username: addToQueueDto.username,
      email: addToQueueDto.email,
      userId: addToQueueDto.userId,
      queueName: addToQueueDto.queueName,
      phone: addToQueueDto.phone,
    };
    const queueUsers: QueueUser[] = queue.usersQueue;
    this.isUserOrPlaceExists(
      queueUsers,
      queueUser,
      "This user already exists in this queue"
    );
    queueUsers.push(queueUser);
    const updatedQueue = await this.queueModel.findOneAndUpdate(
      { name: addToQueueDto.queueName },
      { usersQueue: [...queue.usersQueue, ...queueUsers] }
    );
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
    const queue = await this.queueModel
      .findOne({ name: queuePlaceDto.queueName })
      .exec();
    if (!queue)
      throw new HttpException(
        "Queue with this name doesn`t exist",
        HttpStatus.BAD_REQUEST
      );
    const place: Place = {
      username: queuePlaceDto.username,
      email: queuePlaceDto.email,
      userId: queuePlaceDto.userId,
      queueName: queuePlaceDto.queueName,
      phone: queuePlaceDto.phone,
    };
    const places: Place[] = queue.places;
    this.isUserOrPlaceExists(places, place, "This place already exists");
    places.push(place);
    const updatedQueue = await this.queueModel.findOneAndUpdate(
      { name: queuePlaceDto.queueName },
      { places: [...queue.places, ...places] }
    );
    return updatedQueue;
  }

  isUserOrPlaceExists(array: any[], object: any, message: string) {
    array.forEach((placeObject) => {
      if (
        placeObject.userId === object.userId ||
        placeObject.email === object.email ||
        placeObject.phone === object.phone ||
        placeObject.username === object.username
      ) {
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
    });
  }
}
