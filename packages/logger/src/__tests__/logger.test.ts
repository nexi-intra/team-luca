import { Logger, LogLevel, createLogger, createLoggerWithConfig, LogLevelConfig } from '../index';

describe('Logger', () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('LogLevel', () => {
    it('should have correct numeric values', () => {
      expect(LogLevel.VERBOSE).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
      expect(LogLevel.NONE).toBe(4);
    });
  });

  describe('Logger instantiation', () => {
    it('should create logger with default config', () => {
      const logger = new Logger();
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it('should create logger with custom config', () => {
      const logger = new Logger({
        level: LogLevel.VERBOSE,
        prefix: '[Custom]',
        timestamp: false,
        colors: false,
      });
      expect(logger.getLevel()).toBe(LogLevel.VERBOSE);
    });

    it('should create logger with namespace', () => {
      const logger = new Logger({}, 'test-namespace');
      logger.info('test message');
      
      expect(consoleSpy.info).toHaveBeenCalled();
      const call = consoleSpy.info.mock.calls[0][0];
      expect(call).toContain('[test-namespace]');
    });
  });

  describe('Log level filtering', () => {
    it('should log messages at or above current level', () => {
      const logger = new Logger({ level: LogLevel.WARN });
      
      logger.verbose('verbose message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it('should not log anything when level is NONE', () => {
      const logger = new Logger({ level: LogLevel.NONE });
      
      logger.verbose('verbose message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('Message formatting', () => {
    it('should include timestamp by default', () => {
      const logger = new Logger();
      const dateSpy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T00:00:00.000Z');
      
      logger.info('test message');
      
      expect(consoleSpy.info).toHaveBeenCalled();
      const call = consoleSpy.info.mock.calls[0][0];
      expect(call).toContain('[2024-01-01T00:00:00.000Z]');
      
      dateSpy.mockRestore();
    });

    it('should not include timestamp when disabled', () => {
      const logger = new Logger({ timestamp: false });
      
      logger.info('test message');
      
      expect(consoleSpy.info).toHaveBeenCalled();
      const call = consoleSpy.info.mock.calls[0][0];
      expect(call).not.toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\]/);
    });

    it('should include custom prefix', () => {
      const logger = new Logger({ prefix: '[TestApp]' });
      
      logger.info('test message');
      
      expect(consoleSpy.info).toHaveBeenCalled();
      const call = consoleSpy.info.mock.calls[0][0];
      expect(call).toContain('[TestApp]');
    });

    it('should include log level in message', () => {
      const logger = new Logger();
      
      logger.info('test message');
      logger.warn('test warning');
      logger.error('test error');
      
      expect(consoleSpy.info.mock.calls[0][0]).toContain('[INFO]');
      expect(consoleSpy.warn.mock.calls[0][0]).toContain('[WARN]');
      expect(consoleSpy.error.mock.calls[0][0]).toContain('[ERROR]');
    });
  });

  describe('Child loggers', () => {
    it('should create child logger with namespace', () => {
      const parentLogger = new Logger({}, 'parent');
      const childLogger = parentLogger.child('child');
      
      childLogger.info('test message');
      
      expect(consoleSpy.info).toHaveBeenCalled();
      const call = consoleSpy.info.mock.calls[0][0];
      expect(call).toContain('[parent:child]');
    });

    it('should inherit parent configuration', () => {
      const parentLogger = new Logger({ level: LogLevel.ERROR, prefix: '[Parent]' });
      const childLogger = parentLogger.child('child');
      
      expect(childLogger.getLevel()).toBe(LogLevel.ERROR);
      
      childLogger.warn('should not log');
      childLogger.error('should log');
      
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dynamic level setting', () => {
    it('should update log level with enum', () => {
      const logger = new Logger({ level: LogLevel.ERROR });
      
      logger.info('should not log');
      expect(consoleSpy.info).not.toHaveBeenCalled();
      
      logger.setLevel(LogLevel.INFO);
      logger.info('should log');
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    });

    it('should update log level with string', () => {
      const logger = new Logger({ level: LogLevel.ERROR });
      
      logger.info('should not log');
      expect(consoleSpy.info).not.toHaveBeenCalled();
      
      logger.setLevel('INFO');
      logger.info('should log');
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    });

    it('should handle case-insensitive level strings', () => {
      const logger = new Logger();
      
      logger.setLevel('verbose');
      expect(logger.getLevel()).toBe(LogLevel.VERBOSE);
      
      logger.setLevel('WARN');
      expect(logger.getLevel()).toBe(LogLevel.WARN);
      
      logger.setLevel('ErRoR');
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('Factory functions', () => {
    it('should create logger with namespace using createLogger', () => {
      const logger = createLogger('test-namespace', { level: LogLevel.VERBOSE });
      
      expect(logger.getLevel()).toBe(LogLevel.VERBOSE);
      
      logger.info('test message');
      expect(consoleSpy.info).toHaveBeenCalled();
      const call = consoleSpy.info.mock.calls[0][0];
      expect(call).toContain('[test-namespace]');
    });

    it('should create logger with config provider using createLoggerWithConfig', () => {
      const mockConfig: LogLevelConfig = {
        getLogLevel: () => 'ERROR',
      };
      
      const logger = createLoggerWithConfig(mockConfig, 'test-namespace');
      
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
      
      logger.warn('should not log');
      logger.error('should log');
      
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Additional arguments', () => {
    it('should pass additional arguments to console methods', () => {
      const logger = new Logger();
      const obj = { key: 'value' };
      const arr = [1, 2, 3];
      
      logger.info('test message', obj, arr);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('test message'),
        obj,
        arr
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid log level strings', () => {
      const logger = new Logger();
      
      logger.setLevel('invalid');
      expect(logger.getLevel()).toBe(LogLevel.INFO); // Should default to INFO
    });

    it('should handle undefined config provider', () => {
      const logger = createLoggerWithConfig(undefined as any);
      expect(logger.getLevel()).toBe(LogLevel.INFO); // Should default to INFO
    });
  });
});