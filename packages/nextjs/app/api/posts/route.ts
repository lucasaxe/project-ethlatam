// /packages/nextjs/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Define a estrutura completa que será salva no JSON (posts-data.json)
interface PostJSONData {
  id: number;
  ongName: string;
  ongDescription: string;
  ongTokens: number;
  likes: number;
  postTitle: string;
  imageUrl: string;
  imageDescription: string;
  createdAt: string;
}

const postsFilePath = path.join(process.cwd(), "public", "posts-data.json");

/**
 * Função POST para criar um novo post a partir de FormData.
 * URL de acesso: /api/posts
 */
export async function POST(request: NextRequest) {
  try {
    // 1. LÊ OS DADOS DO CORPO DA REQUISIÇÃO COMO FormData
    const formData = await request.formData();

    // Dados do Formulário
    const postTitle = formData.get("postTitle")?.toString();
    const imageDescription = formData.get("imageDescription")?.toString(); // Conteúdo
    const imageFile = formData.get("image") as File | null;
    const imageUrlFromForm = formData.get("imageUrl")?.toString();

    // Dados da ONG (Puxados do estado do cliente)
    const ongName = formData.get("ongName")?.toString();
    const ongDescription = formData.get("ongDescription")?.toString();
    const ongTokensStr = formData.get("ongTokens")?.toString();
    const ongTokens = parseInt(ongTokensStr || "0", 10);

    // 2. VALIDAÇÃO BÁSICA
    if (!postTitle || !imageDescription || !ongName) {
      return NextResponse.json({ error: "Título, conteúdo e nome da ONG são obrigatórios." }, { status: 400 });
    }

    // 3. LÊ O ARQUIVO JSON EXISTENTE E GERA O ID
    let posts: PostJSONData[] = [];
    try {
      const fileContent = await fs.readFile(postsFilePath, "utf-8");
      posts = JSON.parse(fileContent);
    } catch {
      console.warn("Arquivo JSON de posts não encontrado ou vazio. Criando novo array.");
    }

    // Gera o próximo ID sequencial (O primeiro post na lista terá o ID mais alto)
    const lastPostId = posts.length > 0 ? posts[0].id : 0;
    const newId = lastPostId + 1;

    // 4. RESOLVE A URL DA IMAGEM
    let finalImageUrl = imageUrlFromForm || "https://placehold.co/1200x800/999/white?text=Sem+Imagem";

    // Se houver um arquivo, salva ele na pasta public/images e usa o caminho relativo.
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      // CORREÇÃO TS: Converter ArrayBuffer para Uint8Array em vez de Buffer do Node
      const bufferView = new Uint8Array(bytes);

      // Define o nome e caminho onde a imagem será salva
      const imageExtension = path.extname(imageFile.name) || ".jpg";
      const imageName = `post-${newId}${imageExtension}`;
      const imagePath = path.join(process.cwd(), "public", "images", imageName);

      // Certifica-se que a pasta 'images' existe
      await fs.mkdir(path.join(process.cwd(), "public", "images"), { recursive: true });

      // Salva o arquivo no disco (usando o bufferView)
      await fs.writeFile(imagePath, bufferView); // <-- CORREÇÃO AQUI

      // Define a URL final como o caminho público
      finalImageUrl = `/images/${imageName}`;
    }

    // 5. CRIA O NOVO POST FINAL
    const newPost: PostJSONData = {
      id: newId,
      ongName: ongName,
      ongDescription: ongDescription || "Descrição não informada",
      ongTokens: ongTokens,
      likes: 0, // Começa em 0
      postTitle: postTitle,
      imageUrl: finalImageUrl,
      imageDescription: imageDescription,
      createdAt: new Date().toISOString(),
    };

    // 6. ADICIONA O NOVO POST (no início para ser o mais recente) E ESCREVE DE VOLTA NO ARQUIVO
    posts.unshift(newPost);
    await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2));

    // 7. RETORNA A RESPOSTA DE SUCESSO
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Erro ao processar requisição POST /api/posts:", error);
    return NextResponse.json({ error: "Erro interno do servidor ao criar postagem." }, { status: 500 });
  }
}
