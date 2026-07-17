import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { config } from "./config";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins,
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    socket.on("support:join", (sessionId: string) => {
      if (typeof sessionId === "string" && sessionId.length > 8) {
        socket.join(`session:${sessionId}`);
      }
    });

    socket.on("disconnect", () => {
      /* no-op */
    });
  });

  return io;
}

export function getIo() {
  return io;
}
