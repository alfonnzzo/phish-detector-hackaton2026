import { Analisis, estadoAviso } from './analisis';

export type InfoAmenaza = {
  titulo: string;
  resumen: string;
  explicacion: string;
  riesgos: string[];
  siYaLoAbriste: string[];
};

const AMENAZAS: Record<string, InfoAmenaza> = {
  SOCIAL_ENGINEERING: {
    titulo: 'Phishing: sitio falso para robar datos',
    resumen: 'Se hace pasar por un sitio conocido para robarte datos.',
    explicacion:
      'Es una página falsa que imita a un banco, una billetera virtual, una red social, un organismo público o una tienda. Copia logos y colores para que escribas tus datos creyendo que estás en el sitio real.',
    riesgos: [
      'Robo de usuario y contraseña.',
      'Robo de datos de tarjeta, CBU o claves de home banking.',
      'Robo de códigos de verificación (SMS o WhatsApp) para quedarse con tus cuentas.',
      'Pedidos de pagos o transferencias para "desbloquear" una cuenta o cobrar un premio.',
    ],
    siYaLoAbriste: [
      'Si escribiste una contraseña, cambiala ya desde la app o el sitio oficial, nunca desde el link.',
      'Si diste datos de tarjeta o bancarios, llamá a tu banco al número que figura en la tarjeta y pedí bloquearla.',
      'Activá la verificación en dos pasos en WhatsApp, mail y redes sociales.',
      'No compartas códigos que te lleguen por SMS: ninguna empresa te los pide.',
    ],
  },
  MALWARE: {
    titulo: 'Malware: programa malicioso',
    resumen: 'Intenta instalar un programa dañino en tu teléfono.',
    explicacion:
      'El sitio distribuye archivos o aplicaciones maliciosas. Suelen presentarse como una actualización, un comprobante, una foto o una app "necesaria" para ver el contenido. Una vez instalados, toman control de partes del teléfono.',
    riesgos: [
      'Leer tus SMS y códigos de verificación.',
      'Robar contraseñas y datos bancarios mientras usás otras apps.',
      'Mostrar pantallas falsas encima de la app de tu banco.',
      'Espiar mensajes, fotos y contactos.',
    ],
    siYaLoAbriste: [
      'No abras ni instales ningún archivo que se haya descargado (APK, PDF, ZIP).',
      'Revisá las apps instaladas y desinstalá cualquiera que no reconozcas.',
      'Quitale los permisos de accesibilidad y de administrador a las apps que no conozcas.',
      'Si instalaste algo, cambiá tus contraseñas desde otro dispositivo y avisale a tu banco.',
    ],
  },
  UNWANTED_SOFTWARE: {
    titulo: 'Software no deseado',
    resumen: 'Ofrece programas que hacen cosas sin tu permiso.',
    explicacion:
      'El sitio ofrece programas que parecen útiles pero esconden funciones que no pediste: cambian la configuración del navegador, llenan el teléfono de publicidad o juntan tus datos para venderlos.',
    riesgos: [
      'Publicidad invasiva y redirecciones a otros sitios peligrosos.',
      'Recolección de datos personales y de navegación.',
      'Teléfono más lento y con menos batería.',
    ],
    siYaLoAbriste: [
      'No instales nada de ese sitio.',
      'Si instalaste algo, desinstalalo y revisá la configuración del navegador.',
    ],
  },
  POTENTIALLY_HARMFUL_APPLICATION: {
    titulo: 'Aplicación potencialmente dañina',
    resumen: 'Distribuye apps peligrosas fuera de las tiendas oficiales.',
    explicacion:
      'El sitio ofrece aplicaciones para instalar por fuera de Google Play o App Store. Esas apps no pasaron ningún control y muchas se hacen pasar por apps de bancos, delivery o gobierno.',
    riesgos: [
      'Acceso a tus mensajes, contactos y cámara.',
      'Robo de datos bancarios.',
      'Suscripciones o cobros que no autorizaste.',
    ],
    siYaLoAbriste: [
      'Instalá apps solo desde Google Play o App Store.',
      'Si instalaste la app, desinstalala y revisá los permisos que le diste.',
    ],
  },
  DIRECCION_INTERNA: {
    titulo: 'Apunta a tu red interna',
    resumen: 'Lleva a equipos de tu red local, no a un sitio de Internet.',
    explicacion:
      'El link, o alguna de sus redirecciones, lleva a una dirección privada, como la de tu router o la de otros equipos de tu casa o trabajo. Un sitio legítimo no tiene motivos para mandarte ahí.',
    riesgos: [
      'Cambiar la configuración de tu router para redirigirte a sitios falsos.',
      'Atacar cámaras, impresoras u otros dispositivos conectados a tu red.',
    ],
    siYaLoAbriste: [
      'Cambiá la contraseña de administración del router si todavía es la de fábrica.',
      'Si sitios conocidos empiezan a verse raros, reiniciá el router y revisá su configuración.',
    ],
  },
};

