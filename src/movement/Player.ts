import { Direction } from "./Direction";
import { GameScene, scene } from "../scenes/game";

var offX;
var offY;

export class Player {
  constructor(
    private sprite: Phaser.GameObjects.Sprite,
    private tilePos: Phaser.Math.Vector2,
    private player_id: string,
    private username: string,
    private usernameText
  ) {
    //** Position of the player within tile */
    const offsetX = GameScene.TILE_SIZE / 2;
    const offsetY = GameScene.TILE_SIZE / 2;

    offX = offsetX;
    offY = offsetY;

    this.createUsername(this.username);

    this.sprite.setOrigin(0.5, 1);

    this.sprite.setPosition(
      tilePos.x * GameScene.TILE_SIZE + offsetX,
      tilePos.y * GameScene.TILE_SIZE + offsetY
    );
    this.sprite.setFrame(55);
  }

  update() {
    const newX = this.sprite.x + 2;
    const newY = this.sprite.y - 80;
    this.usernameText.setPosition(newX, newY);
  }

  /**
   *
   * @returns @param
   */
  getPosition(): Phaser.Math.Vector2 {
    return this.sprite.getBottomCenter();
  }

  /**
   *
   * @param position
   */
  setPosition(position: Phaser.Math.Vector2): void {
    this.sprite.setPosition(position.x, position.y);
  }

  stopAnimation(direction: Direction) {
    const animationManager = this.sprite.anims.animationManager;
    const standingFrame = animationManager.get(direction).frames[1].frame.name;
    this.sprite.anims.stop();
    this.sprite.setFrame(standingFrame);
  }

  startAnimation(direction: Direction) {
    this.sprite.anims.play(direction);
  }

  getTilePos(): Phaser.Math.Vector2 {
    return this.tilePos.clone();
  }

  setTilePos(tilePosition: Phaser.Math.Vector2): void {
    this.tilePos = tilePosition.clone();
  }

  createUsername(username) {
    this.usernameText = scene.add
      .text(this.sprite.x, this.sprite.y, username, {
        fontSize: 18,
        fontColor: "white",
        fontFamily: "verdana",
        stroke: "0xfff",
        strokeThickness: 6,
        fontWeight: "100",
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setResolution(3);
  }
}
