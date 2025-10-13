/**
 * Production Logger
 * Structured logging for development and production environments
 * Can be integrated with Sentry, LogRocket, or other monitoring services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  accountId?: string;
  emailId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProd = process.env.NODE_ENV === 'production';

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }

    // In production, send to monitoring service
    if (this.isProd) {
      this.sendToMonitoring('info', message, context);
    }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || '');

    if (this.isProd) {
      this.sendToMonitoring('warn', message, context);
    }
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error, context || '');

    if (this.isProd) {
      this.sendToMonitoring('error', message, {
        ...context,
        error: {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        },
      });
    }
  }

  /**
   * Log a user action for analytics
   */
  logAction(action: string, context?: LogContext) {
    this.info(`User action: ${action}`, { ...context, action });
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric: string, duration: number, context?: LogContext) {
    const message = `Performance: ${metric} took ${duration.toFixed(2)}ms`;
    
    if (duration > 1000) {
      this.warn(message, { ...context, metric, duration });
    } else if (this.isDevelopment) {
      this.debug(message, { ...context, metric, duration });
    }
  }

  /**
   * Log API calls
   */
  logApiCall(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    context?: LogContext
  ) {
    const message = `API ${method} ${endpoint} - ${status} (${duration}ms)`;

    if (status >= 500) {
      this.error(message, undefined, { ...context, endpoint, method, status, duration });
    } else if (status >= 400) {
      this.warn(message, { ...context, endpoint, method, status, duration });
    } else if (this.isDevelopment) {
      this.debug(message, { ...context, endpoint, method, status, duration });
    }
  }

  /**
   * Send logs to monitoring service (Sentry, LogRocket, etc.)
   * Override this method to integrate with your monitoring service
   */
  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext) {
    // TODO: Integrate with monitoring service
    // Example for Sentry:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureMessage(message, {
    //     level: level as Sentry.SeverityLevel,
    //     extra: context,
    //   });
    // }

    // Example for LogRocket:
    // if (typeof window !== 'undefined' && window.LogRocket) {
    //   window.LogRocket.track(message, context);
    // }

    // For now, just structure the log for future integration
    const structuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      environment: process.env.NODE_ENV,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    // In production, you might want to send this to a logging endpoint
    if (this.isProd && typeof window !== 'undefined') {
      // Store in sessionStorage for debugging (optional)
      try {
        const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
        logs.push(structuredLog);
        // Keep only last 50 logs
        if (logs.length > 50) logs.shift();
        sessionStorage.setItem('app_logs', JSON.stringify(logs));
      } catch (e) {
        // Ignore storage errors
      }
    }
  }

  /**
   * Get stored logs (for debugging)
   */
  getLogs(): any[] {
    if (typeof window === 'undefined') return [];
    
    try {
      return JSON.parse(sessionStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearLogs() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('app_logs');
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logAction = logger.logAction.bind(logger);
export const logPerformance = logger.logPerformance.bind(logger);
export const logApiCall = logger.logApiCall.bind(logger);


