import { io } from "socket.io-client";

const BACKEND_URL = "https://rootsclasess.vercel.app";
const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const SOCKET_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || (isLocal ? "http://localhost:5050" : BACKEND_URL);

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      try {
        this.socket = io(SOCKET_URL, {
          transports: ["websocket", "polling"],
          reconnectionAttempts: 5,
          timeout: 6000
        });
        console.log("Connected to socket server");
      } catch (err) {
        console.warn("Socket connection warning:", err.message);
      }
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
