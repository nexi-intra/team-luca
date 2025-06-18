import { createLogger } from '../lib/logger.js';

const routeLogger = createLogger('routes');

export function setupRoutes(app, scriptManager) {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const health = {
      status: 'healthy',
      service: 'koksmat-companion',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
    
    routeLogger.verbose('Health check requested', health);
    res.json(health);
  });
  
  // List available scripts
  app.get('/api/scripts', async (req, res) => {
    try {
      routeLogger.info('Listing available scripts');
      const scripts = await scriptManager.listScripts();
      res.json({ scripts });
    } catch (error) {
      routeLogger.error('Failed to list scripts', { error: error.message });
      res.status(500).json({ error: 'Failed to list scripts' });
    }
  });
  
  // Execute a script
  app.post('/api/scripts/execute', async (req, res) => {
    const { id, name, args, env } = req.body;
    
    if (!id || !name) {
      routeLogger.warn('Missing required fields for script execution', { id, name });
      return res.status(400).json({ error: 'Missing required fields: id and name' });
    }
    
    try {
      routeLogger.info('Executing script via REST API', { id, name });
      const result = await scriptManager.executeScript({ id, name, args, env });
      res.json(result);
    } catch (error) {
      routeLogger.error('Script execution failed', { id, name, error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
  
  // Stop a running script
  app.post('/api/scripts/:id/stop', (req, res) => {
    const { id } = req.params;
    
    try {
      routeLogger.info('Stopping script', { id });
      const result = scriptManager.stopScript(id);
      res.json(result);
    } catch (error) {
      routeLogger.error('Failed to stop script', { id, error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get running scripts
  app.get('/api/scripts/running', (req, res) => {
    routeLogger.verbose('Getting running scripts');
    const scripts = scriptManager.getRunningScripts();
    res.json({ scripts });
  });
  
  // Root endpoint
  app.get('/', (req, res) => {
    routeLogger.verbose('Root endpoint accessed');
    res.json({
      service: 'Koksmat Companion',
      version: '1.0.0',
      endpoints: [
        'GET /api/health',
        'GET /api/scripts',
        'POST /api/scripts/execute',
        'POST /api/scripts/:id/stop',
        'GET /api/scripts/running'
      ]
    });
  });
  
  // 404 handler
  app.use((req, res) => {
    routeLogger.warn('Route not found', { method: req.method, path: req.path });
    res.status(404).json({ error: 'Not found' });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    routeLogger.error('Unhandled error', { 
      error: err.message, 
      stack: err.stack,
      method: req.method,
      path: req.path
    });
    res.status(500).json({ error: 'Internal server error' });
  });
}