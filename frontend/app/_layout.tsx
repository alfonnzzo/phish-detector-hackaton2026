import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { VigilantePortapapeles } from '@/components/VigilantePortapapeles';
import { ProteccionProvider } from '@/context/Proteccion';
import { colores } from '@/lib/tema';

export const unstable_settings = {
  // Si la app se abre desde un link, el inicio queda debajo para poder volver.
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <ProteccionProvider>
      <StatusBar style="light" />
      <VigilantePortapapeles />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.fondo },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="analizar" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="alerta"
          options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="explicacion" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </ProteccionProvider>
  );
}
