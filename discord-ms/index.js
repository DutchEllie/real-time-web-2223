import * as dotenv from "dotenv";
dotenv.config();

import { DiscordApp } from "./src/discord.js";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import messageHandler from "./handlers/messageHandler.js";
import cors from "cors";

const app = express();
// app.use(cors);
const httpServer = createServer(app);
const io = new Server(httpServer, {});
const port = 3000;

const discordToken = process.DISCORD_TOKEN;
const discordApp = new DiscordApp(discordToken);
// discordApp.registerEvents();

const onConnection = (socket) => {
	// console.log("a user connected");
	messageHandler(io, socket, discordApp);
	discordApp.setSocket(io);
	console.log("Ready for connections!")

	// discordApp.sendMessage();
	// socket.emit("message", "Hello World!");
};

io.on("connection", onConnection);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

httpServer.listen(port, );
