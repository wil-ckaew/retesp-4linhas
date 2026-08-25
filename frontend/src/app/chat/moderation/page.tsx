export default function ModerationPage() {
  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-6">
        IA Moderadora
      </h1>

      <div className="bg-white rounded shadow p-6">

        <ul className="space-y-2">
          <li>Mensagem inadequada detectada.</li>
          <li>Possível bullying identificado.</li>
          <li>Coordenador notificado.</li>
        </ul>

      </div>

    </div>
  );
}
