import { jest } from '@jest/globals';
import { EventEmitter } from 'events';
import path from 'path';

// Create mocks
const mockSpawn = jest.fn();
const mockAccess = jest.fn();
const mockReaddir = jest.fn();

// Mock child_process
jest.unstable_mockModule('child_process', () => ({
  spawn: mockSpawn
}));

// Mock fs promises
jest.unstable_mockModule('fs', () => ({
  promises: {
    access: mockAccess,
    readdir: mockReaddir
  }
}));

// Import after mocking
const { ScriptManager } = await import('../../lib/ScriptManager.js');

describe('ScriptManager', () => {
  let scriptManager;
  let mockLogger;
  let mockIO;
  let mockProcesses;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock logger
    mockLogger = {
      verbose: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    
    // Create mock Socket.IO instance
    mockIO = {
      emit: jest.fn()
    };
    
    // Store all mock processes
    mockProcesses = [];
    
    // Setup spawn mock to return new mock process each time
    mockSpawn.mockImplementation(() => {
      const proc = new EventEmitter();
      proc.stdout = new EventEmitter();
      proc.stderr = new EventEmitter();
      proc.kill = jest.fn();
      mockProcesses.push(proc);
      return proc;
    });
    
    // Create ScriptManager instance
    scriptManager = new ScriptManager(mockLogger, mockIO);
  });
  
  describe('executeScript', () => {
    const testScript = {
      id: 'test-123',
      name: 'test-script.js',
      args: ['arg1', 'arg2'],
      env: { TEST_VAR: 'value' }
    };
    
    beforeEach(() => {
      // Mock fs.access to simulate script exists
      mockAccess.mockResolvedValue(undefined);
    });
    
    it('should execute a script successfully', async () => {
      const executePromise = scriptManager.executeScript(testScript);
      
      // Simulate successful script execution
      setImmediate(() => {
        const mockProcess = mockProcesses[0];
        mockProcess.stdout.emit('data', Buffer.from('Script output\n'));
        mockProcess.emit('close', 0);
      });
      
      const result = await executePromise;
      
      expect(result).toMatchObject({
        id: testScript.id,
        name: testScript.name,
        code: 0,
        success: true
      });
      
      expect(mockSpawn).toHaveBeenCalledWith(
        'node',
        [expect.stringContaining(testScript.name), ...testScript.args],
        expect.objectContaining({
          env: expect.objectContaining(testScript.env)
        })
      );
      
      expect(mockIO.emit).toHaveBeenCalledWith('script:started', expect.any(Object));
      expect(mockIO.emit).toHaveBeenCalledWith('script:output', expect.any(Object));
      expect(mockIO.emit).toHaveBeenCalledWith('script:completed', expect.any(Object));
    });
    
    it('should handle script failure', async () => {
      const executePromise = scriptManager.executeScript(testScript);
      
      // Simulate script failure
      setImmediate(() => {
        const mockProcess = mockProcesses[0];
        mockProcess.stderr.emit('data', Buffer.from('Error output\n'));
        mockProcess.emit('close', 1);
      });
      
      await expect(executePromise).rejects.toThrow('Script exited with code 1');
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Script failed',
        expect.objectContaining({ code: 1 })
      );
    });
    
    it('should prevent duplicate script execution', async () => {
      // Start first execution
      const firstExecution = scriptManager.executeScript(testScript);
      
      // Wait for the script to be registered
      await new Promise(resolve => setImmediate(resolve));
      
      // Try to start same script again (should fail)
      await expect(scriptManager.executeScript(testScript))
        .rejects.toThrow(`Script ${testScript.id} is already running`);
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Script already running',
        expect.objectContaining({ id: testScript.id })
      );
      
      // Clean up by finishing the first execution
      const mockProcess = mockProcesses[0];
      mockProcess.emit('close', 0);
      
      await firstExecution;
    });
    
    it('should handle missing script', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      
      await expect(scriptManager.executeScript(testScript))
        .rejects.toThrow(`Script not found: ${testScript.name}`);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Script not found',
        expect.objectContaining({ name: testScript.name })
      );
    });
    
    it('should handle process spawn error', async () => {
      const spawnError = new Error('Spawn failed');
      const executePromise = scriptManager.executeScript(testScript);
      
      setImmediate(() => {
        const mockProcess = mockProcesses[0];
        mockProcess.emit('error', spawnError);
      });
      
      await expect(executePromise).rejects.toThrow('Spawn failed');
      
      expect(mockIO.emit).toHaveBeenCalledWith(
        'script:error',
        expect.objectContaining({ error: 'Spawn failed' })
      );
    });
  });
  
  describe('listScripts', () => {
    it('should list available scripts', async () => {
      const mockFiles = ['script1.js', 'script2.mjs', 'readme.txt', 'script3.js'];
      mockReaddir.mockResolvedValue(mockFiles);
      
      const scripts = await scriptManager.listScripts();
      
      expect(scripts).toEqual(['script1.js', 'script2.mjs', 'script3.js']);
      expect(mockLogger.verbose).toHaveBeenCalledWith(
        'Listed scripts',
        expect.objectContaining({ count: 3 })
      );
    });
    
    it('should handle directory read error', async () => {
      mockReaddir.mockRejectedValue(new Error('Permission denied'));
      
      const scripts = await scriptManager.listScripts();
      
      expect(scripts).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to list scripts',
        expect.objectContaining({ error: 'Permission denied' })
      );
    });
  });
  
  describe('stopScript', () => {
    it('should stop a running script', async () => {
      const testScript = { id: 'test-123', name: 'test-script.js' };
      
      // Start a script first
      mockAccess.mockResolvedValue(undefined);
      const executePromise = scriptManager.executeScript(testScript);
      
      // Wait a tick to ensure script is registered
      await new Promise(resolve => setImmediate(resolve));
      
      // Stop the script
      const result = scriptManager.stopScript(testScript.id);
      
      expect(result).toEqual({ id: testScript.id, stopped: true });
      expect(mockProcesses[0].kill).toHaveBeenCalledWith('SIGTERM');
      expect(mockIO.emit).toHaveBeenCalledWith('script:stopped', { id: testScript.id });
      
      // Clean up by emitting close
      mockProcesses[0].emit('close', 0);
      await executePromise;
    });
    
    it('should throw error when stopping non-running script', () => {
      expect(() => scriptManager.stopScript('non-existent'))
        .toThrow('Script non-existent is not running');
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempted to stop non-running script',
        { id: 'non-existent' }
      );
    });
  });
  
  describe('getRunningScripts', () => {
    it('should return list of running scripts', async () => {
      const script1 = { id: 'test-1', name: 'script1.js' };
      const script2 = { id: 'test-2', name: 'script2.js' };
      
      mockAccess.mockResolvedValue(undefined);
      
      // Start two scripts
      const promise1 = scriptManager.executeScript(script1);
      const promise2 = scriptManager.executeScript(script2);
      
      // Wait a tick to ensure scripts are registered
      await new Promise(resolve => setImmediate(resolve));
      
      const runningScripts = scriptManager.getRunningScripts();
      
      expect(runningScripts).toHaveLength(2);
      expect(runningScripts[0]).toMatchObject({
        id: script1.id,
        name: script1.name,
        startTime: expect.any(Number),
        duration: expect.any(Number)
      });
      expect(runningScripts[1]).toMatchObject({
        id: script2.id,
        name: script2.name,
        startTime: expect.any(Number),
        duration: expect.any(Number)
      });
      
      // Clean up
      mockProcesses[0].emit('close', 0);
      mockProcesses[1].emit('close', 0);
      await Promise.all([promise1, promise2]);
    });
    
    it('should return empty array when no scripts running', () => {
      const runningScripts = scriptManager.getRunningScripts();
      expect(runningScripts).toEqual([]);
    });
  });
});