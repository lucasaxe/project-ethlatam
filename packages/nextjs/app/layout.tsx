import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
// Este import provavelmente não existe e o <ThemeProvider> foi adicionado por engano
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Scaffold-ETH 2 App",
  description: "Built with Scaffold-ETH 2",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    // 1. Adicione suppressHydrationWarning={true} aqui
    <html suppressHydrationWarning={true}>
      {/* Você já tem a supressão aqui, o que é bom */}
      <body suppressHydrationWarning={true}>
        {/* 2. Remova o <ThemeProvider> que estava aqui. */}
        {/* O ScaffoldEthAppWithProviders já cuida disso. */}

        <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
