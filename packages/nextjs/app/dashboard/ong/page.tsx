// /packages/nextjs/app/dashboard/ong/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import CreatePostForm from "../../../components/dashboard/CreatePostForm";
import { DashboardPostItem } from "../../../components/dashboard/DashboardPostItem";
import EditOngForm from "../../../components/dashboard/EditOngForm";
import Modal from "../../../components/dashboard/Modal";
import { EditOngInput, OngData } from "../../lib/types";
import styles from "./Dashboard.module.css";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// /packages/nextjs/app/dashboard/ong/page.tsx

// /packages/nextjs/app/dashboard/ong/page.tsx

// /packages/nextjs/app/dashboard/ong/page.tsx

// /packages/nextjs/app/dashboard/ong/page.tsx

// /packages/nextjs/app/dashboard/ong/page.tsx

// /packages/nextjs/app/dashboard/ong/page.tsx

// /packages/nextjs/app/dashboard/ong/page.tsx

// /packages/nextjs/app/dashboard/ong/page.tsx

// /packages/nextjs/app/dashboard/ong/page.tsx

// /packages/nextjs/app/dashboard/ong/page.tsx

export default function OngDashboardPage() {
  const [modalOpen, setModalOpen] = useState<"edit-ong" | "create-post" | null>(null);
  const [ongData, setOngData] = useState<OngData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justRegistered, setJustRegistered] = useState(false);

  const { address, isConnected } = useAccount();

  const queryClient = useQueryClient();

  // Chaves de Query
  const ongQueryKey = ["scaffoldRead", "YourContract", "ngos", { args: [address] }];
  const postCountQueryKey = ["scaffoldRead", "YourContract", "getPostCount"];
  const ngoPostIdsKey = ["scaffoldRead", "YourContract", "getNgoPostIds", { args: [address] }];

  // --- Hooks do Contrato ---
  const { data: onChainOngData, isLoading: isLoadingOng } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "ngos",
    args: [address],
    // --- CORREÇÃO TS2353: 'enabled' movido para dentro de 'query' ---
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Busca a LISTA de IDs de posts que esta ONG criou
  const { data: ngoPostIds } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getNgoPostIds",
    args: [address],
    // --- CORREÇÃO TS2353: 'enabled' movido para dentro de 'query' ---
    query: {
      enabled: isConnected && !!address,
    },
  });

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

  // Atualiza o estado da ONG (componente) quando os dados on-chain carregarem
  useEffect(() => {
    // onChainOngData[3] é 'isRegistered'
    if (onChainOngData && onChainOngData[3]) {
      setOngData({
        id: address || "",
        name: onChainOngData[0],
        objective: "", // Adicionado valor padrão
        contactEmail: "",
        website: "",
        cnpj: "",
        reputationTokens: Number(onChainOngData[2]),
        totalRaisedETH: 0.0,
      });
      setIsLoading(false);

      if (justRegistered) {
        setModalOpen("edit-ong");
        setJustRegistered(false);
      }
    } else if (isConnected && address && !isLoadingOng) {
      setIsLoading(false);
    }
  }, [onChainOngData, address, isConnected, isLoadingOng, justRegistered]);

  /**
   * Chamado para registrar a ONG
   */
  const handleRegister = async () => {
    if (!address || isRegistering) return;

    const toastId = toast.loading("Confirmando registro na MetaMask...");
    try {
      const defaultName = `ONG ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      await registerNGO({
        functionName: "registerNGO",
        args: [defaultName],
      });

      toast.success("ONG registrada! Bem-vindo.", { id: toastId });

      queryClient.invalidateQueries({ queryKey: ongQueryKey });

      setJustRegistered(true);
    } catch (error: any) {
      console.error("Erro ao registrar ONG:", error);
      if (error.message.includes("rejected")) {
        toast.error("Transação rejeitada.", { id: toastId });
      } else {
        toast.error("Falha ao registrar ONG.", { id: toastId });
      }
    }
  };

  /**
   * Chamado ao salvar o formulário de "Editar Dados da ONG"
   */
  const handleUpdateOng = async (formData: EditOngInput) => {
    if (isUpdatingName) return;

    const toastId = toast.loading("Preparando transação...");
    try {
      if (formData.name && formData.name !== ongData?.name) {
        toast.loading("Atualizando nome na blockchain...", { id: toastId });
        await updateNGOName({
          functionName: "updateNGOName",
          args: [formData.name],
        });
        toast.success("Nome da ONG atualizado!", { id: toastId });

        queryClient.invalidateQueries({ queryKey: ongQueryKey });
      } else {
        toast.success("Dados atualizados (simulado).", { id: toastId });
      }

      setModalOpen(null);
    } catch (error: any) {
      console.error("Erro ao atualizar nome da ONG:", error);
      if (error.message.includes("rejected")) {
        toast.error("Transação rejeitada.", { id: toastId });
      } else {
        toast.error("Falha ao atualizar nome.", { id: toastId });
      }
    }
  };

  /**
   * Chamado ao criar um novo post
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

    const toastId = toast.loading("Iniciando criação do post...");

    try {
      let finalImageUrl = imageUrl;
      const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;

      if (!pinataJwt) {
        throw new Error("Chave JWT do Pinata não configurada no .env.local");
      }

      // 1. Upload da Imagem
      if (imageFile) {
        toast.loading("1/3 - Fazendo upload da imagem...", { id: toastId });
        const formData = new FormData();
        formData.append("file", imageFile);

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: { Authorization: `Bearer ${pinataJwt}` },
          body: formData,
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Falha no upload da imagem");
        finalImageUrl = `ipfs://${resData.IpfsHash}`;
      }

      if (!finalImageUrl) {
        throw new Error("Nenhuma imagem fornecida (link ou arquivo).");
      }

      // 2. Upload dos Metadados (JSON)
      toast.loading("2/3 - Fazendo upload dos metadados...", { id: toastId });
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
      if (!res.ok) throw new Error(resData.error || "Falha no upload dos metadados");

      const contentUrl = `ipfs://${resData.IpfsHash}`;

      // 4. Chamada do Contrato
      toast.loading("3/3 - Aguardando confirmação da MetaMask...", { id: toastId });

      await createPost({
        functionName: "createPost",
        args: [contentUrl],
      });

      toast.success("Post criado com sucesso!", { id: toastId });
      setModalOpen(null);

      queryClient.invalidateQueries({ queryKey: postCountQueryKey });
      queryClient.invalidateQueries({ queryKey: ngoPostIdsKey });
    } catch (error: any) {
      console.error("Erro ao criar postagem:", error);
      if (error.message.includes("rejected")) {
        toast.error("Transação rejeitada.", { id: toastId });
      } else {
        toast.error(error.message || "Erro desconhecido", { id: toastId });
      }
    }
  };

  // --- Renderização ---
  if (!isConnected) {
    return <div className={styles.error}>Conecte sua carteira de ONG para acessar o Dashboard.</div>;
  }
  if (isLoading || isLoadingOng) {
    return <div className={styles.loading}>Carregando dados da ONG...</div>;
  }
  if (!address) {
    return (
      <div className={styles.error}>Não foi possível carregar os dados. Verifique sua conexão e tente novamente.</div>
    );
  }

  // --- LÓGICA DE ONBOARDING ---
  if (!onChainOngData?.[3]) {
    // onChainOngData[3] é 'isRegistered'
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <div className="card w-full max-w-lg bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <SparklesIcon className="h-16 w-16 text-primary" />
            <h2 className="card-title text-3xl">Bem-vindo(a) à Plataforma!</h2>
            <p className="text-base-content/80 mt-4">
              Sua carteira ({address}) ainda não está registrada como uma ONG.
            </p>
            <p className="text-base-content/80">Clique abaixo para se registrar na blockchain e começar a postar.</p>
            <div className="card-actions mt-6">
              <button onClick={handleRegister} className="btn btn-primary btn-lg" disabled={isRegistering}>
                {isRegistering ? <span className="loading loading-spinner"></span> : "Registrar-se como ONG"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ongData) {
    return <div className={styles.loading}>Carregando dados da ONG...</div>;
  }

  // --- RENDERIZAÇÃO DO DASHBOARD NORMAL ---
  const postIdsToShow = ngoPostIds ? ngoPostIds.map(id => Number(id)).reverse() : [];

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.header}>
        <h1>Dashboard: {ongData.name}</h1>
        <div className={styles.actions}>
          <button onClick={() => setModalOpen("create-post")} className={styles.buttonPrimary}>
            Criar Postagem
          </button>
          <button onClick={() => setModalOpen("edit-ong")} className={styles.buttonSecondary}>
            Alterar Dados
          </button>
        </div>
      </header>

      <section className={styles.section}>
        <h2>Informações da Organização</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <strong>Tokens de Reputação</strong>
            <div className={styles.tokenDisplay}>
              <span>{ongData.reputationTokens.toLocaleString("pt-BR")}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/good-reputation-token.jpg" alt="Token de Reputação" className={styles.tokenIcon} />
            </div>
          </div>
          <div className={styles.metricBox}>
            <strong>Total Arrecadado (ETH)</strong>
            <span>{ongData.totalRaisedETH.toFixed(4)} ETH</span>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoBox}>
            <strong>Carteira:</strong>
            <span>{address}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Suas Postagens</h2>
        <div className="flex flex-col gap-4 mt-4">
          {postIdsToShow.length === 0 ? (
            <p className="text-base-content/70">Você ainda não criou nenhuma postagem.</p>
          ) : (
            postIdsToShow.map(id => <DashboardPostItem key={id} postId={id} />)
          )}
        </div>
      </section>

      <Modal
        isOpen={modalOpen !== null}
        onClose={() => setModalOpen(null)}
        title={modalOpen === "edit-ong" ? "Alterar Dados da ONG" : "Criar Nova Postagem"}
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

//
