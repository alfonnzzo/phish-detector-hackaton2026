# Phish Detector - App

App Expo (SDK 57 + expo-router) que funciona como un disyuntor: con la protección activada,
cada link que llega a la app se revisa contra el backend (`POST /api/links/verificar`) y, si es
peligroso o sospechoso, salta un aviso a pantalla completa con la explicación de la amenaza.

## Cómo se detectan los links

| Vía                                                                                                                                                                                                                                                     | Plataforma    | Requiere                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| Navegador predeterminado: la app se registra para abrir links `http/https`. Al elegirla como navegador, todo link tocado en WhatsApp, SMS o mail pasa primero por `app/analizar.tsx`. Si es seguro se abre en el navegador real; si no, salta el aviso. | Android       | Build de desarrollo (`npx expo run:android`). Expo Go no registra el filtro de links. |
| Portapapeles: al volver a la app o al copiar, se revisa el link copiado.                                                                                                                                                                                | Android e iOS | Funciona en Expo Go. iOS pide permiso de pegado.                                      |

iOS no permite que una app de terceros intercepte links de otras apps ni leer el portapapeles en
segundo plano, así que ahí la detección es solo por portapapeles.

## Ejecutar

1. Levantar el backend (`backend/`) en el puerto 3000.
2. `npm install`
3. `npm start` y abrir en Expo Go, o `npx expo run:android` para probar la intercepción de links.

La URL del backend se toma de la IP de la PC que corre Metro. Para fijarla, copiar `.env.example`
a `.env` y completar `EXPO_PUBLIC_API_URL`.

## Estructura

- `app/index.tsx`: botón del disyuntor y estado de conexión con el servidor.
- `app/analizar.tsx`: revisa links que llegan desde otras apps.
- `app/alerta.tsx`: aviso a pantalla completa.
- `app/explicacion.tsx`: qué es la amenaza, qué pueden hacer, qué hacer si ya se abrió, recorrido de redirecciones y fuentes.
- `lib/api.ts`: cliente de todos los endpoints (incluye login e instituciones, sin pantallas todavía).
- `lib/amenazas.ts`: textos explicativos por tipo de amenaza.
