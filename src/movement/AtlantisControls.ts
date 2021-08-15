import { Direction } from "./Direction";
import { AtlantisPhysics } from "./AtlantisPhysics";
import { seats, inBldg } from "../scenes/game";
import {chatWindow} from "../client/socket.js";

export class AtlantisControls {
  constructor(
    private input: Phaser.Input.InputPlugin,
    private atlantisPhysics: AtlantisPhysics
  ) {}

  update() {
    const cursors = this.input.keyboard.createCursorKeys();
    let physics = this.atlantisPhysics;
    if (cursors.left.isDown && !seats.inChat && !inBldg) {
      //chatWindow.classList.toggle("slideOut");
      physics.movePlayer(Direction.LEFT);
    } else if (cursors.right.isDown && !seats.inChat && !inBldg) {
      physics.movePlayer(Direction.RIGHT);
    } else if (cursors.up.isDown && !seats.inChat && !inBldg) {
      physics.movePlayer(Direction.UP);
    } else if (cursors.down.isDown && !seats.inChat && !inBldg) {
      physics.movePlayer(Direction.DOWN);
    }
  }
}
