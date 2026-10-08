// mobile/src/screens/ConsentScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  createConsent,
  getConsentByAthlete,
  revokeConsent,
  CONSENT_TEXT_DEFAULT,
  RELATIONSHIPS,
  ImageConsent,
} from '../services/consentApi';
import { useTheme } from '../context/ThemeContext';

// Importação condicional: WebView só no mobile
let SignatureScreen: any = null;
if (Platform.OS !== 'web') {
  try {
    SignatureScreen = require('react-native-signature-canvas').default;
  } catch (e) {
    console.warn('react-native-signature-canvas não disponível');
  }
}

export default function ConsentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDark } = useTheme();
  const { athlete } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingConsent, setExistingConsent] = useState<ImageConsent | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  // Dados do formulário
  const [guardianName, setGuardianName] = useState('');
  const [guardianCpf, setGuardianCpf] = useState('');
  const [guardianRg, setGuardianRg] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [relationship, setRelationship] = useState('mae');
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const signatureRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  // Verificar se já existe termo
  useEffect(() => {
    checkExistingConsent();
  }, []);

  const checkExistingConsent = async () => {
    try {
      setLoading(true);
      const consent = await getConsentByAthlete(athlete.id);
      setExistingConsent(consent);
    } catch (error) {
      console.error('Erro ao verificar termo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatar CPF
  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (!match) return text;
    let formatted = match[1];
    if (match[2]) formatted += '.' + match[2];
    if (match[3]) formatted += '.' + match[3];
    if (match[4]) formatted += '-' + match[4];
    return formatted;
  };

  // Formatar telefone
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) => {
        let result = '';
        if (a) result += `(${a}`;
        if (a.length === 2) result += ') ';
        if (b) result += b;
        if (c) result += `-${c}`;
        return result;
      });
    } else {
      return cleaned.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (_, a, b, c) => {
        let result = '';
        if (a) result += `(${a}`;
        if (a.length === 2) result += ') ';
        if (b) result += b;
        if (c) result += `-${c}`;
        return result;
      });
    }
  };

  // Revogar termo
  const handleRevoke = async () => {
    if (!existingConsent) return;

    const confirmar = Platform.OS === 'web'
      ? window.confirm(
          '⚠️ Tem certeza que deseja revogar o termo?\n\n' +
          'Isso permitirá assinar um novo termo. O termo anterior ficará registrado como revogado.'
        )
      : true;

    if (!confirmar) return;

    try {
      setSaving(true);
      console.log('🗑️ Revogando termo:', existingConsent.id);

      await revokeConsent(existingConsent.id, 'Revogado pelo responsável');

      console.log('✅ Termo revogado!');
      
      if (Platform.OS === 'web') {
        window.alert('✅ Termo revogado!\n\nAgora você pode assinar um novo termo.');
      }

      // Recarregar a tela para permitir novo termo
      setExistingConsent(null);
      setSignature(null);
      setAccepted(false);
      setGuardianName('');
      setGuardianCpf('');
      setGuardianRg('');
      setGuardianEmail('');
      setGuardianPhone('');

      // Recarregar do backend
      setTimeout(async () => {
        try {
          const consent = await getConsentByAthlete(athlete.id);
          setExistingConsent(consent);
        } catch (error) {
          console.error('Erro ao recarregar:', error);
        }
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro ao revogar:', error);
      const msg = error.message || 'Erro ao revogar termo';
      if (Platform.OS === 'web') {
        window.alert('❌ Erro: ' + msg);
      } else {
        Alert.alert('❌ Erro', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // Salvar termo
  const handleSave = async () => {
    console.log('🔵 handleSave CHAMADO!');
    console.log('📋 Dados:', {
      guardianName: guardianName || '(vazio)',
      guardianCpf: guardianCpf || '(vazio)',
      signature: signature ? 'OK (' + signature.length + ' bytes)' : 'VAZIO',
      accepted,
      athlete_id: athlete?.id,
    });

    if (!guardianName.trim()) {
      const msg = 'Preencha o nome completo do responsável';
      console.log('❌ Validação falhou: ' + msg);
      if (Platform.OS === 'web') {
        window.alert('⚠️ Atenção: ' + msg);
      } else {
        Alert.alert('⚠️ Atenção', msg);
      }
      return;
    }
    if (!guardianCpf.trim() || guardianCpf.replace(/\D/g, '').length !== 11) {
      const msg = 'CPF inválido';
      console.log('❌ Validação falhou: ' + msg);
      if (Platform.OS === 'web') {
        window.alert('⚠️ Atenção: ' + msg);
      } else {
        Alert.alert('⚠️ Atenção', msg);
      }
      return;
    }
    if (!signature) {
      const msg = 'Por favor, assine no espaço indicado';
      console.log('❌ Validação falhou: ' + msg);
      if (Platform.OS === 'web') {
        window.alert('⚠️ Atenção: ' + msg);
      } else {
        Alert.alert('⚠️ Atenção', msg);
      }
      return;
    }
    if (!accepted) {
      const msg = 'Você precisa aceitar os termos';
      console.log('❌ Validação falhou: ' + msg);
      if (Platform.OS === 'web') {
        window.alert('⚠️ Atenção: ' + msg);
      } else {
        Alert.alert('⚠️ Atenção', msg);
      }
      return;
    }

    console.log('✅ Validações OK! Enviando para o backend...');

    try {
      setSaving(true);

      const payload = {
        athlete_id: athlete.id,
        guardian_name: guardianName.trim(),
        guardian_cpf: guardianCpf.trim(),
        guardian_rg: guardianRg.trim() || undefined,
        guardian_email: guardianEmail.trim() || undefined,
        guardian_phone: guardianPhone.trim() || undefined,
        relationship,
        signature_data: signature,
        consent_text: CONSENT_TEXT_DEFAULT,
        consent_version: '1.0',
      };

      console.log('📤 Payload:', { ...payload, signature_data: '...' });

      const result = await createConsent(payload);
      console.log('✅ Resposta do backend:', result);

      if (Platform.OS === 'web') {
        window.alert('✅ Sucesso!\n\nTermo assinado com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert(
          '✅ Sucesso!',
          'Termo assinado com sucesso!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      const msg = error.message || 'Erro ao salvar termo';
      if (Platform.OS === 'web') {
        window.alert('❌ Erro: ' + msg);
      } else {
        Alert.alert('❌ Erro', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // --- COMPONENTE DE ASSINATURA PARA WEB (iframe com HTML puro) ---
  const WebSignaturePad = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
      // HTML completo da assinatura
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #FFF;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      touch-action: none;
      cursor: crosshair;
    }
  </style>
</head>
<body>
  <canvas id="signature"></canvas>
  <script>
    (function() {
      const canvas = document.getElementById('signature');
      const ctx = canvas.getContext('2d');
      let isDrawing = false;
      let lastX = 0;
      let lastY = 0;
      let hasDrawn = false;

      function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
      }

      function start(e) {
        e.preventDefault();
        const { x, y } = getCoords(e);
        isDrawing = true;
        lastX = x;
        lastY = y;
        hasDrawn = true;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
      }

      function move(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x;
        lastY = y;
      }

      function end(e) {
        e.preventDefault();
        isDrawing = false;
      }

      function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn = false;
        window.parent.postMessage({ type: 'SIGNATURE_CLEARED' }, '*');
      }

      function save() {
        if (!hasDrawn) {
          window.parent.postMessage({ type: 'SIGNATURE_EMPTY' }, '*');
          return;
        }
        try {
          const dataUrl = canvas.toDataURL('image/png');
          window.parent.postMessage({ 
            type: 'SIGNATURE_SAVED', 
            data: dataUrl 
          }, '*');
        } catch (err) {
          window.parent.postMessage({ 
            type: 'SIGNATURE_ERROR', 
            error: err.message 
          }, '*');
        }
      }

      // Registrar eventos
      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove', move, { passive: false });
      canvas.addEventListener('touchend', end, { passive: false });
      canvas.addEventListener('touchcancel', end, { passive: false });

      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', move);
      canvas.addEventListener('mouseup', end);
      canvas.addEventListener('mouseleave', end);

      // Redimensionar
      window.addEventListener('resize', resize);
      setTimeout(resize, 50);

      // Expor funções para o parent
      window.clearSignature = clear;
      window.saveSignature = save;

      // Notificar que está pronto
      window.parent.postMessage({ type: 'SIGNATURE_READY' }, '*');
    })();
  </script>
</body>
</html>
`;

      const iframe = iframeRef.current;
      if (!iframe) return;

      iframe.srcdoc = html;

      // Listener para mensagens do iframe
      const handleMessage = (event: MessageEvent) => {
        const data = event.data;
        if (!data || !data.type) return;

        console.log('📨 Mensagem do iframe:', data.type);

        if (data.type === 'SIGNATURE_SAVED') {
          console.log('✅ Assinatura recebida!');
          setSignature(data.data);
          setShowSignature(false);
          setTimeout(() => {
            window.alert('✅ Assinatura capturada!\n\nAgora preencha os dados e clique em "Assinar e Enviar Termo"');
          }, 100);
        } else if (data.type === 'SIGNATURE_EMPTY') {
          window.alert('⚠️ Por favor, assine no espaço antes de confirmar');
        } else if (data.type === 'SIGNATURE_ERROR') {
          window.alert('❌ Erro: ' + data.error);
        } else if (data.type === 'SIGNATURE_READY') {
          console.log('✅ iframe pronto');
        }
      };

      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, []);

    const handleClear = () => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        try {
          (iframe.contentWindow as any).clearSignature?.();
        } catch (e) {
          console.error('Erro ao limpar:', e);
        }
      }
    };

    const handleSave = () => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        try {
          (iframe.contentWindow as any).saveSignature?.();
        } catch (e) {
          console.error('Erro ao salvar:', e);
        }
      }
    };

    return (
      <View style={styles.signatureModal}>
        <View style={styles.signatureHeader}>
          <Text style={styles.signatureTitle}>✍️ Assine no espaço abaixo</Text>
          <TouchableOpacity onPress={() => setShowSignature(false)}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.signatureContainer, { position: 'relative' }]}>
          {/* @ts-ignore - iframe */}
          <iframe
            ref={iframeRef}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#FFF',
              touchAction: 'none',
            }}
            title="signature-pad"
          />
        </View>

        <View style={styles.signatureActions}>
          <TouchableOpacity
            style={[styles.signatureButton, { backgroundColor: '#6B7280' }]}
            onPress={handleClear}
          >
            <Text style={styles.signatureButtonText}>🗑️ Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.signatureButton, { backgroundColor: '#10B981' }]}
            onPress={handleSave}
          >
            <Text style={styles.signatureButtonText}>✅ Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- RENDERIZAÇÃO ---

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Verificando termo...
        </Text>
      </View>
    );
  }

  // Se já tem termo ativo
  if (existingConsent && existingConsent.status === 'active') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            📸 Autorização de Imagem
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Atleta: {athlete.name}
          </Text>
        </View>

        <View style={[styles.successCard, { borderColor: '#10B981' }]}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={[styles.successTitle, { color: '#10B981' }]}>
            Termo Assinado
          </Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            Assinado em{new Date(existingConsent.signed_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Atleta:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{athlete.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Responsável:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {existingConsent.guardian_name}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CPF:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {existingConsent.guardian_cpf}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Parentesco:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {RELATIONSHIPS.find((r) => r.value === existingConsent.relationship)?.label ||
                existingConsent.relationship}
            </Text>
          </View>
        </View>

        {/* Assinatura capturada */}
        {existingConsent.signature_data && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ✍️ Assinatura Digital
            </Text>
            <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 8 }}>
              <img
                src={existingConsent.signature_data}
                alt="Assinatura"
                style={{ width: '100%', height: 150, objectFit: 'contain' }}
              />
            </View>
          </View>
        )}

        {/* Termo assinado */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📜 Termo Assinado
          </Text>
          <ScrollView
            style={[styles.termsBox, { backgroundColor: colors.background, borderColor: colors.border, maxHeight: 200 }]}
            nestedScrollEnabled={true}
          >
            <Text style={[styles.termsText, { color: colors.text }]}>
              {existingConsent.consent_text || CONSENT_TEXT_DEFAULT}
            </Text>
          </ScrollView>
        </View>

        {/* Botão Voltar */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6B7280', marginBottom: 12 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Voltar</Text>
        </TouchableOpacity>

        {/* Botão Revogar */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#EF4444', marginBottom: 40 }]}
          onPress={handleRevoke}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? '⏳ Revogando...' : '🗑️ Revogar Termo e Assinar Outro'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Formulário
  // No WEB, usar View simples em vez de KeyboardAvoidingView
  const Container: any = Platform.OS === 'web' ? View : KeyboardAvoidingView;
  const containerProps = Platform.OS === 'web' 
    ? { style: { flex: 1, backgroundColor: colors.background } }
    : { style: { flex: 1, backgroundColor: colors.background }, behavior: 'padding' as const };

  return (
    <Container {...containerProps}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: 150,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            📸 Autorização de Imagem
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Atleta: {athlete.name}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            👤 Dados do Responsável
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Nome completo *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Digite o nome completo"
            placeholderTextColor={colors.textSecondary}
            value={guardianName}
            onChangeText={setGuardianName}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>CPF *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="000.000.000-00"
            placeholderTextColor={colors.textSecondary}
            value={guardianCpf}
            onChangeText={(t) => setGuardianCpf(formatCPF(t))}
            keyboardType="numeric"
            maxLength={14}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>RG</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="00.000.000-0"
            placeholderTextColor={colors.textSecondary}
            value={guardianRg}
            onChangeText={setGuardianRg}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>E-mail</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="email@exemplo.com"
            placeholderTextColor={colors.textSecondary}
            value={guardianEmail}
            onChangeText={setGuardianEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Telefone</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="(00) 00000-0000"
            placeholderTextColor={colors.textSecondary}
            value={guardianPhone}
            onChangeText={(t) => setGuardianPhone(formatPhone(t))}
            keyboardType="phone-pad"
            maxLength={15}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Parentesco *</Text>
          <View style={styles.relationshipContainer}>
            {RELATIONSHIPS.map((rel) => (
              <TouchableOpacity
                key={rel.value}
                style={[
                  styles.relationshipButton,
                  {
                    backgroundColor: relationship === rel.value ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setRelationship(rel.value)}
              >
                <Text
                  style={[
                    styles.relationshipText,
                    {
                      color: relationship === rel.value ? '#FFF' : colors.text,
                      fontWeight: relationship === rel.value ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {rel.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📜 Termo de Consentimento
          </Text>
          <ScrollView 
            style={[styles.termsBox, { backgroundColor: colors.background, borderColor: colors.border, maxHeight: 200 }]}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            <Text style={[styles.termsText, { color: colors.text }]}>
              {CONSENT_TEXT_DEFAULT.replace('pelo(a) atleta', `pelo(a) atleta ${athlete.name}`)}
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAccepted(!accepted)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: accepted ? '#10B981' : colors.border,
                  backgroundColor: accepted ? '#10B981' : 'transparent',
                },
              ]}
            >
              {accepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Li e aceito os termos acima
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ✍️ Assinatura Digital
          </Text>

          {signature ? (
            <View>
              <View style={[styles.signaturePreview, { backgroundColor: '#FFF', borderColor: colors.border }]}>
                <Text style={styles.signaturePreviewText}>✍️ Assinatura capturada</Text>
              </View>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#6B7280', marginTop: 12 }]}
                onPress={() => setSignature(null)}
              >
                <Text style={styles.buttonText}>🗑️ Limpar Assinatura</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setShowSignature(true)}
            >
              <Text style={styles.buttonText}>✍️ Assinar Agora</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: saving ? '#6B7280' : '#10B981',
              marginBottom: 40,
            },
          ]}
          onPress={() => {
            console.log('🖱️ BOTÃO CLICADO!');
            handleSave();
          }}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>✅ Assinar e Enviar Termo</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Assinatura */}
      {showSignature && (
        Platform.OS === 'web' ? (
          <WebSignaturePad />
        ) : (
          <View style={styles.signatureModal}>
            <View style={styles.signatureHeader}>
              <Text style={styles.signatureTitle}>✍️ Assine no espaço abaixo</Text>
              <TouchableOpacity onPress={() => setShowSignature(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.signatureContainer}>
              {SignatureScreen ? (
                <SignatureScreen
                  ref={signatureRef}
                  onOK={(sig: string) => {
                    setSignature(sig);
                    setShowSignature(false);
                  }}
                  onEmpty={() => Alert.alert('⚠️ Atenção', 'Por favor, assine no espaço')}
                  descriptionText=""
                  clearText="Limpar"
                  confirmText="Confirmar"
                />
              ) : (
                <Text style={{ color: '#000', textAlign: 'center', padding: 20 }}>
                  Assinatura não disponível
                </Text>
              )}
            </View>

            <View style={styles.signatureActions}>
              <TouchableOpacity
                style={[styles.signatureButton, { backgroundColor: '#6B7280' }]}
                onPress={() => signatureRef.current?.clearSignature()}
              >
                <Text style={styles.signatureButtonText}>🗑️ Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signatureButton, { backgroundColor: '#10B981' }]}
                onPress={() => signatureRef.current?.readSignature()}
              >
                <Text style={styles.signatureButtonText}>✅ Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      )}
    </Container>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 14 },

  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14 },

  card: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },

  label: { fontSize: 12, marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15 },

  relationshipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  relationshipButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  relationshipText: { fontSize: 13 },

  termsBox: { borderRadius: 8, padding: 12, maxHeight: 250, borderWidth: 1 },
  termsText: { fontSize: 12, lineHeight: 18 },

  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkmark: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14 },

  signaturePreview: { borderRadius: 8, padding: 20, alignItems: 'center', borderWidth: 1 },
  signaturePreviewText: { color: '#000', fontSize: 14 },

  button: { borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  successCard: { borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 2, marginBottom: 20 },
  successIcon: { fontSize: 64, marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  successText: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#333' },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: 'bold' },

  signatureModal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0D1117', zIndex: 1000 },
  signatureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#161B22', borderBottomWidth: 1, borderBottomColor: '#30363D' },
  signatureTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  closeButton: { color: '#FFF', fontSize: 24, padding: 8 },
  signatureContainer: { flex: 1, backgroundColor: '#FFF', margin: 16, borderRadius: 8, overflow: 'hidden' },
  signatureActions: { flexDirection: 'row', padding: 16, gap: 12 },
  signatureButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  signatureButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});
