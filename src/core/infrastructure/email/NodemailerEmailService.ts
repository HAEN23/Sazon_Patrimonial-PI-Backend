import { IEmailService } from '@/core/application/ports/NodemailerEmailService';
import nodemailer, { Transporter } from 'nodemailer';

/**
 * Implementación de envío de emails con Nodemailer
 */
export class NodemailerEmailService implements IEmailService {
  private transporter: Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@sazonpatrimonial.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Sazón Patrimonial';

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error enviando email:', error);
      throw new Error('Error al enviar email');
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = '¡Bienvenido a Sazón Patrimonial!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c5282;">¡Bienvenido, ${name}!</h1>
        <p>Gracias por registrarte en Sazón Patrimonial.</p>
        <p>Ahora puedes explorar los mejores restaurantes de comida tradicional chiapaneca.</p>
        <a href="${process.env.APP_URL}" style="display: inline-block; padding: 10px 20px; background-color: #2c5282; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Explorar Restaurantes
        </a>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    const subject = 'Restablecer contraseña - Sazón Patrimonial';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c5282;">Restablecer Contraseña</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2c5282; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Restablecer Contraseña
        </a>
        <p style="margin-top: 20px; color: #666;">Este enlace expirará en 1 hora.</p>
        <p style="color: #666;">Si no solicitaste este cambio, ignora este mensaje.</p>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendApplicationApprovedEmail(to: string, restaurantName: string): Promise<void> {
    const subject = '¡Tu solicitud ha sido aprobada! - Sazón Patrimonial';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #48bb78;">¡Felicidades! 🎉</h1>
        <p>Tu solicitud para registrar el restaurante <strong>${restaurantName}</strong> ha sido aprobada.</p>
        <p>Ya puedes comenzar a gestionar tu restaurante desde el panel de control.</p>
        <a href="${process.env.APP_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #48bb78; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Ir al Panel de Control
        </a>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendApplicationRejectedEmail(to: string, restaurantName: string, reason?: string): Promise<void> {
    const subject = 'Actualización de tu solicitud - Sazón Patrimonial';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f56565;">Solicitud no aprobada</h1>
        <p>Lamentamos informarte que tu solicitud para registrar el restaurante <strong>${restaurantName}</strong> no ha sido aprobada en este momento.</p>
        ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
        <p>Puedes revisar los requisitos y enviar una nueva solicitud.</p>
        <a href="${process.env.APP_URL}/nueva-solicitud" style="display: inline-block; padding: 10px 20px; background-color: #2c5282; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Nueva Solicitud
        </a>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }
}