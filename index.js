const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { dbconnect } = require("./config/database");
const cors = require("cors");
const auth = require("./routes/auth");
const chat = require("./routes/chat");
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3001/",
  // "http://localhost:8080/",
  // "http://localhost:8080",
  "https://metrixcolorchange.netlify.app",
  "*",
  "https://cheeta-chat.netlify.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.use(express.json());

dbconnect();

app.use("/api/auth", auth);
app.use("/api/chat", chat);

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { room } = data;
    // emailToSocketIdMap.set(email, socket.id);
    // socketidToEmailMap.set(socket.id, email);
    socket.join(room);
    console.log(`room joined by ${room}`);
    // io.to(room).emit("user:joined", { email, id: socket.id });
    // io.to(socket.id).emit("room:join", data);
  });

  // for message
  socket.on("chatMessage", ({ to, from, message, time }) => {
    // Broadcast the message to other users in the room
    // console.log(to, from, message, time);
    io.to(to).emit("receiveMessage", { to, from, message, time });
  });

  // for calling

  socket.on("videoCalling", ({ to, from, offer }) => {
    console.log("videoCalling", to, from);
    io.to(to).emit("incomming:videCall", { from: from, offer });
  });

  socket.on("call:accepted", ({ to, from, ans }) => {
    console.log("call:accepted", to, from);
    io.to(to).emit("call:accepted", { from: from, to, ans });
  });

  socket.on("call:rejected", ({ to, from }) => {
    console.log("call:rejected", to, from);
    io.to(to).emit("call:rejected", { from: from });
  });

  socket.on("peer:nego:needed", ({ to, from, offer }) => {
    console.log("peer:nego:needed", to, from);
    io.to(to).emit("peer:nego:needed", { from: from, offer });
  });

  socket.on("peer:nego:done", ({ to, from, ans }) => {
    console.log("peer:nego:done", to, from);
    io.to(to).emit("peer:nego:final", { from: from, ans });
  });

  socket.on("call:ended", ({ to, from }) => {
    console.log("call:ended", to, from);
    io.to(to).emit("call:ended", { from: from });
  });

  socket.on("disconnect", (room) => {
    console.log("Socket disconnected");
    // io.to(room).emit("user:left", { id: socket.id });
    // socketidToEmailMap.delete(socket.id);
    // emailToSocketIdMap.delete(email);
    // socket.leave(room);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
