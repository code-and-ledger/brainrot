"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Mock data for demonstration
const TOP_MEMES = [
  {
    id: 1,
    title: "Blockchain Drama",
    votes: 15482,
    creator: "0x1a2b...3c4d",
    imageUrl: "/assets/meme1.png",
  },
  {
    id: 2,
    title: "Smart Contract Bugs",
    votes: 12783,
    creator: "0x5e6f...7g8h",
    imageUrl: "/assets/meme2.png",
  },
  {
    id: 3,
    title: "Gas Fee Pain",
    votes: 10921,
    creator: "0x9i0j...1k2l",
    imageUrl: "/assets/meme3.png",
  },
  {
    id: 4,
    title: "NFT Madness",
    votes: 9240,
    creator: "0x3m4n...5o6p",
    imageUrl: "/assets/meme4.png",
  },
  {
    id: 5,
    title: "Web3 Expectations",
    votes: 8325,
    creator: "0x7q8r...9s0t",
    imageUrl: "/assets/meme5.png",
  },
];

const TOP_USERS = [
  {
    id: 1,
    address: "0x1a2b...3c4d",
    wins: 24,
    totalVotes: 45920,
    totalMemes: 37,
  },
  {
    id: 2,
    address: "0x5e6f...7g8h",
    wins: 18,
    totalVotes: 38457,
    totalMemes: 29,
  },
  {
    id: 3,
    address: "0x9i0j...1k2l",
    wins: 15,
    totalVotes: 32189,
    totalMemes: 26,
  },
  {
    id: 4,
    address: "0x3m4n...5o6p",
    wins: 12,
    totalVotes: 27834,
    totalMemes: 21,
  },
  {
    id: 5,
    address: "0x7q8r...9s0t",
    wins: 10,
    totalVotes: 23561,
    totalMemes: 19,
  },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("memes"); // "memes" or "users"

  return (
    <div className="bg-black min-h-screen text-[#fff] relative overflow-hidden">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl border border-gray-300 rounded-2xl">
        <h1
          className="text-4xl font-bold mb-8 text-center text-white"
          style={{ fontFamily: "var(--font-permanent-marker)" }}
        >
          Leaderboard
        </h1>

        {/* Tab Toggle */}
        <div className="p-2 rounded-xl flex mb-8">
          <button
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === "memes"
                ? "bg-white text-black"
                : "hover:bg-gray-950"
            }`}
            onClick={() => setActiveTab("memes")}
          >
            Top Memes
          </button>
          <button
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === "users"
                ? "bg-white text-black"
                : "hover:bg-gray-950"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Top Users
          </button>
        </div>

        {/* Content based on active tab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 rounded-xl"
        >
          {activeTab === "memes" ? (
            <>
              <div className="grid gap-6">
                {TOP_MEMES.map((meme, index) => (
                  <div
                    key={meme.id}
                    className="border border-gray-700 rounded-xl p-4 flex items-center"
                  >
                    <div className="flex-shrink-0 text-2xl font-bold mr-4 w-8 text-center">
                      {index + 1}
                    </div>
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden mr-4 flex-shrink-0">
                      <div className="bg-gray-700 w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-400">
                          Meme image
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold">{meme.title}</h3>
                      <p className="text-gray-400 text-sm">by {meme.creator}</p>
                    </div>
                    <div className="flex-shrink-0 bg-white text-black px-4 py-2 rounded-lg font-medium">
                      {meme.votes.toLocaleString()} votes
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-6">
                {TOP_USERS.map((user, index) => (
                  <div
                    key={user.id}
                    className="border border-gray-700 rounded-xl p-4 flex items-center"
                  >
                    <div className="flex-shrink-0 text-2xl font-bold mr-4 w-8 text-center">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 bg-gray-800 rounded-full mr-4 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">👤</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold">{user.address}</h3>
                      <div className="flex text-sm text-gray-400 gap-4 mt-1">
                        <span>{user.wins} wins</span>
                        <span>{user.totalMemes} memes</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 bg-white text-black px-4 py-2 rounded-lg font-medium">
                      {user.totalVotes.toLocaleString()} votes
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Stats */}
        <div className="mt-8 p-6 rounded-xl">
          <h2
            className="text-xl font-bold mb-4"
            style={{ fontFamily: "var(--font-permanent-marker)" }}
          >
            Platform Stats
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">128,459</div>
              <div className="text-gray-400 mt-1">Total Votes</div>
            </div>
            <div className="border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">2,187</div>
              <div className="text-gray-400 mt-1">Memes Created</div>
            </div>
            <div className="border border-gray-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">843</div>
              <div className="text-gray-400 mt-1">Active Users</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
