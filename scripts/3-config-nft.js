import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0xC11E06FB5A3582A0ca7a909dE987a457A2ABe022"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Idea Bulb",
        description: "This NFT will give you access to CrazyIdea DAO",
        image: readFileSync("scripts/assets/bulbnft.png"),
      },
    ]);
    console.log("Successfully created a new NFT in the drop!");
  } catch (err) {
    console.error("failed to create the new NFT", err);
  }
})();
