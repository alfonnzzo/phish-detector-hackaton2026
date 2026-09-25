import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProteccion } from '@/context/Proteccion';
import { infoDeAnalisis } from '@/lib/amenazas';
import { EstadoAviso, estadoAviso } from '@/lib/analisis';
import { abrirEnNavegador } from '@/lib/navegador';
import { colorDeAviso, colores, fondoDeAviso } from '@/lib/tema';
import { dominio } from '@/lib/urls';

const TITULOS: Record<EstadoAviso, string> = {
  peligroso: 'Link peligroso bloqueado',
  sospechoso: 'Link sospechoso',
  sin_verificar: 'No pudimos revisar este link',
};

const ICONOS: Record<EstadoAviso, React.ComponentProps<typeof FontAwesome>['name']> = {
  peligroso: 'ban',
  sospechoso: 'exclamation-triangle',
  sin_verificar: 'question-circle',
};

const volverAlInicio = () => router.dismissTo('/');

export default function Alerta() {
  const { aviso } = useProteccion();
  const [portapapelesBorrado, setPortapapelesBorrado] = useState(false);

  if (!aviso) {
    return <Redirect href="/" />;
  }

  const estado = estadoAviso(aviso) ?? 'sospechoso';
  const color = colorDeAviso[estado];
  const infos = infoDeAnalisis(aviso);
  const dominioLink = dominio(aviso.url);
  const dominioFinal = aviso.resultado ? dominio(aviso.resultado.urlFinal) : dominioLink;

  const abrirIgual = () => {
    const abrir = () => {
      volverAlInicio();
      abrirEnNavegador(aviso.url).catch(() => {});
    };
    if (estado !== 'peligroso') {
      abrir();
      return;
    }
    Alert.alert(
      '¿Abrir un sitio peligroso?',
      'Este sitio figura en listas de amenazas. No escribas datos ni descargues nada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir igual', style: 'destructive', onPress: abrir },
      ]
    );
  };

  const borrarPortapapeles = () => {
    Clipboard.setStringAsync('')
      .then(() => setPortapapelesBorrado(true))
      .catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: fondoDeAviso[estado] }]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={[styles.icono, { borderColor: color }]}>
          <FontAwesome name={ICONOS[estado]} size={56} color={color} />
        </View>

        <Text style={[styles.titulo, { color }]}>{TITULOS[estado]}</Text>
        <Text style={styles.origen}>
          {aviso.origen === 'portapapeles'
            ? 'Lo detectamos en un link que copiaste.'
            : 'El disyuntor cortó el link antes de que se abriera.'}
        </Text>

        <View style={[styles.tarjeta, { borderColor: color }]}>
          <Text style={styles.etiqueta}>Link</Text>
          <Text style={styles.dominio} numberOfLines={2}>
            {dominioLink}
          </Text>
          {dominioFinal !== dominioLink ? (
            <>
              <Text style={[styles.etiqueta, styles.separado]}>Te llevaba a</Text>
              <Text style={[styles.dominio, { color }]} numberOfLines={2}>
                {dominioFinal}
              </Text>
            </>
          ) : null}
        </View>

        <View style={styles.resumenes}>
          {infos.map((info) => (
            <View key={info.titulo} style={styles.resumen}>
              <FontAwesome name="warning" size={16} color={color} style={styles.resumenIcono} />
              <View style={styles.resumenTexto}>
                <Text style={styles.resumenTitulo}>{info.titulo}</Text>
                <Text style={styles.resumenDetalle}>{info.resumen}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.acciones}>
        <Pressable
          style={[styles.botonPrincipal, { backgroundColor: color }]}
          onPress={() => router.push('/explicacion')}>
          <Text style={styles.botonPrincipalTexto}>
            {estado === 'peligroso' ? '¿Por qué es peligroso?' : '¿Por qué este aviso?'}
          </Text>
        </Pressable>

        <Pressable style={styles.botonSecundario} onPress={volverAlInicio}>
          <Text style={styles.botonSecundarioTexto}>Volver a un lugar seguro</Text>
        </Pressable>

        <View style={styles.accionesMenores}>
          {aviso.origen === 'portapapeles' ? (
            <Pressable onPress={borrarPortapapeles} disabled={portapapelesBorrado} hitSlop={8}>
              <Text style={styles.accionMenor}>
                {portapapelesBorrado ? 'Link borrado del portapapeles' : 'Borrar link copiado'}
              </Text>
            </Pressable>
          ) : null}
          <Pressable onPress={abrirIgual} hitSlop={8}>
            <Text style={styles.accionMenor}>Abrir de todos modos</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  contenido: {
    alignItems: 'center',
    gap: 16,
    padding: 24,
    paddingTop: 40,
  },
  icono: {
    alignItems: 'center',
    borderRadius: 60,
    borderWidth: 3,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  titulo: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  origen: {
    color: colores.texto,
    fontSize: 16,
    textAlign: 'center',
  },
  tarjeta: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  etiqueta: {
    color: colores.textoSuave,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  separado: {
    marginTop: 12,
  },
  dominio: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  resumenes: {
    alignSelf: 'stretch',
    gap: 12,
  },
  resumen: {
    flexDirection: 'row',
    gap: 12,
  },
  resumenIcono: {
    marginTop: 3,
  },
  resumenTexto: {
    flex: 1,
  },
  resumenTitulo: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '700',
  },
  resumenDetalle: {
    color: colores.textoSuave,
    fontSize: 15,
    marginTop: 2,
  },
  acciones: {
    gap: 12,
    padding: 24,
    paddingTop: 8,
  },
  botonPrincipal: {
    alignItems: 'center',
    borderRadius: 28,
    paddingVertical: 16,
  },
  botonPrincipalTexto: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '800',
  },
  botonSecundario: {
    alignItems: 'center',
    borderColor: colores.texto,
    borderRadius: 28,
    borderWidth: 1.5,
    paddingVertical: 15,
  },
  botonSecundarioTexto: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '700',
  },
  accionesMenores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  accionMenor: {
    color: colores.textoSuave,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
