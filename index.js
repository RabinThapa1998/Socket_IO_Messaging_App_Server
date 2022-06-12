const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const PORT = 8080;
const cors = require("cors");

app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connection at", socket.id);
  socket.on("send-message", (message) => {
    console.log(message);
    io.emit("receive-message", message);
    // socket.broadcast.emit("receive-message", message);
  });
});

server.listen(PORT, () => console.log("server is running", PORT));
