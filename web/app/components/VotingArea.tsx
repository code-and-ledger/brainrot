import { useState, useEffect } from "react";
import { useContractInteractions } from "../lib/useContractInteractions";
import { useAccount } from "wagmi";
import Image from "next/image";

interface MemeWithVotes {
  memeId: number;
  name: string;
  description: string;
  imageUrl: string;
  creator: string;
  totalVotes: number;
  isApproved: boolean;
  votesToAllocate: number;
}

interface VotingAreaProps {
  gameId: number;
  roundNumber: number;
}

export default function VotingArea({ gameId, roundNumber }: VotingAreaProps) {
  const [memes, setMemes] = useState<MemeWithVotes[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [roundInfo, setRoundInfo] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const { address } = useAccount();
  const { getRoundInfo, getMemeInfo, getParticipantInfo, vote, isLoading } =
    useContractInteractions();

  // Fetch round info and memes
  useEffect(() => {
    const fetchRoundData = async () => {
      setLoading(true);

      try {
        // Get round information
        const roundResult = await getRoundInfo(gameId, roundNumber);
        if (roundResult.success && roundResult.data) {
          setRoundInfo(roundResult.data);

          // Get details for each meme
          const memesWithDetails: MemeWithVotes[] = [];
          for (const memeId of roundResult.data.memeIds) {
            const memeResult = await getMemeInfo(memeId);
            if (memeResult.success && memeResult.data) {
              memesWithDetails.push({
                memeId: memeResult.data.memeId,
                name: memeResult.data.name,
                description: memeResult.data.description,
                imageUrl: memeResult.data.imageUrl,
                creator: memeResult.data.creator,
                totalVotes: memeResult.data.totalVotes,
                isApproved: memeResult.data.isApproved,
                votesToAllocate: 0,
              });
            }
          }

          setMemes(memesWithDetails);

          // Get user's credits if they're connected
          if (address) {
            const participantResult = await getParticipantInfo(gameId, address);
            if (participantResult.success && participantResult.data) {
              const userCredits = participantResult.data.credits;
              // If user has 0 credits but hasn't voted this round, they get 1000
              setCredits(
                userCredits === 0 &&
                  participantResult.data.lastVotedRound < roundNumber
                  ? 1000
                  : userCredits
              );
            }
          }
        }
      } catch (err: any) {
        setError(err.message || "Error loading round data");
      } finally {
        setLoading(false);
      }
    };

    if (gameId && roundNumber) {
      fetchRoundData();
    }
  }, [
    gameId,
    roundNumber,
    address,
    getRoundInfo,
    getMemeInfo,
    getParticipantInfo,
  ]);

  // Update countdown timer
  useEffect(() => {
    if (!roundInfo) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = roundInfo.endTime;

      if (now >= endTime) {
        setTimeLeft("Voting ended");
        return;
      }

      const secondsLeft = endTime - now;
      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [roundInfo]);

  // Handle voting input changes
  const handleVoteChange = (memeId: number, votesValue: string) => {
    const newVotes = parseInt(votesValue) || 0;

    setMemes((prevMemes) => {
      // Calculate total votes allocated excluding this meme
      const otherVotes = prevMemes.reduce(
        (sum, meme) =>
          meme.memeId === memeId ? sum : sum + meme.votesToAllocate,
        0
      );

      // Limit votes to available credits
      const maxAvailableForThisMeme = credits - otherVotes;
      const validatedVotes = Math.min(newVotes, maxAvailableForThisMeme);

      return prevMemes.map((meme) =>
        meme.memeId === memeId
          ? { ...meme, votesToAllocate: validatedVotes }
          : meme
      );
    });
  };

  // Submit votes for a meme
  const handleSubmitVote = async (memeId: number, votesToAllocate: number) => {
    if (votesToAllocate <= 0) {
      setError("You must allocate at least 1 vote");
      return;
    }

    setVoting(true);
    setError(null);

    try {
      const result = await vote(gameId, memeId, votesToAllocate);

      if (result.success) {
        setSuccess(true);

        // Update UI state
        setCredits((prev) => prev - votesToAllocate);
        setMemes((prevMemes) =>
          prevMemes.map((meme) => ({
            ...meme,
            votesToAllocate: 0,
            totalVotes:
              meme.memeId === memeId
                ? meme.totalVotes + votesToAllocate
                : meme.totalVotes,
          }))
        );
      } else {
        setError(result.error || "Failed to submit vote");
      }
    } catch (err: any) {
      setError(err.message || "Error submitting vote");
    } finally {
      setVoting(false);
    }
  };

  if (loading || isLoading) {
    return <div className="p-4 text-center">Loading voting area...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!roundInfo) {
    return <div className="p-4 text-center">Round not found</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Game #{gameId} - Round {roundNumber}
        </h2>
        <div className="text-lg font-semibold">
          Time left: <span className="text-blue-600">{timeLeft}</span>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center">
          <p className="font-medium">Your remaining credits: {credits}</p>
          {success && (
            <p className="text-green-600">Vote submitted successfully!</p>
          )}
        </div>
      </div>

      {memes.length === 0 ? (
        <div className="text-center py-8">
          No memes available for voting in this round
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memes.map((meme) => (
            <div
              key={meme.memeId}
              className="border rounded-lg overflow-hidden shadow-md bg-white"
            >
              <div className="relative w-full h-48">
                <img
                  src={meme.imageUrl}
                  alt={meme.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{meme.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{meme.description}</p>

                <div className="mb-4">
                  <p className="text-sm">
                    Current votes:{" "}
                    <span className="font-semibold">{meme.totalVotes}</span>
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max={credits}
                    value={meme.votesToAllocate || ""}
                    onChange={(e) =>
                      handleVoteChange(meme.memeId, e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                    placeholder="Number of votes"
                  />

                  <button
                    onClick={() =>
                      handleSubmitVote(meme.memeId, meme.votesToAllocate)
                    }
                    disabled={
                      voting || meme.votesToAllocate <= 0 || credits <= 0
                    }
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      voting || meme.votesToAllocate <= 0 || credits <= 0
                        ? "bg-gray-400"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Vote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
