# Título do Projeto

Uma breve descrição sobre o que esse projeto faz e para quem ele é

📝 README - Sistema de Chamados Helpdesk
Bem-vindo ao projeto Helpdesk!
Este é um sistema para gerenciamento de chamados técnicos, clientes e usuários, desenvolvido com Node.js (Backend) e MySQL (Banco de Dados).

🚀 Como Executar o Projeto
📋 Pré-requisitos
Antes de começar, você precisará ter instalado:

Node.js (v18 ou superior) → Download Node.js

MySQL (MariaDB ou MySQL 8.0+) → Download MySQL

Git (Opcional, para clonar o repositório) → Download Git

⚙️ Configuração Inicial
1️⃣ Clone o repositório (se aplicável)
bash
git clone https://github.com/seu-usuario/projeto-helpdesk.git
cd projeto-helpdesk
2️⃣ Instale as dependências
bash
npm install
3️⃣ Configure o Banco de Dados
Opção A: Usando Script SQL (Recomendado)
Execute o script SQL para criar o banco de dados e as tabelas:

bash
npm run setup-db
Observação: Certifique-se de que o MySQL está rodando (mysql -u root -p).

Opção B: Manualmente (via MySQL Workbench ou CLI)
Abra o arquivo config/setup.sql e execute no MySQL.

4️⃣ Configure as Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto com:

env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=helpdesk
JWT_SECRET=sua_chave_secreta
PORT=3000
⚠️ Substitua sua_senha pela senha do seu MySQL.

🖥️ Executando o Sistema
▶️ Inicie o Servidor (Backend)
bash
npm start
ou (para desenvolvimento com auto-reload):

bash
npm run dev
🔹 O servidor estará rodando em:
👉 http://localhost:3000

📌 Rotas da API (Endpoints)
Método Rota Descrição
POST /api/clientes Cadastra um novo cliente
GET /api/clientes Lista todos os clientes
GET /api/clientes/:id Busca um cliente por ID
PUT /api/clientes/:id Atualiza um cliente
DELETE /api/clientes/:id Remove um cliente (soft delete)
POST /api/chamados Abre um novo chamado
GET /api/chamados Lista todos os chamados
PATCH /api/chamados/:id/status Altera o status do chamado
🛠️ Estrutura do Projeto
📁 banco-api/
├── 📁 config/ # Configurações do banco de dados
├── 📁 controllers/ # Lógica das rotas da API
├── 📁 models/ # Modelos do banco de dados
├── 📁 routes/ # Definição das rotas
├── 📁 services/ # Regras de negócio
├── 📄 server.js # Ponto de entrada da aplicação
└── 📄 package.json # Dependências e scripts
🔧 Possíveis Problemas e Soluções
❌ Erro: "mysql não é reconhecido"
Solução: Adicione o MySQL ao PATH do sistema ou use o caminho completo no package.json.

❌ Erro de Conexão com o Banco de Dados
Verifique se o MySQL está rodando (sudo service mysql start no Linux).

Confira as credenciais no .env.

❌ Erro de CORS no Frontend
Solução: No server.js, adicione:

javascript
const cors = require('cors');
app.use(cors());
📜 Licença
Este projeto está sob a licença MIT.
