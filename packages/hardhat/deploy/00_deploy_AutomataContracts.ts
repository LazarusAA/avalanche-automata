import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the Automata contracts (AutomataUsdt, LoyaltyBadge)
 * and a MockUSDT on local/test networks.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployAutomataContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const network = hre.network.name;

  let usdtTokenAddress: string;

  console.log(`\nDeploying Automata Contracts to ${network}...`);
  console.log(`  > Deployer (Relayer): ${deployer}`);

  // --- Handle USDT Token Address ---
  if (network === "avalancheLocal" || network === "avalancheFuji") {
    // On local or Fuji, deploy a Mock USDT for testing
    console.log(`\n  > Deploying MockUSDT for ${network}...`);
    const mockUSDT = await deploy("MockUSDT", {
      from: deployer,
      log: true,
      autoMine: true,
      args: ["Mock USDT", "mUSDT"], // Constructor args for MockUSDT
      gasPrice: "225000000000", // 225 gwei for local Avalanche
    });
    usdtTokenAddress = mockUSDT.address;
    console.log(`  > MockUSDT deployed to: ${usdtTokenAddress}`);

    // Mint 1,000,000 mUSDT to the deployer/relayer for testing
    const mockContract = await hre.ethers.getContract<Contract>("MockUSDT", deployer);
    const initialMintAmount = hre.ethers.parseUnits("1000000", 18); // 1M USDT
    const mintTx = await mockContract.mint(deployer, initialMintAmount, { gasPrice: "225000000000" });
    await mintTx.wait();
    console.log(`  > Minted 1,000,000 mUSDT to deployer/relayer (${deployer})`);

  } else if (network === "avalanche") {
    // On Avalanche Mainnet, use the official USDT.e contract address
    usdtTokenAddress = "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7";
    console.log(`\n  > Using Mainnet USDT.e at: ${usdtTokenAddress}`);
  } else {
    throw new Error(`Network ${network} not configured in deploy script!`);
  }

  // --- Deploy AutomataUsdt Contract ---
  console.log(`\n  > Deploying AutomataUsdt...`);
  const automataUsdtArgs = [
    usdtTokenAddress, // The only constructor argument
  ];

  await deploy("AutomataUsdt", {
    from: deployer,
    args: automataUsdtArgs,
    log: true,
    autoMine: true,
    gasPrice: "225000000000", // 225 gwei for local Avalanche
  });

  const automataUsdt = await hre.ethers.getContract<Contract>("AutomataUsdt", deployer);
  const automataUsdtAddress = await automataUsdt.getAddress();
  console.log(
    `  > AutomataUsdt deployed to: ${automataUsdtAddress}`
  );
  console.log(
    `    - Using USDT Token at: ${await automataUsdt.usdtToken()}`
  );

  // --- Approve AutomataUsdt to spend relayer's MockUSDT ---
  if (network === "avalancheLocal" || network === "avalancheFuji") {
    console.log(`\n  > Approving AutomataUsdt to spend deployer's MockUSDT...`);
    const mockContract = await hre.ethers.getContract<Contract>("MockUSDT", deployer);
    const approveAmount = hre.ethers.parseUnits("1000000", 18); // Approve 1M USDT
    const approveTx = await mockContract.approve(automataUsdtAddress, approveAmount, { gasPrice: "225000000000" });
    await approveTx.wait();
    console.log(`  > Approved ${hre.ethers.formatUnits(approveAmount, 18)} mUSDT for AutomataUsdt contract`);
  }

  // --- Deploy LoyaltyBadge Contract ---
  console.log(`\n  > Deploying LoyaltyBadge...`);
  const loyaltyBadgeArgs = [
    deployer, // The relayer/deployer is the owner
  ];

  await deploy("LoyaltyBadge", {
    from: deployer,
    args: loyaltyBadgeArgs,
    log: true,
    autoMine: true,
    gasPrice: "225000000000", // 225 gwei for local Avalanche
  });

  const loyaltyBadge = await hre.ethers.getContract<Contract>("LoyaltyBadge", deployer);
  console.log(
    `  > LoyaltyBadge deployed to: ${await loyaltyBadge.getAddress()}`
  );
  console.log(
    `    - Owner (Relayer): ${await loyaltyBadge.owner()}`
  );

  console.log("\n✅ All Automata contracts deployed successfully!");
};

export default deployAutomataContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags AutomataUsdt
deployAutomataContracts.tags = ["AutomataUsdt", "LoyaltyBadge"];