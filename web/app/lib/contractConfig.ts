"use client";
import { createPublicClient, http, createWalletClient } from "viem";
import {
  usePublicClient,
  useWalletClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { useState, useEffect } from "react";

// Contract address where MemeCompetition is deployed
export const MEME_COMPETITION_ADDRESS =
  "0x93C0b69042f3703537774c228a24E8c9F582a840"; // Replace with your deployed contract address

// Flow token address (same as in contract)
export const FLOW_TOKEN_ADDRESS = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

// ABI for MemeCompetition contract
export const MEME_COMPETITION_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
    ],
    name: "GameCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: false, name: "startTime", type: "uint256" },
    ],
    name: "GameStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: true, name: "memeId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
    ],
    name: "MemeSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: true, name: "memeId", type: "uint256" },
    ],
    name: "MemeApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: true, name: "memeId", type: "uint256" },
    ],
    name: "MemeRejected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
    ],
    name: "UserJoined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: true, name: "roundNumber", type: "uint256" },
      { indexed: false, name: "startTime", type: "uint256" },
    ],
    name: "RoundStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: true, name: "roundNumber", type: "uint256" },
      { indexed: false, name: "endTime", type: "uint256" },
    ],
    name: "RoundEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: true, name: "roundNumber", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "memeId", type: "uint256" },
      { indexed: false, name: "votes", type: "uint256" },
    ],
    name: "UserVoted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
    ],
    name: "UserEliminated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "gameId", type: "uint256" },
      { indexed: false, name: "winningMemeId", type: "uint256" },
      { indexed: false, name: "prizeAmount", type: "uint256" },
    ],
    name: "GameEnded",
    type: "event",
  },

  // Admin functions
  {
    inputs: [
      { name: "_entryFee", type: "uint256" },
      { name: "_roundDuration", type: "uint256" },
    ],
    name: "createGame",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_gameId", type: "uint256" }],
    name: "startGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_gameId", type: "uint256" },
      { name: "_memeId", type: "uint256" },
    ],
    name: "approveMeme",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_gameId", type: "uint256" },
      { name: "_memeId", type: "uint256" },
    ],
    name: "rejectMeme",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // User functions
  {
    inputs: [{ name: "_gameId", type: "uint256" }],
    name: "joinGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_gameId", type: "uint256" },
      { name: "_name", type: "string" },
      { name: "_description", type: "string" },
      { name: "_tokenName", type: "string" },
      { name: "_tokenSymbol", type: "string" },
      { name: "_uniqueId", type: "string" },
      { name: "_imageUrl", type: "string" },
    ],
    name: "submitMeme",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_gameId", type: "uint256" },
      { name: "_memeId", type: "uint256" },
      { name: "_votes", type: "uint256" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_gameId", type: "uint256" }],
    name: "endRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // View functions
  {
    inputs: [{ name: "_gameId", type: "uint256" }],
    name: "getGameInfo",
    outputs: [
      { name: "gameId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "prizePool", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "currentRound", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "isStarted", type: "bool" },
      { name: "entryFee", type: "uint256" },
      { name: "roundDuration", type: "uint256" },
      { name: "totalParticipants", type: "uint256" },
      { name: "remainingParticipants", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_memeId", type: "uint256" }],
    name: "getMemeInfo",
    outputs: [
      { name: "memeId", type: "uint256" },
      { name: "gameId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "tokenName", type: "string" },
      { name: "tokenSymbol", type: "string" },
      { name: "uniqueId", type: "string" },
      { name: "imageUrl", type: "string" },
      { name: "isApproved", type: "bool" },
      { name: "totalVotes", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_gameId", type: "uint256" },
      { name: "_user", type: "address" },
    ],
    name: "getParticipantInfo",
    outputs: [
      { name: "user", type: "address" },
      { name: "credits", type: "uint256" },
      { name: "score", type: "uint256" },
      { name: "isEliminated", type: "bool" },
      { name: "lastVotedRound", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_gameId", type: "uint256" },
      { name: "_roundNumber", type: "uint256" },
    ],
    name: "getRoundInfo",
    outputs: [
      { name: "roundNumber", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "memeIds", type: "uint256[]" },
      { name: "memeVotes", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_gameId", type: "uint256" }],
    name: "getLeaderboard",
    outputs: [
      { name: "users", type: "address[]" },
      { name: "scores", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// ERC20 FLOW Token ABI (simplified)
export const FLOW_TOKEN_ABI = [
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// Hook to get contract instance
export function useContract() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    setHasAccount(!!walletClient?.account);
  }, [walletClient]);

  // Function to read from contract
  const readContract = async (functionName: string, args: any[] = []) => {
    if (!publicClient) return null;

    try {
      return await publicClient.readContract({
        address: MEME_COMPETITION_ADDRESS,
        abi: MEME_COMPETITION_ABI,
        functionName,
        args,
      });
    } catch (error) {
      console.error(`Error reading ${functionName}:`, error);
      throw error;
    }
  };

  // Function to write to contract
  const writeContract = async (functionName: string, args: any[] = []) => {
    if (!walletClient) return null;

    try {
      return await walletClient.writeContract({
        address: MEME_COMPETITION_ADDRESS,
        abi: MEME_COMPETITION_ABI,
        functionName,
        args,
      });
    } catch (error) {
      console.error(`Error writing ${functionName}:`, error);
      throw error;
    }
  };

  // Function to write to FLOW token contract
  const writeFlowToken = async (functionName: string, args: any[] = []) => {
    if (!walletClient) return null;

    try {
      return await walletClient.writeContract({
        address: FLOW_TOKEN_ADDRESS,
        abi: FLOW_TOKEN_ABI,
        functionName,
        args,
      });
    } catch (error) {
      console.error(`Error writing to FLOW token ${functionName}:`, error);
      throw error;
    }
  };

  return {
    readContract,
    writeContract,
    writeFlowToken,
    hasAccount,
  };
}
