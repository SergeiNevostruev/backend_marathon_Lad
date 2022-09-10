import http from "http";
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { parse } from "url";
import WebSocket, { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const host = "192.168.0.107";
// const host = "localhost";
// const port = 8081;
const port = 80;
// const hostSocket = "ws://localhost";
const portSocket = 8080;

const websocket = new WebSocketServer({
  // host: host + "/chat",
  // port,
  // hostSocket,
  port: portSocket,
  // noServer: true,
});
websocket.on("connection", onConnect);
// широковещательная функция
websocket.broadcast = function (data, sender) {
  websocket.clients.forEach(function (client) {
    if (client !== sender) {
      client.send(data);
    }
  });
};
function onConnect(wsClient) {
  console.log("Новый пользователь");
  console.log(wsClient);
  // отправка приветственного сообщения клиенту
  wsClient.send("Привет от сервера");

  wsClient.on("message", function (message) {
    // wsClient.send(`Ты написал: ${message}`);
    websocket.broadcast(`Еще кто-то: ${message}`, wsClient);
  });

  wsClient.on("close", function () {
    // отправка уведомления в консоль
    console.log("Пользователь отключился");
  });

  wsClient;
}

const requestListener = function (req, res, header) {
  const { pathname } = parse(req.url);
  if (pathname === "/") {
    // console.log(pathname);
    fs.readFile(join(__dirname, "index.html"))
      .then((contents) => {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(contents);
      })
      .catch((err) => {
        res.writeHead(500);
        res.end(err);
        return;
      });
  } else if (pathname === "/chat") {
    websocket.handleUpgrade(request, res, head, function done(ws) {
      websocket.emit("connection", ws, request);
    });
  } else {
    res.destroy();
  }
};
const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Сервер запущен на ${host}:${port}`);
});
