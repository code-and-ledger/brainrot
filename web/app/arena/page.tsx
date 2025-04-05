"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useSubmitMeme } from "../hooks/useSubmitMeme";
import { useContractInteractions } from "../lib/useContractInteractions";

export default function JoinPage() {
  const router = useRouter();
  const [joinMode, setJoinMode] = useState("join"); // "join" or "create"
  const [gameId, setGameId] = useState<number>(1); // Default to game ID 1
  const [isLoading, setIsLoading] = useState(false);
  const [memeTitle, setMemeTitle] = useState("");
  const [memeDescription, setMemeDescription] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isConnected, address } = useAccount();

  const { createMeme, isSubmitting, error, success, txHash } = useSubmitMeme();
  const { getGameInfo, joinGame } = useContractInteractions();

  // Fetch active games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        // For simplicity, check for games with IDs 1-5
        const games = [];

        for (let i = 1; i <= 5; i++) {
          const result = await getGameInfo(i);
          if (
            result.success &&
            result.data &&
            result.data.isActive &&
            !result.data.isStarted
          ) {
            games.push({
              id: i,
              entryFee: result.data.entryFee.toString(),
              participants: result.data.totalParticipants,
            });
          }
        }

        setActiveGames(games);
        if (games.length > 0) {
          setSelectedGameId(games[0].id);
          setGameId(games[0].id);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchGames();
  }, [getGameInfo]);

  // Handle join game
  const handleJoinGame = async () => {
    if (!isConnected) {
      alert("Please connect your wallet to get rotted!");
      return;
    }

    if (!selectedGameId) {
      alert("Please select a game to join");
      return;
    }

    setIsLoading(true);

    try {
      // Get game info to know the entry fee
      const gameInfo = await getGameInfo(selectedGameId);
      if (!gameInfo.success || !gameInfo.data) {
        throw new Error("Failed to get game info");
      }

      // Join the game
      const entryFee = gameInfo.data.entryFee.toString();
      const result = await joinGame(selectedGameId, entryFee);

      if (result.success) {
        // Redirect to game page after successful join
        router.push(`/game/${selectedGameId}`);
      } else {
        alert(`Failed to join game: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Error joining game:", error);
      alert(`Error joining game: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle meme submission
  const handleSubmitMeme = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet to get rotted!");
      return;
    }

    if (!selectedGameId) {
      alert("Please select a game to join");
      return;
    }

    if (
      !memeTitle ||
      !memeDescription ||
      !tokenName ||
      !tokenSymbol ||
      !imageUrl
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      // First, join the game
      const gameInfo = await getGameInfo(selectedGameId);
      if (!gameInfo.success || !gameInfo.data) {
        throw new Error("Failed to get game info");
      }

      // Join the game
      const entryFee = gameInfo.data.entryFee.toString();
      const joinResult = await joinGame(selectedGameId, entryFee);

      if (!joinResult.success) {
        throw new Error(`Failed to join game: ${joinResult.error}`);
      }

      // Then submit the meme
      const result = await createMeme({
        gameId: selectedGameId,
        name: memeTitle,
        description: memeDescription,
        tokenName,
        tokenSymbol,
        imageUrl,
      });

      if (result.success) {
        // Redirect to game page after successful submission
        router.push(`/game/${selectedGameId}`);
      } else {
        alert(`Failed to submit meme: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Error submitting meme:", error);
      alert(`Error submitting meme: ${error.message}`);
    }
  };

  return (
    <div className="bg-black min-h-screen text-[#fff] relative overflow-hidden">
      <Navbar />

      {!isConnected && (
        <div className="mb-6 p-4 mx-auto max-w-lg border border-red-500 rounded-lg text-center">
          <p className="text-white font-medium">
            Connect wallet to get rotted!
          </p>
        </div>
      )}
      <main className="container mx-auto px-4 py-8 max-w-lg border border-gray-300 rounded-2xl">
        <h1
          className="text-4xl font-bold mb-8 text-center text-white"
          style={{ fontFamily: "var(--font-permanent-marker)" }}
        >
          Meme Battle Arena
        </h1>

        {isConnected && (
          <div>
            {/* Game Selection */}
            <div className="mb-6">
              <label className="block text-gray-400 mb-2">Select Game</label>
              <select
                value={selectedGameId || ""}
                onChange={(e) => setSelectedGameId(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="">Select a game</option>
                {activeGames.map((game) => (
                  <option key={game.id} value={game.id}>
                    Game #{game.id} - {game.participants} players
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Toggle */}
            <div className="p-2 rounded-xl flex mb-8">
              <button
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  joinMode === "join"
                    ? "bg-white text-black"
                    : "hover:bg-gray-950"
                }`}
                onClick={() => setJoinMode("join")}
              >
                Join Game
              </button>
              <button
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  joinMode === "create"
                    ? "bg-white text-black"
                    : "hover:bg-gray-950"
                }`}
                onClick={() => setJoinMode("create")}
              >
                Create Meme
              </button>
            </div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={joinMode === "join" ? handleJoinGame : handleSubmitMeme}
              className="p-6 rounded-xl"
            >
              {joinMode === "join" ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">Join Game</h2>
                  <p className="text-gray-400 mb-6">
                    Join a game to participate in the meme competition. You'll
                    need to pay an entry fee to join.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    Create Meme Entry & Join Game
                  </h2>

                  <div className="mb-6">
                    <label className="block text-gray-400 mb-2">
                      Meme Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter a catchy title"
                      value={memeTitle}
                      onChange={(e) => setMemeTitle(e.target.value)}
                      required
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-400 mb-2">
                      Meme Description
                    </label>
                    <textarea
                      placeholder="Describe your meme"
                      value={memeDescription}
                      onChange={(e) => setMemeDescription(e.target.value)}
                      required
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                      rows={3}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-400 mb-2">
                      Token Name (if your meme wins)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Doge Coin"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      required
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-400 mb-2">
                      Token Symbol (if your meme wins)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., DOGE"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value)}
                      required
                      maxLength={5}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-400 mb-2">
                      Meme Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="Enter an image URL (e.g., https://example.com/meme.jpg)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      required
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    {imageUrl && (
                      <div className="mt-4">
                        <p className="text-gray-400 mb-2">Image Preview:</p>
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-700">
                          <img
                            src={imageUrl}
                            alt="Meme preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/400x400/black/white?text=Invalid+Image+URL";
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Enter a direct link to your meme image
                    </p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={
                  isLoading ||
                  isSubmitting ||
                  !selectedGameId ||
                  (joinMode === "create" &&
                    (!imageUrl ||
                      !memeTitle ||
                      !memeDescription ||
                      !tokenName ||
                      !tokenSymbol))
                }
                className={`w-full py-4 rounded-lg font-bold text-black transition-all ${
                  isLoading ||
                  isSubmitting ||
                  !selectedGameId ||
                  (joinMode === "create" &&
                    (!imageUrl ||
                      !memeTitle ||
                      !memeDescription ||
                      !tokenName ||
                      !tokenSymbol))
                    ? "bg-gray-950 text-white cursor-not-allowed"
                    : "bg-white hover:bg-black hover:text-white hover:border"
                }`}
              >
                {isLoading || isSubmitting ? (
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
                    Processing...
                  </span>
                ) : joinMode === "join" ? (
                  "Join Game"
                ) : (
                  "Create Meme & Join"
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-900 text-red-100 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-900 text-green-100 rounded-lg">
                  Meme submitted successfully!
                  {txHash && (
                    <p className="text-xs mt-1 overflow-hidden text-ellipsis">
                      Transaction: {txHash}
                    </p>
                  )}
                </div>
              )}
            </motion.form>
          </div>
        )}

        {/* Game Info */}
        <div className="mt-8 p-6 rounded-xl">
          <h2
            className="text-xl font-bold mb-4"
            style={{ fontFamily: "var(--font-permanent-marker)" }}
          >
            How to Play
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>
                Vote for your favorite memes by holding down on their card
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>The longer you hold, the more credits you bet</span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>Each player starts with 1,000 credits</span>
            </li>
            <li className="flex items-start">
              <span className="text-white mr-2">•</span>
              <span>The meme with the most votes at the end wins!</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
