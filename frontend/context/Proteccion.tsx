import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Vibration } from 'react-native';

import { Analisis } from '@/lib/analisis';

const CLAVE_ACTIVA = 'proteccion_activa';
const PATRON_VIBRACION = [0, 250, 120, 250];

type ValorProteccion = {
  activa: boolean;
  cargando: boolean;
  alternar: () => void;
  aviso: Analisis | null;
  mostrarAviso: (analisis: Analisis, opciones?: { reemplazar?: boolean }) => void;
};

const ProteccionContext = createContext<ValorProteccion | null>(null);

export function ProteccionProvider({ children }: { children: React.ReactNode }) {
  const [activa, setActiva] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState<Analisis | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(CLAVE_ACTIVA)
      .then((valor) => setActiva(valor !== 'false'))
      .catch(() => setActiva(true))
      .finally(() => setCargando(false));
  }, []);

  const alternar = useCallback(() => {
    setActiva((actual) => {
      const nueva = !actual;
      SecureStore.setItemAsync(CLAVE_ACTIVA, String(nueva)).catch(() => {});
      return nueva;
    });
  }, []);

  const mostrarAviso = useCallback(
    (analisis: Analisis, { reemplazar = false }: { reemplazar?: boolean } = {}) => {
      setAviso(analisis);
      Vibration.vibrate(PATRON_VIBRACION);
      if (reemplazar) {
        router.replace('/alerta');
      } else {
        router.push('/alerta');
      }
    },
    []
  );

  const valor = useMemo(
    () => ({ activa, cargando, alternar, aviso, mostrarAviso }),
    [activa, cargando, alternar, aviso, mostrarAviso]
  );

  return <ProteccionContext.Provider value={valor}>{children}</ProteccionContext.Provider>;
}

export function useProteccion() {
  const valor = useContext(ProteccionContext);
  if (!valor) {
    throw new Error('useProteccion debe usarse dentro de ProteccionProvider');
  }
  return valor;
}
