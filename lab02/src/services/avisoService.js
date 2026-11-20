const fs = require('fs/promises');
const path = require('path');

// Caminho absoluto esperado dentro do container: /usr/src/app/dados/aviso.txt
const AVISO_PATH = path.resolve(__dirname, '..', '..', 'dados', 'aviso.txt');

// O arquivo é lido a CADA requisição (sem cache), por isso uma alteração feita
// no host via bind mount aparece imediatamente, sem rebuild da imagem.
async function lerAviso() {
  try {
    const conteudo = await fs.readFile(AVISO_PATH, 'utf-8');
    return { ok: true, conteudo };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {
        ok: false,
        erro: `Arquivo não encontrado em ${AVISO_PATH}. Monte o volume com -v (bind mount).`,
      };
    }
    throw err;
  }
}

module.exports = { lerAviso, AVISO_PATH };
