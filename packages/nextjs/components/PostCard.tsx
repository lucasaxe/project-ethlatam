// /packages/nextjs/components/PostCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
// <--- ADICIONADO PELA MUDANÇA VISUAL
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

// --- Ícones SVG (Mantidos) ---
const HeartIcon = ({ filled, ...props }: { filled: boolean; [key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

// --- Ícone do Token (REMOVIDO) ---
// const TokenIcon = ... (Este SVG foi removido pois será substituído pelo next/image)

/**
 * @dev Converte uma URL 'ipfs://' para uma URL HTTP (usando 'ipfs.io' que funcionou no Chrome)
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

  const [donationAmount, setDonationAmount] = useState("1000"); // Valor figurativo

  const modalId = `donate-modal-${postId}`;

  // Chaves de query para invalidar o cache
  const postDetailsQueryKey = ["scaffoldRead", "YourContract", "getPostDetails", { args: [BigInt(postId)] }];
  const hasLikedQueryKey = ["scaffoldRead", "YourContract", "hasLiked", { args: [BigInt(postId), connectedAddress] }];

  // 1. Busca os dados ON-CHAIN
  const { data: onChainPostData, isLoading: isLoadingOnChain } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPostDetails",
    args: [BigInt(postId)],
  });

  // 2. Busca se o usuário JÁ CURTIU
  const { data: userHasLiked } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "hasLiked",
    args: [BigInt(postId), connectedAddress],
    query: {
      enabled: !!connectedAddress,
    },
  });

  // 3. Prepara a função de 'like'
  const { writeContractAsync: likePost, isPending: isLiking } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  // Hook de ESCRITA PARA DOAÇÃO
  const { writeContractAsync: donateToPost, isPending: isDonating } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  // Hook para buscar os metadados OFF-CHAIN (IPFS/JSON)
  useEffect(() => {
    if (onChainPostData && onChainPostData.contentUrl) {
      const httpUrl = ipfsToHttpGateway(onChainPostData.contentUrl);

      setIsLoadingMetadata(true);
      fetch(httpUrl)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Falha na rede ao buscar: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          setMetadata(data);
        })
        .catch(e => {
          console.error("Falha ao buscar metadados do IPFS", e);
        })
        .finally(() => setIsLoadingMetadata(false));
    }
  }, [onChainPostData]);

  /**
   * @dev Chamado pelo botão de LIKE
   */
  const handleLike = async () => {
    if (isLiking) return;
    try {
      await likePost({
        functionName: "likePost",
        args: [BigInt(postId)],
      });
      // ATUALIZAÇÃO AUTOMÁTICA
      queryClient.invalidateQueries({ queryKey: postDetailsQueryKey });
      queryClient.invalidateQueries({ queryKey: hasLikedQueryKey });
    } catch (e) {
      console.error("Erro ao tentar curtir o post:", e);
      toast.error("Erro ao curtir o post.");
    }
  };

  /**
   * @dev Chamado pelo botão "Confirmar" DENTRO DO MODAL
   */
  const handleDonate = async () => {
    if (isDonating || !donationAmount || BigInt(donationAmount) <= 0) {
      toast.error("Por favor, insira um valor válido em Wei (maior que zero).");
      return;
    }

    const toastId = toast.loading("Confirmando doação na MetaMask...");
    try {
      const valueInWei = BigInt(donationAmount);

      await donateToPost({
        functionName: "donateToPost",
        args: [BigInt(postId)],
        value: valueInWei, // Envia o Wei com a transação
      });

      toast.success("Doação enviada com sucesso!", { id: toastId });

      // ATUALIZAÇÃO AUTOMÁTICA
      queryClient.invalidateQueries({ queryKey: postDetailsQueryKey });

      (document.getElementById(modalId) as HTMLDialogElement)?.close();
    } catch (e: any) {
      console.error("Erro ao tentar doar:", e);
      if (e.message.includes("rejected")) {
        toast.error("Doação rejeitada.", { id: toastId });
      } else {
        toast.error("Falha ao doar.", { id: toastId });
      }
    }
  };

  // --- Renderização ---

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
        {/* Coluna 1: Informações da ONG e Botão DOAR */}
        <div className="md:col-span-1 flex flex-col justify-center md:order-1 order-2 items-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-4">
            <h2 className="text-3xl font-bold text-blue-600 w-full text-center">{ngoName}</h2>
          </div>

          {/* --- AQUI ESTÁ A MUDANÇA VISUAL DO SEU AMIGO --- */}
          <div className="flex items-center gap-2 w-full justify-start mb-4">
            {/* TEXTO PRIMEIRO */}
            <span className="text-lg font-medium text-base-content/80">Reputação:</span>
            <span className="text-2xl font-bold">{Number(ngoReputation)}</span>

            {/* IMAGEM DEPOIS (do next/image) */}
            <Image
              src="/good-reputation-token.jpg" // Nome da imagem na pasta 'public'
              alt="Ícone de Reputação"
              width={38}
              height={38}
              className="rounded-full"
            />
          </div>
          {/* --- FIM DA MUDANÇA VISUAL --- */}

          <p className="text-base text-base-content/70 mb-8 w-full text-left">
            {imageDescription.substring(0, 100)}...
          </p>

          <div className="flex justify-center w-full">
            <button
              className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90 w-full"
              onClick={() => (document.getElementById(modalId) as HTMLDialogElement)?.showModal()}
              disabled={!connectedAddress}
            >
              DOAR PARA O POST
            </button>
          </div>
        </div>

        {/* Coluna 2: Imagem Principal (Puxada dos metadados) */}
        <div className="md:col-span-3 md:order-2 order-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={httpImageUrl}
            alt={imageDescription}
            className="w-full aspect-video object-cover rounded-2xl shadow-xl bg-base-300"
            onError={e => {
              (e.currentTarget as HTMLImageElement).src =
                "https://placehold.co/1200x800/FF0000/white?text=Erro+ao+Carregar+Imagem";
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
              aria-label="Curtir"
              disabled={isLiking || !connectedAddress || userHasLiked}
            >
              <HeartIcon
                filled={!!userHasLiked}
                className={!!userHasLiked ? "text-lime-500" : "text-base-content/70"}
              />
            </button>
            <span className="text-lg font-semibold text-base-content/80">{BigInt(likeCount).toString()}</span>
            {isLiking && <span className="loading loading-spinner loading-xs"></span>}
          </div>
        </div>
      </div>

      {/* --- O MODAL (POP-UP) DE DOAÇÃO --- */}
      <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-base-content">Fazer uma Doação para:</h3>
          <p className="py-2 text-lime-600 font-semibold">{postTitle}</p>

          {/* Input para Wei */}
          <div className="form-control w-full mt-4">
            <label className="label" htmlFor={`wei-amount-${postId}`}>
              <span className="label-text">Valor (em Wei)</span>
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
              onClick={handleDonate}
              disabled={isDonating || !connectedAddress}
            >
              {isDonating ? <span className="loading loading-spinner"></span> : "Confirmar Doação"}
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

//
