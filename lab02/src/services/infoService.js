const os = require('os');

// 12-Factor (fator III): configuração vem do ambiente, nunca do código.
function getInfo() {
  return {
    mensagem: process.env.APP_MESSAGE || 'Mensagem padrão (APP_MESSAGE não definida)',
    hostname: os.hostname(), // dentro do container = ID do container
    porta_interna: Number(process.env.PORT) || 4000,
    node: process.version,
  };
}

module.exports = { getInfo };
