"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { erc20Abi, parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

// --- ENDEREÇO DO WETH NA BASE SEPOLIA ---
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

// --- Tipagem para os Metadados (do IPFS/JSON) ---
interface PostMetadata {
  postTitle: string;
  imageDescription: string;
  imageUrl: string;
}

// --- Ícones SVG (Sem alteração) ---
const HeartIcon = ({ filled, ...props }: { filled: boolean; [key: string]: any }) => {
  const gradientId = "heartGradient";
  return (
    <div className="w-9 h-9 flex items-center justify-center">
      <svg width="0" height="0" className="absolute">
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#84cc16" />
        </linearGradient>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill={filled ? `url(#${gradientId})` : "none"}
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
 * @dev Converts an 'ipfs://' URL to an HTTP URL
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

  // --- Estados ---
  const [ethPrice, setEthPrice] = useState(0);
  const [metadata, setMetadata] = useState<PostMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [donationAmount, setDonationAmount] = useState("5.00"); // Valor em USD
  const [minReputation, setMinReputation] = useState("100"); // Valor padrão
  const [isApproving, setIsApproving] = useState(false);

  const modalId = `donate-modal-${postId}`;

  // Query keys
  const postDetailsQueryKey = ["scaffoldRead", "YourContract", "getPostDetails", { args: [BigInt(postId)] }];
  const hasLikedQueryKey = ["scaffoldRead", "YourContract", "hasLiked", { args: [BigInt(postId), connectedAddress] }];

  // 1. Busca dados ON-CHAIN
  const { data: onChainPostData, isLoading: isLoadingOnChain } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPostDetails",
    args: [BigInt(postId)],
  });

  // 2. Verifica se o usuário curtiu
  const { data: userHasLiked } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "hasLiked",
    args: [BigInt(postId), connectedAddress],
    query: {
      enabled: !!connectedAddress,
    },
  });

  // --- Pega o endereço do 'YourContract' para usar no 'approve' ---
  const { data: deployedContractInfo, isLoading: isLoadingContractInfo } = useDeployedContractInfo("YourContract");
  const yourContractAddress = deployedContractInfo?.address;

  // 3. Prepara a função 'like'
  const { writeContractAsync: likePost, isPending: isLiking } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  // --- Hooks de Escrita para o Fluxo de Penhor ---
  const { writeContractAsync: approveWeth } = useWriteContract();
  const { writeContractAsync: pledgeDonation, isPending: isPledging } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  // useEffect para buscar preço do ETH
  useEffect(() => {
    fetch("/api/eth-price")
      .then(response => response.json())
      .then(data => {
        if (data && data.price) {
          setEthPrice(data.price);
        }
      })
      .catch(error => {
        console.error("Erro ao buscar preço do ETH (API local):", error);
        setEthPrice(0);
      });
  }, []);

  // useEffect para buscar metadados OFF-CHAIN (IPFS)
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
   * @dev Chamado pelo botão LIKE
   */
  const handleLike = async () => {
    if (isLiking) return;
    try {
      await likePost({
        functionName: "likePost",
        args: [BigInt(postId)],
      });
      queryClient.invalidateQueries({ queryKey: postDetailsQueryKey });
      queryClient.invalidateQueries({ queryKey: hasLikedQueryKey });
    } catch (e) {
      console.error("Error trying to like post:", e);
      toast.error("Error liking the post.");
    }
  };

  /**
   * @dev Chamado pelo botão PLEDGE
   */
  const handlePledge = async () => {
    const amountUsd = parseFloat(donationAmount);
    const minReputationBigInt = BigInt(minReputation || "0");

    // Validação
    if (isApproving || isPledging) return;
    if (!amountUsd || amountUsd <= 0) {
      toast.error("Please enter a valid USD amount.");
      return;
    }
    if (minReputationBigInt <= 0) {
      toast.error("Minimum reputation must be greater than 0.");
      return;
    }
    if (ethPrice === 0) {
      toast.error("Could not fetch WETH price. Please try again.");
      return;
    }
    if (!yourContractAddress) {
      toast.error("Contract address not found.");
      return;
    }

    const toastId = toast.loading("Calculating pledge value...");
    try {
      // Lógica de Conversão
      const amountEth = amountUsd / ethPrice;
      const valueInWei = parseEther(amountEth.toString());

      setIsApproving(true);

      // ETAPA 1: Approve
      toast.loading("Please approve WETH spending in your wallet...", { id: toastId });

      const approveTxHash = await approveWeth({
        address: WETH_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [yourContractAddress as `0x${string}`, valueInWei],
      });

      // ETAPA 1.5: Aguardar Mineração
      toast.loading("Waiting for approval confirmation...", { id: toastId });

      await waitForTransactionReceipt(wagmiConfig, {
        hash: approveTxHash,
        confirmations: 1,
      });

      setIsApproving(false);

      // ETAPA 2: Pledge
      toast.loading("Registering your pledge...", { id: toastId });

      await pledgeDonation({
        functionName: "pledgeDonation",
        args: [BigInt(postId), WETH_ADDRESS, valueInWei, minReputationBigInt],
      });

      toast.success("Pledge registered successfully! The donation will occur when the NGO meets the goal.", {
        id: toastId,
      });

      queryClient.invalidateQueries({ queryKey: postDetailsQueryKey });
      (document.getElementById(modalId) as HTMLDialogElement)?.close();
    } catch (e: any) {
      setIsApproving(false);
      console.error("Error registering pledge:", e);
      if (e.message.includes("rejected")) {
        toast.error("Transaction rejected.", { id: toastId });
      } else {
        toast.error("Failed to register pledge.", { id: toastId });
      }
    }
  };

  // --- Rendering ---
  if (isLoadingOnChain || isLoadingMetadata || !onChainPostData || !metadata || ethPrice === 0) {
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
        {/* Coluna 1: Informações da ONG e Botão PLEDGE */}
        <div className="md:col-span-1 flex flex-col justify-center md:order-1 order-2 items-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-4">
            <h2 className="text-3xl font-bold text-blue-600 w-full text-center">{ngoName}</h2>
          </div>
          <p className="text-base text-base-content/70 mb-8 w-full text-left">
            {imageDescription.substring(0, 100)}...
          </p>
          <div className="flex items-center space-x-2 mb-8 p-2 bg-base-200/50 rounded-lg border border-base-300 w-fit">
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-semibold text-blue-600">Reputation:</span>
              <span className="text-2xl font-bold text-blue-600">{Number(ngoReputation)}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/good-reputation-token.jpg"
              alt="Reputation Token"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <div className="flex justify-center w-full">
            <button
              className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90 w-full"
              onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.showModal()}
              disabled={!connectedAddress}
            >
              PLEDGE DONATION
            </button>
          </div>
        </div>

        {/* Coluna 2: Imagem Principal */}
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

        {/* Coluna 3: Descrição e LIKES */}
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

      {/* --- MODAL DE DOAÇÃO (ORDEM INVERTIDA) --- */}
      <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box relative">
          {/* Botão de Fechar (X) no canto */}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.close()}
          >
            ✕
          </button>

          <h3 className="font-bold text-2xl text-base-content">Make a Pledge for:</h3>
          <p className="py-1 text-lime-600 font-semibold text-lg">{ngoName}</p>

          <div className="divider mt-2 mb-4"></div>

          {/* === BLOCO 1: VALOR (INPUT) === */}
          <div className="form-control w-full">
            <label className="label" htmlFor={`usd-amount-${postId}`}>
              <span className="label-text font-medium">1. Set Pledge Amount (USD)</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 text-lg">
              <span className="text-base-content/50">$</span>
              <input
                id={`usd-amount-${postId}`}
                type="number"
                value={donationAmount}
                onChange={e => setDonationAmount(e.target.value)}
                className="grow"
                placeholder="5.00"
              />
              <span className="badge badge-ghost">USD</span>
            </label>
            <label className="label"></label>
          </div>

          {/* === BLOCO 2: REPUTAÇÃO ATUAL (INFO) === */}
          <div className="w-full mt-4">
            <span className="label-text font-medium">NGO&apos;s Current Reputation:</span>
            <div className="flex items-center gap-2 mt-2">
              {/* --- ORDEM INVERTIDA --- */}
              <span className="font-bold text-info text-2xl">{Number(ngoReputation)}</span>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/good-reputation-token.jpg"
                alt="Rep"
                // vvv PONTO DE MUDANÇA vvv
                // Altere as classes w-9 e h-9 para aumentar o tamanho (ex: w-10 h-10)
                className="w-16 h-16 rounded-full"
                // ^^^ PONTO DE MUDANÇA ^^^
              />
            </div>
          </div>

          {/* === BLOCO 3: REPUTAÇÃO MÍNIMA (INPUT) === */}
          <div className="form-control w-full mt-6">
            <label className="label" htmlFor={`min-reputation-${postId}`}>
              <span className="label-text font-medium">2. Set Your Minimum Reputation</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-5 h-5 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M8 1.75a.75.75 0 0 1 .692 1.032l-1.32 3.299 3.299-1.32A.75.75 0 0 1 11.75 5.5l-1.32 3.299 3.299-1.32a.75.75 0 0 1 .68 1.39l-3.298 1.318 1.318 3.298a.75.75 0 0 1-1.39.68l-1.32-3.299-3.299 1.32a.75.75 0 0 1-1.032-.692l1.32-3.299-3.299 1.32a.75.75 0 0 1-.68-1.39l3.298-1.318-1.318-3.298a.75.75 0 0 1 1.39-.68l1.32 3.299L7.308 2.782A.75.75 0 0 1 8 1.75Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                id={`min-reputation-${postId}`}
                type="number"
                value={minReputation}
                onChange={e => setMinReputation(e.target.value)}
                className="grow"
                placeholder="100"
              />
            </label>
          </div>

          {/* === AVISO DE CONDIÇÃO === */}
          <div role="alert" className="alert alert-info mt-8 bg-blue-500/10 border-blue-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-info shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">This is a Conditional Pledge!</h3>
              <div className="text-xs">
                Your pledge will only be transferred to the NGO if and when their reputation meets your minimum
                requirement.
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="modal-action flex flex-col-reverse sm:flex-row gap-2 mt-6">
            <button
              className="btn btn-ghost"
              onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.close()}
            >
              Cancel
            </button>
            <button
              className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90"
              onClick={handlePledge}
              disabled={isApproving || isPledging || !connectedAddress || !ethPrice || isLoadingContractInfo}
            >
              {isApproving ? "Approving WETH..." : isPledging ? "Pledging..." : "Confirm Pledge (2 steps)"}
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
