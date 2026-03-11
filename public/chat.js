const ws = new WebSocket("wss://simplechat-production-c6a6.up.railway.app/ws");

ws.onmessage = (event) => {
  const chat = document.getElementById("chat");
  chat.innerHTML += "<div>" + event.data + "</div>";
};

function send() {
  const input = document.getElementById("msg");
  ws.send(input.value);
  input.value = "";
}
