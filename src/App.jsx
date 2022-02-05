import { useEffect, useMemo, useState } from "react";
// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

// Instantiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// Grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0xC11E06FB5A3582A0ca7a909dE987a457A2ABe022"
);

const App = () => {
  // connectWallet hook from thirdweb
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address);

  // Set state to know if user has NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // Check isClaiming status for loading the loading state while minting
  const [isClaiming, setIsClaiming] = useState(false);

  // Get signer for signing transactions
  const signer = provider ? provider.getSigner() : undefined;
  // Pass signer to sdk
  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // If wallet is not connected just exit
    if (!address) {
      return;
    }

    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0") // 0 is the tokenId of membership NFT
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("This user has a membership NFT");
        } else {
          setHasClaimedNFT(false);
          console.log("This user doesn't have a membership NFT");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
  }, [address]);

  // Let user know to connect a wallet
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to CrazyIdea DAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect wallet
        </button>
      </div>
    );
  }

  // If the user is member of DAO
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>DAO Member Page</h1>
        <p>Congratualtions on being a member!!</p>
      </div>
    );
  }

  const mintNft = () => {
    setIsClaiming(true);
    bundleDropModule
      .claim("0", 1)
      .then(() => {
        setHasClaimedNFT(true);
        console.log(
          `Successfully Minted: https://testnets.opensea.io/assets/${bundleDropModule.address.toLowerCase()}/0`
        );
      })
      .catch((err) => {
        console.log("Failed to claim", err);
      })
      .finally(() => {
        setIsClaiming(false);
      });
  };

  return (
    <div className="landing">
      <div className="mint-nft">
        <h1>Mint your free CrazyIdea NFT</h1>
        <button disabled={isClaiming} onClick={() => mintNft()}>
          {isClaiming ? "Minting..." : "Mint"}
        </button>
      </div>
      <p>Wallet connected: {address}</p>
    </div>
  );
};

export default App;
