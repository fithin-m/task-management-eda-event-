import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const socketAuth = (socket: Socket, next: any) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized: No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Normalize JWT payload shape across REST + sockets
    // REST issues { userId, role }, while socket handlers expect { id, role }.
    const userId: string | undefined = decoded?.userId ?? decoded?.id;
    const role: string | undefined = decoded?.role;

    if (!userId) {
      return next(new Error("Unauthorized: Invalid token payload"));
    }

    (socket as any).user = { id: userId, role };

    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
};