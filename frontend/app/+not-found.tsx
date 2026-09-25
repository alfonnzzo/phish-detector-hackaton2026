import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colores } from '@/lib/tema';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrada' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Esta pantalla no existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colores.fondo,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    paddingVertical: 16,
  },
  linkText: {
    color: colores.acento,
    fontSize: 14,
  },
});
