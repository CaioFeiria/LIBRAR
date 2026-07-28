import axios, { isAxiosError } from 'axios';
import { CameraCapturedPicture, CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Image, Linking, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL } from '@/constants/api';

export default function LetterScreen() {
  const { letter } = useLocalSearchParams<{ letter: string }>();
  const router = useRouter();
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
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Letra inválida.</Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (!permission) return <Text style={styles.message}>Solicitando permissão...</Text>;

  if (!permission.granted)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>Permita o uso da câmera</Text>
        {permission.canAskAgain ? (
          <Button title="Permitir" onPress={requestPermission} />
        ) : (
          <Button title="Abrir Configurações" onPress={() => Linking.openSettings()} />
        )}
      </SafeAreaView>
    );

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const captured = await cameraRef.current.takePictureAsync();
      setPhoto(captured);
    } catch {
      Alert.alert('Erro', 'Não foi possível capturar a foto. Tente novamente.');
    }
  };

  const sendPhoto = async () => {
    if (!photo) return Alert.alert('Erro', 'Nenhuma foto capturada');
    if (!API_URL) {
      Alert.alert('Configuração ausente', 'Defina EXPO_PUBLIC_API_URL no arquivo .env para enviar a foto.');
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
      if (isMounted.current) Alert.alert('Sucesso', `Resultado: ${res.data.result}`);
    } catch (error) {
      const message = isAxiosError(error) ? error.message : 'Falha ao enviar imagem';
      if (isMounted.current) Alert.alert('Erro', message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Letra: {letter}</Text>
      {!photo ? (
        <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      ) : (
        <Image source={{ uri: photo.uri }} style={styles.preview} />
      )}
      {!photo ? (
        <Button title="Tirar Foto" onPress={takePhoto} />
      ) : (
        <>
          <Button title={loading ? 'Enviando...' : 'Enviar'} onPress={sendPhoto} disabled={loading} />
          <Button title="Tirar Outra" onPress={() => setPhoto(null)} disabled={loading} />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  message: { textAlign: 'center', fontSize: 16, margin: 20 },
  camera: { width: '100%', height: 400, borderRadius: 16, overflow: 'hidden' },
  preview: { width: 300, height: 400, borderRadius: 16, marginVertical: 20 },
});
