import * as Phaser from "phaser";
import { Player } from "../movement/Player";
import { AtlantisControls } from "../movement/AtlantisControls";
import { AtlantisPhysics } from "../movement/AtlantisPhysics";
import { Direction } from "../movement/Direction";
import {
  newSocket,
  connectSocket,
  playerCount,
  allPlayers,
  self,
  messages,
  renderedMessages,
  renderMessages,
  chatWindow,
  deleteRoom,
  makeEvent,
} from "../client/socket.js";
import eventsCenter from "../EventsCenter.js";
import { getAudius, musicUpdate } from "../audius/musicPlayer.js";
import { Seats, chatroom, chat } from "../map/seats";
import { setAudius } from "../audius/musicPlayer.js";
import { listener } from "../web3/metamaskConnection.js";

const PLAYER_SCALE = 1.8;
const PLAYER_DEPTH = 6;

var musicPlayer;
var textInput;
var message = "";
export var username: string;
var gameLoaded: boolean = false;
export var otherPlayers = [];
export var chatForm;
export var scene;
export var playerObj;
export var seats = new Seats(false, false);
export var inBldg = false;

//var socket;

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};

export class GameScene extends Phaser.Scene {
  static readonly TILE_SIZE = 32;
  private playerSprite;
  private mainSceneTileMap;
  private player;

  private atlantisControls: AtlantisControls;
  public atlantisPhysics: AtlantisPhysics;

  constructor() {
    super(sceneConfig);
  }

  /*
   *  KAY PHASER SCENE INITIALIZATION FUNCTIONS
   */

  init(data) {
    if (data.username) {
      username = data.username;
    }
  }

  public preload() {
    scene = this;
    this.loadAssets();
  }

  public create() {
    this.scale.displaySize.setAspectRatio(1300 / 800);
    this.scale.refresh();
    this.setChatForm();
    musicPlayer = this.add.dom(1075, 700).createFromCache("audius").setDepth(10).setScale(1);
    setAudius(musicPlayer);
    eventsCenter.on("exitBldg", this.exitBldg, this);
  }

  public update(_time: number, delta: number) {
    this.loadGame();
    this.afterLoaded(delta);
    this.updateControllers(delta);
    this.player.update();
    this.updateUIPos();
    musicUpdate();
  }

  /*
   * *************************
   *   ADDITIONAL FUNCTIONS
   * *************************
   */

  /**
   *
   *
   */

  public exitBldg(tilePos) {
    var vector = new Phaser.Math.Vector2();
    var posVector = new Phaser.Math.Vector2();
    vector.x = tilePos.x;
    vector.y = tilePos.y;
    posVector.x = vector.x * 32;
    posVector.y = vector.y * 32;
    this.player.setTilePos(vector);
    this.player.setPosition(posVector);
    this.atlantisPhysics.movePlayer(Direction.DOWN);
  }

  private updateUIPos() {
    var xPos = this.playerSprite.x;
    var yPos = this.playerSprite.y;
    const minX = 812;
    const maxX = 1748;
    //const minY = 100;
    const maxY = 1550;

    xPos > maxX ? (xPos = maxX) : (xPos = xPos);
    xPos < minX ? (xPos = minX) : (xPos = xPos);
    yPos > maxY ? (yPos = maxY) : (yPos = yPos);
    //yPos < minY? yPos = minY: yPos = yPos;

    chatForm.x = xPos - 683;
    chatForm.y = yPos;

    musicPlayer.x = xPos + 520;
    musicPlayer.y = yPos + 280;
  }

  private setChatForm() {
    chatForm = scene.add
      .dom(0, 660)
      .createFromCache("chatForm")
      .setDepth(10)
      .addListener("click")
      .on("click", function (event) {
        if (event.target.name === "leave") {
          seats.inChat = false;
          console.log(seats.inChat);
          //chatForm.setVisible(false);
          newSocket.emit("leaveRoom", chatroom);
          deleteRoom(chat.openRooms[chat.roomIndex].socket);
          makeEvent("left", "you");
        }
        if (event.target.name === "chat") {
          scene.submitChatMessage();
        }
      });
    //.setVisible(false);

    textInput = chatForm.parent.ownerDocument.getElementById("textInput");
    const htmlDoc = chatForm.parent.ownerDocument;

    textInput.onkeydown = function (event) {
      if (event.keyCode == 32) {
        console.log("space is pressed");
        textInput.value = textInput.value + "\xa0";
        console.log(textInput.value);
      }
      if (event.keyCode == 37) {
        scene.setCaretPosition("left", textInput);
      }
      if (event.keyCode == 39) {
        scene.setCaretPosition("right", textInput);
      }
      if (event.keyCode == 13) {
        scene.submitChatMessage();
      }
    };
  }

  public submitChatMessage() {
    //  Have they entered anything?
    if (textInput.value !== "") {
      const newMsg = {
        username: username,
        text: textInput.value,
      };
      messages.push(newMsg);
      console.log(messages);
      console.log("sending message: " + textInput.value);
      newSocket.emit("message", chatroom, textInput.value);
      renderMessages();

      chatForm.parent.ownerDocument.getElementById("messages").innerHTML = renderedMessages;
      textInput.value = "";
      textInput.focus();
    } else {
      //alert("please enter a message");
    }
  }

  public setCaretPosition(direction, element) {
    const pos = element.selectionStart;
    if (element != null) {
      if (direction === "right") {
        element.setSelectionRange(pos + 1, pos + 1);
      } else {
        element.setSelectionRange(pos - 1, pos - 1);
      }
    }
  }

