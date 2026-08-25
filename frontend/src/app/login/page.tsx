export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0D1117]">
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">R4</div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-6">Entrar no RETESP</h1>
        <input
          className="w-full bg-[#0D1117] border border-[#30363D] p-3 rounded-lg mb-4 text-white focus:outline-none focus:border-blue-500"
          placeholder="Email"
        />
        <input
          type="password"
          className="w-full bg-[#0D1117] border border-[#30363D] p-3 rounded-lg mb-6 text-white focus:outline-none focus:border-blue-500"
          placeholder="Senha"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg w-full font-bold transition">
          Entrar
        </button>
      </div>
    </div>
  );
}