const SOSPECHOSO: InfoAmenaza = {
  titulo: 'No se pudo confirmar que sea seguro',
  resumen: 'No figura en listas de amenazas, pero no pudimos revisarlo completo.',
  explicacion:
    'Este link no aparece en las listas de sitios peligrosos, pero no pudimos seguir todo su recorrido o uno de los servicios de verificación no respondió. Los estafadores usan acortadores y varias redirecciones para esconder el destino real, y los sitios nuevos todavía no figuran en ninguna lista.',
  riesgos: [
    'Puede ser un sitio de phishing recién creado.',
    'El destino final puede ser distinto al que muestra el link.',
  ],
  siYaLoAbriste: [
    'No escribas contraseñas, datos de tarjeta ni códigos en ese sitio.',
    'Si te pidió datos, entrá al sitio oficial escribiendo la dirección a mano y verificá ahí.',
  ],
};

const SIN_VERIFICAR: InfoAmenaza = {
  titulo: 'No pudimos revisar este link',
  resumen: 'El servidor de verificación no respondió.',
  explicacion:
    'No pudimos consultar si este link es peligroso. Eso no significa que sea seguro: por las dudas lo frenamos hasta que se pueda verificar.',
  riesgos: ['Si el link es malicioso, nada te va a advertir al abrirlo.'],
  siYaLoAbriste: [
    'No escribas datos personales ni bancarios.',
    'Probá de nuevo en unos minutos con conexión a Internet.',
  ],
};

const desconocida = (codigo: string): InfoAmenaza => ({
  titulo: `Amenaza detectada (${codigo})`,
  resumen: 'Figura en una lista de sitios peligrosos.',
  explicacion: 'Una fuente de seguridad marcó este sitio como peligroso.',
  riesgos: ['Robo de datos o instalación de programas maliciosos.'],
  siYaLoAbriste: ['No escribas datos ni descargues archivos desde ese sitio.'],
});

export const infoDeAnalisis = (analisis: Analisis): InfoAmenaza[] => {
  if (estadoAviso(analisis) === 'sin_verificar') return [SIN_VERIFICAR];
  const amenazas = analisis.resultado?.amenazas ?? [];
  if (amenazas.length === 0) return [SOSPECHOSO];
  return amenazas.map((codigo) => AMENAZAS[codigo] ?? desconocida(codigo));
};

export const FUENTES: Record<string, { nombre: string; descripcion: string }> = {
  GOOGLE_SAFE_BROWSING: {
    nombre: 'Google Safe Browsing',
    descripcion:
      'Base de Google de sitios de phishing y malware, la misma que usan Chrome y Android.',
  },
  OPENPHISH: {
    nombre: 'OpenPhish',
    descripcion: 'Lista abierta de sitios de phishing activos, actualizada cada hora.',
  },
  URLHAUS: {
    nombre: 'URLhaus (abuse.ch)',
    descripcion: 'Lista de links que están distribuyendo malware en este momento.',
  },
};

export const SENALES = [
  'El dominio tiene letras cambiadas o agregadas (ej: rnercadopago.com, bancoo-nacion.com).',
  'Te apura: "tu cuenta se bloquea hoy", "último aviso", "premio por tiempo limitado".',
  'Llega por WhatsApp o SMS desde un número desconocido.',
  'Usa acortadores (bit.ly, tinyurl) para esconder el destino.',
  'Te pide contraseñas, códigos de verificación o datos de tarjeta.',
  'Te pide instalar una app o un archivo fuera de la tienda oficial.',
];
