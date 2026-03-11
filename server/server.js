const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path"); // 引入路径模块

const app = express();
const server = http.createServer(app);

// 关键改动：确保 wss 能够正确处理路径（如果你的网友代码连接的是 /ws）
const wss = new WebSocket.Server({ 
  server: server,
  path: "/ws" // 明确指定路径，与你的日志请求匹配
});

// 使用绝对路径指向 public 文件夹
app.use(express.static(path.join(__dirname, "../public")));

wss.on("connection", function connection(ws) {
  console.log("新用户已连接");

  ws.on("message", function incoming(message) {
    // 广播给所有用户
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("error", console.error);
});

// Railway 必须读取 process.env.PORT
const PORT = process.env.PORT || 8080;
// 必须监听 0.0.0.0
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
