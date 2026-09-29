import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || "http://localhost:5050";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      console.log("Connected to socket server");
    }
    return this.socket;
  }

  joinAdmin() {
    if (this.socket) {
      this.socket.emit("join_admin");
    }
  }

  joinStudents() {
    if (this.socket) {
      this.socket.emit("join_students");
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketService = new SocketService();
export default socketService;
