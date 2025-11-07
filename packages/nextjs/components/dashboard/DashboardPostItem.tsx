// /packages/nextjs/components/dashboard/DashboardPostItem.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// /packages/nextjs/components/dashboard/DashboardPostItem.tsx

// Tipagem dos Metadados (do IPFS)
interface PostMetadata {
  postTitle: string;
  imageDescription: string;
  imageUrl: string;
}

// Função para converter 'ipfs://' para 'http://'
const ipfsToHttpGateway = (ipfsUrl: string, gateway = "https://ipfs.io/ipfs/") => {
  if (!ipfsUrl || !ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl;
  }
  return ipfsUrl.replace("ipfs://", gateway);
};

/**
 * Este é um componente "mini-card" que busca seus próprios dados.
 * Ele é usado na lista de posts do Dashboard.
 */
export const DashboardPostItem = ({ postId }: { postId: number }) => {
  const [metadata, setMetadata] = useState<PostMetadata | null>(null);

  // 1. Busca os dados ON-CHAIN (Título, Likes, etc.)
  const { data: onChainPostData, isLoading: isLoadingOnChain } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPostDetails",
    args: [BigInt(postId)],
  });

  // 2. Busca os dados OFF-CHAIN (Metadados do IPFS)
  useEffect(() => {
    if (onChainPostData && onChainPostData.contentUrl) {
      const httpUrl = ipfsToHttpGateway(onChainPostData.contentUrl);
      fetch(httpUrl)
        .then(res => res.json())
        .then(data => setMetadata(data))
        .catch(e => console.error("Falha ao buscar metadados do mini-card", e));
    }
  }, [onChainPostData]);

  // Enquanto carrega, mostra um placeholder
  if (isLoadingOnChain || !onChainPostData || !metadata) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg bg-base-200 animate-pulse">
        <div className="w-16 h-16 rounded bg-base-300"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded bg-base-300 w-3/4"></div>
          <div className="h-4 rounded bg-base-300 w-1/4"></div>
        </div>
      </div>
    );
  }

  // Dados carregados
  const { likeCount } = onChainPostData;
  const { postTitle, imageUrl } = metadata;
  const httpImageUrl = ipfsToHttpGateway(imageUrl);

  return (
    <article className="flex items-center gap-4 p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-colors">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={httpImageUrl}
        alt={postTitle}
        className="w-16 h-16 rounded-md object-cover flex-shrink-0"
        onError={e => {
          (e.currentTarget as HTMLImageElement).src = "https://placehold.co/100x100/FF0000/white?text=Erro";
        }}
      />
      <div className="flex-1 overflow-hidden">
        <h4 className="font-semibold text-base-content truncate">{postTitle}</h4>
        <p className="text-sm text-base-content/70">
          {BigInt(likeCount).toString()} {BigInt(likeCount) === 1n ? "Likes" : "Likes"}
        </p>
      </div>
    </article>
  );
};

//
