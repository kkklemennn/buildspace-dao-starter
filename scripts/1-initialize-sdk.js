import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// Check if env is working
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY == "") {
  console.log("Private key not found");
}
if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS == "") {
  console.log("Wallet address not found");
}
if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL == "") {
  console.log("Alchemy API URL not found");
}

// Initialize Alchemy sdk
const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    process.env.PRIVATE_KEY,
    ethers.getDefaultProvider(process.env.ALCHEMY_API_URL)
  )
);

// Get app address from Alchemy
(async () => {
  try {
    const apps = await sdk.getApps();
    console.log("App address is:", apps[0].address);
  } catch (err) {
    console.log("Failt to load apps from sdk", err);
    process.exit(1);
  }
})();

export default sdk;
