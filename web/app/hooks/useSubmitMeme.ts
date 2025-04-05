import { useState } from "react";
import { useContractInteractions } from "../lib/useContractInteractions";

interface SubmitMemeParams {
  gameId: number;
  name: string;
  description: string;
  tokenName: string;
  tokenSymbol: string;
  imageUrl: string;
}

export function useSubmitMeme() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { submitMeme } = useContractInteractions();

  const createMeme = async ({
    gameId,
    name,
    description,
    tokenName,
    tokenSymbol,
    imageUrl,
  }: SubmitMemeParams) => {
    if (
      !gameId ||
      !name ||
      !description ||
      !tokenName ||
      !tokenSymbol ||
      !imageUrl
    ) {
      setError("All fields are required");
      return { success: false, error: "All fields are required" };
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      // Generate a unique ID for the meme
      const uniqueId = `meme-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const result = await submitMeme(
        gameId,
        name,
        description,
        tokenName,
        tokenSymbol,
        uniqueId,
        imageUrl
      );

      if (result.success) {
        setSuccess(true);
        if (result.txHash) {
          setTxHash(result.txHash.toString());
        }
        return { success: true, txHash: result.txHash };
      } else {
        setError(result.error || "Failed to submit meme");
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      const errorMessage = err.message || "Error submitting meme";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createMeme,
    isSubmitting,
    error,
    success,
    txHash,
    reset: () => {
      setError(null);
      setSuccess(false);
      setTxHash(null);
    },
  };
}
