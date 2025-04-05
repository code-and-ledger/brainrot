import { useState, useEffect } from "react";
import { useContractInteractions } from "../lib/useContractInteractions";
import { useAccount } from "wagmi";

interface LeaderboardEntry {
  user: string;
  score: number;
  rank: number;
  isCurrentUser: boolean;
}

interface LeaderboardProps {
  gameId: number;
}

export default function Leaderboard({ gameId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { getLeaderboard, isLoading } = useContractInteractions();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      try {
        const result = await getLeaderboard(gameId);

        if (result.success && result.data) {
          // Convert to our local format with rank information
          const formattedLeaderboard = result.data.map((entry, index) => ({
            user: entry.user,
            score: entry.score,
            rank: index + 1,
            isCurrentUser: address?.toLowerCase() === entry.user.toLowerCase(),
          }));

          setLeaderboard(formattedLeaderboard);
        } else {
          setError("Failed to fetch leaderboard");
        }
      } catch (err: any) {
        setError(err.message || "Error loading leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameId, address, getLeaderboard]);

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  if (loading || isLoading) {
    return <div className="p-4 text-center">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (leaderboard.length === 0) {
    return <div className="p-4 text-center">No players yet</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Game #{gameId} Leaderboard</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <tr
                key={entry.user}
                className={
                  entry.isCurrentUser ? "bg-blue-50" : "hover:bg-gray-50"
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.rank === 1 && "🥇"}
                    {entry.rank === 2 && "🥈"}
                    {entry.rank === 3 && "🥉"}
                    {entry.rank > 3 && entry.rank}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {truncateAddress(entry.user)}
                    {entry.isCurrentUser && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {entry.score.toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
