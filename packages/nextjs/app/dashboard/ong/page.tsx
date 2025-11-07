// app/dashboard/ong/page.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
// Importações de componentes (Ajuste o caminho se necessário)
import CreatePostForm from "../../../components/dashboard/CreatePostForm";
import EditOngForm from "../../../components/dashboard/EditOngForm";
import Modal from "../../../components/dashboard/Modal";
import { EditOngInput, OngData, PostData } from "../../lib/types";
// Importando seus tipos
import styles from "./Dashboard.module.css";
// --- NOVO IMPORT WAGMI ---
import { useAccount } from "wagmi";

// app/dashboard/ong/page.tsx

// app/dashboard/ong/page.tsx

// app/dashboard/ong/page.tsx

// app/dashboard/ong/page.tsx

// app/dashboard/ong/page.tsx

// app/dashboard/ong/page.tsx

// app/dashboard/ong/page.tsx

// app/dashboard/ong/page.tsx

// app/dashboard/ong/page.tsx

// app/dashboard/ong/page.tsx

// --- DADOS MOCKADOS/DEFAULT PARA POSTS ---
const MOCK_POSTS_DATA: PostData[] = [
  {
    id: "post-1",
    title: "Campanha do Agasalho 2025",
    content:
      "Coletamos 500 casacos! Este é um texto um pouco mais longo para preencher espaço e ver como o card se comporta com mais conteúdo.",
    createdAt: "2025-10-30T10:00:00Z",
    imageUrl: "/images/post-placeholder.jpg",
    likes: 128,
  },
];
// --- FIM DOS DADOS MOCKADOS ---

