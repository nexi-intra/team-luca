import { Router } from 'express';

export function statusRoutes(companionState) {
  const router = Router();

  // Get companion status
  router.get('/', (req, res) => {
    res.json({
      status: companionState.status,
      uptime: Date.now() - companionState.startTime.getTime(),
      connectedClients: companionState.connectedClients,
      scripts: companionState.scripts,
      startTime: companionState.startTime
    });
  });

  // Update companion status
  router.post('/update', (req, res) => {
    const { status } = req.body;
    
    if (!status || !['ready', 'busy', 'error'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    companionState.status = status;
    res.json({ status: companionState.status });
  });

  return router;
}