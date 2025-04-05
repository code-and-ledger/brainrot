import { ethers } from "hardhat";

async function main() {
  const MemeCompetition = await ethers.getContractFactory("MemeCompetition");
  const memeCompetition = await MemeCompetition.deploy();

  await memeCompetition.waitForDeployment();
  console.log("MemeCompetition deployed to:", memeCompetition.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
