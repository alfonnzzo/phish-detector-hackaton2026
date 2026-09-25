import { test } from 'node:test';
import assert from 'node:assert/strict';
import limitePedidos from './limitePedidos.js';

const pedir = (ip) => {
  let estado = null;
  let paso = false;
  const res = { status: (codigo) => { estado = codigo; return { json: () => {} }; } };
  limitePedidos({ ip }, res, () => { paso = true; });
  return { paso, estado };
};

test('limitePedidos deja pasar 30 pedidos por IP y bloquea el 31', () => {
  for (let i = 0; i < 30; i++) {
    assert.equal(pedir('1.1.1.1').paso, true);
  }
  assert.deepEqual(pedir('1.1.1.1'), { paso: false, estado: 429 });
  assert.equal(pedir('2.2.2.2').paso, true);
});
