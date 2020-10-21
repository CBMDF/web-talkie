import io from "socket.io-client";

let socket;
export const person = Math.random();

const ENDPOINT = {
  path: "/socket.io",

  secure: true,
};

export const initiateSocket = (room) => {
  socket = io(ENDPOINT);
  if (socket && room) {
    socket.emit("join", room);
  }
};
export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const subscribeToChat = (cb) => {
  if (!socket) return true;
  socket.on("chat", (msg) => {
    return cb(null, msg);
  });
};

export const subscribeToError = (cb) => {
  if (!socket) return true;
  socket.on("connect_error", (msg) => {
    return cb(null, msg);
  });
};

export const subscribeToReconnect = (cb, room) => {
  if (!socket) return true;

  socket.on("reconnect", (msg) => {
    socket.emit("join", room);
    return cb(null, msg);
  });
};

export const sendMessage = (room, message, apelido) => {
  if (socket) socket.emit("chat", { message, room, person, apelido });
};

export const subscribeToQtd = (cb) => {
  if (!socket) return true;
  socket.on("qtdConectado", (msg) => {
    return cb(null, msg);
  });
};
