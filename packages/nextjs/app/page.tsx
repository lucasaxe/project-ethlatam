"use client";

// Imports de lógica
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import * as THREE from "three";
// --- Imports do Vanta (Novo Background) ---
import VantaNet from "vanta/dist/vanta.net.min.js";
import { useAccount } from "wagmi";

// -------------------------------------------

// --- DADOS E COMPONENTES DE PLACEHOLDER (para a Seção 2) ---

const post = {
  id: 1,
  ongName: "Save Lives NGO", // Traduzido
  ongDescription: "Rescuing street animals and caring for our local community.", // Traduzido
  ongTokens: 25,
  postTitle: "Food Basket Campaign", // Traduzido
  imageUrl: "https://placehold.co/1200x800/A98B7F/white?text=Social+Action+1", // Traduzido (placeholder)
  imageDescription:
    "Today was an incredible day! We delivered 200 food baskets to the Bairro Sol community. We thank all the donors who made this possible. Every donation turns into smiles!", // Traduzido
};

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

const HeartIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill={filled ? "currentColor" : "none"}
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: "2.5rem", height: "2.5rem" }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  </svg>
);

// -------------------------------------------------

// --- Definição dos Estilos (Layout Principal) ---

// Container PAI com o gradiente
const pageContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  backgroundImage: "linear-gradient(to right, #3b82f6, #14b8a6, #84cc16)",
};

const vantaBackgroundStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 0,
};

// Container de Scroll
const scrollContainerStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  height: "100vh",
  overflowY: "scroll",
  scrollSnapType: "y mandatory",
  scrollBehavior: "smooth",
};

// Estilo BASE para todas as seções
const sectionStyle: React.CSSProperties = {
  height: "100vh",
  width: "100%",
  scrollSnapAlign: "start",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

// Estilo para as SEÇÕES 1 e 3 (Hero e CTA)
const heroSectionStyle: React.CSSProperties = {
  ...sectionStyle,
  color: "#ffffff",
};

// Estilo para a SEÇÃO 2 (Conteúdo)
const contentSectionStyle: React.CSSProperties = {
  ...sectionStyle,
  backgroundColor: "#ffffff", // Fundo branco
  color: "#1a1a1a", // Cor de texto padrão (preto)
};

// --- Estilos dos Componentes (Títulos, Botões CTA) ---

const heroTitleStyle: React.CSSProperties = {
  fontSize: "4.5rem",
  fontWeight: "bold",
  letterSpacing: "-0.05em",
  marginBottom: "1rem",
  color: "#ffffff",
};

const scrollIndicatorStyle: React.CSSProperties = {
  fontSize: "1rem",
  color: "#f0f0f0",
  marginTop: "4rem",
  animation: "bounce 2s infinite",
};

// Estilos da SEÇÃO 3 (CTA)
const ctaTitleStyle: React.CSSProperties = {
  ...heroTitleStyle, // Reutiliza o estilo base
  fontSize: "3rem",
  marginBottom: "1.5rem",
  textAlign: "center",
  color: "#ffffff",
};

const ctaSubtitleStyle: React.CSSProperties = {
  fontSize: "1.25rem",
  color: "#f0f0f0",
  marginBottom: "3rem",
  maxWidth: "500px",
  textAlign: "center",
  padding: "0 1rem",
};

const buttonContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  gap: "1.5rem",
};

// --- ESTILOS DOS BOTÕES CTA ---

// Estilo Base
const baseCtaButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  minWidth: "12rem",
  padding: "1rem 2rem",
  fontSize: "1.25rem",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease",
};

// Botão USER (Branco)
const whiteButtonStyle: React.CSSProperties = {
  ...baseCtaButtonStyle,
  backgroundColor: "#ffffffff",
  color: "#1a1a1a", // Texto preto
};

// Hover do Botão USER
const whiteButtonHoverStyle: React.CSSProperties = {
  transform: "scale(1.05)",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#3b82f6", // Fundo azul
  color: "#ffffffff", // Texto branco
};

// Botão NGO (Preto)
const blackButtonStyle: React.CSSProperties = {
  ...baseCtaButtonStyle,
  backgroundColor: "#1a1a1a", // Fundo preto
  color: "#ffffff", // Texto branco
};

// Hover do Botão NGO
const blackButtonHoverStyle: React.CSSProperties = {
  transform: "scale(1.05)",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#f0f0f0", // Fundo cinza claro
  color: "#14b8a6", // Texto teal
};

// -------------------------------------------------

