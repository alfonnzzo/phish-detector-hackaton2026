import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Disyuntor } from '@/components/Disyuntor';
import { useProteccion } from '@/context/Proteccion';
import { estadoServidor } from '@/lib/api';
import { colores } from '@/lib/tema';

type Conexion = 'revisando' | 'conectado' | 'sin_conexion';

const abrirAjustesDeNavegador = () =>
  Linking.sendIntent('android.settings.MANAGE_DEFAULT_APPS_SETTINGS').catch(() =>
    Linking.openSettings()
  );

export default function Inicio() {
  const { activa, cargando, alternar } = useProteccion();
  const [conexion, setConexion] = useState<Conexion>('revisando');

  const revisarConexion = useCallback(() => {
    estadoServidor()
      .then(() => setConexion('conectado'))
      .catch(() => setConexion('sin_conexion'));
  }, []);

  useEffect(() => {
    revisarConexion();
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') revisarConexion();
    });
    return () => suscripcion.remove();
  }, [revisarConexion]);

  const sinServidor = activa && conexion === 'sin_conexion';

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.marca}>
        <Text style={styles.marcaTitulo}>Phish Detector</Text>
        <Text style={styles.marcaSubtitulo}>Hackatón 2026</Text>
      </View>

      <View style={styles.centro}>
        <Text style={[styles.titulo, { color: activa ? colores.acento : colores.apagado }]}>
          DISYUNTOR
        </Text>

        <Disyuntor activo={activa} deshabilitado={cargando} onCambiar={alternar} />

        <Text style={[styles.estado, { color: activa ? colores.acento : colores.textoSuave }]}>
          {activa ? 'Protegido' : 'Desprotegido'}
        </Text>
        <Text style={styles.descripcion}>
          {activa
            ? 'Revisamos cada link antes de que lo abras.'
            : 'Los links se abren sin revisar.'}
        </Text>

        <Pressable style={styles.conexion} onPress={revisarConexion} hitSlop={8}>
          <View
            style={[
              styles.punto,
              {
                backgroundColor:
                  conexion === 'conectado'
                    ? colores.seguro
                    : conexion === 'sin_conexion'
                      ? colores.peligroso
                      : colores.apagado,
              },
            ]}
          />
          <Text style={[styles.conexionTexto, sinServidor && { color: colores.peligroso }]}>
            {conexion === 'conectado'
              ? 'Servidor de verificación conectado'
              : conexion === 'sin_conexion'
                ? 'Sin conexión con el servidor: tocá para reintentar'
                : 'Conectando con el servidor...'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitulo}>Cómo te protege</Text>
        {Platform.OS === 'android' ? (
          <>
            <Text style={styles.panelTexto}>
              Elegí Phish Detector como navegador predeterminado: cada link que toques en WhatsApp,
              SMS o mail pasa primero por acá.
            </Text>
            <Pressable style={styles.panelBoton} onPress={abrirAjustesDeNavegador}>
              <FontAwesome name="cog" size={16} color={colores.fondo} />
              <Text style={styles.panelBotonTexto}>Elegir navegador predeterminado</Text>
            </Pressable>
          </>
        ) : null}
        <Text style={styles.panelTexto}>
          Copiá cualquier link que te llegue y volvé a la app: si es peligroso, salta el aviso.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.fondo,
    flex: 1,
  },
  marca: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  marcaTitulo: {
    color: colores.texto,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  marcaSubtitulo: {
    color: colores.texto,
    fontSize: 15,
    fontWeight: '600',
  },
  centro: {
    alignItems: 'center',
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titulo: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 24,
  },
  estado: {
    fontSize: 28,
    fontWeight: '700',
  },
  descripcion: {
    color: colores.texto,
    fontSize: 17,
    textAlign: 'center',
  },
  conexion: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  punto: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  conexionTexto: {
    color: colores.textoSuave,
    fontSize: 13,
  },
  panel: {
    backgroundColor: colores.superficie,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 12,
    padding: 24,
    paddingBottom: 32,
  },
  panelTitulo: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '800',
  },
  panelTexto: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 21,
  },
  panelBoton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colores.texto,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  panelBotonTexto: {
    color: colores.fondo,
    fontSize: 14,
    fontWeight: '700',
  },
});
