import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule(
  "0x024132410AE19B084c64dd8a4542b012611459c7"
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "Crazy Ideas",
      votingTokenAddress: "0x0e2c23673Be474ecf07a821488e084f48b3a9666",
      proposalStartWaitTimeInSeconds: 0, // Members can start voting immidiately after proposal is created
      proposalVotingTimeInSeconds: 24 * 60 * 60, // Members have up to 24h to vote after proposal is created
      votingQuorumFraction: 0, // Min % of tokens must be used in order to pass
      minimumNumberOfTokensNeededToPropose: "0",
    });
    console.log("Successfully deployed vote module", voteModule.address);
  } catch (err) {
    console.error("Failed to deploy vote module", err);
  }
})();
