
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// ✅ MIDDLEWARE FIRST (IMPORTANT)
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// ✅ ROUTES
const alumniRoutes = require("./routes/alumni");
const authRoutes = require("./routes/auth");
const usersRoute = require("./routes/users");

app.use("/api/alumni", alumniRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoute);
app.use("/api/posts", require("./routes/posts"));
app.use("/api/mentorship", require("./routes/requests"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/alumni", require("./routes/alumni"));

// ✅ TEST ROUTE
app.get("/test", (req, res) => {
    res.json({ message: "API working properly 🚀" });
});

// ✅ START SERVER
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
    
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});
global.io = io;

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("join_room", (chatId) => {
        socket.join(chatId);
    });

    socket.on("send_message", (data) => {
        socket.to(data.chatId).emit("receive_message", data);
    });
});

server.listen(5000, () => {
    console.log("Server running with WebSocket 🚀");
});
