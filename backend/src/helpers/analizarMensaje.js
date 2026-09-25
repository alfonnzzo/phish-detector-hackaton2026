const PATRON_URL = /(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>"']*/gi;
const PATRON_EMAIL = /\b[a-z0-9._%+-]+@(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi;
const PATRON_CBU = /\b\d(?:[ -]?\d){21}\b/g;
const PATRON_ALIAS_CLAVE = /\balias(?:\s+(?:cbu|cvu))?\s*[:=-]?\s*([a-z0-9][a-z0-9.-]{4,18}[a-z0-9])/gi;
const PATRON_ALIAS_SUELTO = /(?<![\w@./-])[a-z]+(?:\.[a-z]+){2,3}(?![\w@/-]|\.[a-z])/gi;
const PATRON_TELEFONO = /(?<![\d+])(?:\+?54[ -]?)?(?:9[ -]?)?\(?0?\d{2,4}\)?[ -]?(?:15[ -]?)?\d{3,4}[ -]?\d{4}(?!\d)/g;
const PATRON_USUARIO = /(?<![\w.@])@([a-z0-9_.]{3,30})/gi;
const PUNTUACION_FINAL = /[).,;:!?]+$/;

// Terminaciones de dominio: "banco.com.ar" no es un alias.
const DOMINIOS_FINALES = new Set([
  'ar', 'com', 'net', 'org', 'gob', 'gov', 'edu', 'io', 'app', 'info', 'co', 'me', 'tv', 'xyz',
  'online', 'site', 'shop', 'store', 'club', 'biz', 'mil', 'int',
]);

const SENALES = [
  {
    codigo: 'PEDIDO_CODIGO',
    fuerte: true,
    patron: /\b(?:codigo|token|clave|pin)\b.{0,40}\b(?:verificacion|seguridad|sms|whatsapp|llego|llegar)|\b(?:pasame|pasa|enviame|envia|mandame|manda|decime|compartime)\b.{0,20}\b(?:codigo|clave|token|pin)\b/,
  },
  {
    codigo: 'URGENCIA',
    fuerte: false,
    patron: /\b(?:cuenta|tarjeta|usuario|home ?banking)\b.{0,30}\b(?:bloquead|suspendid|desactivad|inhabilitad|vencid)|\bultimo aviso\b|\bdentro de las? \d+ ?(?:h|hs|horas)\b|\bde inmediato\b|\burgente\b/,
  },
  {
    codigo: 'PREMIO',
    fuerte: false,
    patron: /\b(?:ganaste|ganador|ganadora|premio|sorteo|reintegro|beneficio exclusivo)\b/,
  },
  {
    codigo: 'PEDIDO_DINERO',
    fuerte: false,
    patron: /\b(?:transferi|transferime|transferir|deposita|depositame|abona|cambie de (?:numero|celular))\b/,
  },
];

const NIVELES = ['seguro', 'sospechoso', 'peligroso'];

export const quitarAcentos = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '');

const unicos = (valores) => [...new Set(valores)];

export const normalizarIdentificador = (tipo, valor) => {
  const texto = String(valor ?? '').trim().toLowerCase();
  if (tipo === 'cbu_cvu') return texto.replace(/\D/g, '');
  if (tipo === 'telefono') return texto.replace(/\D/g, '').slice(-10);
  if (tipo === 'usuario') return texto.replace(/^@/, '');
  return texto;
};

