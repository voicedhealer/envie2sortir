import { StructuredLogger, createRequestLogger, generateRequestId } from '../../src/lib/monitoring/logger';

// Mock fs pour les tests
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    appendFile: jest.fn(),
    stat: jest.fn(),
    rename: jest.fn(),
    readdir: jest.fn(),
    unlink: jest.fn()
  }
}));

// Mock fetch pour les tests
global.fetch = jest.fn();

describe('Structured Logger', () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = new StructuredLogger({
      level: 'DEBUG',
      service: 'test-service',
      enableConsole: true, // Activer la console pour les tests
      enableFile: false,
      enableRemote: false
    });
    
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Logging', () => {
    test('should log error messages', async () => {
      await logger.error('Test error message', { userId: '123' });
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });

    test('should log warning messages', async () => {
      await logger.warn('Test warning message', { userId: '123' });
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Test warning message')
      );
    });

    test('should log info messages', async () => {
      await logger.info('Test info message', { userId: '123' });
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
    });

    test('should log debug messages', async () => {
      await logger.debug('Test debug message', { userId: '123' });
      
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message')
      );
    });
  });

  describe('Log Level Filtering', () => {
    test('should filter logs based on level', async () => {
      logger.setLevel('WARN');
      
      await logger.info('This should not be logged');
      await logger.debug('This should not be logged');
      await logger.warn('This should be logged');
      await logger.error('This should be logged');
      
      expect(console.info).not.toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    test('should log all levels when set to DEBUG', async () => {
      logger.setLevel('DEBUG');
      
      await logger.error('Error message');
      await logger.warn('Warning message');
      await logger.info('Info message');
      await logger.debug('Debug message');
      
      expect(console.error).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe('Log Formatting', () => {
    test('should format log entries correctly', async () => {
      await logger.info('Test message', { userId: '123', requestId: 'req-456' });
      
      const logCall = (console.info as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('INFO');
      expect(logCall).toContain('test-service');
      expect(logCall).toContain('Test message');
      expect(logCall).toContain('User: 123');
      expect(logCall).toContain('Request: req-456');
    });

    test('should include error information when provided', async () => {
      const error = new Error('Test error');
      await logger.error('Test error message', { userId: '123' }, error);
      
      const logCall = (console.error as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('Test error message');
      expect(logCall).toContain('Error: Error: Test error');
      expect(logCall).toContain('Stack:');
    });
  });

  describe('Specialized Logging Methods', () => {
    test('should log API calls', async () => {
      await logger.logAPICall('/api/test', 'GET', 200, 150, { userId: '123' });
      
      const logCall = (console.info as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('API GET /api/test - 200 (150ms)');
      expect(logCall).toContain('endpoint');
      expect(logCall).toContain('method');
      expect(logCall).toContain('statusCode');
      expect(logCall).toContain('responseTime');
    });

    test('should log API calls with error status as error', async () => {
      await logger.logAPICall('/api/test', 'GET', 500, 150, { userId: '123' });
      
      expect(console.error).toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
    });

    test('should log business events', async () => {
      await logger.logBusinessEvent('user_registration', { userId: '123', plan: 'premium' });
      
      const logCall = (console.info as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('Business Event: user_registration');
      expect(logCall).toContain('userId');
      expect(logCall).toContain('plan');
    });

    test('should log security events', async () => {
      await logger.logSecurityEvent('failed_login', { userId: '123', ip: '127.0.0.1' });
      
      const logCall = (console.warn as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('Security Event: failed_login');
      expect(logCall).toContain('userId');
      expect(logCall).toContain('ip');
    });

    test('should log performance metrics', async () => {
      await logger.logPerformanceMetric('response_time', 150, { endpoint: '/api/test' });
      
      const logCall = (console.debug as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('Performance: response_time = 150');
      expect(logCall).toContain('endpoint');
    });
  });

  describe('Configuration', () => {
    test('should allow configuration changes', () => {
      logger.setLevel('ERROR');
      logger.setService('new-service');
      
      const config = logger.getConfig();
      
      expect(config.level).toBe('ERROR');
      expect(config.service).toBe('new-service');
    });

    test('should return current configuration', () => {
      const config = logger.getConfig();
      
      expect(config).toHaveProperty('level');
      expect(config).toHaveProperty('service');
      expect(config).toHaveProperty('enableConsole');
      expect(config).toHaveProperty('enableFile');
      expect(config).toHaveProperty('enableRemote');
    });
  });

  describe('File Logging', () => {
    test('should attempt to write to file when enabled', async () => {
      const fs = require('fs').promises;
      
      const fileLogger = new StructuredLogger({
        level: 'INFO',
        service: 'test-service',
        enableConsole: false,
        enableFile: true,
        enableRemote: false
      });
      
      fs.access.mockRejectedValueOnce(new Error('Directory does not exist'));
      fs.mkdir.mockResolvedValueOnce(undefined);
      fs.appendFile.mockResolvedValueOnce(undefined);
      fs.stat.mockResolvedValueOnce({ size: 1000 });
      
      await fileLogger.info('Test message');
      
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.appendFile).toHaveBeenCalled();
    });
  });

  describe('Remote Logging', () => {
    test('should attempt to send logs to remote endpoint', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response);
      
      const remoteLogger = new StructuredLogger({
        level: 'INFO',
        service: 'test-service',
        enableConsole: false,
        enableFile: false,
        enableRemote: true,
        remoteEndpoint: 'https://api.example.com/logs'
      });
      
      await remoteLogger.info('Test message');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/logs',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('Test message')
        })
      );
    });
  });

  describe('Utility Functions', () => {
    test('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    test('should create request logger with context', async () => {
      const requestLogger = createRequestLogger('req-123', 'user-456', '127.0.0.1');
      
      await requestLogger.info('Test message', { additional: 'data' });
      
      const logCall = (console.info as jest.Mock).mock.calls[0][0];
      
      expect(logCall).toContain('Test message');
      expect(logCall).toContain('Request: req-123');
      expect(logCall).toContain('User: user-456');
      expect(logCall).toContain('additional');
    });
  });

  describe('Error Handling', () => {
    test('should handle file writing errors gracefully', async () => {
      const fs = require('fs').promises;
      fs.access.mockRejectedValueOnce(new Error('Permission denied'));
      
      const fileLogger = new StructuredLogger({
        level: 'INFO',
        service: 'test-service',
        enableConsole: false,
        enableFile: true,
        enableRemote: false
      });
      
      // Ne devrait pas lever d'erreur
      await expect(fileLogger.info('Test message')).resolves.not.toThrow();
    });

    test('should handle remote logging errors gracefully', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const remoteLogger = new StructuredLogger({
        level: 'INFO',
        service: 'test-service',
        enableConsole: false,
        enableFile: false,
        enableRemote: true,
        remoteEndpoint: 'https://api.example.com/logs'
      });
      
      // Ne devrait pas lever d'erreur
      await expect(remoteLogger.info('Test message')).resolves.not.toThrow();
    });
  });
});
