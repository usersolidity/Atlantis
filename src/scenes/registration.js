import * as MetaMaskAPI from "../web3/metamaskConnection";

/**Global Variables */
var gameScene;

/**Scene Setup */
class RegistrationScene extends Phaser.Scene {
  constructor() {
    super("RegistrationScene");
  }
  init() {
    // Used to prepare data
  }
  preload() {
    gameScene = this;
    loadAssets();
  }
  create(User) {
    setBackground();
    setRegistrationForm(User);
  }
  update(time, delta) {}
}

function setBackground() {
  var bg = gameScene.add.image(0, 0, "bg").setOrigin(0).setScale(0.5);
  var spotlight = gameScene.add
    .dom(450, 445)
    .createFromCache("spotlight")
    .setDepth(3);

  // var char = gameScene.add.dom(732, 219).createFromCache("char").setDepth(3);
  var char = gameScene.add.dom(732, 285).createFromCache("char").setDepth(3);
  var sign = gameScene.add.dom(1100, 400).createFromCache("sign").setDepth(3);
}

// create bg with animation and start play
// function setBackground() {
//   var bg = gameScene.add.image(0, 0, "bg").setOrigin(0).setScale(0.5);

// }

function setRegistrationForm(User) {
  console.log(User);
  var profileInput = gameScene.add
    .dom(530, 660)
    .createFromCache("registrationForm")
    .setDepth(3)
    .addListener("click");
  var inputUsername = profileInput.getChildByName("username");
  var inputEmail = profileInput.getChildByName("email");
  if (User.username) inputUsername.value = User.username;
  if (User.email) inputEmail.value = User.email;

  profileInput.on("click", function (event) {
    if (event.target.name === "start") {
      if (inputUsername.value && inputEmail.value) {
        MetaMaskAPI.setProfileMoralis(
          inputUsername.value,
          inputEmail.value
        ).then((user) => {
          gameScene.scene.start("Game", { username: user.attributes.Nickname });
        });
      } else {
        alert("Please input Email and Username");
      }
    }
  });
  MetaMaskAPI.listener();
}

function loadAssets() {
  //   gameScene.load.image("bg", "assets/images/login/loginBG.jpg");
  //   //html load
  gameScene.load.html("registrationForm", "assets/registrationForm.html");
}

export default RegistrationScene;
