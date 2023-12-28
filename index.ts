import express from "express";
import connect from "./db/db";
import cors from "cors";
import authRouter from "./Routes/authenticate";
import userRouter from "./Routes/useroffline";
import messageRouter from "./Routes/messaging";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import ws, { WebSocket } from "ws";
import jwt from "jsonwebtoken";
import User from "./Models/User";
import Messages from "./Models/Messages";

dotenv.config();

const app = express();

interface WebSocketMessage {
  recipient: string;
  text: string;
}

interface JwtPayload {
  _id: string,
   iat:number
}

interface customWebSocket extends WebSocket {
  username?: string;
  userId?: string;
  isAlive?: boolean;
  timer?: ReturnType<typeof setInterval>;
  deathTimer?: ReturnType<typeof setTimeout>;
  ping: () => void;
  
}

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
  methods: "GET,POST,PUT,PATCH,DELETE",
  credentials: true,
  allowHeaders: "Origin, X-Requested-With, Content-Type, Accept",
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
const PORT = process.env.PORT || 5000;

connect();

app.use("/auth", authRouter);

app.use("/api", messageRouter);

app.use("/getOffline", userRouter);

const server = app.listen(PORT);

const wss = new ws.WebSocketServer({ server });

wss.on("connection", async (connection: customWebSocket, req) => {
  const notifyOnline = () => {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          usersOnline: [...wss.clients].map((c: customWebSocket) => ({
            userId: c.userId,
            username: c.username,
          })),
        }),
      );
    });
  };

  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCoookie = cookies
      .split(";")
      .find((str:string) => str.startsWith("token="));
    if (tokenCoookie) {
      const token = tokenCoookie.split("=")[1];
      if (token && process.env.JWT_SECRET) {
        const  {_id : id}  = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        const user = await User.findById(id);
        if(user){
          connection.userId = user.id;
          connection.username = user.username;
        }
      }
    }
  }

  

  connection.on("message", async (msg: string) => {
    const parsedMsg: WebSocketMessage = JSON.parse(msg.toString());
    const { recipient, text } = parsedMsg;

    if (recipient && text) {
      const messageDoc = await Messages.create({
        recipient,
        text,
        sender: connection.userId,
      });
      [...wss.clients]
        .filter((client: customWebSocket) => client.userId === recipient)
        .forEach((client: customWebSocket) =>
          client.send(
            JSON.stringify({
              text,
              recipient,
              sender: connection.userId,
              _id: messageDoc.id,
              ID: Date.now(),
            }),
          ),
        );
    }
  });
  notifyOnline();
});
