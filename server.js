const express = require("express");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production"; // Check if we're in development mode
const app = next({ dev }); // Initialize Next.js app
const handle = app.getRequestHandler(); // Handler for routing requests to Next.js

app.prepare().then(() => {
  const server = express(); // Create an Express server

  // Create a Socket.IO server and attach it to the Express server
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // The origin URL of your Next.js app (adjust as necessary)
      methods: ["GET", "POST"], // Allow these HTTP methods
    },
  });

  // Listen for new WebSocket connections
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for incoming messages from the client
    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      io.emit("message", msg); // Broadcast the message to all connected clients
    });

    // Handle client disconnecting
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Set up a catch-all route handler for all requests, sending them to Next.js to be handled
  server.all("*", (req, res) => {
    return handle(req, res); // This will route all requests to Next.js
  });

  // Start the server on port 3001
  server.listen(3001, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3001");
  });
});
