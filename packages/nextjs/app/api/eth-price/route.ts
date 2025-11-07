import { NextResponse } from "next/server";

// Esta função GET será chamada quando o frontend fizer fetch em /api/eth-price
export async function GET() {
  try {
    // 1. O Servidor (sem CORS) busca o preço no CoinGecko
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", {
      // Revalida o cache a cada 60 segundos
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar dados do CoinGecko");
    }

    const data = await response.json();

    if (!data.ethereum || !data.ethereum.usd) {
      throw new Error("Resposta inesperada do CoinGecko");
    }

    // 2. O Servidor envia o preço para o Frontend
    return NextResponse.json({ price: data.ethereum.usd });
  } catch (error) {
    console.error("[API /eth-price] Erro:", error);
    // Retorna um erro 500
    return new NextResponse(JSON.stringify({ error: "Erro interno ao buscar preço." }), { status: 500 });
  }
}
