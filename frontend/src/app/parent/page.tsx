export default function ParentPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        Portal dos Pais
      </h1>

      <div className="grid gap-4">
        <div className="border p-4 rounded">
          Frequência do Filho
        </div>

        <div className="border p-4 rounded">
          Fotos dos Treinos
        </div>

        <div className="border p-4 rounded">
          Vídeos dos Treinos
        </div>
      </div>
    </div>
  );
}
