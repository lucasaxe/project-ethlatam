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

// Corrected to point to 'app/lib/types' (Corrigido para apontar para 'app/lib/types')

interface CreateFormProps {
  // The typing of 'onCreate' now supports URL or File (A tipagem de 'onCreate' agora suporta URL ou File)
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
  const [imageOption, setImageOption] = useState<"file" | "url">("file"); // New state: File or URL (Novo estado: Arquivo ou URL)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(""); // New state for the link (Novo estado para o link)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Handles file change (Manipula a mudança de arquivo)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Clear previous preview to prevent memory leak (Limpa o preview anterior para evitar vazamento de memória)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (file) {
      setImageFile(file);
      setImageUrl(""); // Clear the link (Limpa o link)
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Handles URL change (Manipula a mudança de URL)
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    // Clear previous file preview (Limpa o preview de arquivo anterior)
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageUrl(url);
    setImageFile(null); // Clear the file (Limpa o arquivo)
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
      console.error("Error in form onCreate:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // --- Form Rendering (Renderização do Formulário) ---
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="postTitle">Post Title</label>
        <input id="postTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      {/* --- Image Option Selection (Seleção de Opção de Imagem) --- */}
      <div className={styles.formGroup}>
        <label>Image Source (Optional)</label>
        <div className={styles.radioGroup}>
          <label>
            <input type="radio" checked={imageOption === "file"} onChange={() => setImageOption("file")} />
            File Upload
          </label>
          <label>
            <input type="radio" checked={imageOption === "url"} onChange={() => setImageOption("url")} />
            Link (URL)
          </label>
        </div>
      </div>

      {/* --- Conditional Field (Campo Condicional) --- */}
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
          <label htmlFor="postImageUrl">Image Link (URL)</label>
          <input id="postImageUrl" type="url" value={imageUrl} onChange={handleUrlChange} />
        </div>
      )}

      {/* Image Preview (Preview de Imagem) */}
      {imagePreview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
      )}

      <div className={styles.formGroup}>
        <label htmlFor="postContent">Post Content/Description</label>
        <textarea id="postContent" value={content} onChange={e => setContent(e.target.value)} rows={8} required />
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.buttonSecondary} disabled={isCreating}>
          Cancel
        </button>
        <button type="submit" className={styles.buttonPrimary} disabled={isCreating}>
          {isCreating ? "Publishing..." : "Publish Post"}
        </button>
      </div>
    </form>
  );
}

// <-- CORREÇÃO PRETTIER: Linha em branco
