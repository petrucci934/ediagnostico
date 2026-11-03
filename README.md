# E-Diagnóstico

Aplicação para consulta de códigos de falha e procedimentos de diagnóstico de veículos elétricos, com biblioteca técnica, atendimentos e testes técnicos revisados.

## Estrutura

- `frontend/`: interface em React e Vite.
- `backend/`: API em Express e PostgreSQL.
- `backend/schema.sql`: esquema da base para uma instalação nova.
- `dados/manuais/`: materiais técnicos utilizados pelo projeto.

## Requisitos

- Node.js compatível com as versões de Vite e Express declaradas nos respectivos `package.json`.
- PostgreSQL 15 ou superior, com o esquema do projeto aplicado.

## Configuração local

Crie `backend/.env` com estas variáveis, preenchendo os valores do seu ambiente:

```env
PORT=3000
JWT_SECRET=uma-chave-longa-e-aleatoria
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ediagnostico
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

Instale as dependências em cada aplicação:

```sh
cd backend && npm install
cd ../frontend && npm install
```

Inicie a API e a interface em terminais separados:

```sh
cd backend && npm run dev
```

```sh
cd frontend && npm run dev
```

O Vite encaminha as chamadas `/api` para a API local. O banco precisa estar disponível e preparado antes de usar as consultas. A rota `/api/status` informa se a conexão com o banco está funcionando.

Para um banco novo, aplique o esquema completo a partir da raiz do projeto:

```sh
psql -d ediagnostico -f backend/schema.sql
```

O esquema cria as tabelas usadas pela API, incluindo usuários, atendimentos, relação entre modelos e códigos, testes técnicos e revisões. Em uma base que já contém dados, faça uma cópia de segurança e compare o esquema antes de aplicar alterações: o arquivo inicial não é uma migração incremental.

Para atualizar uma base existente com o cadastro administrativo de clientes e a proteção contra e-mails repetidos, aplique as migrações incrementais:

```sh
psql -d ediagnostico -f backend/migrations/20261027_criar_clientes.sql
psql -d ediagnostico -f backend/migrations/20261027_email_usuarios_case_insensitive.sql
```

Para criar a conta inicial solicitada, com o banco configurado no `backend/.env`, execute `npm run criar-admin-padrao` dentro da pasta `backend/`. O primeiro acesso usa usuário `Admin` e senha `admin`; o sistema exige que ambos sejam trocados antes de abrir a área administrativa. Para criar outras contas de administrador com senha forte, use `npm run criar-admin`.

## Comandos úteis

Na pasta `frontend/`:

- `npm run build`: gera a versão de produção.
- `npm run lint`: verifica problemas estáticos no código da interface.

Na pasta `backend/`:

- `npm start`: inicia a API.
- `npm run dev`: inicia a API com reinício automático durante o desenvolvimento.

## Cuidados com dados locais

Segredos, dependências, dumps e cópias de segurança ficam fora do controle de versão pela configuração raiz do Git. Os arquivos locais não são apagados.

## Atualização de 03/11/2026

Antes de iniciar a API atualizada em uma base existente, faça backup e aplique:

```sh
psql -d ediagnostico -f backend/migrations/20261103_completar_recursos.sql
```

A migração cria as tabelas ausentes de catálogo, contatos e recuperação de senha e adiciona os valores separados de mão de obra e materiais ao catálogo existente, sem excluir registros. Não substitua uma base existente pelo `schema.sql`.

### Biblioteca técnica no PostgreSQL

A biblioteca consulta `GET /api/biblioteca/artigos`, com autenticação e acesso de mecânicos e administradores. Os textos ficam na tabela `biblioteca_artigos`; seções e referências usam JSONB para preservar a estrutura dos documentos. O frontend não importa mais o arquivo de conteúdos.

Para criar a tabela e importar os 84 textos, configure o `.env` do backend e execute dentro de `backend`:

```bash
npm run migrar:biblioteca
```

O comando aplica a migração e importa os textos em uma única transação. Pode ser repetido: registros com o mesmo identificador são preservados, incluindo futuras edições no banco. O arquivo `backend/data/artigos-biblioteca.json` é somente a carga inicial, não a fonte usada pela aplicação em execução. Reinicie o backend após atualizar o código para disponibilizar a nova rota. Em uma instalação nova, o `schema.sql` já contém a tabela, mas a carga inicial ainda deve ser executada.

Esta migração disponibiliza a leitura pelo banco. A edição dos textos por uma tela administrativa será uma funcionalidade separada.

A recuperação de senha requer `FRONTEND_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` e `SMTP_PASS` no ambiente do backend; use `SMTP_SECURE=true` quando exigido pelo servidor de e-mail. A hospedagem do frontend deve encaminhar `/redefinir-senha` para `index.html`, preservando a query string, e `/api` para o backend.

Novos serviços adicionados na precificação são gravados na API e ficam disponíveis no orçamento. Os serviços antigos armazenados apenas no navegador são preservados; eles não são importados automaticamente para evitar duplicação. Para utilizá-los no orçamento, cadastre-os no catálogo compartilhado.

Execute `npm test` na pasta `backend/` para as verificações de regressão. Elas usam banco simulado e não modificam dados reais. Execute `npm run lint` e `npm run build` na pasta `frontend/` para validar a interface.
