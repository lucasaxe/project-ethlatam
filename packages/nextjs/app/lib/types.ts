// app/lib/types.ts

// O que esperamos receber da API sobre a ONG
export interface OngData {
  id: string;
  name: string;
  objective: string;
  contactEmail: string;
  website?: string;
  cnpj: string;
  reputationTokens: number;
  totalRaisedETH: number;
}

// O que esperamos receber da API sobre uma postagem
export interface PostData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  likes: number; // <-- NOVO CAMPO DE CURTIDAS
}

// O que o formulário de criação de post vai enviar
export type CreatePostInput = Omit<PostData, "id" | "createdAt" | "imageUrl" | "likes">;

// O que o formulário de edição da ONG vai enviar
export interface EditOngInput {
  name: string;
  objective: string;
  contactEmail: string;
  website?: string;
  cnpj: string;
}
