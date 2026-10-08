// mobile/src/services/consentApi.ts
import { API_URL } from './api';

export interface ImageConsent {
  id: string;
  athlete_id: string;
  athlete_name?: string;
  guardian_name: string;
  guardian_cpf: string;
  guardian_rg?: string;
  guardian_email?: string;
  guardian_phone?: string;
  relationship: string;
  consent_type: string;
  signature_data?: string;
  document_url?: string;
  pdf_url?: string;
  ip_address?: string;
  status: string;
  signed_at: string;
  consent_text?: string;
  consent_version?: string;
}

export interface CreateConsentPayload {
  athlete_id: string;
  guardian_name: string;
  guardian_cpf: string;
  guardian_rg?: string;
  guardian_email?: string;
  guardian_phone?: string;
  relationship: string;
  signature_data?: string;
  consent_text: string;
  consent_version?: string;
}

export async function getConsentByAthlete(athleteId: string): Promise<ImageConsent | null> {
  try {
    const response = await fetch(
      `${API_URL}/image-consents/athlete/${athleteId}?_t=${Date.now()}`
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao buscar termo:', error);
    throw error;
  }
}

export async function createConsent(payload: CreateConsentPayload): Promise<ImageConsent> {
  try {
    console.log('📤 Enviando termo:', { ...payload, signature_data: '...' });
    const response = await fetch(`${API_URL}/image-consents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Erro ${response.status}`);
    console.log('✅ Termo criado:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar termo:', error);
    throw error;
  }
}

export async function revokeConsent(consentId: string, reason?: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/image-consents/${consentId}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Erro ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao revogar:', error);
    throw error;
  }
}

export async function listConsents(): Promise<ImageConsent[]> {
  try {
    const response = await fetch(`${API_URL}/image-consents?_t=${Date.now()}`);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao listar termos:', error);
    throw error;
  }
}

export const CONSENT_TEXT_DEFAULT = `TERMO DE AUTORIZAÇÃO DE USO DE IMAGEM E VOZ

Eu, na qualidade de responsável legal pelo(a) atleta, autorizo o uso gratuito da imagem, voz e som do(a) referido(a) menor para fins de divulgação do projeto RETESP 4 Linhas, em qualquer meio de comunicação, incluindo redes sociais, site e material impresso.

Declaro estar ciente de que:

1. Esta autorização é gratuita e por prazo indeterminado;
2. Posso revogar esta autorização a qualquer momento, por escrito;
3. A revogação não afeta os usos já realizados;
4. O projeto se compromete a não usar as imagens de forma depreciativa ou contrária à moral;
5. Esta autorização está em conformidade com a LGPD (Lei 13.709/2018).

Ao assinar digitalmente, confirmo que li, entendi e concordo com os termos acima.`;

export const RELATIONSHIPS = [
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mãe' },
  { value: 'avo', label: 'Avô/Avó' },
  { value: 'tio', label: 'Tio/Tia' },
  { value: 'tutor', label: 'Tutor(a)' },
  { value: 'outro', label: 'Outro' },
];
