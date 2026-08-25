export default function AchievementsPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Conquistas</h1>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white p-6 rounded shadow">
          🏆 Frequência Perfeita
        </div>

        <div className="bg-white p-6 rounded shadow">
          ⚽ Artilheiro
        </div>

        <div className="bg-white p-6 rounded shadow">
          🎯 Melhor Passe
        </div>

        <div className="bg-white p-6 rounded shadow">
          🥇 Destaque da Semana
        </div>

      </div>
    </div>
  );
}
