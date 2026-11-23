import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();

createApp(config).listen(config.port, config.host, () => {
  console.log(`mcp upload service listening on ${config.host}:${config.port}`);
});
