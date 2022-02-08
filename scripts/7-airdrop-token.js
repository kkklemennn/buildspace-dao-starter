import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const bundleDropModule = sdk.getBundleDropModule(
  "0xC11E06FB5A3582A0ca7a909dE987a457A2ABe022"
);

const tokenModule = sdk.getTokenModule(
  "0x0e2c23673Be474ecf07a821488e084f48b3a9666"
);

(async () => {
  try {
    // Get all addresses of wallets who membership NFT (tokenId = 0)
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");
    if (walletAddresses.length === 0) {
      console.log("No NFTs have been claimed yet");
      process.exit(0);
    }

    const totalSupply = await tokenModule.totalSupply();
    const dropAmount =
      totalSupply / walletAddresses.length / 100_000 / 10 ** 18;

    // Drop to each address
    const airdropTargets = walletAddresses.map((address) => {
      console.log("Going to drop", dropAmount, "to:", address);
      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(dropAmount.toString(), 18),
      };
      return airdropTarget;
    });
    console.log("Starting airdrop...");
    await tokenModule.transferBatch(airdropTargets);
    console.log("Successfully airdropped tokens to all holders!");
  } catch (err) {
    console.log("Error airdropping", err);
  }
})();
