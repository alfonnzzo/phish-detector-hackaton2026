import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canalCoincide,
  detectarSenales,
  evaluarMensaje,
  extraerIdentificadores,
  institucionesMencionadas,
} from './analizarMensaje.js';

const BANCO = {
  nombre: 'Banco Demo',
  canales: [
    { tipo: 'sitio_web', valor: 'https://www.bancodemo.com.ar' },
    { tipo: 'telefono', valor: '0800-555-0100' },
    { tipo: 'cbu_cvu_alias', valor: 'banco.demo.oficial' },
    { tipo: 'cbu_cvu_alias', valor: '0000000000000000000001' },
    { tipo: 'red_social', valor: 'https://instagram.com/bancodemo' },
  ],
};

const tipos = (identificadores) => identificadores.map(({ tipo, valor }) => `${tipo}:${valor}`);

test('extraerIdentificadores separa links, CBU, alias, correos, telefonos y usuarios', () => {
  const { urls, identificadores } = extraerIdentificadores(
    'Transferi al CBU 1111 2222 3333 4444 5555 66 o al alias: premio.sorteo.ya. ' +
      'Dudas a soporte@bancodemo-verificacion.com, al +54 9 11 5555-0199 o a @bancodemo_soporte. ' +
      'Entra a https://bancodemo.com.ar/login, www.otro.com y bit.ly/abc123.'
  );

  assert.deepEqual(urls, ['https://bancodemo.com.ar/login', 'www.otro.com', 'bit.ly/abc123']);
  assert.deepEqual(tipos(identificadores), [
    'cbu_cvu:1111222233334444555566',
    'alias:premio.sorteo.ya',
    'email:soporte@bancodemo-verificacion.com',
    'telefono:1155550199',
    'usuario:bancodemo_soporte',
  ]);
});

test('extraerIdentificadores no confunde dominios, montos ni fechas', () => {
  const { identificadores } = extraerIdentificadores(
    'Pagaste $150000 el 25-09-2026 en banco.com.ar, gracias. Hola... como estas?'
  );
  assert.deepEqual(identificadores, []);
});

test('extraerIdentificadores toma alias sueltos con tres palabras', () => {
  const { identificadores } = extraerIdentificadores('mandalo a casa.perro.luna porfa');
  assert.deepEqual(tipos(identificadores), ['alias:casa.perro.luna']);
});

test('canalCoincide compara cada tipo con su canal oficial', () => {
  const [web, telefono, alias, cbu, red] = BANCO.canales;
  assert.equal(canalCoincide({ tipo: 'url', valor: 'https://app.bancodemo.com.ar/x' }, web), true);
  assert.equal(canalCoincide({ tipo: 'url', valor: 'https://bancodemo.com.ar.estafa.xyz' }, web), false);
  assert.equal(canalCoincide({ tipo: 'email', valor: 'ayuda@bancodemo.com.ar' }, web), true);
  assert.equal(canalCoincide({ tipo: 'telefono', valor: '8005550100' }, telefono), true);
  assert.equal(canalCoincide({ tipo: 'alias', valor: 'banco.demo.oficial' }, alias), true);
  assert.equal(canalCoincide({ tipo: 'cbu_cvu', valor: '0000000000000000000001' }, cbu), true);
  assert.equal(canalCoincide({ tipo: 'cbu_cvu', valor: '0000000000000000000001' }, alias), false);
  assert.equal(canalCoincide({ tipo: 'usuario', valor: 'bancodemo' }, red), true);
});

test('institucionesMencionadas ignora mayusculas y acentos', () => {
  const instituciones = [BANCO, { nombre: 'Banco Nación', canales: [] }];
  assert.deepEqual(
    institucionesMencionadas('Mensaje del BANCO NACION: tu cuenta', instituciones).map(({ nombre }) => nombre),
    ['Banco Nación']
  );
  assert.deepEqual(institucionesMencionadas('Banco Demostracion', instituciones), []);
});

