import { useEffect, useMemo, useState } from "react";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";

const App = () => {
  // connectWallet hook from thirdweb
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address);

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

  return (
    <div className="landing">
      <h1>Welcome to CrazyIdea DAO</h1>
      <p>Wallet connected: {address}</p>
    </div>
  );
};

export default App;
