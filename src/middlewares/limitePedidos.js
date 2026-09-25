const VENTANA_MS = 60000;
const MAX_PEDIDOS = 30;
const pedidos = new Map();

setInterval(() => {
  const ahora = Date.now();
  for (const [ip, { inicio }] of pedidos) {
    if (ahora - inicio > VENTANA_MS) pedidos.delete(ip);
  }
}, VENTANA_MS).unref();

const limitePedidos = (req, res, next) => {
  const ahora = Date.now();
  const registro = pedidos.get(req.ip);

  if (!registro || ahora - registro.inicio > VENTANA_MS) {
    pedidos.set(req.ip, { inicio: ahora, cantidad: 1 });
    return next();
  }

  if (registro.cantidad >= MAX_PEDIDOS) {
    return res.status(429).json({ error: 'Demasiadas verificaciones, espere un minuto' });
  }

  registro.cantidad++;
  next();
};

export default limitePedidos;
