const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const PORT = 8080;
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./model/user");
require("dotenv").config();
const DB = process.env.DATABASE;

app.use(
  cors({
    origin: ["http://localhost:3000", "https://chatteam.netlify.app/"],
  })
);

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(DB)
  .then(() => {
    console.log("connnected to db");
    // app.listen(PORT, () => console.log("connected to server at port", PORT));
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("hello");
});
app.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(422)
        .json({ error: "please enter username and password" });
    } else {
      const checkuser = await User.findOne({ username });
      if (checkuser) {
        return res
          .status(422)
          .json({ error: "username not available change username" });
      } else {
        const hashedpassword = await bcrypt.hash(password, 12);
        await new User({
          username,
          password: hashedpassword,
        }).save();
        return res.status(200).json({ message: "user created successfully" });
      }
    }
  } catch (err) {
    console.log("login error__________________________", err);
  }
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
