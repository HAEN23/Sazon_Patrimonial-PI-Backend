export interface IEmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
  sendWelcomeEmail(to: string, name: string): Promise<void>;
  sendPasswordResetEmail(to: string, resetToken: string): Promise<void>;
  sendApplicationApprovedEmail(to: string, restaurantName: string): Promise<void>;
  sendApplicationRejectedEmail(to: string, restaurantName: string, reason?: string): Promise<void>;
}