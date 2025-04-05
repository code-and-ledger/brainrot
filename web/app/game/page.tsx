"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "../components/Navbar";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

// Mock data for memes
const mockMemes = [
  {
    id: 1,
    imageUrl:
      "https://images.squarespace-cdn.com/content/v1/64a1f0c282a2257f0aedb399/0024a7fd-2a40-48ae-9278-6560737012b6/05_my-boss_b.jpg",
    title: "Doge 2.0",
    votes: 0,
    userCredits: 0,
  },
  {
    id: 2,
    imageUrl: "/memes/2.jpg",
    title: "Wojak Returns",
    votes: 0,
    userCredits: 0,
  },
  {
    id: 3,
    imageUrl: "/memes/3.jpg",
    title: "Pepe Evolution",
    votes: 0,
    userCredits: 0,
  },
  {
    id: 4,
    imageUrl: "/memes/4.jpg",
    title: "Chad Meme",
    votes: 0,
    userCredits: 0,
  },
];

export default function GamePage() {
  const { width, height } = useWindowSize();
  const [memes, setMemes] = useState(mockMemes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [credits, setCredits] = useState(1000);
  const [countdown, setCountdown] = useState(3);
  const [gamePhase, setGamePhase] = useState("COUNTDOWN");
  const [bettingAmount, setBettingAmount] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [creditParticles, setCreditParticles] = useState<
    Array<{ id: number; x: number; y: number; value: number }>
  >([]);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);
  const memeCardRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  useEffect(() => {
    if (gamePhase !== "COUNTDOWN") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGamePhase("LIVE");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase]);

  // Handle credit particles animation
  useEffect(() => {
    if (creditParticles.length === 0) return;

    const animationFrame = requestAnimationFrame(() => {
      setCreditParticles(
        (prev) =>
          prev
            .map((particle) => ({
              ...particle,
              y: particle.y + 2, // Fall speed
            }))
            .filter((particle) => particle.y < height) // Remove when out of screen
      );
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [creditParticles, height]);

  // Navigation functions
  const goNext = () => {
    setCurrentIndex((prev) => (prev < memes.length - 1 ? prev + 1 : 0));
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : memes.length - 1));
  };

  // Handle swipe gestures
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 50) {
      goPrev();
    } else if (info.offset.x < -50) {
      goNext();
    }
  };

  // Create credit particles
  const createCreditParticles = (amount: number) => {
    if (!memeCardRef.current) return;

    const rect = memeCardRef.current.getBoundingClientRect();
    const particles = [];

    for (let i = 0; i < Math.min(amount, 30); i++) {
      // Limit to 30 particles max
      particles.push({
        id: Math.random(),
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        value: Math.floor(Math.random() * bettingAmount) + 1, // Random value between 1-10
      });
    }

    setCreditParticles(particles);
  };

  // Handle hold to bet
  const startBetting = () => {
    setIsHolding(true);
    holdInterval.current = setInterval(() => {
      if (credits > 0) {
        setBettingAmount((prev) => prev + 10);
        setCredits((prev) => prev - 10);
        createCreditParticles(Math.floor(bettingAmount / 5));
        // Create particles every 200ms while holding

        createCreditParticles(5);
      } else {
        stopBetting();
      }
    }, 100);
  };

  const stopBetting = () => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
    setIsHolding(false);

    if (bettingAmount > 0) {
      setMemes((prev) =>
        prev.map((meme, i) =>
          i === currentIndex
            ? {
                ...meme,
                votes: meme.votes + bettingAmount,
                userCredits: meme.userCredits + bettingAmount,
              }
            : meme
        )
      );

      // Show confetti and credit shower for significant bets
      // if (bettingAmount >= 50) {
      //   setShowConfetti(true);
      //   createCreditParticles(20);
      //   setTimeout(() => setShowConfetti(false), 3000);
      // } else {
      createCreditParticles(Math.floor(bettingAmount));
      // }

      setBettingAmount(0);
    }
  };

  const currentMeme = memes[currentIndex];

  return (
    <div className="bg-black min-h-screen text-[#fff] relative overflow-hidden">
      <Navbar />

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}

      {/* Credit Particles */}
      {creditParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-yellow-400 font-bold text-sm pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            left: particle.x,
            top: particle.y,
          }}
        >
          +{particle.value}
        </motion.div>
      ))}

      <main className="container mx-auto px-4 py-8">
        {/* Game Status Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            {gamePhase === "COUNTDOWN" ? (
              <span>
                Game starts in: <strong>{countdown}s</strong>
              </span>
            ) : (
              <span>LIVE! Place your bets</span>
            )}
          </div>
          <div className="bg-purple-600 px-4 py-2 rounded-lg">
            Credits: <strong>{credits}</strong>
          </div>
        </div>

        {/* Instructions */}
        {gamePhase === "COUNTDOWN" && (
          <div className="text-center mb-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Get Ready!</h2>
            <p>
              When countdown hits zero, you'll get 1,000 credits to bet on memes
            </p>
            <p>Swipe left/right to browse, hold to bet</p>
          </div>
        )}

        {/* Meme Card Container */}
        {gamePhase !== "COUNTDOWN" && (
          <div className="relative max-w-2xl mx-auto">
            {/* Navigation Arrows */}
            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 p-4 rounded-full hover:bg-opacity-75 transition-all"
            >
              PREV
            </button>

            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 p-4 rounded-full hover:bg-opacity-75 transition-all"
              style={{ right: 0 }}
            >
              NEXT
            </button>

            {/* Meme Card */}
            <div
              className="relative h-[60vh] w-[300px] mx-auto"
              ref={memeCardRef}
            >
              <AnimatePresence>
                <motion.div
                  key={currentMeme.id}
                  className="absolute inset-0 bg-gray-900 rounded-xl overflow-hidden flex flex-col"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onMouseDown={startBetting}
                  onMouseUp={stopBetting}
                  onMouseLeave={stopBetting}
                  onTouchStart={startBetting}
                  onTouchEnd={stopBetting}
                >
                  {/* Meme Image */}
                  <div className="flex-1 relative">
                    <img
                      src={currentMeme.imageUrl}
                      alt={currentMeme.title}
                      className="w-full h-full object-contain"
                    />

                    {/* Betting overlay */}
                    {isHolding && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-4xl font-bold text-yellow-400 animate-pulse">
                          +{bettingAmount}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meme Info */}
                  <div className="p-4 bg-gray-800">
                    <h3 className="text-xl font-bold">{currentMeme.title}</h3>
                    <div className="flex justify-between mt-2">
                      <span>Total Votes: {currentMeme.votes}</span>
                      <span>Your Bet: {currentMeme.userCredits}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Navigation Dots */}
        {gamePhase !== "COUNTDOWN" && (
          <div className="flex justify-center mt-4 gap-2">
            {memes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? "bg-[#fff]" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}

        {/* Current Bet Display */}
        {bettingAmount > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 px-4 py-2 rounded-lg">
            Current Bet: {bettingAmount} credits
          </div>
        )}
      </main>
    </div>
  );
}
