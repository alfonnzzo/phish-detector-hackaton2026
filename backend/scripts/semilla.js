// Carga datos ficticios para probar la verificacion de mensajes: npm run semilla
import { sequelize, connectDB } from '../src/config/database.js';
import { InstitucionVerificada, CanalOficial } from '../src/models/associations.js';
import IdentificadorReportado from '../src/models/IdentificadorReportado.js';
import { normalizarIdentificador } from '../src/helpers/analizarMensaje.js';

const INSTITUCION = {
  nombre: 'Banco Demo',
  canales: [
    { tipo: 'sitio_web', valor: 'bancodemo.com.ar' },
    { tipo: 'telefono', valor: '0800-555-0100' },
    { tipo: 'cbu_cvu_alias', valor: 'banco.demo.oficial' },
    { tipo: 'cbu_cvu_alias', valor: '0000000000000000000001' },
    { tipo: 'red_social', valor: '@bancodemo' },
  ],
};

const REPORTADOS = [
  { tipo: 'cbu_cvu', valor: '1111222233334444555566', motivo: 'Cuenta usada en estafas de falsos premios' },
  { tipo: 'alias', valor: 'premio.sorteo.ya', motivo: 'Alias usado en estafas de falsos premios' },
  { tipo: 'email', valor: 'soporte@bancodemo-verificacion.com', motivo: 'Correo que suplanta a Banco Demo' },
  { tipo: 'telefono', valor: '11 5555-0199', motivo: 'Numero que pide codigos de WhatsApp' },
  { tipo: 'usuario', valor: '@bancodemo_soporte', motivo: 'Perfil falso de atencion al cliente' },
];

const cargar = async () => {
  await connectDB();
  await sequelize.sync();

  const [institucion, creada] = await InstitucionVerificada.findOrCreate({
    where: { nombre: INSTITUCION.nombre },
  });
  if (creada) {
    await CanalOficial.bulkCreate(
      INSTITUCION.canales.map((canal) => ({ ...canal, institucionId: institucion.id }))
    );
  }
  console.log(`Institucion ${INSTITUCION.nombre}: ${creada ? 'creada' : 'ya existia'}`);

  for (const { tipo, valor, motivo } of REPORTADOS) {
    const [, nuevo] = await IdentificadorReportado.findOrCreate({
      where: { tipo, valor: normalizarIdentificador(tipo, valor) },
      defaults: { motivo },
    });
    console.log(`Reportado ${tipo} ${valor}: ${nuevo ? 'creado' : 'ya existia'}`);
  }

  await sequelize.close();
};

cargar().catch((error) => {
  console.error('No se pudo cargar la semilla:', error.message);
  process.exit(1);
});
