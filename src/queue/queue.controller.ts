import { Body, Controller, Post } from '@nestjs/common';
import { AddToQueueDto } from 'src/dto/add-to-queue.dto';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

	@Post('add')
	async addToQueue(@Body() addToQueueDto: AddToQueueDto) {
		await this.queueService.addToQueue(addToQueueDto);
	}

}
