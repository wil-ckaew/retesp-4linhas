// frontend/src/app/parents/consent/[athleteId]/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WebSignaturePad from '@/components/WebSignaturePad';
import {
  createConsent,
  getConsentByAthlete,
  revokeConsent,
  CONSENT_TEXT_DEFAULT,
  RELATIONSHIPS,
  ImageConsent,
} from '@/services/consentApi';
import { API_URL } from '@/lib/config';

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url?: string;
}

export default function ConsentPage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.athleteId as string;

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [existingConsent, setExistingConsent] = useState<ImageConsent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [guardianName, setGuardianName] = useState('');
  const [guardianCpf, setGuardianCpf] = useState('');
  const [guardianRg, setGuardianRg] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [relationship, setRelationship] = useState('mae');
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, [athleteId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Buscar atleta
      const athleteRes = await fetch(`${API_URL}/athletes/${athleteId}`);
      if (athleteRes.ok) {
        const data = await athleteRes.json();
        setAthlete(data);
      }
      // Buscar termo
      const consent = await getConsentByAthlete(athleteId);
      setExistingConsent(consent);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatadores
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 14);
    }
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  // Salvar
  const handleSave = async () => {
    console.log('🔵 handleSave CHAMADO!');
    console.log('📋 Dados:', {
      guardianName,
      guardianCpf,
      signature: signature ? 'OK' : 'VAZIO',
      accepted,
      athleteId,
    });

    if (!guardianName.trim()) {
      alert('⚠️ Preencha o nome completo do responsável');
      return;
    }
    if (!guardianCpf.trim() || guardianCpf.replace(/\D/g, '').length !== 11) {
      alert('⚠️ CPF inválido');
      return;
    }
    if (!signature) {
      alert('⚠️ Por favor, assine no espaço indicado');
      return;
    }
    if (!accepted) {
      alert('⚠️ Você precisa aceitar os termos');
      return;
    }

    try {
      setSaving(true);
      await createConsent({
        athlete_id: athleteId,
        guardian_name: guardianName.trim(),
        guardian_cpf: guardianCpf.trim(),
        guardian_rg: guardianRg.trim() || undefined,
        guardian_email: guardianEmail.trim() || undefined,
        guardian_phone: guardianPhone.trim() || undefined,
        relationship,
        signature_data: signature,
        consent_text: CONSENT_TEXT_DEFAULT.replace('pelo(a) atleta', `pelo(a) atleta ${athlete?.name || ''}`),
        consent_version: '1.0',
      });

      alert('✅ Sucesso! Termo assinado com sucesso!');
      router.back();
    } catch (error: any) {
      console.error('❌ Erro:', error);
      alert('❌ Erro: ' + (error.message || 'Erro ao salvar termo'));
    } finally {
      setSaving(false);
    }
  };

  // Revogar
  const handleRevoke = async () => {
    if (!existingConsent) return;
    const confirmar = window.confirm(
      '⚠️ Tem certeza que deseja revogar o termo?\n\nIsso permitirá assinar um novo termo.'
    );
    if (!confirmar) return;

    try {
      setSaving(true);
      await revokeConsent(existingConsent.id, 'Revogado pelo responsável');
      alert('✅ Termo revogado! Agora você pode assinar um novo.');
      setExistingConsent(null);
      setSignature(null);
      setAccepted(false);
    } catch (error: any) {
      alert('❌ Erro: ' + (error.message || 'Erro ao revogar'));
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Termo já assinado
  if (existingConsent && existingConsent.status === 'active') {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">📸 Autorização de Imagem</h1>
          <p className="text-gray-400 mb-6">Atleta: {athlete?.name}</p>

          <div className="bg-green-900/20 border-2 border-green-500 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <div className="text-6xl mb-3">✅</div>
              <h2 className="text-2xl font-bold text-green-400 mb-3">Termo Assinado</h2>
              <p className="text-gray-300 mb-6">
                Assinado em {new Date(existingConsent.signed_at).toLocaleDateString('pt-BR')}
              </p>

              <div className="space-y-2 text-left bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Atleta:</span>
                  <span className="text-white font-medium">{athlete?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Responsável:</span>
                  <span className="text-white font-medium">{existingConsent.guardian_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CPF:</span>
                  <span className="text-white font-medium">{existingConsent.guardian_cpf}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Parentesco:</span>
                  <span className="text-white font-medium">
                    {RELATIONSHIPS.find(r => r.value === existingConsent.relationship)?.label || existingConsent.relationship}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {existingConsent.signature_data && (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-bold mb-3">✍️ Assinatura Digital</h3>
              <div className="bg-white rounded-lg p-4">
                <img
                  src={existingConsent.signature_data}
                  alt="Assinatura"
                  className="w-full h-32 object-contain"
                />
              </div>
            </div>
          )}

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-bold mb-3">📜 Termo Assinado</h3>
            <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                {existingConsent.consent_text || CONSENT_TEXT_DEFAULT}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
            >
              ← Voltar
            </button>
            <button
              onClick={handleRevoke}
              disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? '⏳ Revogando...' : '🗑️ Revogar Termo'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulário
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">📸 Autorização de Imagem</h1>
        <p className="text-gray-400 mb-6">Atleta: {athlete?.name}</p>

        {/* Dados do Responsável */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">👤 Dados do Responsável</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Nome completo *</label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">CPF *</label>
              <input
                type="text"
                value={guardianCpf}
                onChange={(e) => setGuardianCpf(formatCPF(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">RG</label>
              <input
                type="text"
                value={guardianRg}
                onChange={(e) => setGuardianRg(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                placeholder="00.000.000-0"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">E-mail</label>
              <input
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Telefone</label>
              <input
                type="text"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(formatPhone(e.target.value))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Parentesco *</label>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIPS.map((rel) => (
                  <button
                    key={rel.value}
                    type="button"
                    onClick={() => setRelationship(rel.value)}
                    className={`px-4 py-2 rounded-full border ${
                      relationship === rel.value
                        ? 'bg-blue-600 border-blue-600 text-white font-bold'
                        : 'bg-gray-900 border-gray-700 text-gray-300'
                    }`}
                  >
                    {rel.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Termo */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📜 Termo de Consentimento</h2>
          <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto mb-4">
            <p className="text-gray-300 text-sm whitespace-pre-wrap">
              {CONSENT_TEXT_DEFAULT.replace('pelo(a) atleta', `pelo(a) atleta ${athlete?.name || ''}`)}
            </p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-6 h-6 rounded"
            />
            <span className="text-white">Li e aceito os termos acima</span>
          </label>
        </div>

        {/* Assinatura */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">✍️ Assinatura Digital</h2>
          {signature ? (
            <div>
              <div className="bg-white rounded-lg p-4 mb-3">
                <img src={signature} alt="Assinatura" className="w-full h-32 object-contain" />
              </div>
              <button
                type="button"
                onClick={() => setSignature(null)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
              >
                🗑️ Limpar Assinatura
              </button>
            </div>
          ) : (
            <WebSignaturePad onSave={(dataUrl) => setSignature(dataUrl)} />
          )}
        </div>

        {/* Botão Salvar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg mb-8 disabled:opacity-50"
        >
          {saving ? '⏳ Salvando...' : '✅ Assinar e Enviar Termo'}
        </button>
      </div>
    </div>
  );
}
