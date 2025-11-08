"use client";

// Imports de lógica
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import * as THREE from "three";
import VantaGlobe from "vanta/dist/vanta.globe.min.js";
import VantaNet from "vanta/dist/vanta.net.min.js";
// --- Imports do Vanta (Novo Background) ---
import VantaTopology from "vanta/dist/vanta.topology.min.js";
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

const aboutUsSectionStyle: React.CSSProperties = {
  ...contentSectionStyle,
  position: "relative",
  justifyContent: "space-around",
  paddingTop: "rem",
  paddingLeft: "4rem",
  paddingRight: "rem",
  alignItems: "flex-start",
};

const aboutUsTextStyle: React.CSSProperties = {
  marginTop: "5rem",
  maxWidth: "1000px",
  textAlign: "justify",
  color: "#374151", // Cinza escuro
  fontSize: "1.25rem",
};

const herobelowtitleStyle: React.CSSProperties = {
  fontSize: "1.15rem",
  fontWeight: "semibold",
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
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  padding: "0.5rem 1.5rem",
  borderRadius: "12px",
  marginBottom: "3rem",
  maxWidth: "500px",
  textAlign: "center",
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

  const [vantaGlobeEffect, setVantaGlobeEffect] = useState<any>(null);
  const vantaGlobeRef = useRef(null);
  const [vantaHeroEffect, setVantaHeroEffect] = useState<any>(null);
  const vantaHeroRef = useRef(null);
  const [vantaCtaEffect, setVantaCtaEffect] = useState<any>(null);
  const vantaCtaRef = useRef(null);

  useEffect(() => {
    if (!vantaGlobeEffect && vantaGlobeRef.current && VantaGlobe) {
      const effect = VantaGlobe({
        el: vantaGlobeRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        // --- CÓDIGO ATUALIZADO (CORES DO GLOBO) ---
        color: 0x84cc16, // Cor corrigida (verde-limão)
        color2: 0x3b82f6, // Cor corrigida (azul)
        backgroundColor: 0x0, // Pode manter 0x0

        // --- ADICIONE ESTA LINHA ---
        backgroundAlpha: 0.0,
        // --- FIM DA ADIÇÃO ---
        size: 1.2,
      });
      setVantaGlobeEffect(effect);
    }
    return () => {
      if (vantaGlobeEffect) vantaGlobeEffect.destroy();
    };
  }, [vantaGlobeEffect]);

  useEffect(() => {
    if (!vantaHeroEffect && vantaHeroRef.current && VantaTopology) {
      const effect = VantaTopology({
        el: vantaHeroRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x14b8a6,
        backgroundColor: 0x0,
      });
      setVantaHeroEffect(effect);
    }
    return () => {
      if (vantaHeroEffect) vantaHeroEffect.destroy();
    };
  }, [vantaHeroEffect]);

  useEffect(() => {
    if (!vantaCtaEffect && vantaCtaRef.current && VantaTopology) {
      const effect = VantaTopology({
        el: vantaCtaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x84cc16,
        backgroundColor: 0x0,
      });
      setVantaCtaEffect(effect);
    }
    return () => {
      if (vantaCtaEffect) vantaCtaEffect.destroy();
    };
  }, [vantaCtaEffect]);

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
        @keyframes shine {
          0%,
          100% {
            box-shadow: 0 0 20px 5px rgba(255, 255, 0, 0.7);
          }
          50% {
            box-shadow: 0 0 30px 10px rgba(255, 255, 0, 0.9);
          }
        }
        @keyframes moveCloud {
          from {
            transform: translateX(-200px);
          }
          to {
            transform: translateX(100vw);
          }
        }
        .animated-bg-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: linear-gradient(to bottom, #87ceeb 0%, #f0f8ff 60%, #2e8b57 60%, #3cb371 100%);
          z-index: 0;
        }
        .sun {
          position: absolute;
          top: 5%;
          left: 10%;
          width: 80px;
          height: 80px;
          background-color: #ffeb3b;
          border-radius: 50%;
          animation: shine 5s infinite linear;
        }
        .cloud {
          position: absolute;
          background: white;
          border-radius: 50px;
          opacity: 0.9;
          animation-name: moveCloud;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .cloud.one {
          top: 15%;
          left: 0;
          width: 120px;
          height: 40px;
          animation-duration: 70s;
          animation-delay: -10s;
        }
        .cloud.two {
          top: 25%;
          left: 0;
          width: 150px;
          height: 50px;
          animation-duration: 90s;
          animation-delay: -35s;
        }
        .cloud.three {
          top: 20%;
          left: 0;
          width: 100px;
          height: 30px;
          animation-duration: 120s;
          animation-delay: -60s;
        }
        .ciranda-circle {
          position: absolute;
          bottom: 5%;
          left: 50%;
          width: 280px;
          height: 280px;
          transform: translateX(-50%);
        }
        .person {
          position: absolute;
          top: calc(50% - 40px);
          left: calc(50% - 11px);
        }
        .person .head {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(to bottom, #3b82f6, #14b8a6);
          position: relative;
          z-index: 2;
        }
        .person .body {
          width: 22px;
          height: 35px;
          border-radius: 10px 10px 0 0;
          background: linear-gradient(to bottom, #14b8a6, #84cc16);
          position: relative;
          top: -2px;
          z-index: 1;
        }
        .arm,
        .leg {
          position: absolute;
          left: 50%;
          width: 8px;
          height: 28px;
          background: linear-gradient(to bottom, #14b8a6, #84cc16);
          transform-origin: center 4px;
        }
        .arm {
          top: 2px;
        }
        .leg {
          top: 30px;
          background: linear-gradient(to bottom, #84cc16, #a3e635);
        }
        .arm.left {
          transform: translateX(-50%) rotate(40deg);
        }
        .arm.right {
          transform: translateX(-50%) rotate(-40deg);
        }
        .leg.left {
          transform: translateX(-50%) rotate(-20deg);
        }
        .leg.right {
          transform: translateX(-50%) rotate(20deg);
        }
        .person:nth-child(1) {
          transform: rotate(0deg) translateY(-120px) rotate(0deg);
        }
        .person:nth-child(2) {
          transform: rotate(60deg) translateY(-120px) rotate(-60deg);
        }
        .person:nth-child(3) {
          transform: rotate(120deg) translateY(-120px) rotate(-120deg);
        }
        .person:nth-child(4) {
          transform: rotate(180deg) translateY(-120px) rotate(-180deg);
        }
        .person:nth-child(5) {
          transform: rotate(240deg) translateY(-120px) rotate(-240deg);
        }
        .person:nth-child(6) {
          transform: rotate(300deg) translateY(-120px) rotate(-300deg);
        }
        .gradient-text {
          background: linear-gradient(to right, #3b82f6, #14b8a6, #84cc16);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
      `}</style>

      {/* --- ESTRUTURA JSX ATUALIZADA --- */}
      <div style={pageContainerStyle}>
        {/* 1. O Background Vanta (Fixo atrás) */}
        <div ref={vantaRef} style={vantaBackgroundStyle}></div>

        {/* 2. O Container de Scroll (na frente) */}
        <div style={scrollContainerStyle}>
          {/* SEÇÃO 1: Hero */}
          <section style={{ ...heroSectionStyle, position: "relative" }}>
            <div
              ref={vantaHeroRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
              }}
            ></div>
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h2 style={heroTitleStyle}>make it happen</h2>
              <h1 style={herobelowtitleStyle}>transparency, visibility and action.</h1>
              <div style={scrollIndicatorStyle}>Scroll Down ↓</div>
            </div>
          </section>

          {/* SEÇÃO About Us */}
          <section style={aboutUsSectionStyle}>
            <div
              ref={vantaGlobeRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
              }}
            ></div>
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <img src="/MIH_logo.png" alt="Make It Happen Logo" style={{ height: "180px", width: "auto" }} />
              <div style={aboutUsTextStyle}>
                <p className="gradient-text">
                  We created Make It Happen to solve the crisis of trust in charity. Our platform is a decentralized
                  social dApp where you can scroll through real-time photo and video updates from NGOs, just like a
                  social media feed. We use cryptocurrency for donations, which means every transaction is recorded on
                  the blockchain, allowing you to trace your money and see exactly where it goes, while giving you
                  privacy as a anonymous donor. This radical transparency is designed to rebuild trust between donors
                  and organizations and make sure your goodwill turns into real, verifiable action.
                </p>
              </div>
            </div>
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
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <span className="text-lg font-medium text-gray-700">Reputation:</span>
                        <span className="text-2xl font-bold ml-2">{post.ongTokens}</span>
                      </div>
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src="/good-reputation-token.jpg"
                          alt="Reputation Token"
                          className="w-full h-full object-cover"
                          style={{ transform: "scale(1.2)" }}
                        />
                      </div>
                    </div>
                  </div>

                  <h1 className="text-1xl font-semibold mb-1 text-lime-600">[NGO description]</h1>
                  <p className="text-base text-gray-700 mb-8">{post.ongDescription}</p>

                  <div className="flex justify-center w-full">
                    <button className="btn btn-lg text-white font-bold bg-gradient-to-r from-blue-500 via-teal-500 to-lime-500 border-none hover:opacity-90">
                      Donate to NGO
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
                    <span className="text-xl font-bold text-black">{likeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 3: Call to Action + Botões ATUALIZADOS */}
          <section style={heroSectionStyle}>
            <h2 style={ctaTitleStyle}>Ready to make the difference?</h2> {/* Traduzido */}
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
                // --- ALTERAÇÃO AQUI ---
                onClick={() => handleConnect("/feed")}
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
                // --- ALTERAÇÃO AQUI ---
                onClick={() => handleConnect("/dashboard/ngo")}
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
