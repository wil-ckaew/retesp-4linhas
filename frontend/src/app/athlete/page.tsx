export default function AthletePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        Perfil do Atleta
      </h1>

      <div className="grid gap-4">
        <div className="border p-4 rounded">
          Frequência: 92%
        </div>

        <div className="border p-4 rounded">
          Medalhas: 4
        </div>

        <div className="border p-4 rounded">
          Ranking Atual: #7
        </div>
      </div>
    </div>
  );
}
