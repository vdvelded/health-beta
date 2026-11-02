import { createServer } from 'node:http';
import { createApp } from './src/app.js';

const port = Number(process.env.PORT) || 3000;

createServer(createApp()).listen(port, () => {
  console.log(`Health Quality app listening on http://localhost:${port}`);
});
