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

Para criar a primeira conta de administrador, com o banco configurado no `backend/.env`, execute `npm run criar-admin` dentro da pasta `backend/`. O script solicita nome, e-mail e uma senha de pelo menos 12 caracteres; a senha não é exibida no terminal.

## Comandos úteis

Na pasta `frontend/`:

- `npm run build`: gera a versão de produção.
- `npm run lint`: verifica problemas estáticos no código da interface.

Na pasta `backend/`:

- `npm start`: inicia a API.
- `npm run dev`: inicia a API com reinício automático durante o desenvolvimento.

## Cuidados com dados locais

Segredos, dependências, dumps e cópias de segurança ficam fora do controle de versão pela configuração raiz do Git. Os arquivos locais não são apagados.
