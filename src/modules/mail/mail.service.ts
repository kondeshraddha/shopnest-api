import {
  Injectable, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { EVENTS } from '../../common/constants';
import { welcomeTemplate } from './templates/welcome.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { orderConfirmedTemplate } from './templates/order-confirmed.template';
import { orderStatusTemplate } from './templates/order-status.template';

export interface SendMailOptions {
  to:       string;
  subject:  string;
  html:     string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
  ) {
    // Create email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: false,
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.password'),
      },
    });
  }

  // ─── SEND EMAIL ───────────────────────────────────────
  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from:    this.configService.get<string>('mail.from'),
        to:      options.to,
        subject: options.subject,
        html:    options.html,
      });

      this.logger.log(
        `Email sent to ${options.to}: ${options.subject}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}`,
        error,
      );
      // Don't throw error
      // Email failure should not break the app
    }
  }

  // ─── SEND WELCOME EMAIL ───────────────────────────────
  async sendWelcomeEmail(user: {
    email:     string;
    firstName: string;
  }) {
    await this.sendMail({
      to:      user.email,
      subject: '🎉 Welcome to ShopNest!',
      html:    welcomeTemplate(user.firstName),
    });
  }

  // ─── SEND PASSWORD RESET EMAIL ────────────────────────
  async sendPasswordResetEmail(
    user: { email: string; firstName: string },
    token: string,
  ) {
    const resetUrl =
      `http://localhost:4000/reset-password?token=${token}`;

    await this.sendMail({
      to:      user.email,
      subject: '🔐 Reset Your ShopNest Password',
      html:    passwordResetTemplate(
        user.firstName,
        resetUrl,
      ),
    });
  }

  // ─── SEND ORDER CONFIRMED EMAIL ───────────────────────
  async sendOrderConfirmedEmail(
    user: { email: string; firstName: string },
    order: any,
  ) {
    await this.sendMail({
      to:      user.email,
      subject: `✅ Order Confirmed - ${order.orderNumber}`,
      html:    orderConfirmedTemplate(
        user.firstName,
        order,
      ),
    });
  }

  // ─── SEND ORDER STATUS EMAIL ──────────────────────────
  async sendOrderStatusEmail(
    user: { email: string; firstName: string },
    order: any,
  ) {
    await this.sendMail({
      to:      user.email,
      subject: `📦 Order ${order.orderNumber} - ${order.status.toUpperCase()}`,
      html:    orderStatusTemplate(
        user.firstName,
        order,
      ),
    });
  }

  // ══════════════════════════════════════════════════════
  // EVENT LISTENERS
  // Auto triggered when events emitted
  // ══════════════════════════════════════════════════════

  // ─── LISTEN: USER REGISTERED ──────────────────────────
  @OnEvent(EVENTS.USER_REGISTERED)
  async handleUserRegistered(payload: { user: any }) {
    this.logger.log(
      `Sending welcome email to: ${payload.user.email}`,
    );
    await this.sendWelcomeEmail(payload.user);
  }

  // ─── LISTEN: PASSWORD RESET ───────────────────────────
  @OnEvent(EVENTS.PASSWORD_RESET)
  async handlePasswordReset(payload: {
    user:  any;
    token: string;
  }) {
    this.logger.log(
      `Sending password reset email to: ${payload.user.email}`,
    );
    await this.sendPasswordResetEmail(
      payload.user,
      payload.token,
    );
  }

  // ─── LISTEN: ORDER PLACED ─────────────────────────────
  @OnEvent(EVENTS.ORDER_PLACED)
  async handleOrderPlaced(payload: {
    user:  any;
    order: any;
  }) {
    this.logger.log(
      `Sending order confirmation to: ${payload.user.email}`,
    );
    await this.sendOrderConfirmedEmail(
      payload.user,
      payload.order,
    );
  }

  // ─── LISTEN: ORDER STATUS CHANGED ────────────────────
  @OnEvent(EVENTS.ORDER_STATUS_CHANGED)
  async handleOrderStatusChanged(payload: {
    user:  any;
    order: any;
  }) {
    this.logger.log(
      `Sending status update to: ${payload.user.email}`,
    );
    await this.sendOrderStatusEmail(
      payload.user,
      payload.order,
    );
  }
}