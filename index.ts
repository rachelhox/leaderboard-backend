import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors");

const PORT = process.env.PORT || 4000;
const app = express();
const httpServer = createServer(app);

// middlewares
app.use(express.json());

app.use(cors());

const io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
  })

io.on("connect", (socket) => {

    console.log("user connected", socket.id);

    socket.on("join_board", (data) => {console.log('join board', data); socket.join(data)})

    socket.on("remove_player_from_leaderboard", (data) => {
        io.in(data.board).emit("remaining_players", data)
    })

    socket.on("add_player_to_leaderboard", (data) => {
        io.in(data.board).emit("updated_players", data)
    })
})

// health check api
app.get('/ping', (_req: Request, res: Response, next: NextFunction) => {
try {
    return res.status(200).send('pong');
} catch (err) {
    next(err);
}
})

// 404 middleware
app.use((_req, _res, next) => {
const error = new Error('Not found') as ResponseError;
error.status = 404;
next(error);
});

// error handler middleware
app.use((error: ResponseError, _req: Request, res: Response, _next: NextFunction) => {
res.status(error.status || 500).send({
    error: {
    status: error.status || 500,
    message: error.message || 'Internal Server Error',
    }
});
});

httpServer.listen(PORT);
console.log('Server listening on port ' + `http://localhost:${PORT}`)
