import { chatForm, playerObj, scene, username } from "../scenes/game";
import { newSocket, makeEvent } from "../client/socket.js";

var triggerCount = 0;
var mask;
var maskTable;
var maskBench;
export var chatroom = "public";
export var chat = {
  openRooms: [],
  roomIndex: 0,
};
var inBank = false;


//class to deal with generating seating for chat
export class Seats {
  constructor(public inChat: boolean, public inSeat: boolean) {}
  createSeating(layer, layers): void {
    this.setDefaultArea(layer);
    this.makeTables(layer);
    this.makeBenches(layer);
    layers.add(layer);
    this.makeMask();
    this.makeBank(layer);
  }

  private makeBank(layer) {
    layer.setTileLocationCallback(16, 37, 1, 1, () => {
      if(!inBank && triggerCount < 1) {
        console.log("entering bank");
        inBank = true;
        triggerCount = 1;
        scene.scene.switch("AaveBankScene");
        
      }
      inBank = true; 
       
    });
  }


  private makeTables(layer): void {
    // Arcade
    this.makeTable(26, 20, layer, 1);
    this.makeTable(32, 20, layer, 2);
    this.makeTable(44, 20, layer, 3);
    this.makeTable(50, 20, layer, 4);
    // Bar
    this.makeTable(1, 48, layer, 5);
    this.makeTable(9, 48, layer, 6);
    this.makeTable(17, 48, layer, 7);
    // Bottom
    this.makeTable(30, 58, layer, 8);
    this.makeTable(46, 58, layer, 9);
    // FoodTruck
    this.makeTable(61, 59, layer, 10);
    this.makeTable(68, 59, layer, 11);
    this.makeTable(75, 59, layer, 12);
  }

  private makeBenches(layer): void {
    // BusStop
    this.makeBench(26, 27, layer, 13);
    this.makeBench(30, 27, layer, 14);
    this.makeBench(47, 27, layer, 15);
    this.makeBench(51, 27, layer, 16);
    // Spawn
    this.makeBench(33, 36, layer, 17);
    this.makeBench(33, 46, layer, 18);
    this.makeBench(44, 36, layer, 19);
    this.makeBench(44, 46, layer, 20);
  }

  private makeBench(x: number, y: number, layer, room: number): void {
    layer.setTileLocationCallback(x, y, 3, 1, () => {
      //console.log(this.inSeat + " " + this.inChat);
      if (!scene.atlantisPhysics.isMoving()) {
        if (!this.inSeat && triggerCount < 1) {
          this.startChat("bench", x, y, room);
        }
      }
    });
  }

  private makeTable(x: number, y: number, layer, room: number): void {
    layer.setTileLocationCallback(x, y, 4, 3, () => {
      if (!scene.atlantisPhysics.isMoving()) {
        if (!this.inSeat && triggerCount < 1) {
          this.startChat("table", x, y, room);
        }
      }
    });
  }

  private startChat(type, x, y, room) {
    this.inSeat = true;
    triggerCount++;
    chatForm.setVisible(true);
    chatroom = type + room;
    chatForm.getChildByID("chatroomName").innerHTML = type + room;
    this.inChat = true;
    this.showMask(type, x, y);
    newSocket.emit("joinRoom", chatroom);
  }

  public setRoom(number: number): void {
    console.log("you are at room " + number);
    chatForm.x = scene.cameras.main.midPoint.x - 681;
    chatForm.y = scene.cameras.main.midPoint.y;
  }

  private setDefaultArea(layer) {
    layer.setTileLocationCallback(0, 0, 80, 64, () => {
      if (this.inSeat) {
        this.hideMask();
        setTimeout(() => {
          this.inSeat = false;
          triggerCount = 0;
        }, 1000);
        
      }
      if(inBank) {
        setTimeout(() => {
          inBank = false;
          console.log(inBank);
          triggerCount = 0;
        }, 1000)
      }
      //inBank = false;
      //console.log(inBank);
    });
  }

  private hideMask() {
    var triggered = 0;
    while (triggered < 1) {
      mask.setVisible(false);
      maskBench.setVisible(false);
      maskTable.setVisible(false);
      triggered++;
    }
  }

  private showMask(type, maskX, maskY) {
    const newMaskX = maskX * 32;
    const newMaskY = maskY * 32;
    console.log(scene.cameras.main);
    const newX = scene.cameras.main.midPoint.x;
    const newY = scene.cameras.main.midPoint.y;
    mask.x = newX;
    mask.y = newY;
    mask.setVisible(true);
    if (type === "bench") {
      maskBench.x = newMaskX - 16;
      maskBench.y = newMaskY;
      mask.mask = new Phaser.Display.Masks.GeometryMask(scene, maskBench);
      mask.mask.invertAlpha = true;
    }
    if (type === "table") {
      maskTable.x = newMaskX - 16;
      maskTable.y = newMaskY + 16;
      mask.mask = new Phaser.Display.Masks.GeometryMask(scene, maskTable);
      mask.mask.invertAlpha = true;
    }
  }

  private makeMask() {
    mask = scene.add
      .rectangle(0, 0, 1800, 1800, 0x3d4654, 0.5)
      .setDepth(9)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setVisible(false);
    maskBench = scene.add
      .rectangle(0, 0, 128, 64, 0xffffff, 0)
      .setDepth(10)
      .setOrigin(0)
      .setVisible(false);
    maskTable = scene.add
      .rectangle(0, 0, 160, 128, 0xffffff, 0)
      .setDepth(10)
      .setOrigin(0)
      .setVisible(false);
  }
}
