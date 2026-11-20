const { getInfo } = require('../services/infoService');
const { lerAviso } = require('../services/avisoService');

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body, null, 2));
}

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

// Tabela de rotas: "MÉTODO caminho" -> handler
const routes = {
  'GET /': async (req, res) => {
    sendJson(res, 200, { status: 'ok', servico: 'api-node-classroom', rotas: ['/info', '/aviso'] });
  },

  'GET /info': async (req, res) => {
    sendJson(res, 200, getInfo());
  },

  'GET /aviso': async (req, res) => {
    const resultado = await lerAviso();
    if (!resultado.ok) return sendText(res, 404, resultado.erro);
    sendText(res, 200, resultado.conteudo);
  },
};

module.exports = { routes, sendJson };
