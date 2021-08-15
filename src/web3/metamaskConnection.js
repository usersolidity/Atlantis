import Moralis from "moralis";
import Web3 from "web3";

export const connectMoralis = () => {
  Moralis.initialize("nAplGpihVQeHUrirnWY20y9tFF9N0Imjb5DtCZUI");
  Moralis.serverURL = "https://dlcxxcapyhza.usemoralis.com:2053/server";
};

const authenticate = async (provider) => {
  try {
    let user = await Moralis.Web3.authenticate({ provider });
    return user;
  } catch (e) {
    alert(e.message);
  }
};

export async function authenticateMoralis(provider) {
  let user = await Moralis.User.current();
  console.log(provider);
  if (provider == "metamask") {
    // await Moralis.Web3.enable();
    let currentAddress = await window.ethereum.send("eth_requestAccounts");
    currentAddress = currentAddress.result[0];
    if (user && user.attributes.ethAddress == currentAddress) {
      return user;
    } else {
      return await authenticate(provider);
    }
  } else if (provider !== "metamask") {
    return await authenticate(provider);
  }
}

export async function setProfileMoralis(username, email) {
  let user = Moralis.User.current();
  user.set("Nickname", username);
  user.set("email", email);
  try {
    await user.save();
    console.log(user.attributes);
    return user;
  } catch (e) {
    alert(e.message);
  }
}

export async function listener() {
  console.log("works");
  window.ethereum.on("accountsChanged", async function (accounts) {
    let user = Moralis.User.current();
    console.log(user);
    console.log("changed");
    console.log(accounts);
    if (accounts.length) {
      const isConfirmed = confirm("Link this address to your account?");
      if (isConfirmed) {
        try {
          await Moralis.Web3.link(accounts[0]);
          alert("Address added!");
        } catch (e) {
          alert(e.message);
        }
        console.log(user.attributes);
      } else {
        alert("Address not added!");
      }
    } else {
      alert("No accounts selected");
      location.reload();
    }
  });
  Moralis.Web3.onDisconnect(async function () {
    // const confirmed = confirm("Link this address to your account?");
    // if (confirmed) {
    //   await Moralis.Web3.link(accounts[0]);
    //   alert("Address added!");
    // }
    location.reload();
  });
}

export const getChainId = async () => {
  return await window.ethereum.request({ method: "eth_chainId" });
};

export async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x89" }],
    });
  } catch (error) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x89",
              rpcUrl: "https://rpc-mainnet.maticvigil.com",
            },
          ],
        });
      } catch (addError) {
        alert(addError);
      }
    }
    alert(error);
  }
}
