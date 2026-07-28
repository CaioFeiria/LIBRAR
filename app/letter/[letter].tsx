import { Ionicons } from '@expo/vector-icons';
import axios, { isAxiosError } from 'axios';
import { CameraCapturedPicture, CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppAlert } from '@/components/AppAlertProvider';
import { API_URL } from '@/constants/api';
import { useAlbumColors } from '@/constants/theme';

type ButtonVariant = 'solid' | 'outline';

function Btn({
  label,
  icon,
  onPress,
  disabled,
  variant = 'solid',
  color,
  textColor,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  color: string;
  textColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        variant === 'solid' ? { backgroundColor: color } : { borderWidth: 1.6, borderColor: color },
        disabled && styles.btnDisabled,
      ]}
    >
      {icon && <Ionicons name={icon} size={17} color={variant === 'solid' ? textColor : color} />}
      <Text style={[styles.btnText, { color: variant === 'solid' ? textColor : color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoCard({
  icon,
  title,
  description,
  children,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  children?: React.ReactNode;
  colors: ReturnType<typeof useAlbumColors>;
}) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]}>
      <View style={styles.centerBody}>
        <View style={[styles.iconBubble, { backgroundColor: colors.card }]}>
          <Ionicons name={icon} size={30} color={colors.inkSoft} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.ink }]}>{title}</Text>
        <Text style={[styles.cardDesc, { color: colors.inkSoft }]}>{description}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

export default function LetterScreen() {
  const { letter } = useLocalSearchParams<{ letter: string }>();
  const router = useRouter();
  const colors = useAlbumColors();
  const alert = useAppAlert();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (!letter) {
    return (
      <InfoCard
        colors={colors}
        icon="alert-circle-outline"
        title="Letra inválida"
        description="Volte e escolha uma figurinha ou letra válida para praticar."
      >
        <Btn label="Voltar" icon="chevron-back" onPress={() => router.back()} color={colors.ink} textColor={colors.card} />
      </InfoCard>
    );
  }

  if (!permission) {
    return (
      <InfoCard
        colors={colors}
        icon="hourglass-outline"
        title="Solicitando permissão..."
        description="Só um instante enquanto verificamos o acesso à câmera."
      />
    );
  }

  if (!permission.granted) {
    return (
      <InfoCard
        colors={colors}
        icon="camera-outline"
        title="Permita o uso da câmera"
        description="Precisamos da câmera para validar o sinal que você reproduzir com a mão."
      >
        {permission.canAskAgain ? (
          <Btn label="Permitir" icon="checkmark" onPress={requestPermission} color={colors.raspberry} textColor={colors.card} />
        ) : (
          <Btn
            label="Abrir Configurações"
            icon="settings-outline"
            onPress={() => Linking.openSettings()}
            color={colors.raspberry}
            textColor={colors.card}
          />
        )}
      </InfoCard>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const captured = await cameraRef.current.takePictureAsync();
      setPhoto(captured);
    } catch {
      alert('Erro', 'Não foi possível capturar a foto. Tente novamente.');
    }
  };

  const sendPhoto = async () => {
    if (!photo) return alert('Erro', 'Nenhuma foto capturada');
    if (!API_URL) {
      alert('Configuração ausente', 'Defina EXPO_PUBLIC_API_URL no arquivo .env para enviar a foto.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: photo.uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);
    try {
      const res = await axios.post(`${API_URL}/upload`, formData, { timeout: 15000 });
      if (isMounted.current) {
        alert('Sucesso', `Resultado: ${res.data.result}`, [{ text: 'Continuar', style: 'secondary' }]);
      }
    } catch (error) {
      const message = isAxiosError(error) ? error.message : 'Falha ao enviar imagem';
      if (isMounted.current) alert('Erro', message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card }]}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <View style={[styles.letterBadge, { backgroundColor: colors.amber }]}>
          <Text style={[styles.letterBadgeText, { color: colors.amberInk }]}>Letra {letter}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.body}>
        <View style={[styles.cameraCard, { backgroundColor: colors.card, shadowColor: colors.ink }]}>
          {!photo ? (
            <CameraView ref={cameraRef} style={styles.camera} facing="front" />
          ) : (
            <Image source={{ uri: photo.uri }} style={styles.camera} />
          )}
        </View>

        {!photo ? (
          <Btn label="Tirar Foto" icon="camera" onPress={takePhoto} color={colors.raspberry} textColor={colors.card} />
        ) : (
          <View style={styles.actionsRow}>
            <Btn
              label={loading ? 'Enviando...' : 'Enviar'}
              icon="cloud-upload-outline"
              onPress={sendPhoto}
              disabled={loading}
              color={colors.teal}
              textColor={colors.card}
            />
            <Btn
              label="Tirar Outra"
              icon="refresh-outline"
              onPress={() => setPhoto(null)}
              disabled={loading}
              variant="outline"
              color={colors.ink}
              textColor={colors.card}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  letterBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  letterBadgeText: { fontWeight: '800', fontSize: 14 },

  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 18 },
  cameraCard: {
    width: '100%',
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  camera: { width: '100%', height: '100%' },

  actionsRow: { flexDirection: 'row', gap: 10 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { fontWeight: '800', fontSize: 14 },

  centerBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  iconBubble: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  cardDesc: { fontSize: 13.5, textAlign: 'center', lineHeight: 19, maxWidth: 280, marginBottom: 8 },
});
