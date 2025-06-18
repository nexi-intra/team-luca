import { Router } from 'express';
import { createLogger } from '../lib/logger.js';

export function scriptRoutes(scriptManager) {
  const router = Router();
  const logger = createLogger('routes/scripts');

  // List available scripts
  router.get('/', async (req, res) => {
    logger.info('Listing scripts');
    try {
      const scripts = await scriptManager.listScripts();
      res.json({ scripts });
    } catch (error) {
      logger.error('Failed to list scripts', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Get running scripts
  router.get('/running', (req, res) => {
    const running = scriptManager.getRunningScripts();
    res.json({ running });
  });

  // Execute a script
  router.post('/execute', async (req, res) => {
    const { name, args, env } = req.body;
    
    logger.info('Script execution request received', { name, args });
    
    if (!name) {
      logger.warn('Script execution request missing name');
      return res.status(400).json({ error: 'Script name is required' });
    }

    const id = `script-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Start script execution asynchronously
      scriptManager.executeScript({ id, name, args, env })
        .then(result => {
          // Result will be emitted via WebSocket
        })
        .catch(error => {
          // Error will be emitted via WebSocket
        });

      res.json({ 
        id, 
        status: 'started',
        message: 'Script execution started. Listen to WebSocket events for updates.' 
      });
    } catch (error) {
      logger.error('Failed to start script execution', { name, error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Stop a running script
  router.post('/stop/:id', (req, res) => {
    const { id } = req.params;
    
    logger.info('Stop script request', { id });

    try {
      const result = scriptManager.stopScript(id);
      res.json(result);
    } catch (error) {
      logger.error('Failed to stop script', { id, error: error.message });
      res.status(404).json({ error: error.message });
    }
  });

  return router;
}