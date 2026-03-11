const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // 建议先不加 path: "/ws"，看她那边默认连哪

app.use(express.static(path.join(__dirname, "../public")));

// 存储当前在线用户（如果需要的话）
const users = new Map();

wss.on("connection", function connection(ws) {
  console.log("检测到新客户端接入...");

  ws.on("message", function incoming(rawData) {
    let data;
    try {
      // 尝试解析 JSON
      data = JSON.parse(rawData.toString());
    } catch (e) {
      console.log("收到非 JSON 消息:", rawData.toString());
      return;
    }

    // 关键逻辑：处理注册消息
    if (data.type === 'register') {
      console.log(`用户 ${data.nickname} (${data.userId}) 注册成功`);
      
      // 保存用户信息
      ws.userData = data;
      
      // 【重点】给当前连接的客户端发回一个“欢迎/成功”的消息
      // 很多前端框架需要这个来消除“连接中”的状态
      ws.send(JSON.stringify({
        type: 'registered', // 或者是 'login_success'，取决于网友的代码，先试试这个
        success: true,
        message: "Welcome to the server!"
      }));

      // 广播给其他人：有人进来了
      const joinMsg = JSON.stringify({
        type: 'user_join',
        user: data
      });
      broadcast(joinMsg, ws); 
      return;
    }

    // 普通聊天消息广播
    broadcast(rawData.toString());
  });

  ws.on("close", () => {
    if (ws.userData) {
      console.log(`${ws.userData.nickname} 离开了`);
    }
  });
});

// 广播函数：可以选择跳过发送者
function broadcast(message, skipClient) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN && client !== skipClient) {
      client.send(message);
    }
  });
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`服务器启动成功，端口: ${PORT}`);
});
