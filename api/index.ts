// This file is automatically replaced by `vercel-build` at deploy time.
// It exists only so Vercel registers `/api/index` as a serverless function.
import type { IncomingMessage, ServerResponse } from 'http';

module.exports = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 503;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Build step did not run. Bundle was not generated.');
};
