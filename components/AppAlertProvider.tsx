import { createContext, useCallback, useContext, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAlbumColors } from '@/constants/theme';

export type AlertButtonStyle = 'neutral' | 'primary' | 'secondary' | 'ghost';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
}

interface AlertRequest {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

type AlertFn = (title: string, message?: string, buttons?: AlertButton[]) => void;

const AlertContext = createContext<AlertFn | null>(null);

export function useAppAlert(): AlertFn {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAppAlert deve ser usado dentro de <AppAlertProvider>');
  return ctx;
}

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const colors = useAlbumColors();
  const [request, setRequest] = useState<AlertRequest | null>(null);

  const alert = useCallback<AlertFn>((title, message, buttons) => {
    setRequest({ title, message, buttons: buttons?.length ? buttons : [{ text: 'Entendi' }] });
  }, []);

  const close = () => setRequest(null);

  const handlePress = (button: AlertButton) => {
    close();
    button.onPress?.();
  };

  return (
    <AlertContext.Provider value={alert}>
      {children}
      <Modal visible={!!request} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: '#000' }]}>
            {request && (
              <>
                <Text style={[styles.title, { color: colors.ink }]}>{request.title}</Text>
                {request.message && (
                  <Text style={[styles.message, { color: colors.inkSoft }]}>{request.message}</Text>
                )}
                <View style={styles.actions}>
                  {request.buttons.map((button, index) => {
                    const style = button.style ?? 'neutral';
                    const fill =
                      style === 'primary' ? colors.raspberry : style === 'secondary' ? colors.teal : style === 'neutral' ? colors.ink : null;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handlePress(button)}
                        style={[styles.btn, fill ? { backgroundColor: fill } : { borderWidth: 1.4, borderColor: colors.line }]}
                      >
                        <Text style={[styles.btnText, { color: fill ? colors.card : colors.ink }]}>{button.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 22,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  title: { fontSize: 17, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 18 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  btn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, minWidth: 110, alignItems: 'center' },
  btnText: { fontWeight: '800', fontSize: 13.5 },
});
