import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarUrl, resolverUrl } from './resolverUrl.js';

test('normalizarUrl agrega http cuando falta y rechaza otros protocolos', () => {
  assert.equal(normalizarUrl('ejemplo.com/ruta').href, 'http://ejemplo.com/ruta');
  assert.equal(normalizarUrl('ftp://ejemplo.com'), null);
  assert.equal(normalizarUrl('javascript:alert(1)'), null);
  assert.equal(normalizarUrl('file:///etc/passwd'), null);
  assert.equal(normalizarUrl('no es una url'), null);
});

test('resolverUrl bloquea direcciones internas sin conectarse', async () => {
  const internas = [
    'http://127.0.0.1:3000/api/health',
    'http://localhost:3000',
    'http://[::1]',
    'http://2130706433',
    'http://0x7f.1',
    'http://[::ffff:127.0.0.1]',
    'http://169.254.169.254/latest/meta-data',
    'http://10.0.0.1',
    'http://172.16.5.4',
    'http://192.168.0.1',
    'http://0.0.0.0',
  ];

  for (const direccion of internas) {
    const { interna } = await resolverUrl(normalizarUrl(direccion));
    assert.equal(interna, true, direccion);
  }
});
