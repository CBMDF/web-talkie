const express = require("express");
const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
var compression = require("compression");

const socketIo = require("socket.io");
const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;

// // Multi-process to utilize all CPU cores.
// if (!isDev && cluster.isMaster) {
//   console.error(`Node cluster master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
//   });

// } else {
const app = express();
const server = require("http").createServer(app);
app.use(compression());
const io = socketIo(server);

app.use(function (req, res, next) {
  req.io = io;
  next();
});

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https")
      res.redirect(`https://${req.header("host")}${req.url}`);
    else next();
  });
}

io.on("connection", (socket) => {
  //  console.log("New client connected");

  socket.on("join", (room) => {
    //  console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
    io.to(room).emit("qtdConectado", io.sockets.adapter.rooms[room]);
  });

  socket.on("chat", (data) => {
    const { message, room, person, apelido } = data;
    // console.log(`msg: ${message}, room: ${room}`);
    io.to(room).emit("chat", { message, person, apelido });
  });

  for (let i = 1; i < 100; i++) {
    socket.leave(i, () => {
      io.to(i).emit("qtdConectado", io.sockets.adapter.rooms[i]);
    });
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    for (let i = 1; i < 100; i++) {
      socket.leave(i, () => {
        io.to(i).emit("qtdConectado", io.sockets.adapter.rooms[i]);
      });
    }
  });
});

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

// Answer API requests.
app.get("/api", function (req, res) {
  res.set("Content-Type", "application/json");
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests return the React app, so it can handle routing.
// app.get('*', function(request, response) {
//   response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
// });

server.listen(PORT, function () {
  console.error(
    `Node ${
      isDev ? "dev server" : "cluster worker " + process.pid
    }: listening on port ${PORT}`
  );
});
//}
