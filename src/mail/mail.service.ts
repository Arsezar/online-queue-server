import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendTest(email: string) {
    await this.mailerService.sendMail({
      to: email,
      from: `"Test Team" <${process.env.MAIL_FROM}>`,
      subject: 'Test',
      template: './test',
    });
  }

  async sendPassReset(user: User, token: string) {
    const url = `${process.env.HOST_URL}password-reset?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      from: `"Support Team" <${process.env.MAIL_FROM}>`,
      subject: 'Welcome to Queue App! You can reset your password',
      template: './passreset',
      context: {
        name: user.username,
        url,
      },
    });
  }

  async sendConfirmation(user: User, token: string) {
    const url = `${process.env.HOST_URL}confirmation?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      from: `"Support Team" <${process.env.MAIL_FROM}>`,
      subject: 'Welcome to Queue App! Please confirm your email',
      template: './confirmation',
      context: {
        name: user.username,
        url,
      },
    });
  }
}