  //load game scene only after logged on and only once
  private loadAssets() {
    //scene.load.image("tiles", "assets/awTileSet.png");
    scene.load.image(
      "tiles",
      "https://bafkreibcnmk4gfib6qbo7mgtsqyftxfkhlnm6rqpwb42thudpmyslzr4e4.ipfs.dweb.link/"
    );
    //scene.load.tilemapTiledJSON("demoWorld", "assets/awMap.json");
    scene.load.tilemapTiledJSON("demoWorld", "assets/awTilemap.json");
    scene.load.spritesheet(
      "player",
      "https://bafkreiarf4jshsmnakr6ytz6p3zkdvq2mzfruabvsk3t2gyu33rsod4rvy.ipfs.dweb.link/",
      {
        frameWidth: 18,
        frameHeight: 37,
      }
    );
    scene.load.html("chatForm", "assets/chat/chat.html");
    scene.load.html("audius", "assets/music/audius.html");
  }

  private updateControllers(delta) {
    for (let i = 0; i < otherPlayers.length; i++) {
      otherPlayers[i].update();
    }
  }

  private loadGame() {
    if (!gameLoaded) {
      connectSocket();
      this.createPlayer();
      this.setupCamera();
      this.createMap();
      this.setupPhysics();
      this.setupPlayerAnimation();
      this.sendPlayerData();
      listener();
      gameLoaded = true;
    }
  }

  //send your data to server
  private sendPlayerData() {
    console.log("Seemee");

    const playerObj = {
      username: this.player.username,
      x: this.playerSprite.x,
      y: this.playerSprite.y,
      tilePos: {
        x: this.player.tilePos.x,
        y: this.player.tilePos.y,
      },
      direction: "none",
    };
    console.log("sending this to server: ");
    console.log(playerObj);
    newSocket.emit("playerJoined", playerObj);
    newSocket.emit("joinRoom", chatroom);
  }

  // creates new player, adds a new player sprite and socketId
  private createOtherPlayer(player) {
    const newPlayerSprite = this.physics.add.sprite(0, 0, "player");
    newPlayerSprite.body.setSize(16, 16);
    newPlayerSprite.setDepth(PLAYER_DEPTH - 1);
    newPlayerSprite.scale = PLAYER_SCALE;
    console.log(player);
    const newVector = new Phaser.Math.Vector2();
    newVector.x = player.tilePos.x;
    newVector.y = player.tilePos.y;
    const newPlayer = new Player(
      newPlayerSprite,
      newVector,
      player.player_id,
      player.username,
      null
    );
    otherPlayers[otherPlayers.length] = newPlayer;
  }

  //iterates through list of all connected players and loads them into scene
  loadPlayers() {
    console.log("in load player");
    for (let i = 0; i < playerCount; i++) {
      if (allPlayers[i] && allPlayers[i].player_id !== self.player_id) {
        console.log("creating player " + i);
        scene.createOtherPlayer(allPlayers[i]);
      }
    }
    console.log("other players: ");
    console.log(otherPlayers);
  }

  //only listed for control inputs after the game is loaded
  private afterLoaded(delta) {
    if (gameLoaded) {
      this.atlantisControls.update();
      this.atlantisPhysics.update(delta);
      playerObj = this.player;
    }
  }

  // create map by iterating through tilemap data
  private createMap() {
    var layers = this.add.group();
    this.mainSceneTileMap = this.make.tilemap({ key: "demoWorld" });
    const tileSet = this.mainSceneTileMap.addTilesetImage("awTileset", "tiles");
    for (let i = 0; i < this.mainSceneTileMap.layers.length; i++) {
      const layer = this.mainSceneTileMap.createLayer(i, "awTileset", 0, 0);
      layer.setDepth(i);
      layer.scale = 2;
      if (i === 3) {
        /**create seating */
        seats.createSeating(layer, layers);
        this.physics.add.overlap(this.player.sprite, layers);
      }
    }
  }

  /**
   *  Adds a playerSprite
   *  Sets it depth so it will overlap other objects with lower depth
   *  Adjusting scale to match other objects on the game field.
   */
  private createPlayer() {
    this.playerSprite = this.physics.add.sprite(0, 0, "player");
    this.playerSprite.setDepth(PLAYER_DEPTH);
    this.playerSprite.scale = PLAYER_SCALE;
    this.playerSprite.body.setSize(16, 16);
  }

  //camera is set up to follow the sprite object held in this.player
  private setupCamera() {
    this.cameras.main.setBounds(0, 0, 2560, 2050);
    this.cameras.main.zoom = 0.8;
    this.cameras.main.startFollow(this.playerSprite);
    this.cameras.main.roundPixels = true;
    const cameraBounds = this.cameras.main.getBounds();
    cameraBounds.width = 1300;
    cameraBounds.height = 800;
    console.log("creating player with username: " + username);
    this.player = new Player(
      this.playerSprite,
      new Phaser.Math.Vector2(40, 46),
      "",
      username,
      null
    );
  }

  // create new control and physics objects linking in the main player and input
  private setupPhysics() {
    this.atlantisPhysics = new AtlantisPhysics(this.player, this.mainSceneTileMap, true);
    this.atlantisControls = new AtlantisControls(this.input, this.atlantisPhysics);
  }

  //creates all animations for 4 arrow directions
  private setupPlayerAnimation() {
    this.createPlayerAnimation(Direction.UP, 0, 2);
    this.createPlayerAnimation(Direction.RIGHT, 3, 5);
    this.createPlayerAnimation(Direction.DOWN, 6, 8);
    this.createPlayerAnimation(Direction.LEFT, 9, 11);
  }

  //set up for each animation
  private createPlayerAnimation(name: string, startFrame: number, endFrame: number) {
    this.anims.create({
      key: name,
      frames: this.anims.generateFrameNumbers("player", {
        start: startFrame,
        end: endFrame,
      }),
      frameRate: 10,
      repeat: -1,
      yoyo: true,
    });
  }
}

export default GameScene;
