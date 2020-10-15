import io from 'socket.io-client';

let socket;
export const person = Math.random();

const ENDPOINT = {
  path: '/socket.io',

  secure: true,
};

export const initiateSocket = (room) => {
  socket = io(ENDPOINT);
  // console.log(`Connecting socket...`);
  if (socket && room) {
    socket.emit('join', room);
  }
};
export const disconnectSocket = () => {
  //  console.log('Disconnecting socket...');
  if (socket) socket.disconnect();
};

export const subscribeToChat = (cb) => {
  if (!socket) return true;
  socket.on('chat', (msg) => {
    //  console.log('Websocket event received!');
    return cb(null, msg);
  });
};

export const subscribeToError = (cb) => {
  if (!socket) return true;
  socket.on('connect_error', (msg) => {
    //  console.log('Websocket event received!');
    return cb(null, msg);
  });
};

export const subscribeToReconnect = (cb) => {
  if (!socket) return true;
  socket.on('reconnect', (msg) => {
    //  console.log('Websocket event received!');
    return cb(null, msg);
  });
};

export const sendMessage = (room, message) => {
  if (socket) socket.emit('chat', { message, room, person });
};

export const subscribeToQtd = (cb) => {
  if (!socket) return true;
  socket.on('qtdConectado', (msg) => {
    //   console.log('Websocket event received!', msg);
    return cb(null, msg);
  });
};
