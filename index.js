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
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`use with id ${socket.id} joined room ${data}`);
  });
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(PORT, () => console.log("server is running", PORT));
