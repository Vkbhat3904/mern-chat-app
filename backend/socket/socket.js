import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

const userSocketMap = {}; // { userId: [socketId1, socketId2, ...] }

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId] || [];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    userSocketMap[userId].push(socket.id);
    socket.join(userId); // Join user-specific room
    console.log(`User ${userId} connected with sockets:`, userSocketMap[userId]);
  }

  // Handle ping/pong for connection health
  socket.on("ping", (cb) => {
    if (typeof cb === "function") cb();
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

export { app, io, server };

// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:3000"],
//     methods: ["GET", "POST", "PATCH", "DELETE"],
//     credentials: true
//   },
// });

// const userSocketMap = {}; // { userId: [socketId1, socketId2, ...] }

// export const getReceiverSocketId = (userId) => {
//   return userSocketMap[userId] || []; // Return all sockets for user
// };

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (userId && userId !== "undefined") {
//     if (!userSocketMap[userId]) {
//       userSocketMap[userId] = [];
//     }
//     userSocketMap[userId].push(socket.id);
//     console.log(`User ${userId} connected with sockets:`, userSocketMap[userId]);
//   }

//   // Notify all clients about online users
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//     if (userId && userSocketMap[userId]) {
//       userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
//       if (userSocketMap[userId].length === 0) {
//         delete userSocketMap[userId];
//       }
//     }
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { app, io, server };