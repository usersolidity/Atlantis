import * as Phaser from "phaser";
import LoginScene from "./scenes/login.js";
import RegistrationScene from "./scenes/registration";
import GameScene from "./scenes/game";
import AaveBankScene from "./scenes/aaveBank";

// canvas variables
const CANVAS_WIDTH = 1300;
const CANVAS_HEIGHT = 800;

// phaser config file
const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Atlantis World",
  render: {
    antialias: false,
  },
  type: Phaser.AUTO,
  dom: {
    createContainer: true,
  },
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  parent: "game",
  backgroundColor: "#E8F6EF",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
};

// create game, add scenes, start game
const game = new Phaser.Game(gameConfig);
game.scene.add("LoginScene", LoginScene);
game.scene.add("RegistrationScene", RegistrationScene);
game.scene.add("GameScene", GameScene);
game.scene.add("AaveBankScene", AaveBankScene);
game.scene.start("LoginScene");
