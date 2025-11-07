// components/dashboard/CreatePostForm.tsx
"use client";

import React, { ChangeEvent, useState } from "react";
import styles from "./Forms.module.css";

// components/dashboard/CreatePostForm.tsx

// components/dashboard/CreatePostForm.tsx

// components/dashboard/CreatePostForm.tsx

// components/dashboard/CreatePostForm.tsx

// components/dashboard/CreatePostForm.tsx

// components/dashboard/CreatePostForm.tsx

// components/dashboard/CreatePostForm.tsx

// components/dashboard/CreatePostForm.tsx

// components/dashboard/CreatePostForm.tsx

// components/dashboard/CreatePostForm.tsx

// Corrigido para apontar para 'app/lib/types'

interface CreateFormProps {
  // A tipagem de 'onCreate' agora suporta URL ou File
  onCreate: (data: {
    title: string;
    content: string;
    imageFile: File | null;
    imageUrl: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function CreatePostForm({ onCreate, onCancel }: CreateFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageOption, setImageOption] = useState<"file" | "url">("file"); // Novo estado: Arquivo ou URL
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(""); // Novo estado para o link
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Manipula a mudança de arquivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Limpa o preview anterior para evitar vazamento de memória
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (file) {
      setImageFile(file);
      setImageUrl(""); // Limpa o link
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Manipula a mudança de URL
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    // Limpa o preview de arquivo anterior
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageUrl(url);
    setImageFile(null); // Limpa o arquivo
    setImagePreview(url || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const finalImageUrl = imageOption === "url" ? imageUrl : null;
    const finalImageFile = imageOption === "file" ? imageFile : null;

    try {
      await onCreate({ title, content, imageFile: finalImageFile, imageUrl: finalImageUrl });
    } catch (error) {
      console.error("Erro no onCreate do formulário:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // --- Renderização do Formulário ---
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="postTitle">Título da Postagem</label>
        <input id="postTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      {/* --- Seleção de Opção de Imagem --- */}
      <div className={styles.formGroup}>
        <label>Fonte da Imagem (Opcional)</label>
        <div className={styles.radioGroup}>
          <label>
            <input type="radio" checked={imageOption === "file"} onChange={() => setImageOption("file")} />
            Upload de Arquivo
          </label>
          <label>
            <input type="radio" checked={imageOption === "url"} onChange={() => setImageOption("url")} />
            Link (URL)
          </label>
        </div>
      </div>

      {/* --- Campo Condicional --- */}
      {imageOption === "file" ? (
        <div className={styles.formGroup}>
          <input
            id="postImageFile"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </div>
      ) : (
        <div className={styles.formGroup}>
          <label htmlFor="postImageUrl">Link da Imagem (URL)</label>
          <input id="postImageUrl" type="url" value={imageUrl} onChange={handleUrlChange} />
        </div>
      )}

      {/* Preview de Imagem */}
      {imagePreview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
      )}

      <div className={styles.formGroup}>
        <label htmlFor="postContent">Conteúdo/Descrição do Post</label>
        <textarea id="postContent" value={content} onChange={e => setContent(e.target.value)} rows={8} required />
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.buttonSecondary} disabled={isCreating}>
          Cancelar
        </button>
        <button type="submit" className={styles.buttonPrimary} disabled={isCreating}>
          {isCreating ? "Publicando..." : "Publicar Postagem"}
        </button>
      </div>
    </form>
  );
}

// <-- CORREÇÃO PRETTIER: Linha em branco
