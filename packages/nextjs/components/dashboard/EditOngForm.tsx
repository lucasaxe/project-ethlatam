// components/dashboard/EditOngForm.tsx
"use client";

import React, { useState } from "react";
// Corrected to point to 'app/lib/types' (Corrigido para apontar para 'app/lib/types')
import { EditOngInput, OngData } from "../../app/lib/types";
import styles from "./Forms.module.css";

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

// components/dashboard/EditOngForm.tsx

interface EditFormProps {
  currentData: OngData;
  onSave: (data: EditOngInput) => Promise<void>;
  onCancel: () => void;
}

export default function EditOngForm({ currentData, onSave, onCancel }: EditFormProps) {
  const [name, setName] = useState(currentData.name);
  const [objective, setObjective] = useState(currentData.objective);
  const [contactEmail, setContactEmail] = useState(currentData.contactEmail);
  const [website, setWebsite] = useState(currentData.website || "");
  const [cnpj, setCnpj] = useState(currentData.cnpj);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formData: EditOngInput = {
      name,
      objective,
      contactEmail,
      website,
      cnpj,
    };

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error in form onSave:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="ngoName">NGO Name</label>
        <input id="ngoName" type="text" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="ngoEmail">Contact Email</label>
        <input
          id="ngoEmail"
          type="email"
          value={contactEmail}
          onChange={e => setContactEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ngoCnpj">CNPJ (Tax ID)</label>
        <input
          id="ngoCnpj"
          type="text"
          value={cnpj}
          onChange={e => setCnpj(e.target.value)}
          placeholder="00.000.000/0001-00"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ngoWebsite">Website (optional)</label>
        <input id="ngoWebsite" type="url" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ngoObjective">Objective</label>
        <textarea id="ngoObjective" value={objective} onChange={e => setObjective(e.target.value)} rows={5} />
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.buttonSecondary} disabled={isSaving}>
          Cancel
        </button>
        <button type="submit" className={styles.buttonPrimary} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
