// app/layout.tsx
import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ThemeProvider } from "next-themes";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Scaffold-ETH 2 App",
  description: "Built with Scaffold-ETH 2",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="bg-base-100">
        {/* CORREÇÃO DEFINITIVA AQUI:
          Trocamos 'attribute="class"' por 'attribute="data-theme"'.
          
          Isso faz o 'ThemeProvider' falar a mesma língua que o DaisyUI,
          alterando <html data-theme="dark">.
          Isso ativará as variáveis de cor corretas no seu globals.css
          e fará o 'bg-base-100' funcionar como esperado.
        */}
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