export default function OngDashboardPage() {
  const [modalOpen, setModalOpen] = useState<"edit-ong" | "create-post" | null>(null);
  const [ongData, setOngData] = useState<OngData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // OBTENDO O ENDEREÇO DA CARTEIRA
  const { address, isConnected } = useAccount();

  // Função para buscar DADOS DA ONG E POSTS
  const fetchDashboardData = useCallback(async (currentAddress: string) => {
    setIsLoading(true);
    try {
      // 1. BUSCA DADOS DA ONG PERSISTENTES USANDO O ENDEREÇO
      const ongResponse = await fetch(`/api/ong-info?address=${currentAddress}`);
      if (!ongResponse.ok) throw new Error("Falha ao buscar dados da ONG");
      const ongApiData: OngData = await ongResponse.json();

      // 2. BUSCA POSTS DA ONG
      const postsResponse = await fetch("/posts-data.json");
      // CORREÇÃO TS: Tipar como 'any[]' para o TypeScript não bloquear o 'filter'
      const postsApiData: any[] = await postsResponse.json();

      setOngData(ongApiData);

      // CORREÇÃO TS: Filtrar e Mapear os dados
      // O JSON salvo tem 'ongName', 'postTitle' e 'imageDescription'
      // O componente espera 'id', 'title' e 'content'
      const filteredAndMappedPosts = postsApiData
        .filter(p => p.ongName === ongApiData.name) // Filtra pelo 'ongName' real
        .map(p => ({
          // Mapeia para o tipo 'PostData' que o componente espera
          id: String(p.id),
          title: p.postTitle, // De 'postTitle' para 'title'
          content: p.imageDescription, // De 'imageDescription' para 'content'
          createdAt: p.createdAt,
          imageUrl: p.imageUrl,
          likes: p.likes,
        }));

      setPosts(filteredAndMappedPosts);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      // Em caso de falha, tenta carregar um default para não travar
      setOngData(
        prev =>
          prev || {
            id: currentAddress,
            name: "ONG Padrão Não Registrada",
            objective: "Conecte a carteira para personalizar seu perfil.",
            contactEmail: "",
            website: "",
            cnpj: "",
            reputationTokens: 0,
            totalRaisedETH: 0.0,
          },
      );
      setPosts(MOCK_POSTS_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependência vazia, pois 'address' é passado como argumento no useEffect

  useEffect(() => {
    if (isConnected && address) {
      fetchDashboardData(address); // Passa o address como argumento
    } else {
      setIsLoading(false);
      setOngData(null);
      setPosts([]); // Limpa os posts ao desconectar
    }
  }, [isConnected, address, fetchDashboardData]); // Depende apenas de address e isConnected

  // --- PONTO DE CONEXÃO BACKEND (2) - Update ONG (Persistência) ---
  const handleUpdateOng = async (formData: EditOngInput) => {
    if (!ongData || !address) return;
    setIsLoading(true);

    try {
      // 1. CHAMA A NOVA ROTA PUT para salvar os dados no profiles.json
      const response = await fetch(`/api/ong-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Envia o endereço no corpo para o servidor saber qual perfil atualizar
        body: JSON.stringify({ ...formData, address }),
      });
      if (!response.ok) throw new Error("Falha ao atualizar ONG");

      const updatedOng: OngData = await response.json();
      setOngData(updatedOng); // Atualiza o estado com os dados salvos

      setModalOpen(null);
    } catch (error) {
      console.error("Erro ao atualizar ONG:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PONTO DE CONEXÃO BACKEND (3) - CRIAÇÃO DE POST ---
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
    setIsLoading(true);

    try {
      // Cria o FormData para enviar os dados
      const formData = new FormData();
      formData.append("postTitle", title);
      formData.append("imageDescription", content);

      // Dados da ONG (Puxados do estado salvo)
      formData.append("ongName", ongData.name);
      formData.append("ongDescription", ongData.objective);
      formData.append("ongTokens", String(ongData.reputationTokens));

      // Arquivo ou Link
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao criar postagem");
      }

      const newPost: PostData = await response.json();
      setPosts([newPost, ...posts]);

      setModalOpen(null);
    } catch (error) {
      console.error("Erro ao criar postagem:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderização ---
  if (!isConnected) {
    return <div className={styles.error}>Conecte sua carteira de ONG para acessar o Dashboard.</div>;
  }
  if (isLoading) {
    return <div className={styles.loading}>Carregando dados da ONG...</div>;
  }
  if (!ongData || !address) {
    return (
      <div className={styles.error}>Não foi possível carregar os dados. Verifique sua conexão e tente novamente.</div>
    );
  }

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

      {/* --- Seção de Informações --- */}
      <section className={styles.section}>
        <h2>Informações da Organização</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <strong>Tokens de Reputação</strong>
            <div className={styles.tokenDisplay}>
              <span>{ongData.reputationTokens.toLocaleString("pt-BR")}</span>
              {/* CORREÇÃO DO PATH DA IMAGEM */}
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
          <div className={styles.infoBox}>
            <strong>Email:</strong>
            <span>{ongData.contactEmail}</span>
          </div>
          <div className={styles.infoBox}>
            <strong>Website:</strong>
            <span>{ongData.website || "Não informado"}</span>
          </div>
          <div className={styles.infoBox}>
            <strong>CNPJ:</strong>
            <span>{ongData.cnpj}</span>
          </div>
          <div className={`${styles.infoBox} ${styles.fullSpan}`}>
            <strong>Objetivo:</strong>
            <p>{ongData.objective}</p>
          </div>
        </div>
      </section>

      {/* --- Seção de Postagens --- */}
      <section className={styles.section}>
        <h2>Postagens Recentes</h2>
        <div className={styles.postList}>
          {posts.length === 0 ? (
            <p>Nenhuma postagem criada ainda.</p>
          ) : (
            posts.map(post => (
              <article key={post.id} className={styles.postItem}>
                {post.imageUrl && (
                  // CORREÇÃO DO WARNING DE IMAGEM
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageUrl} alt={post.title} className={styles.postImage} />
                )}

                <div className={styles.postContent}>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>

                  <div className={styles.postFooter}>
                    <span>Publicado em: {new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className={styles.postLikes}>♥ {post.likes.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* --- MODAL --- */}
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

// <-- CORREÇÃO PRETTIER: Linha em branco
