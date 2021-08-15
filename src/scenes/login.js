import * as MetaMaskAPI from "../web3/metamaskConnection.js";
import {getAudius, musicUpdate, setAudius} from "../audius/musicPlayer";
/**Global Variables */
export var gameScene;
var audius;

/**Scene Setup */
class LoginScene extends Phaser.Scene {
  constructor() {
    super("LoginScene");
  }
  init() {
    // Used to prepare data
  }
  preload() {
    gameScene = this;
    loadAssets();
    MetaMaskAPI.connectMoralis();
    
  }
  create() {
    setBackground();
    setLoginForm();
    setAudius(audius);
    getAudius();
  }
  update(time, delta) {
    musicUpdate();
  }
}

// create bg with animation and start play
function setBackground() {
  var bg = gameScene.add.image(0, 0, "bg").setOrigin(0).setScale(0.5);
  var spotlight = gameScene.add.dom(440, 300).createFromCache("spotlight").setDepth(3);
  var char = gameScene.add.dom(740, 205).createFromCache("char").setDepth(3);
  var sign = gameScene.add.dom(1090, 390).createFromCache("sign").setDepth(3);
  audius = gameScene.add.dom(1100,650).createFromCache("audius").setDepth(4);

}

const startGameScene = async (user) => {
  console.log(user.attributes);
  user.attributes.Nickname && user.attributes.email
    ? gameScene.scene.start("Game", {
        username: user.attributes.Nickname,
      })
    : gameScene.scene.start("RegistrationScene", {
        username: user.attributes.Nickname,
        email: user.attributes.email,
      });
};

function setLoginForm() {
  var loginInput = gameScene.add
    .dom(530, 660)
    .createFromCache("loginForm")
    .setDepth(3)
    .addListener("click");
  // console.log("login start2");
  loginInput.on("click", function (event) {
    if (event.target.name === "login") {
      MetaMaskAPI.authenticateMoralis("metamask").then((user) => startGameScene(user));
    } else if (event.target.name === "loginWalletConnect") {
      MetaMaskAPI.authenticateMoralis("walletconnect").then((user) => startGameScene(user));
    }
  });
}

function loadAssets() {
  gameScene.load.image("bg", "assets/images/login/loginBG.jpg");
  //html load
  gameScene.load.html("loginForm", "assets/login/loginForm.html");
  gameScene.load.html("spotlight", "assets/login/spotlight.html");
  gameScene.load.html("sign", "assets/login/sign.html");
  gameScene.load.html("char", "assets/login/char.html");
  gameScene.load.html("audius", "assets/music/audius.html");
}

export default LoginScene;
