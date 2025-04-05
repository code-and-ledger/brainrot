import hre from "hardhat";

async function main() {
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens
  const myToken = await hre.ethers.deployContract("MyFlowToken", [
    initialSupply,
  ]);

  await myToken.waitForDeployment();

  console.log(`MyFlowToken deployed to ${myToken.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
