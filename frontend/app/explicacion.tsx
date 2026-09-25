import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProteccion } from '@/context/Proteccion';
import { FUENTES, SENALES, infoDeAnalisis } from '@/lib/amenazas';
import { estadoAviso } from '@/lib/analisis';
import { colorDeAviso, colores } from '@/lib/tema';
import { dominio } from '@/lib/urls';

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

function Lista({ items, color }: { items: string[]; color: string }) {
  return (
    <View style={styles.lista}>
      {items.map((item) => (
        <View key={item} style={styles.item}>
          <View style={[styles.vineta, { backgroundColor: color }]} />
          <Text style={styles.itemTexto}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Explicacion() {
  const { aviso } = useProteccion();

  if (!aviso) {
    return <Redirect href="/" />;
  }

  const estado = estadoAviso(aviso) ?? 'sospechoso';
  const color = colorDeAviso[estado];
  const infos = infoDeAnalisis(aviso);
  const resultado = aviso.resultado;
  const dominioLink = dominio(aviso.url);
  const dominioFinal = resultado ? dominio(resultado.urlFinal) : dominioLink;
  const fuentes = resultado?.fuentes ?? [];

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Volver">
          <FontAwesome name="chevron-left" size={20} color={colores.texto} />
        </Pressable>
        <Text style={styles.encabezadoTitulo}>Qué encontramos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={[styles.insignia, { borderColor: color }]}>
          <Text style={[styles.insigniaTexto, { color }]}>{dominioLink}</Text>
        </View>

        {infos.map((info) => (
          <View key={info.titulo} style={[styles.tarjeta, { borderLeftColor: color }]}>
            <Text style={styles.tarjetaTitulo}>{info.titulo}</Text>
            <Text style={styles.parrafo}>{info.explicacion}</Text>

            <Text style={styles.subtitulo}>Qué pueden hacer con vos</Text>
            <Lista items={info.riesgos} color={color} />

            <Text style={styles.subtitulo}>Si ya lo abriste</Text>
            <Lista items={info.siYaLoAbriste} color={colores.seguro} />
          </View>
        ))}

        {resultado ? (
          <Seccion titulo="Recorrido del link">
            {dominioFinal !== dominioLink ? (
              <Text style={styles.parrafo}>
                El link mostraba <Text style={styles.resaltado}>{dominioLink}</Text> pero te llevaba
                a <Text style={[styles.resaltado, { color }]}>{dominioFinal}</Text>. Cambiar de
                dominio a escondidas es una técnica común para engañar.
              </Text>
            ) : null}
            {resultado.saltos.map((salto, indice) => (
              <View key={`${indice}-${salto}`} style={styles.salto}>
                <Text style={[styles.saltoNumero, { color }]}>{indice + 1}</Text>
                <Text style={styles.saltoUrl} numberOfLines={3}>
                  {salto}
                </Text>
              </View>
            ))}
            {!resultado.redireccionCompleta ? (
              <Text style={styles.nota}>
                No pudimos seguir el recorrido completo: el destino real puede ser otro.
              </Text>
            ) : null}
          </Seccion>
        ) : null}

        {estado === 'peligroso' ? (
          <Seccion titulo="Quién lo detectó">
            {fuentes.length > 0 ? (
              fuentes.map((codigo) => (
                <View key={codigo} style={styles.fuente}>
                  <Text style={styles.fuenteNombre}>{FUENTES[codigo]?.nombre ?? codigo}</Text>
                  {FUENTES[codigo] ? (
                    <Text style={styles.parrafo}>{FUENTES[codigo].descripcion}</Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.parrafo}>
                Lo detectó el análisis de redirecciones de Phish Detector.
              </Text>
            )}
          </Seccion>
        ) : null}

        <Seccion titulo="Cómo reconocerlo la próxima vez">
          <Lista items={SENALES} color={colores.acento} />
        </Seccion>
      </ScrollView>

      <View style={styles.acciones}>
        <Pressable style={styles.boton} onPress={() => router.dismissTo('/')}>
          <Text style={styles.botonTexto}>Entendido</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.fondo,
    flex: 1,
  },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  encabezadoTitulo: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '800',
  },
  contenido: {
    gap: 20,
    padding: 20,
  },
  insignia: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  insigniaTexto: {
    fontSize: 15,
    fontWeight: '700',
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderLeftWidth: 4,
    borderRadius: 16,
    gap: 10,
    padding: 18,
  },
  tarjetaTitulo: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitulo: {
    color: colores.texto,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  parrafo: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22,
  },
  resaltado: {
    color: colores.texto,
    fontWeight: '700',
  },
  lista: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    gap: 10,
  },
  vineta: {
    borderRadius: 3,
    height: 6,
    marginTop: 8,
    width: 6,
  },
  itemTexto: {
    color: colores.textoSuave,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  seccion: {
    gap: 10,
  },
  seccionTitulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '800',
  },
  salto: {
    backgroundColor: colores.superficie,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  saltoNumero: {
    fontSize: 15,
    fontWeight: '800',
  },
  saltoUrl: {
    color: colores.texto,
    flex: 1,
    fontSize: 13,
  },
  nota: {
    color: colores.sospechoso,
    fontSize: 14,
  },
  fuente: {
    backgroundColor: colores.superficie,
    borderRadius: 12,
    gap: 4,
    padding: 14,
  },
  fuenteNombre: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '700',
  },
  acciones: {
    padding: 20,
    paddingTop: 8,
  },
  boton: {
    alignItems: 'center',
    backgroundColor: colores.texto,
    borderRadius: 28,
    paddingVertical: 16,
  },
  botonTexto: {
    color: colores.fondo,
    fontSize: 17,
    fontWeight: '800',
  },
});
