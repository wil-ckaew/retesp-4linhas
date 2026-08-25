export default function ProfilePage() {
  return (
    <div className="p-8">

      <div className="bg-white rounded shadow p-8">

        <h1 className="text-4xl font-bold mb-6">
          Perfil do Atleta
        </h1>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <p><b>Nome:</b> João Silva</p>
            <p><b>Categoria:</b> Sub-12</p>
            <p><b>Idade:</b> 11 anos</p>
          </div>

          <div>
            <p><b>Frequência:</b> 95%</p>
            <p><b>Gols:</b> 12</p>
            <p><b>Assistências:</b> 8</p>
          </div>

        </div>

      </div>

    </div>
  );
}
