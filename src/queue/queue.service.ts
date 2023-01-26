import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddToQueueDto } from 'src/dto/add-to-queue.dto';
import { QueueDto } from 'src/dto/queue.dto';
import { Queue, QueueDocument } from 'src/schemas/queue.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class QueueService {
  constructor(
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
		private userService: UsersService,
  ) {}

	async addToQueue(addToQueueDto: AddToQueueDto) {
		const user = await this.userService.findOne(addToQueueDto.username);
		if(!user) {
			throw new ForbiddenException("Queue Access Denied");
		}
		// const queue 
		// add a places array to mongoDB queue, add a queueDto 
	}

	async createQueue(queueDto: QueueDto): Promise<QueueDocument> {
		const createdQueue = new this.queueModel(queueDto);
		return createdQueue.save();
	}
}
