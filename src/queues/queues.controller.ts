import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import { AddToQueueDto } from "src/dto/add-to-queue.dto";
import { QueuePlaceDto } from "src/dto/queue-place.dto";
import { QueueDto } from "src/dto/queue.dto";
import { DataValidationPipe } from "src/pipes/data-validation.pipe";
import { QueueService } from "./queues.service";

@Controller("queues")
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post("add-user")
  async addToQueue(@Body(DataValidationPipe) addToQueueDto: AddToQueueDto) {
    await this.queueService.addToQueue(addToQueueDto);
  }

  @Post("create-queue")
  async createQueue(@Body(DataValidationPipe) queueDto: QueueDto) {
    return this.queueService.createQueue(queueDto);
  }

  @Post("create-place")
  async createPlace(@Body(DataValidationPipe) queuePlaceDto: QueuePlaceDto) {
    return this.queueService.createPlace(queuePlaceDto);
  }

  @Get("get-queues")
  async getQueues() {
    return this.queueService.getAllQueues();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const findedQueue = await this.queueService.findById(id);
    return findedQueue;
  }

  @Delete("remove-place")
  async removePlace() {}

  @Delete("remove-user")
  async removeUser() {}
}
