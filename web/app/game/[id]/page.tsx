"use client";

import { useState, useEffect } from "react";
import { useContractInteractions } from "../../lib/useContractInteractions";
import { useAccount } from "wagmi";
import JoinGame from "../../components/JoinGame";
import SubmitMeme from "../../components/SubmitMeme";
import VotingArea from "../../components/VotingArea";
import Leaderboard from "../../components/Leaderboard";

interface GameDetailPageProps {
  params: {
    id: string;
  };
}

export default function GameDetailPage({ params }: GameDetailPageProps) {
  const gameId = parseInt(params.id);
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [activePage, setActivePage] = useState<
    "join" | "submit" | "vote" | "leaderboard"
  >("join");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();
  const { getGameInfo, getParticipantInfo, isLoading } =
    useContractInteractions();

  useEffect(() => {
    const fetchGameData = async () => {
      if (isNaN(gameId)) {
        setError("Invalid game ID");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get game information
        const gameResult = await getGameInfo(gameId);
        if (gameResult.success && gameResult.data) {
          setGameInfo(gameResult.data);

          // Determine active page based on game state
          if (gameResult.data.isStarted) {
            setActivePage("vote");
          }

          // Check if user is a participant
          if (address) {
            const participantResult = await getParticipantInfo(gameId, address);
            if (participantResult.success && participantResult.data) {
              const isValidParticipant =
                participantResult.data.user !==
                "0x0000000000000000000000000000000000000000";
              setIsParticipant(isValidParticipant);

              // If user is participant but game hasn't started, show submit meme page
              if (isValidParticipant && !gameResult.data.isStarted) {
                setActivePage("submit");
              }
            }
          }
        } else {
          setError("Game not found");
        }
      } catch (err: any) {
        setError(err.message || "Error loading game");
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId, address, getGameInfo, getParticipantInfo]);

  const handleGameJoined = () => {
    setIsParticipant(true);
    setActivePage("submit");
  };

  const handleMemeSubmitted = () => {
    // Could trigger a success notification or update the UI
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Loading Game...</h2>
          <p>Please wait while we load the game details</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12 text-red-500">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!gameInfo) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
          <p>The requested game could not be found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Game #{gameId}</h1>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium">
                {gameInfo.isActive
                  ? gameInfo.isStarted
                    ? "In Progress"
                    : "Not Started"
                  : "Ended"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Prize Pool</p>
              <p className="font-medium">
                {gameInfo.prizePool.toString()} FLOW
              </p>
            </div>
            <div>
              <p className="text-gray-600">Current Round</p>
              <p className="font-medium">{gameInfo.currentRound}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          {!gameInfo.isStarted && !isParticipant && (
            <button
              onClick={() => setActivePage("join")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activePage === "join"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Join Game
            </button>
          )}

          {isParticipant && !gameInfo.isStarted && (
            <button
              onClick={() => setActivePage("submit")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activePage === "submit"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Submit Meme
            </button>
          )}

          {gameInfo.isStarted && (
            <button
              onClick={() => setActivePage("vote")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activePage === "vote"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Vote
            </button>
          )}

          <button
            onClick={() => setActivePage("leaderboard")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activePage === "leaderboard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Leaderboard
          </button>
        </nav>
      </div>

      {/* Page Content */}
      <div>
        {activePage === "join" && <JoinGame gameId={gameId} />}

        {activePage === "submit" && (
          <SubmitMeme gameId={gameId} onSuccess={handleMemeSubmitted} />
        )}

        {activePage === "vote" && (
          <VotingArea gameId={gameId} roundNumber={gameInfo.currentRound} />
        )}

        {activePage === "leaderboard" && <Leaderboard gameId={gameId} />}
      </div>
    </div>
  );
}
