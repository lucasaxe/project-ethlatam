"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { erc20Abi, parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
// <-- Define 'useAccount' e 'useWriteContract'
import { waitForTransactionReceipt } from "wagmi/actions";
// <-- Define 'wagmiConfig'
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
// <-- Define 'waitForTransactionReceipt'
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

// --- ENDEREÇO DO WETH NA BASE SEPOLIA ---
// !! IMPORTANTE !! Verifique este endereço.
// Este é o endereço comum para WETH em testnets L2, mas confirme no block explorer.
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

  // --- NOVO ESTADO PARA O PENHOR (PLEDGE) ---
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

  // --- NOVOS HOOKS DE ESCRITA PARA O FLUXO DE PENHOR ---

  // 1. Hook para APROVAR (no contrato WETH)
  // Usamos o hook genérico do Wagmi, pois WETH é um contrato externo
  const { writeContractAsync: approveWeth } = useWriteContract();

  // 2. Hook para PENHORAR (no YourContract)
  const { writeContractAsync: pledgeDonation, isPending: isPledging } = useScaffoldWriteContract({
    contractName: "YourContract",
  });
  // --- FIM DOS NOVOS HOOKS ---

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

  const handlePledge = async () => {
    const amountUsd = parseFloat(donationAmount);
    const minReputationBigInt = BigInt(minReputation || "0");

    // Validação (sem alteração)
    if (isApproving || isPledging) return;
    if (!amountUsd || amountUsd <= 0) {
      toast.error("Por favor, insira um valor válido em USD.");
      return;
    }
    if (minReputationBigInt <= 0) {
      toast.error("Reputação mínima deve ser maior que 0.");
      return;
    }
    if (ethPrice === 0) {
      toast.error("Não foi possível buscar o preço do WETH. Tente novamente.");
      return;
    }
    if (!yourContractAddress) {
      toast.error("Endereço do contrato principal não encontrado.");
      return;
    }

    const toastId = toast.loading("Calculando valor do penhor...");
    try {
      // --- LÓGICA DE CONVERSÃO (SEM ALTERAÇÃO) ---
      const amountEth = amountUsd / ethPrice;
      const valueInWei = parseEther(amountEth.toString());

      // --- FLUXO DE 2 ETAPAS: APPROVE -> PLEDGE ---

      // Define o estado de 'approving' para desabilitar o botão
      setIsApproving(true);

      // ETAPA 1: APROVAR (Approve)
      toast.loading("Por favor, aprove o gasto do WETH na sua carteira...", { id: toastId });

      const approveTxHash = await approveWeth({
        address: WETH_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [yourContractAddress as `0x${string}`, valueInWei],
      });

      // ETAPA 1.5: AGUARDAR A MINERAÇÃO (A NOVA LÓGICA)
      toast.loading("Aguardando confirmação da aprovação...", { id: toastId });

      await waitForTransactionReceipt(wagmiConfig, {
        hash: approveTxHash,
        confirmations: 1, // Espera pelo menos 1 bloco
      });

      // Libera o estado de 'approving'
      setIsApproving(false);

      // ETAPA 2: PENHORAR (Pledge)
      // Esta etapa só roda DEPOIS que a Etapa 1.5 foi concluída.
      toast.loading("Registrando seu penhor (pledge)...", { id: toastId });

      await pledgeDonation({
        functionName: "pledgeDonation",
        args: [
          BigInt(postId), // _postId
          WETH_ADDRESS, // _token
          valueInWei, // _amount
          minReputationBigInt, // _minReputationTokens
        ],
      });

      toast.success("Penhor registrado com sucesso! A doação ocorrerá quando a ONG atingir a meta.", { id: toastId });

      queryClient.invalidateQueries({ queryKey: postDetailsQueryKey });
      (document.getElementById(modalId) as HTMLDialogElement)?.close();
    } catch (e: any) {
      // Limpa o estado em caso de erro
      setIsApproving(false);

      console.error("Erro ao registrar o penhor:", e);
      // O 'pledgeDonation' (Scaffold-ETH) vai tratar o erro "Verifique a permissao..."
      if (e.message.includes("rejected")) {
        toast.error("Transação rejeitada.", { id: toastId });
      } else if (e.message.includes("Verifique a permissao")) {
        // Isso não deveria mais acontecer, mas é bom ter
        toast.error("Falha na permissão do token.", { id: toastId });
      } else {
        toast.error("Falha ao registrar penhor.", { id: toastId });
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

  // --- CÁLCULO DE VALOR EM WETH (PARA O MODAL) ---
  let donationInEth = 0;
  if (ethPrice > 0) {
    donationInEth = parseFloat(donationAmount || "0") / ethPrice;
  }

  return (
    <section key={postId} className="flex items-center justify-center w-full py-16 border-b border-base-300">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-7xl mx-auto px-6 items-center">
        {/* Coluna 1: Informações da ONG e Botão DONATE */}
        <div className="md:col-span-1 flex flex-col justify-center md:order-1 order-2 items-center">
          {/* ... (Conteúdo da Coluna 1: Nome da ONG, Reputação, Descrição - Sem alteração) ... */}
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
              DONATE TO NGO
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
          {/* ... (Conteúdo da Coluna 3: Título, Descrição, Botão Like - Sem alteração) ... */}
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

      {/* --- MODAL DE DOAÇÃO ATUALIZADO --- */}
      <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-base-content">Fazer um Penhor (Pledge) para:</h3>
          <p className="py-2 text-lime-600 font-semibold">{postTitle}</p>

          {/* CAMPO DE VALOR (USD) */}
          <div className="form-control w-full mt-4">
            <label className="label" htmlFor={`usd-amount-${postId}`}>
              <span className="label-text">Valor da Doação (USD)</span>
            </label>
            <div className="join">
              <span className="btn join-item no-animation pointer-events-none">$</span>
              <input
                id={`usd-amount-${postId}`}
                type="number"
                value={donationAmount}
                onChange={e => setDonationAmount(e.target.value)}
                className="input input-bordered w-full join-item"
                placeholder="Ex: 5.00"
              />
              <span className="btn join-item no-animation pointer-events-none">USD</span>
            </div>
            <label className="label">
              <span className="label-text-alt text-blue-600">Equivalente a: ~{donationInEth.toFixed(6)} WETH</span>
            </label>
          </div>

          {/* --- NOVO CAMPO: REPUTAÇÃO MÍNIMA --- */}
          <div className="form-control w-full mt-4">
            <label className="label" htmlFor={`min-reputation-${postId}`}>
              <span className="label-text">Reputação Mínima Exigida</span>
              <span className="label-text-alt">Reputação Atual: {Number(ngoReputation)}</span>
            </label>
            <input
              id={`min-reputation-${postId}`}
              type="number"
              value={minReputation}
              onChange={e => setMinReputation(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ex: 100"
            />
            <label className="label">
              <span className="label-text-alt text-base-content/70">
                A doação (em WETH) só será executada quando a ONG atingir este valor.
              </span>
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="modal-action flex flex-col-reverse sm:flex-row gap-2">
            <button
              className="btn btn-ghost"
              onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.close()}
            >
              Cancelar
            </button>
            <button
              className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90"
              onClick={handlePledge} // <-- CHAMA A NOVA FUNÇÃO
              disabled={isApproving || isPledging || !connectedAddress || !ethPrice || isLoadingContractInfo}
            >
              {isApproving ? "Aprovando WETH..." : isPledging ? "Registrando Penhor..." : "Confirmar Penhor (2 etapas)"}
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
