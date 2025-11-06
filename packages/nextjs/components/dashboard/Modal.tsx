// components/Modal.tsx
"use client";

import React from "react";
import styles from "./Modal.module.css";

// components/Modal.tsx

// components/Modal.tsx

// components/Modal.tsx

// components/Modal.tsx

// components/Modal.tsx

// components/Modal.tsx

// components/Modal.tsx

// components/Modal.tsx

// components/Modal.tsx

// components/Modal.tsx

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) {
    return null; // Se não estiver aberto, não renderiza nada
  }

  // Impede que o clique dentro do modal feche o modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    // O overlay (fundo escuro)
    <div className={styles.overlay} onClick={onClose}>
      {/* O conteúdo do modal */}
      <div className={styles.content} onClick={handleContentClick}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times; {/* Isso é um 'X' */}
          </button>
        </header>
        <div className={styles.body}>
          {children} {/* Aqui é onde os formulários vão aparecer */}
        </div>
      </div>
    </div>
  );
}
