import {newSocket, scene} from "../scenes/game";
  // creates debug test button for testing connection and socket disconnect
  function makeTestBtn() {
    const tBtn = scene.add
      .rectangle(1300, 1600, 128, 64, 0xfff)
      .setInteractive()
      .setDepth(33)
      .setOrigin(0.5);
    const tBtnText = scene.add
      .text(1300, 1600, "TEST", { fontSize: "23px" })
      .setOrigin(0.5)
      .setDepth(33);
    tBtn.on(
      "pointerdown",
      function (pointer) {
        newSocket.emit("test");
        console.log("button pressed");
      }.bind(scene)
    );
  }

  export default makeTestBtn;