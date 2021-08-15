const PORT = process.env.PORT || 3000;
const express = require("express");
const socketIO = require("socket.io");
const app = express();
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//https://atlantisworld.netlify.app/
//https://localhost:8080

/** */
/**GLOBAL VARIABLES */
/** */
var players = [];
var users;
var count;

/** */
/** SOCKET SETUP*/
/** */
io.on("connection", (socket) => {
  console.log("Client connected");

  
  // send player list to socket and new player to everyone else
  socket.on("playerJoined", onPlayerJoined);
  // send updated player move data to all other sockets
  socket.on("playerMoved", onPlayerMoved);
  //when sockets leave
  socket.on("close", onClose);
  socket.on("disconnect", onDisconnect);
  //catch errors
  socket.on("list items", onListItems);
  socket.on("nextPos", onNextPos);
  socket.on("stopAnim", onStopAnim);
  socket.on("startAnim", onStartAnim);
  socket.on("nextTile", onNextTile);
  socket.on("joinRoom", onJoinRoom);
  socket.on("leaveRoom", onLeaveRoom);
  socket.on("message", onMessage);
});

/** */
/** CALLBACK FUNCTION DEFINITIONS */
//** */

function onJoinRoom(room) {
  this.join(room);
  var roomUsers = Array.from(io.sockets.adapter.rooms.get(room));
  this.emit("roomData", roomUsers, room);
  this.to(room).emit("chatUserJoin", players[this.id].username, this.id);
}

function onLeaveRoom(room) {
  this.leave(room);
  this.to(room).emit("chatUserLeave", players[this.id].username);
}

function onMessage(room, message) {
  const playerUsername = players[this.id].username;
  this.to(room).emit("message", message, playerUsername);
  console.log(
    playerUsername + " is sending message: " + message + " to room " + room
  );
}

function onNextTile(tilePos) {
  this.broadcast.emit("nextTile", tilePos, this.id);
  if (players[this.id]) {
    players[this.id].tilePos = tilePos;
  }
}

function onStartAnim(direction) {
  this.broadcast.emit("startAnim", direction, this.id);
}

function onStopAnim(direction) {
  this.broadcast.emit("stopAnim", direction, this.id);
}

function onNextPos(pos) {
  this.broadcast.emit("nextPos", pos, this.id);
}

function getCount(socket) {
  count = io.of("/").sockets.size;
  users = Array.from(io.sockets.adapter.rooms);
  socket.emit("playerCount", count, users);
}

// adds new player to players array and send back to same socket, and sends individual player data to all other sockets
function onPlayerJoined(player) {
  getCount(this);
  // players obj struct
  var socketId = this.id;
  players[socketId] = {
    player_id: socketId,
    username: player.username,
    x: player.x,
    y: player.y,
    tilePos: player.tilePos,
    direction: player.direction,
  };

  //create player list
  var list = [];
  console.log("count: " + count);
  for (let i = 0; i < count; i++) {
    if (users[i]) {
      list.push(players[users[i][0]]);
    }
  }

  console.log("sending playerData");
  console.log(list);
  console.log(players[socketId]);
  this.emit("allPlayers", list, players[socketId]);
  this.broadcast.emit("newPlayer", players[socketId]);
}

function onPlayerMoved(direction, tilePos) {
  // update tile pos
  players[this.id].tilePos = tilePos;
  // send info to other players' movement intent
  this.broadcast.emit("playerMoved", this.id, direction);
}

function onClose() {
  delete players[this.id];
  this.broadcast.emit("removePlayer", this.id);
  console.log("Client disconnected");
}

function onDisconnect() {
  delete players[this.id];
  this.broadcast.emit("removePlayer", this.id);
  console.log("Client disconnected");
}

// listens to catch errors
async function onListItems(callback) {
  try {
    const items = await findItems();
    callback({
      status: "OK",
      items,
    });
  } catch (e) {
    callback({
      status: "NOK",
    });
  }
}
