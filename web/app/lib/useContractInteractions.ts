import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useContract, MEME_COMPETITION_ADDRESS } from "./contractConfig";

export function useContractInteractions() {
  const { readContract, writeContract, writeFlowToken, hasAccount } =
    useContract();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin Functions
  async function createGame(entryFee: string, roundDuration: number) {
    if (!hasAccount) return { success: false, error: "Not connected" };

    setIsLoading(true);
    setError(null);

    try {
      const entryFeeWei = parseUnits(entryFee, 18); // Assuming 18 decimals for FLOW token
      const roundDurationSeconds = roundDuration * 60; // Convert minutes to seconds

      const tx = await writeContract("createGame", [
        entryFeeWei,
        BigInt(roundDurationSeconds),
      ]);
      setIsLoading(false);
      return { success: true, txHash: tx };
    } catch (err: any) {
      setError(err.message || "Error creating game");
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }

  async function startGame(gameId: number) {
    if (!hasAccount) return { success: false, error: "Not connected" };

    setIsLoading(true);
    setError(null);

    try {
      const tx = await writeContract("startGame", [BigInt(gameId)]);
      setIsLoading(false);
      return { success: true, txHash: tx };
    } catch (err: any) {
      setError(err.message || "Error starting game");
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }

  async function approveMeme(gameId: number, memeId: number) {
    if (!hasAccount) return { success: false, error: "Not connected" };

    setIsLoading(true);
    setError(null);

    try {
      const tx = await writeContract("approveMeme", [
        BigInt(gameId),
        BigInt(memeId),
      ]);
      setIsLoading(false);
      return { success: true, txHash: tx };
    } catch (err: any) {
      setError(err.message || "Error approving meme");
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }

  async function rejectMeme(gameId: number, memeId: number) {
    if (!hasAccount) return { success: false, error: "Not connected" };

    setIsLoading(true);
    setError(null);

    try {
      const tx = await writeContract("rejectMeme", [
        BigInt(gameId),
        BigInt(memeId),
      ]);
      setIsLoading(false);
      return { success: true, txHash: tx };
    } catch (err: any) {
      setError(err.message || "Error rejecting meme");
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }

  // User Functions
  async function joinGame(gameId: number, entryFee: string) {
    if (!hasAccount) return { success: false, error: "Not connected" };

    setIsLoading(true);
    setError(null);

    try {
      // First approve the token transfer
      const entryFeeWei = parseUnits(entryFee, 18); // Assuming 18 decimals for FLOW token
      const approveTx = await writeFlowToken("approve", [
        MEME_COMPETITION_ADDRESS,
        entryFeeWei,
      ]);

      // Then join the game
      const joinTx = await writeContract("joinGame", [BigInt(gameId)]);

      setIsLoading(false);
      return { success: true, approveTxHash: approveTx, joinTxHash: joinTx };
    } catch (err: any) {
      setError(err.message || "Error joining game");
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }

  async function submitMeme(
    gameId: number,
    name: string,
    description: string,
    tokenName: string,
    tokenSymbol: string,
    uniqueId: string,
    imageUrl: string
  ) {
    if (!hasAccount) return { success: false, error: "Not connected" };

    setIsLoading(true);
    setError(null);

    try {
      const tx = await writeContract("submitMeme", [
        BigInt(gameId),
        name,
        description,
        tokenName,
        tokenSymbol,
        uniqueId,
        imageUrl,
      ]);

      setIsLoading(false);
      return { success: true, txHash: tx };
    } catch (err: any) {
      setError(err.message || "Error submitting meme");
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }

  async function vote(gameId: number, memeId: number, votes: number) {
    if (!hasAccount) return { success: false, error: "Not connected" };

    setIsLoading(true);
    setError(null);

    try {
      const tx = await writeContract("vote", [
        BigInt(gameId),
        BigInt(memeId),
        BigInt(votes),
      ]);
      setIsLoading(false);
      return { success: true, txHash: tx };
    } catch (err: any) {
      setError(err.message || "Error voting");
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }

  async function endRound(gameId: number) {
    if (!hasAccount) return { success: false, error: "Not connected" };

    setIsLoading(true);
    setError(null);

    try {
      const tx = await writeContract("endRound", [BigInt(gameId)]);
      setIsLoading(false);
      return { success: true, txHash: tx };
    } catch (err: any) {
      setError(err.message || "Error ending round");
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }

  // View Functions
  async function getGameInfo(gameId: number) {
    try {
      const gameInfo = await readContract("getGameInfo", [BigInt(gameId)]);
      if (!gameInfo)
        return { success: false, error: "Failed to get game info" };

      // Cast the result to an array since we know the contract returns multiple values
      const result = gameInfo as any[];

      return {
        success: true,
        data: {
          gameId: Number(result[0]),
          creator: result[1],
          prizePool: result[2],
          startTime: Number(result[3]),
          currentRound: Number(result[4]),
          isActive: result[5],
          isStarted: result[6],
          entryFee: result[7],
          roundDuration: Number(result[8]),
          totalParticipants: Number(result[9]),
          remainingParticipants: Number(result[10]),
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async function getMemeInfo(memeId: number) {
    try {
      const memeInfo = await readContract("getMemeInfo", [BigInt(memeId)]);
      if (!memeInfo)
        return { success: false, error: "Failed to get meme info" };

      // Cast the result to an array
      const result = memeInfo as any[];

      return {
        success: true,
        data: {
          memeId: Number(result[0]),
          gameId: Number(result[1]),
          creator: result[2],
          name: result[3],
          description: result[4],
          tokenName: result[5],
          tokenSymbol: result[6],
          uniqueId: result[7],
          imageUrl: result[8],
          isApproved: result[9],
          totalVotes: Number(result[10]),
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async function getParticipantInfo(
    gameId: number,
    userAddress: string = address || ""
  ) {
    if (!userAddress) return { success: false, error: "No address provided" };

    try {
      const participantInfo = await readContract("getParticipantInfo", [
        BigInt(gameId),
        userAddress,
      ]);

      if (!participantInfo)
        return { success: false, error: "Failed to get participant info" };

      // Cast the result to an array
      const result = participantInfo as any[];

      return {
        success: true,
        data: {
          user: result[0],
          credits: Number(result[1]),
          score: Number(result[2]),
          isEliminated: result[3],
          lastVotedRound: Number(result[4]),
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async function getRoundInfo(gameId: number, roundNumber: number) {
    try {
      const roundInfo = await readContract("getRoundInfo", [
        BigInt(gameId),
        BigInt(roundNumber),
      ]);

      if (!roundInfo)
        return { success: false, error: "Failed to get round info" };

      // Cast the result to an array
      const result = roundInfo as any[];

      // Convert BigInt arrays to number arrays
      const memeIds = (result[3] as bigint[]).map((id) => Number(id));
      const memeVotes = (result[4] as bigint[]).map((votes) => Number(votes));

      return {
        success: true,
        data: {
          roundNumber: Number(result[0]),
          startTime: Number(result[1]),
          endTime: Number(result[2]),
          memeIds,
          memeVotes,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async function getLeaderboard(gameId: number) {
    try {
      const leaderboardInfo = await readContract("getLeaderboard", [
        BigInt(gameId),
      ]);

      if (!leaderboardInfo)
        return { success: false, error: "Failed to get leaderboard" };

      // Cast the result to an array
      const result = leaderboardInfo as any[];

      // Convert BigInt scores to numbers
      const scores = (result[1] as bigint[]).map((score) => Number(score));

      // Create array of {user, score} objects
      const leaderboard = (result[0] as string[]).map((user, index) => ({
        user,
        score: scores[index],
      }));

      return { success: true, data: leaderboard };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return {
    // State
    isLoading,
    error,

    // Admin functions
    createGame,
    startGame,
    approveMeme,
    rejectMeme,

    // User functions
    joinGame,
    submitMeme,
    vote,
    endRound,

    // View functions
    getGameInfo,
    getMemeInfo,
    getParticipantInfo,
    getRoundInfo,
    getLeaderboard,
  };
}
