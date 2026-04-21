import app from './src/app';
import config from './src/config/config';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : config.port;

const server = Bun.serve({
  port: PORT,
  hostname: '0.0.0.0',
  fetch: app.fetch,
});

console.log(`Server running at http://0.0.0.0:${server.port}`);
