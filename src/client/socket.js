import { scene, otherPlayers, chatForm } from "../scenes/game";  
import { io } from "socket.io-client";
import { chat } from "../map/seats";

export var newSocket;
export var playerCount;
export var allPlayers;
export var self;
export var messages = [];
var users = [];
var messageBox;
var usersBox;
var roomsBox;
export var chatWindow;
export var renderedMessages;
var renderedChatUsers;
var renderedRooms;

export function renderMessages() {

  renderedMessages = messages.map(msg => {
    if(msg.event) {
      return(
        `<p class="eventText">${msg.eventText}</p>`
      )
    }
    else {
      return(
        '<p class="message">' + `<strong>${msg.username} : </strong>` +
          `${msg.text}` +
        '</p>'
      )
    }
  }).join('');
  messageBox.innerHTML = renderedMessages;
}

function renderChatUsers() {
  renderedChatUsers = users.map((user, i) => {
    return(
      '<p class="chatUser">' + `<strong>${user.username}</strong>` + `<button class="pmButton" id="user${i}">PM</button>` + '<p/>'
    )
  }).join('');
  usersBox.innerHTML = renderedChatUsers;
}

function renderRooms() {
  renderedRooms = chat.openRooms.map(room => {
    return(
      `<button class="chatButton>${room.name}</button>`
    )
  }).join('');
  roomsBox.innerHTML = renderedRooms;
}

// export function updateRoomName() {

// }

function onSocketConnect() {
  console.log("client connected to socket");
  messageBox = chatForm.parent.ownerDocument.getElementById("messages");
  usersBox = chatForm.parent.ownerDocument.getElementById("chatUsers__display");
  chatWindow = chatForm.parent.ownerDocument.getElementById("chatWindow");
  roomsBox = chatForm.parent.ownerDocument.getElementById("chatTabs");
}

  // returns number of connected sockets and list of socket ids
  function onPlayerCount(count, users) {
    console.log("player count: ");
    console.log(count);
    console.log(users);
    playerCount = count;
  }

  function onAllPlayers(playerList, player) {
    
    console.log("------------NEWDATA-----------");
    console.log("player list: ");
    console.log(playerList);
    console.log("player: ")
    console.log(player);
    console.log("------------NEWDATA-----------");
    allPlayers = playerList;
    self = player;
    scene.loadPlayers();
    
  }

  function onRemovePlayer(socketId) {
    console.log("removing player");
    for (let i = 0; i < otherPlayers.length; i++) {
      console.log("other player: " + otherPlayers[i].player_id);
      console.log("current socket: " + socketId);
      if (otherPlayers[i].player_id === socketId) {
        otherPlayers[i].sprite.destroy();
        otherPlayers[i].usernameText.destroy();
        otherPlayers.splice(i, 1);
      }
      if (allPlayers[i].player_id === socketId) {
        allPlayers.splice(i,1);
      }
    }
    playerCount--;
    console.log(this.otherPlayers);
  }

  function onSocketDisconnect() {
    newSocket.emit("removePlayer");
    console.log("you are now disconnected from socket.io");
  }

  function onNextPos(pos, socketId) {
    const newVector = new Phaser.Math.Vector2;
      newVector.x = pos.x;
      newVector.y = pos.y;
      for(let i = 0; i < otherPlayers.length; i++) {
        if(otherPlayers[i].player_id === socketId) {
          otherPlayers[i].setPosition(newVector);
        }
      } 
  }

  function onStopAnim(direction, socketId) {
    for(let i = 0; i < otherPlayers.length; i++) {
      if(otherPlayers[i].player_id === socketId) {
        otherPlayers[i].stopAnimation(direction);
      }
    }
  }

  function onStartAnim(direction, socketId) {
    for(let i = 0; i < otherPlayers.length; i++) {
      if(otherPlayers[i].player_id === socketId) {
        otherPlayers[i].startAnimation(direction);
      }
    }
  }

  function onNextTile(tilePos, socketId) {
    var newTile = new Phaser.Math.Vector2;
    newTile.x = tilePos.x;
    newTile.y = tilePos.y;
    for(let i = 0; i < otherPlayers.length; i++) {
        if(otherPlayers[i].player_id === socketId) {
          otherPlayers[i].setTilePos(newTile);
        } 
    }
  }

