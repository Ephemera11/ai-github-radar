import { Router, Request, Response } from 'express';

export function createExportRouter(): Router {
  const router = Router();

  router.post('/export', (req: Request, res: Response) => {
    const { items } = req.body;
    const text = items.map((item: { name: string; url: string }) => `${item.name}: ${item.url}`).join('\n');
    res.setHeader('Content-Type', 'text/plain');
    res.send(text);
  });

  return router;
}
