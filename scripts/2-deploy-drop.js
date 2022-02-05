import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule("0x024132410AE19B084c64dd8a4542b012611459c7");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: "CrazyIdea DAO membership",
      description: "A DAO for crazy ideas!",
      image: readFileSync("scripts/assets/bulbnft.png"),
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });

    console.log("BundleDrop successfully deployed:", bundleDropModule.address);
    console.log("BundleDrop metadata:", await bundleDropModule.getMetadata());
  } catch (err) {
    console.log("Failed to deploy BundleDrop module:", err);
  }
})();
