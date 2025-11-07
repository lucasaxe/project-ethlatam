// components/PostList.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// components/PostList.tsx

// --- Tipagem de Dados ---
export type Post = {
  id: number;
  ongName: string;
  ongDescription: string;
  ongTokens: number;
  likes: number;
  postTitle: string;
  imageUrl: string;
  imageDescription: string;
};

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

// --- Componente PostCard (Adaptado para usar o tipo Post) ---
const PostCard = ({ post }: { post: Post }) => {
  // O estado agora usa os valores iniciais do post
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(prev => !prev);
    setLikeCount(prev => (liked ? prev - 1 : prev + 1));
  };

  return (
    <section className="flex items-center justify-center w-full py-16 border-b border-base-300">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-7xl mx-auto px-6 items-center">
        {/* Coluna 1: Informações da ONG e Ações (na esquerda) */}
        <div className="md:col-span-1 flex flex-col justify-center md:order-1 order-2 items-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-4">
            <h2 className="text-3xl font-bold text-blue-600 w-full text-center">{post.ongName}</h2>
          </div>

          {/* --- AQUI ESTÁ A ORDEM CORRIGIDA --- */}
          <div className="flex items-center gap-2 w-full justify-start mb-4">
            {/* TEXTO PRIMEIRO */}
            <span className="text-lg font-medium text-base-content/80">Reputação:</span>
            <span className="text-2xl font-bold">{post.ongTokens}</span>

            {/* IMAGEM DEPOIS */}
            <Image
              src="/good-reputation-token.jpg" // Nome da imagem na pasta 'public'
              alt="Ícone de Reputação"
              width={38} // w-7 (7 * 4px = 28px)
              height={38} // h-7 (7 * 4px = 28px)
              className="rounded-full"
            />
          </div>

          <p className="text-base text-base-content/70 mb-8 w-full text-left">{post.ongDescription}</p>

          <div className="flex justify-center w-full">
            <button className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90">
              DOAR PARA ONG
            </button>
          </div>
        </div>

        {/* Coluna 2: Imagem Principal (no centro) */}
        <div className="md:col-span-3 md:order-2 order-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt={post.imageDescription}
            className="w-full aspect-video object-cover rounded-2xl shadow-xl bg-base-300"
            onError={e => {
              e.currentTarget.src = "https://placehold.co/1200x800/FF0000/white?text=Erro+ao+Carregar+Imagem";
            }}
          />
        </div>

        {/* Coluna 3: Descrição da Imagem (na direita) */}
        <div className="md:col-span-1 md:order-3 order-3 flex flex-col justify-start self-start">
          <h3 className="text-2xl font-semibold mb-3 text-lime-600">{post.postTitle}</h3>

          <p className="text-base-content/80 italic">{post.imageDescription}</p>

          <div className="mt-4 flex items-center gap-2">
            <button className="btn btn-ghost btn-circle btn-lg" onClick={handleLike} aria-label="Curtir">
              <HeartIcon filled={liked} className={liked ? "text-lime-500" : "text-base-content/70"} />
            </button>
            <span className="text-lg font-semibold text-base-content/80">{likeCount}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Componente de Listagem (Recebe os posts como props) ---
const PostList = ({ posts }: { posts: Post[] }) => {
  return (
    <div className="flex flex-col w-full">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;

// <-- CORREÇÃO PRETTIER: Linha em branco
