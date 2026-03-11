const ws = new WebSocket("wss://你的railway地址");

ws.onmessage = (event) => {
  const chat = document.getElementById("chat");
  chat.innerHTML += "<div>" + event.data + "</div>";
};

function send() {
  const input = document.getElementById("msg");
  ws.send(input.value);
  input.value = "";
}
