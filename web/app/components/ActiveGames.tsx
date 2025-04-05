"use client";
import { useState, useEffect } from "react";
import { useContractInteractions } from "../lib/useContractInteractions";
import Link from "next/link";
import { formatEther } from "viem";

interface Game {
  gameId: number;
  prizePool: bigint;
  isStarted: boolean;
  isActive: boolean;
  totalParticipants: number;
  entryFee: bigint;
}

export default function ActiveGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGameId, setActiveGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { getGameInfo, isLoading } = useContractInteractions();

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);

      try {
        // For demo purposes, we'll check games with IDs 1-5
        // In a real app, you'd want to listen to GameCreated events or have a backend indexer
        const gamesList: Game[] = [];

        for (let i = 1; i <= 5; i++) {
          const result = await getGameInfo(i);
          if (result.success && result.data && result.data.isActive) {
            gamesList.push({
              gameId: result.data.gameId,
              prizePool: result.data.prizePool,
              isStarted: result.data.isStarted,
              isActive: result.data.isActive,
              totalParticipants: result.data.totalParticipants,
              entryFee: result.data.entryFee,
            });
            // Store first active game we find for quick access
            if (result.data.isActive && !activeGameId) {
              setActiveGameId(result.data.gameId);
            }
          }
        }
        // Only update state once after all games are fetched
        setGames(gamesList);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
    // Empty dependency array to ensure this only runs once on mount
  }, []);

  if (loading || isLoading) {
    return <div className="p-4 text-center">Loading games...</div>;
  }

  if (games.length === 0) {
    return <div className="p-4 text-center">No active games found</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Active Games</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div key={game.gameId} className="border rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold">Game #{game.gameId}</h3>

            <div className="mt-2 space-y-1">
              <p>Status: {game.isStarted ? "In Progress" : "Not Started"}</p>
              <p>Prize Pool: {formatEther(game.prizePool)} FLOW</p>
              <p>Participants: {game.totalParticipants}</p>
              <p>Entry Fee: {formatEther(game.entryFee)} FLOW</p>
            </div>

            <div className="mt-4">
              <Link
                href={`/game/${game.gameId}`}
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-center"
              >
                {game.isStarted ? "View Game" : "Join Game"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
