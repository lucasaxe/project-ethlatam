// /packages/nextjs/app/api/ong-info/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Estrutura do perfil da ONG (todos os campos persistentes, exceto id)
interface OngProfile {
  name: string;
  objective: string;
  reputationTokens: number;
  totalRaisedETH: number;
  contactEmail: string;
  website?: string;
  cnpj: string;
}

interface OngProfileMap {
  [address: string]: OngProfile;
}

const profilesFilePath = path.join(process.cwd(), "public", "ong-profiles.json");

// Dados Padrão (Fallback) para novas carteiras
const DEFAULT_PROFILE: OngProfile = {
  name: "ONG Padrão Não Registrada",
  objective: "Esta é a descrição padrão para ONGs que ainda não personalizaram seus dados.",
  reputationTokens: 50, // Reputação baixa padrão
  totalRaisedETH: 0.0,
  contactEmail: "contato@padrao.org",
  cnpj: "00.000.000/0000-00",
  website: "",
};

/**
 * Funções utilitárias para ler/escrever o JSON
 */
async function readProfiles(): Promise<OngProfileMap> {
  try {
    const fileContent = await fs.readFile(profilesFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    // CORREÇÃO: Variável 'error' usada no console.error
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.warn("Arquivo de perfis não encontrado, criando novo objeto.");
    } else {
      console.error("Erro desconhecido ao ler perfis:", error);
    }
    return {};
  }
}

async function writeProfiles(profiles: OngProfileMap): Promise<void> {
  await fs.writeFile(profilesFilePath, JSON.stringify(profiles, null, 2));
}

/**
 * GET: Retorna os dados da ONG com base no endereço da carteira.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Endereço da carteira é obrigatório." }, { status: 400 });
  }

  try {
    const profiles = await readProfiles();

    // Se o endereço existir, retorna os dados, adicionando o ID (o próprio address)
    if (profiles[address]) {
      return NextResponse.json({ ...profiles[address], id: address });
    }

    // Senão, retorna o padrão, adicionando o ID (o próprio address)
    return NextResponse.json({ ...DEFAULT_PROFILE, id: address });
  } catch (error) {
    console.error("Erro ao buscar perfil da ONG:", error);
    // Em caso de erro de servidor, retorna o padrão
    return NextResponse.json({ ...DEFAULT_PROFILE, id: address }, { status: 500 });
  }
}

/**
 * PUT: Atualiza os dados de uma ONG.
 */
export async function PUT(request: NextRequest) {
  try {
    const updatedData = await request.json();
    // CORREÇÃO: O campo 'id' não é desestruturado se não for usado para evitar o erro.
    const { address, ...profileData } = updatedData;

    if (!address) {
      return NextResponse.json({ error: "Endereço da carteira é obrigatório." }, { status: 400 });
    }

    const profiles = await readProfiles();

    // Mantém dados existentes (como tokens e eth) e sobrescreve os campos editáveis
    profiles[address] = {
      ...(profiles[address] || DEFAULT_PROFILE),
      ...profileData,
    };

    await writeProfiles(profiles);

    // Retorna o objeto completo da ONG, incluindo o id (address)
    return NextResponse.json({ ...profiles[address], id: address });
  } catch (error) {
    console.error("Erro ao atualizar perfil da ONG:", error);
    return NextResponse.json({ error: "Erro interno do servidor ao salvar dados da ONG." }, { status: 500 });
  }
}
