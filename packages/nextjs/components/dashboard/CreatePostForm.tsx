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
  onCreate: (data: { title: string; content: string; imageFile: File | null }) => Promise<void>;
  onCancel: () => void;
}

export default function CreatePostForm({ onCreate, onCancel }: CreateFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await onCreate({ title, content, imageFile });
    } catch (error) {
      console.error("Erro no onCreate do formulário:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="postTitle">Título da Postagem</label>
        <input id="postTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="postImage">Imagem da Postagem (Opcional)</label>
        <input
          id="postImage"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="postContent">Conteúdo</label>
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
