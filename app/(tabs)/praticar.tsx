import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlbumColors } from '@/constants/theme';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function PraticarScreen() {
  const router = useRouter();
  const colors = useAlbumColors();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.paper }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.ink }]}>Prática livre</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Escolha qualquer letra para treinar o sinal na câmera, sem depender da ordem do álbum.
        </Text>
        <View style={styles.grid}>
          {ALPHABET.map((letter) => (
            <TouchableOpacity
              key={letter}
              style={[styles.button, { backgroundColor: colors.teal }]}
              onPress={() => router.push({ pathname: '/letter/[letter]', params: { letter } })}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  subtitle: { fontSize: 13.5, textAlign: 'center', maxWidth: 280, marginTop: 6, marginBottom: 18, lineHeight: 19 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  button: { width: 56, height: 56, margin: 8, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 22, fontWeight: '800' },
});
