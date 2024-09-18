const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("New client connected");

  // Set up ping-pong to prevent connection timeout
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();  // Send a ping message to the client
    }
  }, 30000);  // 30 seconds interval

  ws.on("pong", () => {
    console.log("Received pong from client");
  });

  ws.on("message", (data) => {
    // Broadcast the video stream to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on("close", () => {
    clearInterval(interval);  // Clear the ping interval on close
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Start the server
server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
