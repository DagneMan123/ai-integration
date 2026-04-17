/**
 * Client-side Logger Utility
 * Provides structured logging for development and production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message), data);
    }
  }

  info(message: string, data?: unknown): void {
    console.info(this.formatMessage('info', message), data);
  }

  warn(message: string, data?: unknown): void {
    console.warn(this.formatMessage('warn', message), data);
  }

  error(message: string, error?: unknown): void {
    console.error(this.formatMessage('error', message), error);
  }
}

export const logger = new ClientLogger();
