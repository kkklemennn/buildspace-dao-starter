import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
  "0x0e2c23673Be474ecf07a821488e084f48b3a9666"
);

(async () => {
  try {
    console.log("Roles that exist now:", await tokenModule.getAllRoleMembers());

    // Revoke superpowers our wallet has over ERC20 contract
    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
    console.log("Roles after revoking:", await tokenModule.getAllRoleMembers());
    console.log("Successfully revoked all roles");
  } catch (err) {
    console.error("Failed to revoke roles", err);
  }
})();
