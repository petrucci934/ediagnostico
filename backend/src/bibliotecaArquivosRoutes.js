const path = require('node:path');
const fs = require('node:fs/promises');

// Estes materiais já eram públicos em /videos e /images; a API mantém esse acesso.
function registrarArquivosBiblioteca({ app, db, raiz = path.resolve(__dirname, '../../frontend/public') }) {
  app.get('/api/biblioteca/arquivos/conteudo', async (req, res) => {
    const caminho = req.query.caminho;
    if (typeof caminho !== 'string' || !/^\/(videos|images)\/.+\.(mp4|pdf)$/i.test(caminho) || caminho.includes('..') || caminho.includes('\\')) {
      return res.status(400).json({ erro: 'Caminho de arquivo inválido.' });
    }
    try {
      const resultado = await db.query(
        "SELECT caminho FROM biblioteca_arquivos WHERE caminho = $1 AND tipo IN ('video', 'pdf')", [caminho],
      );
      if (!resultado.rowCount) return res.status(404).json({ erro: 'Material não cadastrado.' });
      const base = await fs.realpath(raiz);
      const arquivo = await fs.realpath(path.resolve(base, `.${caminho}`));
      if (!arquivo.startsWith(base + path.sep)) return res.status(403).json({ erro: 'Arquivo não permitido.' });
      // sendFile suporta Range/206, permitindo avançar o vídeo sem baixar tudo.
      res.sendFile(arquivo, { acceptRanges: true, maxAge: '1h' }, (erro) => {
        if (erro && !res.headersSent) res.status(erro.statusCode || 500).end();
      });
    } catch (erro) {
      if (erro.code === 'ENOENT') return res.status(404).json({ erro: 'Arquivo indisponível no servidor.' });
      console.error('Erro ao servir material:', erro.message);
      if (!res.headersSent) res.status(500).json({ erro: 'Não foi possível abrir o material.' });
    }
  });
}
module.exports = registrarArquivosBiblioteca;
