import { useEffect, useMemo, useState } from "react";
// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

// Instantiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// Grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0xC11E06FB5A3582A0ca7a909dE987a457A2ABe022"
);
const tokenModule = sdk.getTokenModule(
  "0x0e2c23673Be474ecf07a821488e084f48b3a9666"
);
const voteModule = sdk.getVoteModule(
  "0xf7873742F647Fc4e046De7624511065379B3BF90"
);

const App = () => {
  // connectWallet hook from thirdweb
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address);

  // Set state to know if user has NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // Check isClaiming status for loading the loading state while minting
  const [isClaiming, setIsClaiming] = useState(false);

  // Amount of tokens each member has
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});

  // Member addresses
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A simple function for shortening wallet addresses
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // State variables for voting
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Get all proposals from contract
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    voteModule
      .getAll()
      .then((proposals) => {
        setProposals(proposals);
        console.log("Proposals:", proposals);
      })
      .catch((err) => {
        console.error("Failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  // Check if user has already voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // If getting the proposals from previous useEffect has not finished yet
    if (!proposals.length) {
      return;
    }

    voteModule.hasVoted(proposals[0].proposalId, address).then((hasVoted) => {
      setHasVoted(hasVoted);
      if (hasVoted) {
        console.log("This user already voted");
      } else {
        console.log("This user has not voted yet");
      }
    });
  }, [hasClaimedNFT, proposals, address]);

  // Get all addresses of members holding NFTs
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        console.log("Member addresses", addresses);
        setMemberAddresses(addresses);
      })
      .catch((err) => {
        console.log("Failed to get member addresses", err);
      });
  }, [hasClaimedNFT]);

  // Get number of tokens of each member
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("Amounts", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.log("Failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  // Combine memberAddresses and memberTokenAmounts in one array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0, // Set 0 if they do not hold any tokens
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

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
        <p>Congratulations for being a member!</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Disable button before doing async things to prevent double clicks
                setIsVoting(true);
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    vote: 2, // default is abstain
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );
                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // Make sure the user delegates their token to vote
                try {
                  // Check if wallet needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // We have to delegate tokens before voting
                  if (delegation === ethers.constants.AddressZero) {
                    await tokenModule.delegateTo(address);
                  }

                  // Voting on proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // Check if proposal is open for voting and get latest state
                        const proposal = await voteModule.get(vote.proposalId);
                        // 1 = open for voting
                        if (proposal.state === 1) {
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if proposal is not open for voting we just return
                        return;
                      })
                    );
                    // Check if any of proposals are ready to be executed and then execute them
                    try {
                      await Promise.app(
                        votes.map(async (vote) => {
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );
                          // 4 = ready to be executed
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      setHasVoted(true);
                      console.log("Successfully voted!");
                    } catch (err) {
                      console.error("Failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("Fauled to vote", err);
                  }
                } catch (err) {
                  console.error("Failed to delegate tokens", err);
                } finally {
                  // enable button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          defaultChecked={vote.type === 2}
                        ></input>
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                  ? "You already voted"
                  : "Submit votes"}
              </button>
              <small>
                This will trigger multiple transactions thet you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
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
