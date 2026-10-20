import express from 'express';
import http from 'http';
import { matchRouter } from './routes/matches.js';
import { attachWebSocketServer } from './ws/server.js';

const app = express();
// Create an HTTP server using the Express app, wss will be attached to this server
const server = http.createServer(app);

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportz API!' });
});

app.use('/matches', matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baaseUrl = '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running at ${baaseUrl}`);
  console.log(`WebSocket server is running at ${baaseUrl.replace('http', 'ws')}/ws`);
});
