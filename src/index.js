import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { ThirdwebWeb3Provider } from "@3rdweb/hooks";

const supportedChainIds = [4]; // 4 = Rinkeby.

// Support for injected wallets (aka. Metamask lol)
const connectors = {
  injected: {},
};

ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <App />
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
