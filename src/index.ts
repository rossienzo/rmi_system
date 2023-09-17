import express from "express";
import routes from "./routes/index.routes";
import http from "http";
import { WebSocket } from "ws";
import { Server as WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocketServer({ server });

const PORT = 3000;
const subscribers: WebSocket[] = [];

app.use(express.json());

// configura o ejs
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(routes);

webSocketServer.on("connection", (socket) => {
	subscribers.push(socket);
	console.log("Um usuário se conectou. Total: ", subscribers.length);
	notifySubscribers("Um usuário se conectou. Total: " + subscribers.length);
  
	socket.on("close", () => {
		
		const index = subscribers.indexOf(socket);
		if (index !== -1) 
		{
			subscribers.splice(index, 1);
			console.log("Um usuário se desconectou. Total: ", subscribers.length);
			notifySubscribers("Um usuário se desconectou. Total: " + subscribers.length);
		}
	});
  
	socket.on("message", (message: string) => {
		console.log(`Nova mensagem: ${message}`);
		notifySubscribers(message);
	});
});

// Manda a mensagem para todos os clientes conectados
const notifySubscribers = (message: string) => {
	subscribers.forEach((subscriber) => {
		if (subscriber.readyState === WebSocket.OPEN) 
			subscriber.send(message);
	});
};

server.listen(PORT, () => console.log(`Server running in ${PORT}`));