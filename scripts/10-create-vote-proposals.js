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
    // Create a proposal to mint 420_000 new tokens to the treasury
    const amount = 420_000;
    await voteModule.propose(
      "Should the DAO mint an additional " +
        amount +
        " tokens into the treasury?",
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "mint",
            [voteModule.address, ethers.utils.parseUnits(amount.toString(), 18)]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );
    console.log("Successfully created proposal to mint tokens");
  } catch (err) {
    console.error("Failed to create first proposal", err);
    process.exit(1);
  }

  try {
    // Create proposal to transfer 6_900 tokens to us for being awesome
    const amount = 6_900;
    await voteModule.propose(
      "Should the DAO transfer " +
        amount +
        " tokens to " +
        process.env.WALLET_ADDRESS +
        " for being awesome :)",
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18),
            ]
          ),
          toAddress: tokenModule.address,
        },
      ]
    );
    console.log(
      "Successfully created proposal to reward ourself from the treasury"
    );
  } catch (err) {
    console.error("Failed to create second proposal", err);
    process.exit(1);
  }
})();
