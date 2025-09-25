interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: number;
  service: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  userId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface LoggerConfig {
  level: keyof LogLevel;
  service: string;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxFileSize?: number;
  maxFiles?: number;
}

export class StructuredLogger {
  private config: LoggerConfig;
  private logLevels: LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'INFO',
      service: 'envie2sortir',
      enableConsole: true,
      enableFile: process.env.NODE_ENV === 'production',
      enableRemote: process.env.NODE_ENV === 'production',
      remoteEndpoint: process.env.LOGGING_ENDPOINT,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...config
    };
  }

  private shouldLog(level: keyof LogLevel): boolean {
    return this.logLevels[level] <= this.logLevels[this.config.level];
  }

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: Date.now(),
      service: this.config.service,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      requestId: context?.requestId,
      userId: context?.userId,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent
    };
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.padEnd(5);
    const service = entry.service;
    const message = entry.message;

    let logLine = `[${timestamp}] ${level} ${service}: ${message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      logLine += ` | Context: ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      logLine += ` | Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        logLine += `\nStack: ${entry.error.stack}`;
      }
    }

    if (entry.userId) {
      logLine += ` | User: ${entry.userId}`;
    }

    if (entry.requestId) {
      logLine += ` | Request: ${entry.requestId}`;
    }

    return logLine;
  }

  private async writeToConsole(entry: LogEntry): Promise<void> {
    if (!this.config.enableConsole) return;

    const formattedLog = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case 'ERROR':
        console.error(formattedLog);
        break;
      case 'WARN':
        console.warn(formattedLog);
        break;
      case 'INFO':
        console.info(formattedLog);
        break;
      case 'DEBUG':
        console.debug(formattedLog);
        break;
    }
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile) return;

    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `${entry.service}-${new Date().toISOString().split('T')[0]}.log`);
      
      // Créer le dossier logs s'il n'existe pas
      try {
        await fs.access(logDir);
      } catch {
        await fs.mkdir(logDir, { recursive: true });
      }

      const formattedLog = this.formatLogEntry(entry);
      await fs.appendFile(logFile, formattedLog + '\n');
      
      // Rotation des logs si nécessaire
      await this.rotateLogFile(logFile);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private async writeToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOGGING_TOKEN || ''}`
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        console.error(`Failed to send log to remote endpoint: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  private async rotateLogFile(logFile: string): Promise<void> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const stats = await fs.stat(logFile);
      
      if (stats.size > this.config.maxFileSize!) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
        
        await fs.rename(logFile, rotatedFile);
        
        // Supprimer les anciens fichiers
        await this.cleanupOldLogFiles(path.dirname(logFile));
      }
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  private async cleanupOldLogFiles(logDir: string): Promise<void> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const files = await fs.readdir(logDir);
      const logFiles = files
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(logDir, file),
          stats: null as any
        }));

      // Obtenir les stats de tous les fichiers
      for (const file of logFiles) {
        try {
          file.stats = await fs.stat(file.path);
        } catch (error) {
          // Ignorer les fichiers qui n'existent plus
        }
      }

      // Trier par date de modification (plus ancien en premier)
      const validFiles = logFiles.filter(f => f.stats).sort((a, b) => 
        a.stats.mtime.getTime() - b.stats.mtime.getTime()
      );

      // Supprimer les fichiers excédentaires
      if (validFiles.length > this.config.maxFiles!) {
        const filesToDelete = validFiles.slice(0, validFiles.length - this.config.maxFiles!);
        
        for (const file of filesToDelete) {
          try {
            await fs.unlink(file.path);
          } catch (error) {
            console.error(`Failed to delete old log file ${file.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old log files:', error);
    }
  }

  private async log(level: keyof LogLevel, message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);

    // Écrire dans tous les outputs configurés en parallèle
    await Promise.allSettled([
      this.writeToConsole(entry),
      this.writeToFile(entry),
      this.writeToRemote(entry)
    ]);
  }

  // Méthodes publiques
  async error(message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    await this.log('ERROR', message, context, error);
  }

  async warn(message: string, context?: Record<string, any>): Promise<void> {
    await this.log('WARN', message, context);
  }

  async info(message: string, context?: Record<string, any>): Promise<void> {
    await this.log('INFO', message, context);
  }

  async debug(message: string, context?: Record<string, any>): Promise<void> {
    await this.log('DEBUG', message, context);
  }

  // Méthodes spécialisées pour les métriques
  async logAPICall(endpoint: string, method: string, statusCode: number, responseTime: number, context?: Record<string, any>): Promise<void> {
    const level = statusCode >= 400 ? 'ERROR' : statusCode >= 300 ? 'WARN' : 'INFO';
    const message = `API ${method} ${endpoint} - ${statusCode} (${responseTime}ms)`;
    
    await this.log(level, message, {
      ...context,
      endpoint,
      method,
      statusCode,
      responseTime
    });
  }

  async logBusinessEvent(event: string, data: Record<string, any>): Promise<void> {
    await this.info(`Business Event: ${event}`, data);
  }

  async logSecurityEvent(event: string, data: Record<string, any>): Promise<void> {
    await this.warn(`Security Event: ${event}`, data);
  }

  async logPerformanceMetric(metric: string, value: number, context?: Record<string, any>): Promise<void> {
    await this.debug(`Performance: ${metric} = ${value}`, context);
  }

  // Configuration
  setLevel(level: keyof LogLevel): void {
    this.config.level = level;
  }

  setService(service: string): void {
    this.config.service = service;
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Instances globales
export const logger = new StructuredLogger({
  service: 'envie2sortir-api'
});

export const securityLogger = new StructuredLogger({
  service: 'envie2sortir-security',
  level: 'WARN'
});

export const performanceLogger = new StructuredLogger({
  service: 'envie2sortir-performance',
  level: 'DEBUG'
});

// Fonctions utilitaires
export function createRequestLogger(requestId: string, userId?: string, ipAddress?: string) {
  return {
    error: (message: string, context?: Record<string, any>, error?: Error) => 
      logger.error(message, { ...context, requestId, userId, ipAddress }, error),
    warn: (message: string, context?: Record<string, any>) => 
      logger.warn(message, { ...context, requestId, userId, ipAddress }),
    info: (message: string, context?: Record<string, any>) => 
      logger.info(message, { ...context, requestId, userId, ipAddress }),
    debug: (message: string, context?: Record<string, any>) => 
      logger.debug(message, { ...context, requestId, userId, ipAddress })
  };
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
