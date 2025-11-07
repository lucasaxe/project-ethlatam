"use client";

import React, { useState } from "react";
import type { NextPage } from "next";

// --- Ícones SVG ---

// Ícone de coração para o botão "CURTIR"
const HeartIcon = ({ filled, ...props }: { filled: boolean; [key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"} // Preenchimento controlado pelo estado
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

// Ícone do Token a partir da imagem anexada
const TokenIcon = (props: { [key: string]: any }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"></circle>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"></circle>
      <path
        d="M14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10C13.1046 10 14 9.10457 14 8ZM14 8V16C14 17.1046 13.1046 18 12 18C10.8954 18 10 17.1046 10 16V8ZM14 8ZM10 16C10 17.1046 10.8954 18 12 18C13.1046 18 14 17.1046 14 16C14 14.8954 13.1046 14 12 14C10.8954 14 10 14.8954 10 16ZM14 8ZM10 16ZM12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </g>
  </svg>
);

// --- Dados Mocado ---
const mockPosts = [
  {
    id: 1,
    ongName: "ONG Salve Vidas",
    ongDescription: "Resgatando animais de rua e cuidando da nossa comunidade local.",
    ongTokens: 25,
    likes: 128,
    postTitle: "Campanha de Cestas Básicas",
    imageUrl: "https://placehold.co/1200x800/A98B7F/white?text=Ação+Social+1",
    imageDescription:
      "Hoje foi um dia incrível! Entregamos 200 cestas básicas para a comunidade do Bairro Sol. Agradecemos a todos os doadores que tornaram isso possível. Cada doação se transforma em sorrisos!",
  },
  {
    id: 2,
    ongName: "Instituto Mar Limpo",
    ongDescription: "Limpando nossas praias e protegendo a vida marinha.",
    ongTokens: 42,
    likes: 432,
    postTitle: "Mutirão na Praia Central",
    imageUrl: "https://placehold.co/1200x800/7F96A9/white?text=Mutirão+de+Limpeza",
    imageDescription:
      "Mais de 50 voluntários se juntaram a nós neste fim de semana para o mutirão de limpeza na Praia Central. Retiramos 150kg de lixo plástico do oceano. Junte-se a nós na próxima!",
  },
  {
    id: 3,
    ongName: "EducaAção Brasil",
    ongDescription: "Levando educação e tecnologia para crianças carentes.",
    ongTokens: 99,
    likes: 89,
    postTitle: "Nova Sala de Informática",
    imageUrl: "https://placehold.co/1200x800/8B7FA9/white?text=Inauguração+da+Sala+de+Info",
    imageDescription:
      "Inauguramos nossa primeira sala de informática! 30 computadores novinhos para os alunos da Escola Municipal Aprender. O futuro começa aqui. Obrigado a todos os parceiros.",
  },
];

// --- Componente PostCard ---
const PostCard = ({ post }: { post: (typeof mockPosts)[0] }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? post.likes : post.likes + 1);
  };

  return (
    <section className="flex items-center justify-center w-full py-16 border-b border-base-300">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-7xl mx-auto px-6 items-center">
        {/* Coluna 1: Informações da ONG e Ações (na esquerda) */}
        {/* O container 'items-center' centraliza o bloco do título, o da descrição e o do botão */}
        <div className="md:col-span-1 flex flex-col justify-center md:order-1 order-2 items-center">
          {/* *** TÍTULO CENTRALIZADO *** */}
          {/* Este bloco de título está centralizado pelo 'items-center' do pai E 'w-full text-center' */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-4">
            <h2 className="text-3xl font-bold text-blue-600 w-full text-center">{post.ongName}</h2>
          </div>

          {/* *** TOKENS SEPARADOS E ALINHADOS À ESQUERDA *** */}
          {/* Este 'w-full' e 'justify-start' alinha os tokens à esquerda da coluna */}
          {/* *** 'items-center' alinha verticalmente o ícone, texto e número *** */}
          <div className="flex items-center gap-2 w-full justify-start mb-4">
            <TokenIcon className="w-7 h-7 text-blue-500" />
            <span className="text-lg font-medium text-base-content/80">Reputação:</span>
            <span className="text-2xl font-bold">{post.ongTokens}</span>
          </div>

          <p className="text-base text-base-content/70 mb-8 w-full text-left">{post.ongDescription}</p>

          {/* Este bloco de botão está centralizado pelo 'justify-center' */}
          <div className="flex justify-center w-full">
            <button className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90">
              DOAR PARA ONG
            </button>
          </div>
        </div>

        {/* Coluna 2: Imagem Principal (no centro) */}
        <div className="md:col-span-3 md:order-2 order-1">
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

          {/* Botão CURTIR com contador */}
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

// --- Página Principal (Home) ---
const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col w-full">
      {mockPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default HomePage;
