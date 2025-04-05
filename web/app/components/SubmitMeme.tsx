import { useState } from "react";
import { useContractInteractions } from "../lib/useContractInteractions";

interface SubmitMemeProps {
  gameId: number;
  onSuccess?: () => void;
}

export default function SubmitMeme({ gameId, onSuccess }: SubmitMemeProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { submitMeme, isLoading } = useContractInteractions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !tokenName || !tokenSymbol || !imageUrl) {
      setError("Please fill out all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Generate a unique ID if not provided
    const memeUniqueId =
      uniqueId || `meme-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      const result = await submitMeme(
        gameId,
        name,
        description,
        tokenName,
        tokenSymbol,
        memeUniqueId,
        imageUrl
      );

      if (result.success) {
        setSuccess(true);
        resetForm();
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || "Failed to submit meme");
      }
    } catch (err: any) {
      setError(err.message || "Error submitting meme");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setTokenName("");
    setTokenSymbol("");
    setImageUrl("");
    setUniqueId("");
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Submit Your Meme</h2>

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
          Your meme has been submitted! It will need to be approved by the admin
          before it appears in the game.
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Meme Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            required
          />
        </div>

        <div>
          <label htmlFor="tokenName" className="block text-sm font-medium mb-1">
            Token Name *
          </label>
          <input
            id="tokenName"
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be the name of the token if your meme wins (e.g., "Doge
            Coin")
          </p>
        </div>

        <div>
          <label
            htmlFor="tokenSymbol"
            className="block text-sm font-medium mb-1"
          >
            Token Symbol *
          </label>
          <input
            id="tokenSymbol"
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            className="w-full p-2 border rounded-md"
            maxLength={6}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            A short symbol for your token (e.g., "DOGE")
          </p>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
            Image URL *
          </label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Link to your meme image (IPFS or other permanent storage
            recommended)
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || isLoading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            submitting || isLoading
              ? "bg-gray-400"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Meme"}
        </button>
      </form>
    </div>
  );
}
