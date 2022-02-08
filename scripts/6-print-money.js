import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
  "0x0e2c23673Be474ecf07a821488e084f48b3a9666"
);

(async () => {
  try {
    const amount = 1_000_000;

    // Convert to amount to decimals (standard for ERC20 tokens).
    const amountWithDecimals = ethers.utils.parseUnits(amount.toString(), 18);

    // Mint the tokens
    await tokenModule.mint(amountWithDecimals);
    const totalSupply = await tokenModule.totalSupply();

    console.log(
      "Successfully minted",
      ethers.utils.formatUnits(totalSupply, 18),
      "$CIDEA"
    );
  } catch (error) {
    console.error("Failed to mint", error);
  }
})();