export const dominioDe = (url) => {
  const coincidencia = String(url).toLowerCase().match(/^(?:[a-z][a-z0-9+.-]*:\/\/)?(?:[^@/?#]*@)?([^:/?#]+)/);
  return coincidencia ? coincidencia[1].replace(/^www\./, '') : null;
};

const usuarioDeRedSocial = (valor) => {
  const partes = String(valor).toLowerCase().split(/[/?#]/).filter(Boolean);
  return (partes.at(-1) ?? '').replace(/^@/, '');
};

// Saca cada coincidencia del texto para que no la vuelva a tomar otro patron (ej: los digitos de un CBU como telefono).
const extraer = (texto, patron, alEncontrar) => {
  const encontrados = [];
  const resto = texto.replace(patron, (...coincidencia) => {
    const valor = alEncontrar(coincidencia);
    if (valor) encontrados.push(valor);
    return ' ';
  });
  return { encontrados, resto };
};

export const extraerIdentificadores = (texto) => {
  let resto = String(texto);

  const urls = extraer(resto, PATRON_URL, ([url]) => url.replace(PUNTUACION_FINAL, ''));
  resto = urls.resto;
  const emails = extraer(resto, PATRON_EMAIL, ([email]) => email.toLowerCase());
  resto = emails.resto;
  const cbus = extraer(resto, PATRON_CBU, ([cbu]) => normalizarIdentificador('cbu_cvu', cbu));
  resto = cbus.resto;
  const aliasClave = extraer(resto, PATRON_ALIAS_CLAVE, ([, alias]) => {
    const valor = alias.replace(PUNTUACION_FINAL, '').toLowerCase();
    return /[a-z]/.test(valor) ? valor : null;
  });
  resto = aliasClave.resto;
  const aliasSueltos = extraer(resto, PATRON_ALIAS_SUELTO, ([alias]) => {
    const valor = alias.toLowerCase();
    const final = valor.split('.').at(-1);
    return valor.length >= 6 && valor.length <= 20 && !DOMINIOS_FINALES.has(final) ? valor : null;
  });
  resto = aliasSueltos.resto;
  const usuarios = extraer(resto, PATRON_USUARIO, ([, usuario]) => usuario.replace(/\.+$/, '').toLowerCase());
  resto = usuarios.resto;
  const telefonos = extraer(resto, PATRON_TELEFONO, ([telefono]) => {
    const digitos = telefono.replace(/\D/g, '');
    return digitos.length >= 10 ? normalizarIdentificador('telefono', digitos) : null;
  });

  const identificadores = [
    ...unicos(cbus.encontrados).map((valor) => ({ tipo: 'cbu_cvu', valor })),
    ...unicos([...aliasClave.encontrados, ...aliasSueltos.encontrados]).map((valor) => ({ tipo: 'alias', valor })),
    ...unicos(emails.encontrados).map((valor) => ({ tipo: 'email', valor })),
    ...unicos(telefonos.encontrados).map((valor) => ({ tipo: 'telefono', valor })),
    ...unicos(usuarios.encontrados).map((valor) => ({ tipo: 'usuario', valor })),
  ];

  return { urls: unicos(urls.encontrados), identificadores };
};

export const detectarSenales = (texto) => {
  const normalizado = quitarAcentos(String(texto).toLowerCase());
  return SENALES.filter(({ patron }) => patron.test(normalizado));
};

export const institucionesMencionadas = (texto, instituciones) => {
  const normalizado = ` ${quitarAcentos(String(texto).toLowerCase()).replace(/[^a-z0-9]+/g, ' ')} `;
  return instituciones.filter((institucion) => {
    const nombre = quitarAcentos(institucion.nombre.toLowerCase()).replace(/[^a-z0-9]+/g, ' ').trim();
    return nombre && normalizado.includes(` ${nombre} `);
  });
};

// Compara un dato del mensaje ({ tipo, valor } ya normalizado, o tipo "url") con un canal oficial.
export const canalCoincide = ({ tipo, valor }, canal) => {
  const oficial = String(canal.valor).trim().toLowerCase();

  if (canal.tipo === 'cbu_cvu_alias') {
    if (tipo === 'cbu_cvu') return /^[\d -]+$/.test(oficial) && oficial.replace(/\D/g, '') === valor;
    return tipo === 'alias' && oficial === valor;
  }
  if (canal.tipo === 'telefono') {
    return tipo === 'telefono' && normalizarIdentificador('telefono', oficial) === valor;
  }
  if (canal.tipo === 'sitio_web') {
    const dominioOficial = dominioDe(oficial);
    let dominio = null;
    if (tipo === 'url') dominio = dominioDe(valor);
    if (tipo === 'email') dominio = valor.split('@')[1];
    return Boolean(dominio && dominioOficial && (dominio === dominioOficial || dominio.endsWith(`.${dominioOficial}`)));
  }
  if (canal.tipo === 'red_social') {
    return tipo === 'usuario' && usuarioDeRedSocial(oficial) === valor;
  }
  return false;
};

// Junta todo lo encontrado en el mensaje y decide el estado final. No toca la base de datos.
export const evaluarMensaje = ({ texto, reportados, instituciones, links }) => {
  const { urls, identificadores } = extraerIdentificadores(texto);
  const mencionadas = institucionesMencionadas(texto, instituciones);
  const amenazas = new Set();
  const hallazgos = [];
  let nivel = 0;
  const subir = (nuevo) => {
    nivel = Math.max(nivel, nuevo);
  };

  const candidatos = [...identificadores, ...urls.map((url) => ({ tipo: 'url', valor: url }))];

  for (const candidato of candidatos) {
    const reportado = reportados.find(({ tipo, valor }) => tipo === candidato.tipo && valor === candidato.valor);
    if (reportado) {
      hallazgos.push({ ...candidato, resultado: 'reportado', motivo: reportado.motivo ?? null });
      amenazas.add('IDENTIFICADOR_REPORTADO');
      subir(2);
      continue;
    }

    const duena = instituciones.find(({ canales }) => canales.some((canal) => canalCoincide(candidato, canal)));
    if (duena) {
      hallazgos.push({ ...candidato, resultado: 'oficial', institucion: duena.nombre });
      continue;
    }

    if (mencionadas.length > 0) {
      hallazgos.push({
        ...candidato,
        resultado: 'no_oficial',
        institucion: mencionadas.map(({ nombre }) => nombre).join(', '),
      });
      amenazas.add('CANAL_NO_OFICIAL');
      subir(1);
      continue;
    }

    hallazgos.push({ ...candidato, resultado: 'desconocido' });
  }

  for (const link of links) {
    link.amenazas.forEach((amenaza) => amenazas.add(amenaza));
    subir(NIVELES.indexOf(link.estado));
  }

  const senales = detectarSenales(texto);
  for (const senal of senales) {
    // Las senales debiles solo cuentan si el mensaje ademas trae un link o un dato para pagar o contactar.
    if (senal.fuerte || candidatos.length > 0) {
      amenazas.add(senal.codigo);
      subir(1);
    }
  }

  return {
    estado: NIVELES[nivel],
    amenazas: [...amenazas],
    hallazgos,
    links,
    senales: senales.map(({ codigo }) => codigo),
    institucionesMencionadas: mencionadas.map(({ nombre }) => nombre),
  };
};
