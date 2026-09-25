import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { conProtocolo } from './urls';

// Si la app es el navegador predeterminado, Linking.openURL volveria a abrirla en bucle.
// Por eso se abre en una pestana de un navegador real (Chrome, Firefox, etc.).
export const abrirEnNavegador = async (url: string) => {
  let browserPackage: string | undefined;
  if (Platform.OS === 'android') {
    try {
      const { preferredBrowserPackage, servicePackages } =
        await WebBrowser.getCustomTabsSupportingBrowsersAsync();
      browserPackage = preferredBrowserPackage ?? servicePackages[0];
    } catch {
      browserPackage = undefined;
    }
  }
  await WebBrowser.openBrowserAsync(conProtocolo(url), { browserPackage });
};