//create new logged in player
function onNewPlayer(player) {
  scene.createOtherPlayer(player);
  allPlayers.push(player);
  playerCount++;
}

function onMessage(message, username) {
  var msg = {
    username: username,
    text: message
  }
  console.log(msg);
  messages[messages.length] = msg;
  renderMessages();
  messageBox.innerHTML = renderedMessages;
}

function onChatUserJoin(username, socketId) {
  makeEvent("joined", username);
  console.log(event.eventText);
  getUsername(socketId);
  
}

function onChatUserLeave(username) {
  makeEvent("left", username);
  console.log(event.eventTask);
  removeUser(username);
}

function removeUser(username) {
  for(let i = 0; i < users.length; i++) {
    if(user[i].username === username) {
      users.splice(i,1);
    }
  }
  renderChatUsers();
}

export function makeEvent(type, username) {
  const event = {
    event: type,
    eventText: "--- " + username + " has " + type + " the chat ---"
  }
  messages.push(event);
  renderMessages();
}

function onRoomData(usersArray, room) {
  users = [];
  console.log("CHATROOM USERS: ");
  console.log(users);
  getAllUsernames(usersArray);
  newRoom(room,room);
  
}

function newRoom(name, socket) {
  const newRoom = {
    index: chat.openRooms.length,
    name: name,
    socket: socket
  }
  if(!checkForRoom(newRoom.name)) {
    chat.roomIndex = chat.openRooms.length;
    chat.openRooms[chat.roomIndex] = newRoom;
    makeEvent("joined", "you");
    renderRooms();
  }
}

function checkForRoom(name) {
  for(let i = 0; i < chat.openRooms.length; i++) {
    if(chat.openRooms[i].name === name) {
      return true;
    }
  }
  return false;
}

export function deleteRoom(socket) {
  for(let i = 0; i < chat.openRooms.length; i++) {
    if(socket === chat.openRooms[i].socket) {
      chat.openRooms.splice(i,1);
      chat.openRooms.roomIndex = i -1;
    }
  }
  renderRooms();
}

function getAllUsernames(array) {
  for(let i = 0; i < array.length; i++) {
    getUsername(array[i]);
    //console.log("current socket: " + array[i])
  }
}

function getUsername(socketId) {
  for(let i = 0; i < playerCount; i++) {
    if(allPlayers[i]) {
      if(socketId === allPlayers[i].player_id) {
        const newUser = {
          username: allPlayers[i].username,
          playerId: socketId
        }
        users[users.length] = newUser;
      }
    }
    renderChatUsers();
  } 
}
  //set up client side socket handshake
export function connectSocket() {
    // point to server
    newSocket = io("https://aw-testserver.herokuapp.com/");
    
    newSocket.on("connect", onSocketConnect);
    newSocket.on("playerCount", onPlayerCount);
    newSocket.on("removePlayer", onRemovePlayer);
    newSocket.on("allPlayers", onAllPlayers);
    newSocket.on("newPlayer", onNewPlayer);
    newSocket.on("disconnect", onSocketDisconnect);
    newSocket.on("nextPos", onNextPos);
    newSocket.on("stopAnim", onStopAnim);
    newSocket.on("startAnim", onStartAnim);
    newSocket.on("nextTile", onNextTile);
    newSocket.on("message", onMessage);
    newSocket.on("chatUserJoin", onChatUserJoin);
    newSocket.on("chatUserLeave", onChatUserLeave);
    newSocket.on("roomData", onRoomData);
  }
  
  
  