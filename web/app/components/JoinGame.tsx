import { useState, useEffect } from "react";
import { useContractInteractions } from "../lib/useContractInteractions";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

interface JoinGameProps {
  gameId: number;
}

export default function JoinGame({ gameId }: JoinGameProps) {
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const { getGameInfo, getParticipantInfo, joinGame, isLoading } =
    useContractInteractions();

  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);

      try {
        // Get game information
        const gameResult = await getGameInfo(gameId);
        console.log(gameResult);
        if (gameResult.success && gameResult.data) {
          setGameInfo(gameResult.data);

          // Check if user has already joined
          if (address) {
            const participantResult = await getParticipantInfo(gameId, address);
            if (participantResult.success && participantResult.data) {
              // If user exists as participant and is not address(0), they've joined
              setIsJoined(
                participantResult.data.user !==
                  "0x0000000000000000000000000000000000000000"
              );
            }
          }
          setLoading(false);
        } else {
          setError("Game not found");
        }
      } catch (err: any) {
        setError(err.message || "Error loading game");
      } finally {
        setLoading(false);
      }
    };

    if (gameId && address) {
      fetchGameData();
    }
  }, [gameId, address]);

  const handleJoinGame = async () => {
    if (!gameInfo) return;

    setJoining(true);
    setError(null);

    try {
      // Convert entry fee to string for the joinGame function
      const entryFeeString = formatEther(gameInfo.entryFee);
      const result = await joinGame(gameId, entryFeeString);

      if (result.success) {
        setIsJoined(true);
        setLoading(false);
      } else {
        setError(result.error || "Failed to join game");
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error joining game");
    } finally {
      setJoining(false);
    }
  };

  if (loading || isLoading) {
    return <div className="p-4 text-center">Loading game information...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!gameInfo) {
    return <div className="p-4 text-center">Game not found</div>;
  }

  if (!address) {
    return (
      <div className="p-4 text-center">
        Connect your wallet to join this game
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 border-1 border-gray-300 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Game #{gameId}</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="font-medium">Status:</span>
          <span>{gameInfo.isStarted ? "In Progress" : "Not Started"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Prize Pool:</span>
          <span>{formatEther(gameInfo.prizePool)} FLOW</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Entry Fee:</span>
          <span>{formatEther(gameInfo.entryFee)} FLOW</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Participants:</span>
          <span>{gameInfo.totalParticipants}</span>
        </div>
      </div>

      {!gameInfo.isStarted ? (
        isJoined ? (
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
            You've successfully joined this game! Wait for it to start.
          </div>
        ) : (
          <button
            onClick={handleJoinGame}
            disabled={joining || gameInfo.isStarted}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              joining ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {joining ? "Joining..." : "Join Game"}
          </button>
        )
      ) : (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md">
          This game has already started. You can't join now.
        </div>
      )}
    </div>
  );
}
