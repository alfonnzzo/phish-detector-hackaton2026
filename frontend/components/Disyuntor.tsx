import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';

import { colores } from '@/lib/tema';

const ANCHO = 184;
const ALTO = 100;
const MARGEN = 8;
const PERILLA = ALTO - MARGEN * 2;

type Props = {
  activo: boolean;
  deshabilitado?: boolean;
  onCambiar: () => void;
};

export function Disyuntor({ activo, deshabilitado, onCambiar }: Props) {
  const [progreso] = useState(() => new Animated.Value(activo ? 1 : 0));

  useEffect(() => {
    Animated.timing(progreso, {
      toValue: activo ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [activo, progreso]);

  const fondo = progreso.interpolate({
    inputRange: [0, 1],
    outputRange: [colores.apagado, colores.acento],
  });
  const desplazamiento = progreso.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ANCHO - ALTO],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Protección contra links peligrosos"
      accessibilityState={{ checked: activo, disabled: deshabilitado }}
      disabled={deshabilitado}
      hitSlop={16}
      onPress={onCambiar}
      style={({ pressed }) => ({ opacity: pressed || deshabilitado ? 0.8 : 1 })}>
      <Animated.View style={[styles.pista, { backgroundColor: fondo }]}>
        <Animated.View style={[styles.perilla, { transform: [{ translateX: desplazamiento }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pista: {
    borderRadius: ALTO / 2,
    height: ALTO,
    padding: MARGEN,
    width: ANCHO,
  },
  perilla: {
    backgroundColor: '#FFFFFF',
    borderRadius: PERILLA / 2,
    elevation: 4,
    height: PERILLA,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: PERILLA,
  },
});
