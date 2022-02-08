import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteModule = sdk.getVoteModule(
  "0xf7873742F647Fc4e046De7624511065379B3BF90"
);

const tokenModule = sdk.getTokenModule(
  "0x0e2c23673Be474ecf07a821488e084f48b3a9666"
);

(async () => {
  try {
    // Give treasury the power to mint additional tokens if needed
    await tokenModule.grantRole("minter", voteModule.address);
    console.log("Successfully set permissions to act on token module");
  } catch (err) {
    console.error("Failed grant vote module permissions on token module", err);
    process.exit(1);
  }

  try {
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );
    // Get 90% of our tokens to transfer to treasury
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const ninety = ownedAmount.div(100).mul(90);

    // Transfet those tokens
    await tokenModule.transfer(voteModule.address, ninety);
    console.log("Successfully transfered tokens to treasury");
  } catch (err) {
    console.error("Failed to transfer tokens to treasury", err);
  }
})();
