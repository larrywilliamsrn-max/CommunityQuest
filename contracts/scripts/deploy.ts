import hre from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // In Hardhat v3, you must connect to get a NetworkConnection, which has ethers on it
  const { ethers } = await hre.network.create("fuji");

  const QuestTime = await ethers.deployContract("QuestTime");
  await QuestTime.waitForDeployment();

  const address = await QuestTime.getAddress();
  console.log(`QuestTime deployed successfully to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});