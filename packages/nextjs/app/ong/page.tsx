import type { NextPage } from "next";

const ONGPage: NextPage = () => {
  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="flex flex-col items-center">
        {/* Espaço para Imagem (Placeholder) */}
        <div className="w-64 h-64 bg-base-300 rounded-full flex items-center justify-center mb-6">
          <span className="text-base-content/50">Imagem da ONG</span>
        </div>

        {/* Nome da ONG */}
        <h1 className="text-4xl font-bold mb-4">Nome da ONG</h1>

        {/* Descrição Padrão */}
        <p className="text-lg text-center max-w-2xl">
          Esta é uma descrição padrão sobre a missão e o trabalho da nossa ONG. Estamos dedicados a fazer a diferença e
          agradecemos o seu apoio. Aqui você poderá gerenciar seus cupons, verificar doações e acompanhar seu impacto.
        </p>
      </div>
    </div>
  );
};

export default ONGPage;
