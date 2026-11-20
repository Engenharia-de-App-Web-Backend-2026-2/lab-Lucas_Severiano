const http = require('http');
const { routes, sendJson } = require('./routes');

const PORT = Number(process.env.PORT) || 4000;

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const handler = routes[`${req.method} ${pathname}`];

  if (!handler) return sendJson(res, 404, { erro: 'Rota não encontrada' });

  try {
    await handler(req, res);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { erro: 'Erro interno' });
  }
});

// 0.0.0.0 é obrigatório em container: escutar só em 127.0.0.1 tornaria
// a porta inacessível pelo mapeamento -p do Docker.
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API rodando na porta ${PORT} | APP_MESSAGE="${process.env.APP_MESSAGE || ''}"`);
});
