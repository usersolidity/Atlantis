import { switchNetwork, getChainId } from "../web3/metamaskConnection";
import { request } from "../web3/appollo";
import { tokenValueTxt } from "../utils/utils";
import { tokens } from "../utils/consts";
import Web3 from "web3";
import eventsCenter from "../EventsCenter";
import { lendingPoolABI, erc20ABI, wethGateAbi } from "../utils/abis";

/**Global Variables */
var gameScene;
const web3 = new Web3(window.ethereum);
Moralis.initialize("nAplGpihVQeHUrirnWY20y9tFF9N0Imjb5DtCZUI");
Moralis.serverURL = "https://dlcxxcapyhza.usemoralis.com:2053/server";

/**Scene Setup */
class AaveBankScene extends Phaser.Scene {
  constructor() {
    super("AaveBankScene");
  }
  init() {
    // Used to prepare data
  }
  preload() {
    gameScene = this;
    loadAssets();
  }
  create() {
    setAaveBank();
  }
  update(time, delta) {}
}

async function getTokenBalances() {
  const balances = await Moralis.Web3.getAllERC20({ chain: "matic" });
  let resultObj = {};
  for (let balance of balances) resultObj[balance.symbol] = balance;

  return resultObj;
}

/**batch request web3 */

async function batchWeb3() {
  let userAddress = await web3.eth.getAccounts();
  userAddress = userAddress[0];
  async function makeBatchRequest(calls) {
    let batch = new web3.BatchRequest();

    let promises = calls.map((call) => {
      return new Promise((res, rej) => {
        let func = call.func.request((err, data) => {
          if (err) rej(err);
          else res({ token: call.token, allowance: data });
        });
        batch.add(func);
      });
    });
    batch.execute();
    return Promise.all(promises);
  }

  let callArray = [];

  for (let token of Object.keys(tokens)) {
    if (token == "MATIC") continue;
    const address = tokens[token].address;

    const contract = new web3.eth.Contract(erc20ABI, address);
    const call = contract.methods.allowance(
      userAddress,
      "0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf"
    ).call;
    callArray.push({ func: call, token: token });
  }

  let allowances = await makeBatchRequest(callArray);
  console.log(allowances);
}

async function getApproves() {
  // batchWeb3();
}

async function contractCall() {
  const APYs = await request();
  const balances = await getTokenBalances();
  for (let token of Object.keys(tokens)) {
    document.getElementById(`apy-${token}`).innerHTML = APYs[tokens[token].address];
    if (balances[token]) {
      document.getElementById(`inwallet-${token}`).innerHTML = tokenValueTxt(
        balances[token].balance,
        balances[token].decimals,
        ""
      );
    }
    if (balances[tokens[token].aSymbol]) {
      document.getElementById(`deposit-${tokens[token].aSymbol}`).innerHTML = tokenValueTxt(
        balances[tokens[token].aSymbol].balance,
        balances[tokens[token].aSymbol].decimals,
        ""
      );
    }
  }
}

function strtodec(amount, dec) {
  return web3.utils.toBN("0x" + (amount * 10 ** dec).toString(16));
}
// function depositETH(address lendingPool, address onBehalfOf, uint16 referralCode)
function depositETH(contractPool, lendingPoolAddress, amountDeposit, userAddress) {
  contractPool.methods
    .depositETH(lendingPoolAddress, userAddress, "0")
    .send({ from: userAddress, value: amountDeposit })
    .then(function (receipt) {
      console.log(receipt);
      contractCall();
    });
}

function depositPool(asset, contractPool, amountDeposit, userAddress) {
  contractPool.methods
    .deposit(asset, amountDeposit, userAddress, "0")
    .send({ from: userAddress })
    .then(function (receipt) {
      console.log(receipt);
      contractCall();
    });
}

async function deposit(symbol, amount) {
  if (symbol == "MATIC") console.log(symbol);
  let userAddress = (await web3.eth.getAccounts())[0];
  const asset = tokens[symbol].address;
  const isMATIC = symbol == "MATIC" ? true : false;
  const lendingPoolAddress = "0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf";
  const wethGateAddress = "0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97";
  const contractPool = new web3.eth.Contract(
    isMATIC ? wethGateAbi : lendingPoolABI,
    isMATIC ? wethGateAddress : lendingPoolAddress
  );
  const amountDeposit = strtodec(amount, tokens[symbol].decimals);

  const contractToken = new web3.eth.Contract(erc20ABI, asset);
  const allowance = await contractToken.methods.allowance(userAddress, lendingPoolAddress).call();

  if (allowance > amount && !isMATIC) {
    depositPool(asset, contractPool, amountDeposit, userAddress);
  } else if (isMATIC) {
    depositETH(contractPool, lendingPoolAddress, amountDeposit, userAddress);
  } else {
    contractToken.methods
      .approve(
        lendingPoolAddress,
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
      .send({ from: userAddress })
      .then(function (receipt) {
        console.log(receipt);
        depositPool(asset, contractPool, amountDeposit, userAddress);
      });
  }
}

async function setAaveBank() {
  const chainId = await getChainId();
  console.log(chainId);
  if (chainId !== "0x89") {
    try {
      await switchNetwork();
    } catch (e) {
      alert(e.message);
    }
  }
  contractCall();
  //setInterval(() => contractCall(), 10000);
  var bankInterface = gameScene.add
    .dom(630, 400)
    .createFromCache("aaveBank")
    .setDepth(3)
    .addListener("click");
  bankInterface.on("click", function (event) {
    if (event.target.id === "deposit-button") {
      const assetName = event.target.getAttribute("name");
      const amount = bankInterface.getChildByName(`amount-${assetName}`).value;
      if (amount > 0 && typeof +amount == "number") {
        deposit(assetName, amount);
        bankInterface.getChildByName(`amount-${assetName}`).value = null;
      } else {
        return null;
      }
    }
    if (event.target.id === "exitBtn") {
      console.log("exit button pressed");
      eventsCenter.emit("exitBldg", { x: 17, y: 41 });
      gameScene.scene.switch("Game");
    }
  });
}

function loadAssets() {
  gameScene.load.html("aaveBank", "assets/aaveBank.html");
}

export default AaveBankScene;
