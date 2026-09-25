import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useProteccion } from '@/context/Proteccion';
import { analizarLink, estadoAviso } from '@/lib/analisis';
import { extraerUrl } from '@/lib/urls';

// Android solo deja leer el portapapeles con la app en foco, que llega un instante despues de "active".
const ESPERA_FOCO_MS = 400;

// Revisa los links copiados cada vez que la app vuelve al frente o cambia el portapapeles.
export function VigilantePortapapeles() {
  const { activa, mostrarAviso } = useProteccion();
  const ultimoTexto = useRef<string | null>(null);
  const revisando = useRef(false);

  const revisar = useCallback(async () => {
    if (revisando.current) return;
    revisando.current = true;
    try {
      // hasStringAsync no dispara el permiso de pegado de iOS; getStringAsync si.
      if (!(await Clipboard.hasStringAsync())) return;
      const texto = await Clipboard.getStringAsync();
      if (!texto || texto === ultimoTexto.current) return;
      ultimoTexto.current = texto;

      const url = extraerUrl(texto);
      if (!url) return;

      const analisis = await analizarLink(url, 'portapapeles');
      // Sin servidor no se avisa: el estado de conexion ya se muestra en la pantalla principal.
      if (analisis.resultado && estadoAviso(analisis)) {
        mostrarAviso(analisis);
      }
    } catch {
      // El portapapeles puede no estar disponible (app en segundo plano, permiso denegado).
    } finally {
      revisando.current = false;
    }
  }, [mostrarAviso]);

  useEffect(() => {
    if (!activa) return;

    let temporizador = setTimeout(revisar, ESPERA_FOCO_MS);
    const suscripcionApp = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        clearTimeout(temporizador);
        temporizador = setTimeout(revisar, ESPERA_FOCO_MS);
      }
    });
    const suscripcionPortapapeles = Clipboard.addClipboardListener(() => revisar());

    return () => {
      clearTimeout(temporizador);
      suscripcionApp.remove();
      suscripcionPortapapeles.remove();
    };
  }, [activa, revisar]);

  return null;
}
