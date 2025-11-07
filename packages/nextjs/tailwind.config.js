/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Verifique se estes caminhos estão certos para o seu projeto
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Você pode adicionar suas próprias personalizações aqui
    },
  },
  plugins: [
    //@ts-ignore
    require('daisyui'), // Adiciona o plugin DaisyUI
  ],

  // --- Adiciona a configuração do DaisyUI ---
  daisyui: {
    themes: [
      "light", // Tema claro
      "black",  // Adiciona o tema preto
    ],
    darkTheme: "black", // Define "black" como o tema escuro padrão
    base: true,
    styled: true,
    utils: true,
    logs: true,
  },
};