import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0x024132410AE19B084c64dd8a4542b012611459c7");

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      name: "CrazyIdea governance token",
      symbol: "CIDEA",
    });
    console.log("Succesfully deployed token module:", tokenModule.address);
  } catch (err) {
    console.error("failed to deploy", err);
  }
})();
