import 'dotenv/config';

const ENDPOINT = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

export const verificarUrls = async (urls) => {
  const respuesta = await fetch(`${ENDPOINT}?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(3000),
    body: JSON.stringify({
      client: {
        clientId: 'phish-detector-hackaton2026',
        clientVersion: '1.0.0',
      },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'UNWANTED_SOFTWARE',
          'POTENTIALLY_HARMFUL_APPLICATION',
        ],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: urls.map((url) => ({ url })),
      },
    }),
  });

  if (!respuesta.ok) {
    throw new Error(`Google Safe Browsing respondio con estado ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  return datos.matches || [];
};
