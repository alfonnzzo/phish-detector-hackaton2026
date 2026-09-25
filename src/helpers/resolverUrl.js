import dns from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';

const MAX_SALTOS = 5;
const TIEMPO_TOTAL_MS = 4000;
const PROTOCOLOS = ['http:', 'https:'];

const redesInternas = new net.BlockList();
redesInternas.addSubnet('0.0.0.0', 8);
redesInternas.addSubnet('10.0.0.0', 8);
redesInternas.addSubnet('100.64.0.0', 10);
redesInternas.addSubnet('127.0.0.0', 8);
redesInternas.addSubnet('169.254.0.0', 16);
redesInternas.addSubnet('172.16.0.0', 12);
redesInternas.addSubnet('192.168.0.0', 16);
redesInternas.addSubnet('224.0.0.0', 3);
redesInternas.addAddress('::', 'ipv6');
redesInternas.addAddress('::1', 'ipv6');
redesInternas.addSubnet('fc00::', 7, 'ipv6');
redesInternas.addSubnet('fe80::', 10, 'ipv6');

const esInterna = (direccion) =>
  redesInternas.check(direccion, net.isIPv6(direccion) ? 'ipv6' : 'ipv4');

const lookupSeguro = (hostname, opciones, callback) => {
  dns.lookup(hostname, { ...opciones, all: true }, (error, direcciones) => {
    if (error) return callback(error);
    if (direcciones.some(({ address }) => esInterna(address))) {
      return callback(Object.assign(new Error('Direccion interna bloqueada'), { code: 'DIRECCION_INTERNA' }));
    }
    if (opciones.all) return callback(null, direcciones);
    callback(null, direcciones[0].address, direcciones[0].family);
  });
};

const pedirSalto = (url, senal) =>
  new Promise((resolve, reject) => {
    const cliente = url.protocol === 'https:' ? https : http;
    const pedido = cliente.request(url, {
      method: 'HEAD',
      lookup: lookupSeguro,
      signal: senal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile)' },
    }, (respuesta) => {
      respuesta.destroy();
      resolve({ estado: respuesta.statusCode, destino: respuesta.headers.location });
    });
    pedido.on('error', reject);
    pedido.end();
  });

export const normalizarUrl = (entrada) => {
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(entrada) ? entrada : `http://${entrada}`);
    return PROTOCOLOS.includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
};

export const resolverUrl = async (inicial) => {
  const saltos = [inicial.href];
  const senal = AbortSignal.timeout(TIEMPO_TOTAL_MS);
  let url = inicial;

  try {
    for (let i = 0; i < MAX_SALTOS; i++) {
      const host = url.hostname.replace(/^\[|\]$/g, '');
      if (net.isIP(host) && esInterna(host)) {
        return { saltos, completa: false, interna: true };
      }

      const { estado, destino } = await pedirSalto(url, senal);
      if (estado < 300 || estado >= 400 || !destino) {
        return { saltos, completa: estado >= 200 && estado < 300, interna: false };
      }

      url = new URL(destino, url);
      if (!PROTOCOLOS.includes(url.protocol)) {
        return { saltos, completa: false, interna: false };
      }
      saltos.push(url.href);
    }
  } catch (error) {
    return { saltos, completa: false, interna: error.code === 'DIRECCION_INTERNA' };
  }

  return { saltos, completa: false, interna: false };
};
