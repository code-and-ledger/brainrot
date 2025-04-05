import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // Get the signer from the private key
  const provider = new ethers.JsonRpcProvider(
    "https://testnet.evm.nodes.onflow.org/"
  );
  const senderWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY as string,
    provider
  );

  console.log(`Sender wallet address: ${senderWallet.address}`);

  // Amount to send to each wallet (1000 FLOW in wei)
  const amountToSend = ethers.parseEther("1000");

  // Check sender balance
  const senderBalance = await provider.getBalance(senderWallet.address);
  console.log(
    `Sender wallet balance: ${ethers.formatEther(senderBalance)} FLOW`
  );

  const requiredBalance = amountToSend * 10n;
  if (senderBalance < requiredBalance) {
    console.error(
      `Insufficient balance to fund 10 wallets. Required: ${ethers.formatEther(
        requiredBalance
      )} FLOW, Available: ${ethers.formatEther(senderBalance)} FLOW`
    );
    return;
  }

  // Create an array to store wallet info
  const wallets = [];

  // Create 10 wallets and fund them
  for (let i = 0; i < 10; i++) {
    // Create a new wallet
    const newWallet = ethers.Wallet.createRandom().connect(provider);
    console.log(`Created wallet ${i + 1}: ${newWallet.address}`);

    // Fund the new wallet
    console.log(
      `Funding wallet ${i + 1} with ${ethers.formatEther(amountToSend)} FLOW...`
    );

    const tx = await senderWallet.sendTransaction({
      to: newWallet.address,
      value: amountToSend,
    });

    await tx.wait();
    console.log(`Transaction hash: ${tx.hash}`);

    // Store wallet info
    wallets.push({
      id: i + 1,
      address: newWallet.address,
      privateKey: newWallet.privateKey,
      mnemonic: newWallet.mnemonic?.phrase,
    });
  }

  // Save wallet info to a file
  const outputPath = path.join(__dirname, "../generated-wallets.json");
  fs.writeFileSync(outputPath, JSON.stringify(wallets, null, 2));

  console.log(
    `Successfully created and funded 10 wallets. Wallet information saved to ${outputPath}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
