"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function JoinPage() {
  const router = useRouter();
  const [joinMode, setJoinMode] = useState("join"); // "join" or "create"
  const [gameCode, setGameCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [memeTitle, setMemeTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to game page after successful submission
      router.push("/game");
    } catch (error) {
      console.error("Error joining game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-[#fff] relative overflow-hidden">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Meme Battle Arena
        </h1>

        {/* Mode Toggle */}
        <div className="bg-gray-900 p-2 rounded-xl flex mb-8">
          <button
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              joinMode === "join" ? "bg-purple-600" : "hover:bg-gray-800"
            }`}
            onClick={() => setJoinMode("join")}
          >
            Join Game
          </button>
          <button
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              joinMode === "create" ? "bg-purple-600" : "hover:bg-gray-800"
            }`}
            onClick={() => setJoinMode("create")}
          >
            Create Meme
          </button>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8 flex justify-center">
          <ConnectButton />
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-gray-900 p-6 rounded-xl"
        >
          {joinMode === "join" ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Join Existing Game</h2>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">
                  Game Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter game code or leave blank for public game"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Create Meme Entry</h2>

              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Meme Title</label>
                <input
                  type="text"
                  placeholder="Enter a catchy title"
                  value={memeTitle}
                  onChange={(e) => setMemeTitle(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 mb-2">
                  Upload Meme Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  {previewUrl ? (
                    <div className="relative w-full aspect-square mb-4">
                      <img
                        src={previewUrl}
                        alt="Meme preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-500 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <p className="text-gray-400">Click to upload your meme</p>
                      <p className="text-gray-500 text-sm mt-1">
                        (JPG, PNG, GIF)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading || (joinMode === "create" && !selectedFile)}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
              isLoading || (joinMode === "create" && !selectedFile)
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                Processing...
              </span>
            ) : joinMode === "join" ? (
              "Join Game"
            ) : (
              "Create & Join"
            )}
          </button>
        </motion.form>

        {/* Game Info */}
        <div className="mt-8 bg-gray-900 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">How to Play</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>
                Vote for your favorite memes by holding down on their card
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>The longer you hold, the more credits you bet</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>Each player starts with 1,000 credits</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span>
              <span>The meme with the most votes at the end wins!</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
