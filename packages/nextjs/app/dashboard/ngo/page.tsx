// /packages/nextjs/app/dashboard/ngo/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import CreatePostForm from "../../../components/dashboard/CreatePostForm";
import { DashboardPostItem } from "../../../components/dashboard/DashboardPostItem";
import EditOngForm from "../../../components/dashboard/EditOngForm";
import Modal from "../../../components/dashboard/Modal";
import { EditOngInput, OngData } from "../../lib/types";
// Importação de estilos (deve estar idêntica ao seu arquivo original)
import styles from "./Dashboard.module.css";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// /packages/nextjs/app/dashboard/ngo/page.tsx

// A importação do useNativeCurrencyPrice foi removida

export default function OngDashboardPage() {
  const [modalOpen, setModalOpen] = useState<"edit-ong" | "create-post" | null>(null);
  const [ongData, setOngData] = useState<OngData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justRegistered, setJustRegistered] = useState(false);

  // --- NOVO ESTADO PARA O PREÇO DO ETH ---
  const [ethPrice, setEthPrice] = useState(0);

  const { address, isConnected } = useAccount();

  const queryClient = useQueryClient();

  // Query Keys (Chaves de Query)
  const ngoQueryKey = ["scaffoldRead", "YourContract", "ngos", { args: [address] }];
  const postCountQueryKey = ["scaffoldRead", "YourContract", "getPostCount"];
  const ngoPostIdsKey = ["scaffoldRead", "YourContract", "getNgoPostIds", { args: [address] }];

  // --- Contract Hooks (Hooks do Contrato) ---
  const { data: onChainOngData, isLoading: isLoadingOng } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "ngos",
    args: [address],
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { data: ngoPostIds } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getNgoPostIds",
    args: [address],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // --- useEffect ATUALIZADO (Busca na API local) ---
  useEffect(() => {
    // Busca o preço do ETH da nossa própria API (que chama o CoinGecko no servidor)
    fetch("/api/eth-price") // <-- MUDANÇA AQUI
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
  }, []); // Roda apenas uma vez

  // Hooks de Escrita
  const { writeContractAsync: createPost, isPending: isCreatingPost } = useScaffoldWriteContract({
    contractName: "YourContract",
  });
  const { writeContractAsync: registerNGO, isPending: isRegistering } = useScaffoldWriteContract({
    contractName: "YourContract",
  });
  const { writeContractAsync: updateNGOName, isPending: isUpdatingName } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  // Updates the NGO state (component) when on-chain data loads (Atualiza o estado da ONG (componente) quando os dados on-chain carregarem)
  useEffect(() => {
    if (onChainOngData && onChainOngData[3]) {
      const totalEth = formatEther(onChainOngData[4]);
      const totalUsd = parseFloat(totalEth) * (ethPrice || 0);

      setOngData({
        id: address || "",
        name: onChainOngData[0],
        objective: "",
        contactEmail: "",
        website: "",
        cnpj: "",
        reputationTokens: Number(onChainOngData[2]),
        totalRaisedETH: totalUsd,
      });
      setIsLoading(false);

      if (justRegistered) {
        setModalOpen("edit-ong");
        setJustRegistered(false);
      }
    } else if (isConnected && address && !isLoadingOng) {
      setIsLoading(false);
    }
  }, [onChainOngData, address, isConnected, isLoadingOng, justRegistered, ethPrice]);

  /**
   * Called to register the NGO (Chamado para registrar a ONG)
   */
  const handleRegister = async () => {
    if (!address || isRegistering) return;

    const toastId = toast.loading("Confirming registration in MetaMask...");
    try {
      const defaultName = `NGO ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      await registerNGO({
        functionName: "registerNGO",
        args: [defaultName],
      });

      toast.success("NGO registered! Welcome.", { id: toastId });

      queryClient.invalidateQueries({ queryKey: ngoQueryKey });

      setJustRegistered(true);
    } catch (error: any) {
      console.error("Error registering NGO:", error);
      if (error.message.includes("rejected")) {
        toast.error("Transaction rejected.", { id: toastId });
      } else {
        toast.error("Failed to register NGO.", { id: toastId });
      }
    }
  };

  /**
   * Called when saving the "Edit NGO Information" form (Chamado ao salvar o formulário de "Editar Dados da ONG")
   */
  const handleUpdateOng = async (formData: EditOngInput) => {
    if (isUpdatingName) return;

    const toastId = toast.loading("Preparing transaction...");
    try {
      if (formData.name && formData.name !== ongData?.name) {
        toast.loading("Updating name on the blockchain...", { id: toastId });
        await updateNGOName({
          functionName: "updateNGOName",
          args: [formData.name],
        });
        toast.success("NGO name updated!", { id: toastId });

        queryClient.invalidateQueries({ queryKey: ngoQueryKey });
      } else {
        toast.success("Information updated (simulated).", { id: toastId });
      }

      setModalOpen(null);
    } catch (error: any) {
      console.error("Error updating NGO name:", error);
      if (error.message.includes("rejected")) {
        toast.error("Transaction rejected.", { id: toastId });
      } else {
        toast.error("Failed to update name.", { id: toastId });
      }
    }
  };

  /**
   * Called when creating a new post (Chamado ao criar um novo post)
   */
  const handleCreatePost = async ({
    title,
    content,
    imageFile,
    imageUrl,
  }: {
    title: string;
    content: string;
    imageFile: File | null;
    imageUrl: string | null;
  }) => {
    if (!ongData) return;
    if (isCreatingPost) return;

    const toastId = toast.loading("Starting post creation...");

    try {
      let finalImageUrl = imageUrl;
      const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;

      if (!pinataJwt) {
        throw new Error("Pinata JWT key not configured in .env.local");
      }

      // 1. Image Upload (Upload da Imagem)
      if (imageFile) {
        toast.loading("1/3 - Uploading image...", { id: toastId });
        const formData = new FormData();
        formData.append("file", imageFile);

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: { Authorization: `Bearer ${pinataJwt}` },
          body: formData,
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Image upload failed");
        finalImageUrl = `ipfs://${resData.IpfsHash}`;
      }

      if (!finalImageUrl) {
        throw new Error("No image provided (link or file).");
      }

      // 2. Metadata (JSON) Upload (Upload dos Metadados (JSON))
      toast.loading("2/3 - Uploading metadata...", { id: toastId });
      const postMetadata = {
        postTitle: title,
        imageDescription: content,
        imageUrl: finalImageUrl,
        ongName: ongData.name,
      };

      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postMetadata),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Metadata upload failed");

      const contentUrl = `ipfs://${resData.IpfsHash}`;

      // 4. Contract Call (Chamada do Contrato)
      toast.loading("3/3 - Awaiting MetaMask confirmation...", { id: toastId });

      await createPost({
        functionName: "createPost",
        args: [contentUrl],
      });

      toast.success("Post created successfully!", { id: toastId });
      setModalOpen(null);

      queryClient.invalidateQueries({ queryKey: postCountQueryKey });
      queryClient.invalidateQueries({ queryKey: ngoPostIdsKey });
    } catch (error: any) {
      console.error("Error creating post:", error);
      if (error.message.includes("rejected")) {
        toast.error("Transaction rejected.", { id: toastId });
      } else {
        toast.error(error.message || "Unknown error", { id: toastId });
      }
    }
  };

  // --- Rendering (Renderização) ---
  if (!isConnected) {
    return <div className={styles.error}>Connect your NGO wallet to access the Dashboard.</div>;
  }
  if (isLoading || isLoadingOng) {
    return <div className={styles.loading}>Loading NGO data...</div>;
  }
  if (!address) {
    return <div className={styles.error}>Could not load data. Check your connection and try again.</div>;
  }

  // --- ONBOARDING LOGIC (LÓGICA DE ONBOARDING) ---
  // [INÍCIO DA SEÇÃO MODIFICADA]
  if (!onChainOngData?.[3]) {
    // onChainOngData[3] is 'isRegistered'
    // Agora usa as classes do Dashboard.module.css
    return (
      <div className={styles.onboardingContainer}>
        <div className={styles.onboardingCard}>
          <div className={styles.onboardingBody}>
            <SparklesIcon className={styles.onboardingIcon} />
            <h2 className={styles.onboardingTitle}>Welcome to the Platform!</h2>
            <p className={styles.onboardingText}>
              Your wallet (<code>{address}</code>) is not yet registered as an NGO.
            </p>
            <p className={styles.onboardingText}>Click below to register on the blockchain and start posting.</p>
            <div className={styles.onboardingActions}>
              <button
                onClick={handleRegister}
                // Combina a classe .buttonPrimary (do CSS module) com .onboardingButton
                className={`${styles.buttonPrimary} ${styles.onboardingButton}`}
                disabled={isRegistering}
              >
                {isRegistering ? <span className={styles.loadingSpinner}></span> : "Register as NGO"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // [FIM DA SEÇÃO MODIFICADA]

  if (!ongData) {
    return <div className={styles.loading}>Loading NGO data...</div>;
  }

  // --- NORMAL DASHBOARD RENDERING (RENDERIZAÇÃO DO DASHBOARD NORMAL) ---
  const postIdsToShow = ngoPostIds ? ngoPostIds.map(id => Number(id)).reverse() : [];

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.header}>
        <h1>Dashboard: {ongData.name}</h1>
        <div className={styles.actions}>
          <button onClick={() => setModalOpen("create-post")} className={styles.buttonPrimary}>
            Create Post
          </button>
          <button onClick={() => setModalOpen("edit-ong")} className={styles.buttonSecondary}>
            Edit Information
          </button>
        </div>
      </header>

      <section className={styles.section}>
        <h2>Organization Information</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <strong>Reputation Tokens</strong>
            <div className={styles.tokenDisplay}>
              <span>{ongData.reputationTokens.toLocaleString("pt-BR")}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/good-reputation-token.jpg" alt="Reputation Token" className={styles.tokenIcon} />
            </div>
          </div>
          <div className={styles.metricBox}>
            <strong>Total Arrecadado (USD)</strong>
            <span>${ongData.totalRaisedETH.toFixed(2)} USD</span>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoBox}>
            <strong>Wallet:</strong>
            <span>{address}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Your Posts</h2>
        <div className="flex flex-col gap-4 mt-4">
          {postIdsToShow.length === 0 ? (
            <p className="text-base-content/70">Your wallet ({address}) isn&apos;t yet registered as an NGO.</p>
          ) : (
            postIdsToShow.map(id => <DashboardPostItem key={id} postId={id} />)
          )}
        </div>
      </section>

      <Modal
        isOpen={modalOpen !== null}
        onClose={() => setModalOpen(null)}
        title={modalOpen === "edit-ong" ? "Edit NGO Information" : "Create New Post"}
      >
        {modalOpen === "edit-ong" && ongData && (
          <EditOngForm currentData={ongData} onSave={handleUpdateOng} onCancel={() => setModalOpen(null)} />
        )}
        {modalOpen === "create-post" && (
          <CreatePostForm onCreate={handleCreatePost} onCancel={() => setModalOpen(null)} />
        )}
      </Modal>
    </div>
  );
}
