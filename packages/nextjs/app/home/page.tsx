// /packages/nextjs/app/home/page.tsx
import React from "react";
// --- Imports e Tipagem ---
// Importa o componente cliente e a tipagem
import PostList, { Post } from "../../components/PostList";
import type { NextPage } from "next";

// --- Função Assíncrona para Buscar Dados ---
// No App Router, funções assíncronas são Server Components
async function getMockPosts(): Promise<Post[]> {
  // O Next.js usa o caminho raiz para buscar arquivos na pasta public/
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/posts-data.json`, {
    cache: "no-store", // Simula uma API que sempre retorna dados novos
  });

  if (!res.ok) {
    // Se a busca falhar, lança um erro para o Next.js exibir o erro
    console.error("Falha ao buscar dados dos posts. Status:", res.status);
    throw new Error("Falha ao buscar dados dos posts.");
  }

  return res.json();
}

// --- Página Principal (Home) ---
// Note que a função é "async"
const HomePage: NextPage = async () => {
  let posts: Post[] = [];
  try {
    posts = await getMockPosts();
  } catch (error) {
    // CORREÇÃO: Variável 'e' trocada por 'error'
    // Em caso de falha na busca (por exemplo, arquivo não encontrado), use um array vazio ou mostre uma mensagem de erro
    console.error(error);
    // Você pode retornar um componente de erro aqui:
    return (
      <div className="flex items-center justify-center min-h-screen text-center">
        {/* CORREÇÃO DE ASPAS */}
        <p className="text-xl text-red-600">
          Erro ao carregar posts. Verifique se &apos;posts-data.json&apos; está na pasta public/ e se o servidor está
          rodando.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Passa os posts buscados para o componente cliente */}
      <PostList posts={posts} />
    </div>
  );
};

export default HomePage;
