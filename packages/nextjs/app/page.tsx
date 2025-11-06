"use client";

// Precisa ser um Client Component para usar hooks
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

const LandingPage: NextPage = () => {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const router = useRouter();

  // Este hook observa a intenção de redirecionamento e o status da conexão
  useEffect(() => {
    // Se o usuário se conectou com sucesso E existe um caminho de redirecionamento salvo
    if (isConnected && redirectPath) {
      router.push(redirectPath);
    }
  }, [isConnected, redirectPath, router]);

  const handleConnect = (path: string) => {
    // Se o usuário já estiver conectado, apenas navega
    if (isConnected) {
      router.push(path);
    } else {
      // Se não, salva o caminho e abre o modal de conexão
      setRedirectPath(path);
      if (openConnectModal) {
        openConnectModal();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      {/* Título Centralizado */}
      <h1 className="text-5xl font-bold mb-12">DonationChains</h1>

      {/* Botões lado a lado */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <button className="btn btn-primary btn-lg min-w-48" onClick={() => handleConnect("/home")}>
          Usuário
        </button>
        <button className="btn btn-secondary btn-lg min-w-48" onClick={() => handleConnect("/ong")}>
          ONG
        </button>
      </div>

      {/* Descrição Centralizada */}
      <p className="text-xl text-base-content/80">Conectando doadores a quem realmente faz a diferença</p>
    </div>
  );
};

export default LandingPage;
