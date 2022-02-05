import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0xC11E06FB5A3582A0ca7a909dE987a457A2ABe022"
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 50_000,
      maxQuantityPerTransaction: 1,
    });

    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log(
      "Successfully set claim condition on bundle drop:",
      bundleDrop.address
    );
  } catch (err) {
    console.error("Failed to set claim condition", err);
  }
})();
