import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    // Exemplo: pode colocar lógica para animações, fetch, etc.
  }, []);

  return (
    <main className="bg-gradient-to-br from-blue-50 to-white min-h-screen pt-36 px-4">
      <section className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-navy)] mb-6">
          Bem-vindo ao Programa de Desenvolvimento Municipal
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed mb-10">
          Este portal reúne informações sobre o novo Plano Diretor Municipal, audiências públicas, contribuições da população e o histórico dos programas anteriores. Explore e participe ativamente da construção do futuro da cidade.
        </p>
        <a
          href="#sobre"
          className="inline-block bg-[var(--color-navy)] text-white font-semibold px-6 py-3 rounded-full shadow-md hover:bg-blue-900 transition"
        >
          Saiba mais
        </a>
      </section>
    </main>
  );
};

export default Home;
