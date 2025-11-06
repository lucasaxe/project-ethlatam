// app/dashboard/ong/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import CreatePostForm from "../../../components/dashboard/CreatePostForm";
import EditOngForm from "../../../components/dashboard/EditOngForm";
// --- Imports usando o caminho relativo (../) ---
import Modal from "../../../components/dashboard/Modal";
// Corrigido para apontar para 'app/lib/types'
import { EditOngInput, OngData, PostData } from "../../lib/types";
import styles from "./Dashboard.module.css";

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

// -------------------------------------------------

// --- DADOS MOCKADOS ATUALIZADOS ---
const MOCK_ONG_DATA: OngData = {
  id: "ong-123-abc",
  name: "Minha ONG Fantástica",
  objective: "Nosso objetivo é conectar doadores a projetos incríveis na América Latina.",
  contactEmail: "contato@ongfantastica.org",
  website: "https.ongfantastica.org",
  cnpj: "12.345.678/0001-99",
  reputationTokens: 1500,
  totalRaisedETH: 4.75,
};

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
  {
    id: "post-2",
    title: "Voluntários para Causa Animal",
    content: "Precisamos de ajuda no próximo fim de semana.",
    createdAt: "2025-10-28T15:30:00Z",
    likes: 74,
  },
];
// --- FIM DOS DADOS MOCKADOS ---

export default function OngDashboardPage() {
  const [modalOpen, setModalOpen] = useState<"edit-ong" | "create-post" | null>(null);
  const [ongData, setOngData] = useState<OngData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- PONTO DE CONEXÃO BACKEND (1) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // ---- INÍCIO DA REQUISIÇÃO REAL (Substituir o mock) ----
        /*
        const ongResponse = await fetch('/api/ong/me');
        if (!ongResponse.ok) throw new Error('Falha ao buscar dados da ONG');
        const ongApiData: OngData = await ongResponse.json();

        const postsResponse = await fetch('/api/ong/me/posts');
        if (!postsResponse.ok) throw new Error('Falha ao buscar posts');
        const postsApiData: PostData[] = await postsResponse.json();

        setOngData(ongApiData);
        setPosts(postsApiData);
        */
        // ---- FIM DA REQUISIÇÃO REAL ----

        // ---- Início do Mock (Remover em produção) ----
        await new Promise(resolve => setTimeout(resolve, 800));
        setOngData(MOCK_ONG_DATA);
        setPosts(MOCK_POSTS_DATA);
        // ---- Fim do Mock ----
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- PONTO DE CONEXÃO BACKEND (2) ---
  const handleUpdateOng = async (formData: EditOngInput) => {
    console.log("Enviando atualização da ONG:", formData);

    // --- ESTA É A CORREÇÃO ---
    // Garante que ongData não é nulo.
    if (!ongData) return;
    // --- FIM DA CORREÇÃO ---

    try {
      // ---- INÍCIO DA REQUISIÇÃO REAL (Substituir o mock) ----
      /*
      const response = await fetch(`/api/ong/${ongData.id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Falha ao atualizar ONG');
      const updatedOng: OngData = await response.json();
      setOngData(updatedOng);
      */
      // ---- FIM DA REQUISIÇÃO REAL ----

      // ---- Início do Mock (Remover em produção) ----
      await new Promise(resolve => setTimeout(resolve, 600));
      const updatedOng: OngData = {
        ...ongData, // Agora o TypeScript sabe que ongData não é nulo
        ...formData,
      };
      setOngData(updatedOng);
      // ---- FIM DO MOCK ----

      setModalOpen(null);
      console.log("ONG atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar ONG:", error);
    }
  };

  // --- PONTO DE CONEXÃO BACKEND (3) - ATUALIZADO PARA FILE UPLOAD ---
  const handleCreatePost = async ({
    title,
    content,
    imageFile,
  }: {
    title: string;
    content: string;
    imageFile: File | null;
  }) => {
    console.log("Enviando nova postagem com imagem...");

    try {
      // ---- INÍCIO DA REQUISIÇÃO REAL (MUITO IMPORTANTE) ----
      /*
      // Para enviar arquivos, usamos 'FormData'.
      // O backend deve aceitar 'multipart/form-data'.
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      
      if (imageFile) {
        formData.append('image', imageFile); // 'image' é o nome do campo no backend
      }
      
      const response = await fetch('/api/posts', { // <-- Substituir URL
        method: 'POST',
        body: formData, // Envia o FormData (NÃO use headers 'Content-Type')
      });

      if (!response.ok) throw new Error('Falha ao criar postagem');

      const newPost: PostData = await response.json();
      setPosts([newPost, ...posts]);
      */
      // ---- FIM DA REQUISIÇÃO REAL ----

      // ---- Início do Mock (Remover em produção) ----
      await new Promise(resolve => setTimeout(resolve, 600));
      const newPost: PostData = {
        id: `post-${Math.random()}`,
        title,
        content,
        createdAt: new Date().toISOString(),
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
        likes: 0, // Novo post começa com 0 curtidas
      };
      setPosts([newPost, ...posts]);
      // ---- Fim do Mock ----

      setModalOpen(null);
      console.log("Postagem criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar postagem:", error);
    }
  };

  // --- Renderização ---
  if (isLoading) {
    return <div className={styles.loading}>Carregando dados da ONG...</div>;
  }
  if (!ongData) {
    return <div className={styles.error}>Não foi possível carregar os dados.</div>;
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
              <img src="/images/good-reputation-token.jpg" alt="Token de Reputação" className={styles.tokenIcon} />
            </div>
          </div>
          <div className={styles.metricBox}>
            <strong>Total Arrecadado (ETH)</strong>
            <span>{ongData.totalRaisedETH.toFixed(4)} ETH</span>
          </div>
        </div>

        <div className={styles.infoGrid}>
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
                {post.imageUrl && <img src={post.imageUrl} alt={post.title} className={styles.postImage} />}

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
        {modalOpen === "edit-ong" && (
          <EditOngForm currentData={ongData} onSave={handleUpdateOng} onCancel={() => setModalOpen(null)} />
        )}
        {modalOpen === "create-post" && (
          <CreatePostForm onCreate={handleCreatePost} onCancel={() => setModalOpen(null)} />
        )}
      </Modal>
    </div>
  );
}
