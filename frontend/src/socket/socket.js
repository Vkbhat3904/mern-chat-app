import { io } from "socket.io-client";

// Change the URL to match your backend server
export const socket = io("http://localhost:5000", {
  withCredentials: true,
});
