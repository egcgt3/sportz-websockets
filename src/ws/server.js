import { WebSocket, WebSocketServer } from 'ws';

const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB

function sendJson(socket, data) {
  if(socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(data));
}

function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if(client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}

export function attachWebSocketServer(server) {
  // attached to the same HTTP server as the Express app
  const wss = new WebSocketServer({server, path: '/ws', maxPayload: MAX_PAYLOAD_SIZE});

  wss.on('connection', (socket) => {
    sendJson(socket, {type: 'welcome'});

    socket.on('error', console.error);
  });

  function broadcastMatchCreated(match) {
    broadcast(wss, {type: 'match_created', data: match});
  }

  return { broadcastMatchCreated };
}

