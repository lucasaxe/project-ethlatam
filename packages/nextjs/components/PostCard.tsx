// /packages/nextjs/components/PostCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// /packages/nextjs/components/PostCard.tsx

// /packages/nextjs/components/PostCard.tsx

// /packages/nextjs/components/PostCard.tsx

// /packages/nextjs/components/PostCard.tsx

// /packages/nextjs/components/PostCard.tsx

// /packages/nextjs/components/PostCard.tsx

// /packages/nextjs/components/PostCard.tsx

// /packages/nextjs/components/PostCard.tsx

// /packages/nextjs/components/PostCard.tsx

// /packages/nextjs/components/PostCard.tsx

// --- Tipagem para os Metadados (do IPFS/JSON) ---
interface PostMetadata {
  postTitle: string;
  imageDescription: string;
  imageUrl: string;
}

// --- Ícones SVG (CORRIGIDO: Preenchimento com Gradiente Usando Hex Codes) ---
const HeartIcon = ({ filled, ...props }: { filled: boolean; [key: string]: any }) => {
  const gradientId = "heartGradient"; // ID Fixo para o gradiente SVG

  return (
    <div className="w-9 h-9 flex items-center justify-center">
      {/* 1. Definição do Gradiente SVG (Usando Hex Codes dos tons do projeto) */}
      {/* Azul: #3b82f6 (blue-500), Teal: #14b8a6 (teal-500), Lima: #84cc16 (lime-500) */}
      <svg width="0" height="0" className="absolute">
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#84cc16" />
        </linearGradient>
      </svg>

      {/* 2. O Heart SVG que usa o gradiente definido */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        // Preenche com a URL do gradiente quando 'filled', caso contrário 'none'
        fill={filled ? `url(#${gradientId})` : "none"}
        // O contorno também usa o gradiente quando preenchido para melhor efeito visual
        stroke={filled ? `url(#${gradientId})` : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-8 h-8 ${!filled ? "text-base-content/70" : ""}`}
        {...props}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </div>
  );
};

/**
 * @dev Converts an 'ipfs://' URL to an HTTP URL (using 'ipfs.io' which worked in Chrome)
 */
const ipfsToHttpGateway = (ipfsUrl: string, gateway = "https://ipfs.io/ipfs/") => {
  if (!ipfsUrl || !ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl;
  }
  return ipfsUrl.replace("ipfs://", gateway);
};

// --- Componente PostCard ---
export const PostCard = ({ postId }: { postId: number }) => {
  const { address: connectedAddress } = useAccount();

  const queryClient = useQueryClient();

  const [metadata, setMetadata] = useState<PostMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  const [donationAmount, setDonationAmount] = useState("1000"); // Placeholder value

  const modalId = `donate-modal-${postId}`;

  // Query keys to invalidate cache
  const postDetailsQueryKey = ["scaffoldRead", "YourContract", "getPostDetails", { args: [BigInt(postId)] }];
  const hasLikedQueryKey = ["scaffoldRead", "YourContract", "hasLiked", { args: [BigInt(postId), connectedAddress] }];

  // 1. Fetches ON-CHAIN data
  const { data: onChainPostData, isLoading: isLoadingOnChain } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPostDetails",
    args: [BigInt(postId)],
  });

  // 2. Checks if the user HAS LIKED
  const { data: userHasLiked } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "hasLiked",
    args: [BigInt(postId), connectedAddress],
    query: {
      enabled: !!connectedAddress,
    },
  });

  // 3. Prepares the 'like' function
  const { writeContractAsync: likePost, isPending: isLiking } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  // WRITE Hook for DONATION
  const { writeContractAsync: donateToPost, isPending: isDonating } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  // Hook to fetch OFF-CHAIN metadata (IPFS/JSON)
  useEffect(() => {
    if (onChainPostData && onChainPostData.contentUrl) {
      const httpUrl = ipfsToHttpGateway(onChainPostData.contentUrl);

      setIsLoadingMetadata(true);
      fetch(httpUrl)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch from network: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          setMetadata(data);
        })
        .catch(e => {
          console.error("Failed to fetch IPFS metadata", e);
        })
        .finally(() => setIsLoadingMetadata(false));
    }
  }, [onChainPostData]);

  /**
   * @dev Called by the LIKE button
   */
  const handleLike = async () => {
    if (isLiking) return;
    try {
      await likePost({
        functionName: "likePost",
        args: [BigInt(postId)],
      });
      // AUTOMATIC UPDATE
      queryClient.invalidateQueries({ queryKey: postDetailsQueryKey });
      queryClient.invalidateQueries({ queryKey: hasLikedQueryKey });
    } catch (e) {
      console.error("Error trying to like post:", e);
      toast.error("Error liking the post.");
    }
  };

  /**
   * @dev Called by the "Confirm" button INSIDE THE MODAL
   */
  const handleDonate = async () => {
    if (isDonating || !donationAmount || BigInt(donationAmount) <= 0) {
      toast.error("Please enter a valid amount in Wei (greater than zero).");
      return;
    }

    const toastId = toast.loading("Confirming donation in MetaMask...");
    try {
      const valueInWei = BigInt(donationAmount);

      await donateToPost({
        functionName: "donateToPost",
        args: [BigInt(postId)],
        value: valueInWei, // Sends the Wei with the transaction
      });

      toast.success("Donation sent successfully!", { id: toastId });

      // AUTOMATIC UPDATE
      queryClient.invalidateQueries({ queryKey: postDetailsQueryKey });

      (document.getElementById(modalId) as HTMLDialogElement)?.close();
    } catch (e: any) {
      console.error("Error trying to donate:", e);
      if (e.message.includes("rejected")) {
        toast.error("Donation rejected.", { id: toastId });
      } else {
        toast.error("Donation failed.", { id: toastId });
      }
    }
  };

  // --- Rendering ---

  if (isLoadingOnChain || isLoadingMetadata || !onChainPostData || !metadata) {
    return (
      <section className="flex items-center justify-center w-full py-16 border-b border-base-300 min-h-[400px]">
        <span className="loading loading-spinner loading-md"></span>
      </section>
    );
  }

  const { ngoName, ngoReputation, likeCount } = onChainPostData;
  const { postTitle, imageDescription, imageUrl } = metadata;

  const httpImageUrl = ipfsToHttpGateway(imageUrl);

  return (
    <section key={postId} className="flex items-center justify-center w-full py-16 border-b border-base-300">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-7xl mx-auto px-6 items-center">
        {/* Column 1: NGO Information and DONATE Button */}
        <div className="md:col-span-1 flex flex-col justify-center md:order-1 order-2 items-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-4">
            <h2 className="text-3xl font-bold text-blue-600 w-full text-center">{ngoName}</h2>
          </div>

          {/* NGO DESCRIPTION */}
          <p className="text-base text-base-content/70 mb-8 w-full text-left">
            {imageDescription.substring(0, 100)}...
          </p>

          {/* ========================================= */}
          {/* == BLOCK: REPUTATION TOKEN INFORMATION == */}
          {/* ========================================= */}
          <div className="flex items-center space-x-2 mb-8 p-2 bg-base-200/50 rounded-lg border border-base-300 w-fit">
            {/* Token Name and Value: Reputation: [NUMBER] */}
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-semibold text-blue-600">Reputation:</span>
              <span className="text-2xl font-bold text-blue-600">{Number(ngoReputation)}</span>
            </div>

            {/* Token Image (w-12 h-12) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/good-reputation-token.jpg"
              alt="Reputation Token"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          {/* ========================================= */}

          <div className="flex justify-center w-full">
            <button
              className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90 w-full"
              onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.showModal()}
              disabled={!connectedAddress}
            >
              DONATE TO NGO
            </button>
          </div>
        </div>

        {/* Column 2: Main Image (Fetched from metadata) */}
        <div className="md:col-span-3 md:order-2 order-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={httpImageUrl}
            alt={imageDescription}
            className="w-full aspect-video object-cover rounded-2xl shadow-xl bg-base-300"
            onError={e => {
              (e.currentTarget as HTMLImageElement).src =
                "https://placehold.co/1200x800/FF0000/white?text=Image+Load+Error";
            }}
          />
        </div>

        {/* Column 3: Description and LIKES */}
        <div className="md:col-span-1 md:order-3 order-3 flex flex-col justify-start self-start">
          <h3 className="text-2xl font-semibold mb-3 text-lime-600">{postTitle}</h3>
          <p className="text-base-content/80 italic">{imageDescription}</p>

          <div className="mt-4 flex items-center gap-2">
            <button
              className="btn btn-ghost btn-circle btn-lg"
              onClick={handleLike}
              aria-label="Like"
              disabled={isLiking || !connectedAddress || userHasLiked}
            >
              <HeartIcon filled={!!userHasLiked} />
            </button>
            <span className="text-xl font-bold text-lime-600">{BigInt(likeCount).toString()}</span>
            {isLiking && <span className="loading loading-spinner loading-xs"></span>}
          </div>
        </div>
      </div>

      {/* --- THE DONATION MODAL (POP-UP) --- */}
      <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-base-content">Make a Donation to:</h3>
          <p className="py-2 text-lime-600 font-semibold">{postTitle}</p>

          {/* Input for Wei */}
          <div className="form-control w-full mt-4">
            <label className="label" htmlFor={`wei-amount-${postId}`}>
              <span className="label-text">Amount (in Wei)</span>
            </label>
            <input
              id={`wei-amount-${postId}`}
              type="number"
              value={donationAmount}
              onChange={e => setDonationAmount(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ex: 1000"
            />
            <label className="label">
              <span className="label-text-alt">1 ETH = 1,000,000,000,000,000,000 Wei</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="modal-action flex flex-col-reverse sm:flex-row gap-2">
            <button
              className="btn btn-ghost"
              onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.close()}
            >
              Cancel
            </button>
            <button
              className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90"
              onClick={handleDonate}
              disabled={isDonating || !connectedAddress}
            >
              {isDonating ? <span className="loading loading-spinner"></span> : "Confirm Donation"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </section>
  );
};