test('detectarSenales reconoce pedidos de codigo y urgencia', () => {
  const codigos = (texto) => detectarSenales(texto).map(({ codigo }) => codigo);
  assert.deepEqual(codigos('Hola, te llegó un código por SMS, pasame el código porfa'), ['PEDIDO_CODIGO']);
  assert.deepEqual(codigos('Tu cuenta fue bloqueada, último aviso'), ['URGENCIA']);
  assert.deepEqual(codigos('Nos vemos mañana'), []);
});

test('evaluarMensaje marca peligroso un identificador reportado', () => {
  const resultado = evaluarMensaje({
    texto: 'Ganaste! Transferi el envio al alias premio.sorteo.ya',
    reportados: [{ tipo: 'alias', valor: 'premio.sorteo.ya', motivo: 'Falsos premios' }],
    instituciones: [BANCO],
    links: [],
  });

  assert.equal(resultado.estado, 'peligroso');
  assert.deepEqual(resultado.amenazas, ['IDENTIFICADOR_REPORTADO', 'PREMIO', 'PEDIDO_DINERO']);
  assert.deepEqual(resultado.hallazgos, [
    { tipo: 'alias', valor: 'premio.sorteo.ya', resultado: 'reportado', motivo: 'Falsos premios' },
  ]);
});

test('evaluarMensaje marca sospechoso un canal que no es de la institucion mencionada', () => {
  const resultado = evaluarMensaje({
    texto: 'Banco Demo: regularice su deuda al alias pago.deuda.hoy o llame al 11 4444-3333',
    reportados: [],
    instituciones: [BANCO],
    links: [],
  });

  assert.equal(resultado.estado, 'sospechoso');
  assert.deepEqual(resultado.amenazas, ['CANAL_NO_OFICIAL']);
  assert.deepEqual(resultado.institucionesMencionadas, ['Banco Demo']);
  assert.deepEqual(
    resultado.hallazgos.map(({ tipo, resultado: r }) => `${tipo}:${r}`),
    ['alias:no_oficial', 'telefono:no_oficial']
  );
});

test('evaluarMensaje deja seguro un mensaje con canales oficiales', () => {
  const resultado = evaluarMensaje({
    texto: 'Banco Demo: consultas al 0800-555-0100 o en https://bancodemo.com.ar',
    reportados: [],
    instituciones: [BANCO],
    links: [{ url: 'https://bancodemo.com.ar', estado: 'seguro', amenazas: [], fuentes: [] }],
  });

  assert.equal(resultado.estado, 'seguro');
  assert.deepEqual(resultado.amenazas, []);
  assert.deepEqual(
    resultado.hallazgos.map(({ resultado: r, institucion }) => `${r}:${institucion}`),
    ['oficial:Banco Demo', 'oficial:Banco Demo']
  );
});

test('evaluarMensaje toma el peor estado de los links y las senales fuertes solas', () => {
  const conLink = evaluarMensaje({
    texto: 'mira esto https://phish.example/login',
    reportados: [],
    instituciones: [],
    links: [{ url: 'https://phish.example/login', estado: 'peligroso', amenazas: ['SOCIAL_ENGINEERING'], fuentes: [] }],
  });
  assert.equal(conLink.estado, 'peligroso');
  assert.deepEqual(conLink.amenazas, ['SOCIAL_ENGINEERING']);

  const pedidoCodigo = evaluarMensaje({
    texto: 'Me pasas el codigo de verificacion que te llego?',
    reportados: [],
    instituciones: [],
    links: [],
  });
  assert.equal(pedidoCodigo.estado, 'sospechoso');
  assert.deepEqual(pedidoCodigo.amenazas, ['PEDIDO_CODIGO']);

  const premioSolo = evaluarMensaje({ texto: 'Ganaste el partido!', reportados: [], instituciones: [], links: [] });
  assert.equal(premioSolo.estado, 'seguro');
  assert.deepEqual(premioSolo.senales, ['PREMIO']);
});