const LandingPage: NextPage = () => {
  // Lógica de Conexão
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const router = useRouter();

  // Lógica do Vanta.js
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current && VantaNet) {
      const effect = VantaNet({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x000000,
        backgroundAlpha: 0.0,
      });
      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  // Lógica de Hover (separada)
  const [isUserCtaHover, setIsUserCtaHover] = useState(false);
  const [isNgoCtaHover, setIsNgoCtaHover] = useState(false);
  const [liked, setLiked] = useState(false); // Para a Seção 2
  const [likeCount, setLikeCount] = useState(12);
  const [isLiking, setisLiking] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // Atualiza a contagem com base no estado 'liked'
      if (liked) {
        setLikeCount(prevCount => prevCount + 1);
      } else {
        setLikeCount(prevCount => prevCount - 1);
      }
    }
  }, [liked]);

  const handleLike = () => {
    if (isLiking) return;
    setisLiking(true);

    // Apenas alterna o estado 'liked'
    setLiked(prevLiked => !prevLiked);

    // Desativa o debounce após a animação
    setTimeout(() => {
      setisLiking(false);
    }, 300);
  };

  useEffect(() => {
    if (isConnected && redirectPath) {
      router.push(redirectPath);
    }
  }, [isConnected, redirectPath, router]);

  const handleConnect = (path: string) => {
    if (isConnected) {
      router.push(path);
    } else {
      setRedirectPath(path);
      if (openConnectModal) {
        openConnectModal();
      }
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      {/* --- ESTRUTURA JSX ATUALIZADA --- */}
      <div style={pageContainerStyle}>
        {/* 1. O Background Vanta (Fixo atrás) */}
        <div ref={vantaRef} style={vantaBackgroundStyle}></div>

        {/* 2. O Container de Scroll (na frente) */}
        <div style={scrollContainerStyle}>
          {/* SEÇÃO 1: Hero */}
          <section style={heroSectionStyle}>
            <h1 style={heroTitleStyle}>make it happen</h1>
            <div style={scrollIndicatorStyle}>Scroll Down ↓</div>
          </section>

          {/* SEÇÃO 2: Seu componente JSX (com classes Tailwind) */}
          <section style={contentSectionStyle}>
            <div className="flex items-center justify-center w-full py-16">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-7xl mx-auto px-6 items-center">
                {/* Coluna 1: Informações da ONG e Ações (na esquerda) */}
                <div className="md:col-span-1 flex flex-col justify-center md:order-1 order-2">
                  <h3 className="text-2xl font-semibold text-lime-600 mb-2">[NGO Title]</h3>
                  <h2 className="text-3xl font-bold mb-10 text-blue-600">{post.ongName}</h2>

                  <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <TokenIcon className="w-7 h-7 text-blue-500" />
                      <span className="text-lg font-medium text-gray-700">Reputação:</span>
                      <span className="text-2xl font-bold">{post.ongTokens}</span>
                    </div>
                  </div>

                  <h1 className="text-1xl font-semibold mb-1 text-lime-600">[NGO description]</h1>
                  <p className="text-base text-gray-700 mb-8">{post.ongDescription}</p>

                  <div className="flex justify-center w-full">
                    <button className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90">
                      Doar para ONG
                    </button>
                  </div>
                </div>

                {/* Coluna 2: Imagem Principal (no centro) */}
                <div className="md:col-span-3 md:order-2 order-1">
                  <img
                    src={post.imageUrl}
                    alt={post.imageDescription}
                    width={1200} // Baseado na sua URL placeholder
                    height={800} // Baseado na sua URL placeholder
                    className="w-full aspect-video object-cover rounded-2xl shadow-xl bg-base-300"
                  />
                </div>

                {/* Coluna 3: Descrição da Imagem (na direita) */}
                <div className="md:col-span-1 md:order-3 order-3 flex flex-col justify-start self-start">
                  <h4 className="text-2xl font-semibold text-lime-600 mb-2">[Post Title]</h4>
                  <h3 className="text-2xl font-semibold mb-8 text-purple-600">{post.postTitle}</h3>
                  <h2 className="text-1xl font-semibold mb-0 text-lime-600">[Post Description]</h2>
                  <p className="text-gray-700 italic">{post.imageDescription}</p>

                  {/* Botão CURTIR (Ícone) maior */}
                  {/* Botão CURTIR e Contagem */}
                  <div className="mt-4 flex items-center gap-2">
                    {" "}
                    {/* Envolve com flex */}
                    <button
                      className="btn btn-ghost btn-circle btn-lg"
                      onClick={handleLike}
                      aria-label="Like"
                      disabled={isLiking}
                    >
                      <HeartIcon filled={liked} className={liked ? "text-lime-500" : "text-gray-400"} />
                    </button>{" "}
                    {/* A nova contagem */}
                    <span className="text-xl font-bold text-gray-700">{likeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 3: Call to Action + Botões ATUALIZADOS */}
          <section style={heroSectionStyle}>
            <h2 style={ctaTitleStyle}>Ready to make a difference?</h2> {/* Traduzido */}
            <p style={ctaSubtitleStyle}>
              Whether you are a donor wanting to ensure your help arrives, or an NGO seeking transparency.{" "}
              {/* Traduzido */}
            </p>
            <div style={buttonContainerStyle}>
              <button
                style={{
                  ...whiteButtonStyle,
                  ...(isUserCtaHover ? whiteButtonHoverStyle : {}),
                }}
                onMouseEnter={() => setIsUserCtaHover(true)}
                onMouseLeave={() => setIsUserCtaHover(false)}
                onClick={() => handleConnect("/home")}
              >
                USER
              </button>
              <button
                // Botão NGO (Preto)
                style={{
                  ...blackButtonStyle,
                  ...(isNgoCtaHover ? blackButtonHoverStyle : {}),
                }}
                onMouseEnter={() => setIsNgoCtaHover(true)}
                onMouseLeave={() => setIsNgoCtaHover(false)}
                onClick={() => handleConnect("/dashboard/ong")}
              >
                NGO
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
