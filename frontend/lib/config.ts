import Constants from 'expo-constants';

// En desarrollo, hostUri tiene la IP LAN de la PC que corre Metro (ej: "192.168.0.10:8081").
// El backend corre en la misma PC, asi que se reutiliza esa IP con el puerto 3000.
const ipDeLaPc = Constants.expoConfig?.hostUri?.split(':')[0];

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (ipDeLaPc ? `http://${ipDeLaPc}:3000/api` : 'http://10.0.2.2:3000/api');
