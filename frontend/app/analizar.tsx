import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useProteccion } from '@/context/Proteccion';
import { analizarLink, estadoAviso } from '@/lib/analisis';
import { abrirEnNavegador } from '@/lib/navegador';
import { colores } from '@/lib/tema';
import { dominio } from '@/lib/urls';

// Pantalla intermedia para links que llegan desde otras apps: revisa y decide si abrir o avisar.
export default function Analizar() {
  const { url } = useLocalSearchParams<{ url?: string }>();
  const { activa, cargando, mostrarAviso } = useProteccion();
  const iniciado = useRef(false);

  useEffect(() => {
    if (cargando || iniciado.current) return;
    iniciado.current = true;

    const abrir = async (destino: string) => {
      router.replace('/');
      await abrirEnNavegador(destino).catch(() => {});
    };

    const procesar = async () => {
      if (!url) {
        router.replace('/');
        return;
      }
      if (!activa) {
        await abrir(url);
        return;
      }
      const analisis = await analizarLink(url, 'enlace');
      if (estadoAviso(analisis)) {
        mostrarAviso(analisis, { reemplazar: true });
      } else {
        await abrir(url);
      }
    };

    procesar();
  }, [activa, cargando, mostrarAviso, url]);

  return (
    <View style={styles.pantalla}>
      <ActivityIndicator size="large" color={colores.acento} />
      <Text style={styles.titulo}>Revisando el link antes de abrirlo</Text>
      {url ? <Text style={styles.dominio}>{dominio(url)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    alignItems: 'center',
    backgroundColor: colores.fondo,
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  dominio: {
    color: colores.textoSuave,
    fontSize: 15,
  },
});
