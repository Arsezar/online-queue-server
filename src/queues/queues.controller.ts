import { Body, Controller, Delete, Post } from "@nestjs/common";
import { AddToQueueDto } from "src/dto/add-to-queue.dto";
import { QueueService } from "./queues.service";

@Controller("queues")
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post("add-user")
  async addToQueue(@Body() addToQueueDto: AddToQueueDto) {
    await this.queueService.addToQueue(addToQueueDto);
  }

  @Post("create-queue")
  async createQueue() {}

  @Post("create-place")
  async createPlace() {
    return;
  }

  @Delete("remove-place")
  async removePlace() {}

  @Delete("remove-user")
  async removeUser() {}
}
