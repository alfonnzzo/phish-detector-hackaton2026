import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buscarEnListas, cargarLista } from './listasAmenazas.js';

test('buscarEnListas encuentra urls cargadas y descarta las que no estan', () => {
  cargarLista('OPENPHISH', 'https://phish.example/login?x=1\r\nhttps://otro.example/\n# comentario\n\n');
  cargarLista('URLHAUS', 'http://1.2.3.4:5555/bin.sh\n');

  const openphish = [{ fuente: 'OPENPHISH', amenaza: 'SOCIAL_ENGINEERING' }];
  assert.deepEqual(buscarEnListas(['https://phish.example/login?x=1#inicio']), openphish);
  assert.deepEqual(buscarEnListas(['https://PHISH.example/login?x=1']), openphish);
  assert.deepEqual(buscarEnListas(['https://otro.example/?utm_source=whatsapp']), openphish);
  assert.deepEqual(buscarEnListas(['https://legitimo.example/', 'http://1.2.3.4:5555/bin.sh']), [
    { fuente: 'URLHAUS', amenaza: 'MALWARE' },
  ]);
  assert.deepEqual(buscarEnListas(['https://phish.example/login']), []);
  assert.deepEqual(buscarEnListas(['https://legitimo.example/']), []);
});
