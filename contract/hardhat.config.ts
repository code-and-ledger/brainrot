import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    flowEVMTestnet: {
      url: "https://testnet.evm.nodes.onflow.org/", // Flow EVM testnet RPC
      chainId: 545, // Flow EVM testnet chain ID
      accounts: [process.env.PRIVATE_KEY as string], // Your private key
      gas: 5000000, // Gas limit
      gasPrice: 10000000000, // Gas price in wei (10 gwei)
      timeout: 60000, // Timeout in ms
    },
    flowEVMMainnet: {
      url: "https://evm.flowcross.org/", // Flow EVM mainnet RPC
      chainId: 747, // Flow EVM mainnet chain ID
      accounts: [process.env.PRIVATE_KEY as string], // Your private key
    },
  },
};

export default config;
