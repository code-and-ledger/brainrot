"use client";

import { useState, useEffect } from "react";
import { useContractInteractions } from "../lib/useContractInteractions";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function AdminPage() {
  const { isConnected, address } = useAccount();
  const [entryFee, setEntryFee] = useState<string>("0.01");
  const [roundDuration, setRoundDuration] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [memes, setMemes] = useState<any[]>([]);
  const [selectedGameForMemes, setSelectedGameForMemes] = useState<
    number | null
  >(null);
  const [actionMemeId, setActionMemeId] = useState<number | null>(null);
  const [showMemeDetails, setShowMemeDetails] = useState<boolean>(false);
  const [isLoadingMemes, setIsLoadingMemes] = useState(false);

  const {
    createGame,
    getGameInfo,
    startGame,
    approveMeme,
    rejectMeme,
    getMemeInfo,
    getRoundInfo,
  } = useContractInteractions();

  // Fetch active games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        // For simplicity, check for games with IDs 1-10
        const games = [];

        for (let i = 1; i <= 10; i++) {
          const result = await getGameInfo(i);
          if (result.success && result.data) {
            games.push({
              id: i,
              entryFee: result.data.entryFee.toString(),
              isActive: result.data.isActive,
              isStarted: result.data.isStarted,
              participants: result.data.totalParticipants,
              currentRound: result.data.currentRound,
            });
          }
        }

        setActiveGames(games);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    if (isConnected) {
      fetchGames();
    }
  }, [getGameInfo, isConnected]);

  // Fetch memes for selected game
  useEffect(() => {
    const fetchMemes = async () => {
      if (!selectedGameForMemes) return;

      setIsLoadingMemes(true);
      setMemes([]);

      try {
        const gameInfo = await getGameInfo(selectedGameForMemes);
        if (!gameInfo.success || !gameInfo.data) {
          setIsLoadingMemes(false);
          return;
        }

        // Get current round
        const currentRound = gameInfo.data.currentRound;
        const previousRound = currentRound > 0 ? currentRound - 1 : 0;

        // Function to fetch memes from a round
        const fetchMemesFromRound = async (round: number) => {
          if (round <= 0) return [];

          const roundInfo = await getRoundInfo(selectedGameForMemes, round);
          if (!roundInfo.success || !roundInfo.data) return [];

          const memeIds = roundInfo.data.memeIds;
          const memesData = [];

          for (const memeId of memeIds) {
            const memeInfo = await getMemeInfo(memeId);
            if (memeInfo.success && memeInfo.data) {
              memesData.push(memeInfo.data);
            }
          }

          return memesData;
        };

        // Get memes from current round and previous round (if they exist)
        const currentRoundMemes = await fetchMemesFromRound(currentRound);
        const previousRoundMemes = await fetchMemesFromRound(previousRound);

        // Combine and deduplicate memes
        const allMemes = [...currentRoundMemes, ...previousRoundMemes];
        const uniqueMemes = allMemes.filter(
          (meme, index, self) =>
            index === self.findIndex((m) => m.memeId === meme.memeId)
        );

        setMemes(uniqueMemes);
      } catch (error) {
        console.error("Error fetching memes:", error);
      } finally {
        setIsLoadingMemes(false);
      }
    };

    if (isConnected && selectedGameForMemes) {
      fetchMemes();
    }
  }, [
    getGameInfo,
    getRoundInfo,
    getMemeInfo,
    isConnected,
    selectedGameForMemes,
  ]);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const result = await createGame(entryFee, roundDuration);

      if (result.success) {
        setTxHash(result.txHash as string);
        // Refresh games list after creating a new game
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        setError(result.error || "Failed to create game");
      }
    } catch (err: any) {
      setError(err.message || "Error creating game");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async (gameId: number) => {
    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);
    setSelectedGameId(gameId);

    try {
      const result = await startGame(gameId);

      if (result.success) {
        setTxHash(result.txHash as string);
        // Refresh games list after starting the game
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        setError(result.error || "Failed to start game");
      }
    } catch (err: any) {
      setError(err.message || "Error starting game");
    } finally {
      setIsLoading(false);
      setSelectedGameId(null);
    }
  };

  const handleApproveMeme = async (gameId: number, memeId: number) => {
    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);
    setActionMemeId(memeId);

    try {
      const result = await approveMeme(gameId, memeId);

      if (result.success) {
        setTxHash(result.txHash as string);

        // Update meme status in the UI
        setMemes((prevMemes) =>
          prevMemes.map((meme) =>
            meme.memeId === memeId ? { ...meme, isApproved: true } : meme
          )
        );

        setTimeout(() => {
          setTxHash(null);
        }, 5000);
      } else {
        setError(result.error || "Failed to approve meme");
      }
    } catch (err: any) {
      setError(err.message || "Error approving meme");
    } finally {
      setIsLoading(false);
      setActionMemeId(null);
    }
  };

  const handleRejectMeme = async (gameId: number, memeId: number) => {
    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);
    setActionMemeId(memeId);

    try {
      const result = await rejectMeme(gameId, memeId);

      if (result.success) {
        setTxHash(result.txHash as string);

        // Update meme status in the UI
        setMemes((prevMemes) =>
          prevMemes.filter((meme) => meme.memeId !== memeId)
        );

        setTimeout(() => {
          setTxHash(null);
        }, 5000);
      } else {
        setError(result.error || "Failed to reject meme");
      }
    } catch (err: any) {
      setError(err.message || "Error rejecting meme");
    } finally {
      setIsLoading(false);
      setActionMemeId(null);
    }
  };

  const toggleMemeDetails = () => {
    setShowMemeDetails(!showMemeDetails);
  };

  return (
    <div className="bg-black min-h-screen text-[#fff] relative overflow-hidden">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1
          className="text-4xl font-bold mb-8 text-center text-white"
          style={{ fontFamily: "var(--font-permanent-marker)" }}
        >
          Admin Dashboard
        </h1>

        {!isConnected ? (
          <div className="mb-6 p-4 mx-auto max-w-lg border border-red-500 rounded-lg text-center">
            <p className="text-white font-medium mb-4">
              Connect wallet to access admin functions
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Create Game Form */}
              <div className="p-6 border border-gray-700 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Create New Game</h2>
                <form onSubmit={handleCreateGame}>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">
                      Entry Fee (FLOW)
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      required
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-400 mb-2">
                      Round Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={roundDuration}
                      onChange={(e) =>
                        setRoundDuration(parseInt(e.target.value))
                      }
                      required
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      isLoading
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating Game...
                      </span>
                    ) : (
                      "Create Game"
                    )}
                  </button>
                </form>

                {error && (
                  <div className="mt-4 p-3 bg-red-900 text-red-100 rounded-lg">
                    {error}
                  </div>
                )}

                {txHash && (
                  <div className="mt-4 p-3 bg-green-900 text-green-100 rounded-lg">
                    Game created successfully!
                    <p className="text-xs mt-1 overflow-hidden text-ellipsis break-all">
                      Transaction: {txHash}
                    </p>
                  </div>
                )}
              </div>

              {/* Game Management */}
              <div className="p-6 border border-gray-700 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Manage Games</h2>

                {activeGames.length === 0 ? (
                  <p className="text-gray-400">No games found</p>
                ) : (
                  <div className="space-y-4">
                    {activeGames.map((game) => (
                      <div
                        key={game.id}
                        className="p-4 border border-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">
                            Game #{game.id}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              game.isStarted
                                ? "bg-green-900 text-green-100"
                                : "bg-yellow-900 text-yellow-100"
                            }`}
                          >
                            {game.isStarted ? "Started" : "Not Started"}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                          Entry Fee: {parseFloat(game.entryFee) / 10 ** 18} FLOW
                        </p>
                        <p className="text-gray-400 text-sm mb-3">
                          Participants: {game.participants}
                        </p>

                        <div className="flex space-x-2">
                          {!game.isStarted && game.isActive && (
                            <button
                              onClick={() => handleStartGame(game.id)}
                              disabled={isLoading && selectedGameId === game.id}
                              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                                isLoading && selectedGameId === game.id
                                  ? "bg-gray-700 cursor-not-allowed"
                                  : "bg-white text-black hover:bg-gray-200"
                              }`}
                            >
                              {isLoading && selectedGameId === game.id ? (
                                <span className="flex items-center justify-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Starting...
                                </span>
                              ) : (
                                "Start Game"
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedGameForMemes(game.id)}
                            className="flex-1 py-2 rounded-lg font-medium text-sm bg-gray-700 hover:bg-gray-600 transition-all"
                          >
                            View Memes
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Meme Review Section */}
            {selectedGameForMemes && (
              <div className="p-6 border border-gray-700 rounded-xl mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    Memes for Game #{selectedGameForMemes}
                  </h2>
                  <button
                    onClick={() => setSelectedGameForMemes(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ← Back to Games
                  </button>
                </div>

                <div className="mb-4">
                  <button
                    onClick={toggleMemeDetails}
                    className="text-sm px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
                  >
                    {showMemeDetails
                      ? "Show Less Details"
                      : "Show More Details"}
                  </button>
                </div>

                {isLoadingMemes ? (
                  <div className="flex justify-center items-center py-12">
                    <svg
                      className="animate-spin h-10 w-10 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : memes.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No memes found for this game
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memes.map((meme) => (
                      <div
                        key={meme.memeId}
                        className="border border-gray-700 rounded-lg overflow-hidden"
                      >
                        <div className="aspect-square bg-gray-900 relative">
                          <img
                            src={meme.imageUrl}
                            alt={meme.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/400x400/black/white?text=Invalid+Image";
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                meme.isApproved
                                  ? "bg-green-900 text-green-100"
                                  : "bg-yellow-900 text-yellow-100"
                              }`}
                            >
                              {meme.isApproved ? "Approved" : "Pending"}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-1">
                            {meme.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            Meme #{meme.memeId}
                          </p>

                          {showMemeDetails && (
                            <div className="mb-4 space-y-2">
                              <p className="text-gray-400 text-sm">
                                <span className="text-gray-300">
                                  Description:
                                </span>{" "}
                                {meme.description}
                              </p>
                              <p className="text-gray-400 text-sm">
                                <span className="text-gray-300">Token:</span>{" "}
                                {meme.tokenName} ({meme.tokenSymbol})
                              </p>
                              <p className="text-gray-400 text-sm">
                                <span className="text-gray-300">Creator:</span>{" "}
                                {meme.creator.substring(0, 6)}...
                                {meme.creator.substring(
                                  meme.creator.length - 4
                                )}
                              </p>
                              <p className="text-gray-400 text-sm">
                                <span className="text-gray-300">Votes:</span>{" "}
                                {meme.totalVotes}
                              </p>
                            </div>
                          )}

                          {!meme.isApproved && (
                            <div className="flex space-x-2 mt-3">
                              <button
                                onClick={() =>
                                  handleApproveMeme(
                                    selectedGameForMemes,
                                    meme.memeId
                                  )
                                }
                                disabled={
                                  isLoading && actionMemeId === meme.memeId
                                }
                                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                                  isLoading && actionMemeId === meme.memeId
                                    ? "bg-gray-700 cursor-not-allowed"
                                    : "bg-green-700 hover:bg-green-600"
                                }`}
                              >
                                {isLoading && actionMemeId === meme.memeId
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                onClick={() =>
                                  handleRejectMeme(
                                    selectedGameForMemes,
                                    meme.memeId
                                  )
                                }
                                disabled={
                                  isLoading && actionMemeId === meme.memeId
                                }
                                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                                  isLoading && actionMemeId === meme.memeId
                                    ? "bg-gray-700 cursor-not-allowed"
                                    : "bg-red-700 hover:bg-red-600"
                                }`}
                              >
                                {isLoading && actionMemeId === meme.memeId
                                  ? "Processing..."
                                  : "Reject"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-8 p-6 rounded-xl border border-gray-700">
          <h2
            className="text-xl font-bold mb-4"
            style={{ fontFamily: "var(--font-permanent-marker)" }}
          >
            Admin Instructions
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>Use this page to create new meme battle games</span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>
                Set entry fee amount (in FLOW tokens) participants need to pay
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>Set round duration in minutes</span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>Start games when enough participants have joined</span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>
                Review and approve/reject memes submitted by participants
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>
                Note: Only the contract owner can perform these actions
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
