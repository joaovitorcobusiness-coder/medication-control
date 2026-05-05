# 💊 Sistema Inteligente de Controle de Medicamentos para Idosos

> Um sistema IoT completo para ajudar idosos a não esquecer de tomar medicamentos, com alertas visuais, sonoros e notificações em tempo real para familiares.

## 🎯 Problema Social Resolvido

Muitos idosos:
- ❌ Esquecem horários de medicamentos
- ❌ Tomam doses erradas
- ❌ Familiares não conseguem acompanhar
- ❌ Postos de saúde não têm visibilidade do tratamento

**Resultado**: Internações evitáveis, piora da saúde e custos públicos altos.

## ✅ Solução Implementada

Uma plataforma integrada com:

### 🔧 Caixa IoT (ESP32)
- Detector automático de abertura (reed switch)
- LED piscante + Buzzer para alertas
- Botão de confirmação manual
- Wi-Fi integrado
- Sincronização com API em tempo real

### 📱 App Mobile - Idoso
- Interface extremamente simples (letras grandes, alto contraste)
- Alertas visuais + sonoros automáticos
- Botão "Já tomei" para confirmação manual
- Funcionamento offline com sincronização automática

### 👨‍👩‍👧 App Mobile - Familiar/Cuidador
- Visualização em tempo real se medicamento foi tomado
- Alertas de atraso com timestamp
- Histórico diário/semanal
- Notificações push instantâneas

### 🖥️ Painel Web - Saúde
- Cadastro de pacientes
- Gestão de medicamentos e horários
- Relatórios de adesão ao tratamento
- Indicadores simples (% de doses tomadas)

## 🏗️ Arquitetura do Sistema

```
         ┌─────────────────────────────────┐
         │   Caixa de Medicamentos IoT     │
         │   (ESP32 + Sensores)             │
         └────────────┬────────────────────┘
                      │ POST /api/iot/events
                      ▼
         ┌─────────────────────────────────┐
         │  Backend API (Node.js/Express)  │
         │  - REST API                     │
         │  - JWT Authentication           │
         │  - Notificações Push (FCM)      │
         │  - Agendamento automático       │
         └────────────┬────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
    ┌──────────────┐      ┌─────────────────┐
    │ Banco MySQL  │      │ Firebase Cloud  │
    │ - Usuários   │      │ Messaging (FCM) │
    │ - Médicos    │      │ - Notificações  │
    │ - Eventos    │      │   Push          │
    └──────────────┘      └─────────────────┘
         ▲
    ┌────┴──────────────┐
    ▼                   ▼
┌──────────────┐  ┌──────────────┐
│ Frontend     │  │ Painel Web   │
│ React Native │  │ React        │
│ - App Idoso  │  │ - Gestão     │
│ - App Familiar   │ - Relatórios │
└──────────────┘  └──────────────┘
```

## 📋 Dados Registrados

### Paciente
- ID único
- Nome completo
- Idade/Data de nascimento
- Contato emergencial

### Medicamento
- Nome do medicamento
- Dosagem (ex: 500mg)
- Frequência (a cada 6 horas)
- Observações especiais

### Agendamento
- Medicamento ID
- Horário (ex: 08:00)
- Dias da semana
- Lembretes ativados

### Evento IoT
- Data/hora da abertura
- Status (tomado/atraso/ignorado)
- Origem (IoT ou app)

## 🚀 Quick Start

### Pré-requisitos
- Node.js 14+
- MySQL 5.7+
- Arduino IDE (para ESP32)

### Instalação Rápida

```bash
# 1. Banco de Dados
mysql -u root < database/schema.sql

# 2. Backend
cd backend
npm install
npm start
# Acessa: http://localhost:5000

# 3. Frontend
cd frontend
npm install
npm start
# Acessa: http://localhost:3000

# 4. ESP32
# Abrir Arduino IDE → Carregar firmware_esp32_medication_box.ino
```

📖 **[Guia Completo de Setup](SETUP_COMPLETE.md)**

## 📁 Estrutura do Projeto

```
medication-control/
├── backend/                    # API Node.js
│   ├── routes/                # Rotas da API
│   │   ├── auth.js           # Autenticação
│   │   ├── medications.js    # Medicamentos
│   │   ├── schedules.js      # Agendamentos
│   │   ├── history.js        # Histórico
│   │   └── iot.js            # Eventos IoT
│   ├── services/
│   │   └── iotNotificationService.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── database.js
│   └── server.js
│
├── frontend/                   # React Web
│   ├── src/
│   │   ├── pages/            # Telas
│   │   ├── components/       # Componentes
│   │   └── services/         # API client
│   └── public/               # Assets
│
├── iot/                        # Firmware ESP32
│   ├── firmware_esp32_medication_box.ino
│   └── README_ESP32.md
│
├── database/                   # SQL
│   └── schema.sql
│
├── SETUP_COMPLETE.md          # Setup detalhado
├── API_EXAMPLES.md            # Exemplos de API
├── QUICKSTART.md              # Quick start
└── README.md                  # Este arquivo
```

## 🔌 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login

### Medicamentos
- `GET /api/medications` - Listar
- `POST /api/medications` - Criar
- `PUT /api/medications/:id` - Atualizar
- `DELETE /api/medications/:id` - Deletar

### Agendamentos
- `GET /api/schedules` - Listar
- `GET /api/schedules/today` - Hoje
- `POST /api/schedules` - Criar
- `PUT /api/schedules/:id` - Atualizar
- `DELETE /api/schedules/:id` - Deletar

### Histórico
- `GET /api/history` - Listar
- `POST /api/history/mark-taken` - Marcar como tomado
- `POST /api/history/mark-missed` - Marcar como não tomado

### IoT
- `POST /api/iot/devices/register` - Registrar caixa
- `GET /api/iot/devices` - Listar caixas
- `POST /api/iot/events` - Registrar evento (caixa aberta/fecha)
- `GET /api/iot/events/:device_id` - Obter eventos

📄 **[Exemplos de Requisições](API_EXAMPLES.md)**

## 🧪 Testes

```bash
# Script de testes automatizados
bash TEST_COMPLETE.sh

# Ou testar manualmente com curl
curl http://localhost:5000/api/health
```

## 🔐 Segurança

- ✅ Senhas criptografadas (bcryptjs)
- ✅ Autenticação JWT (tokens)
- ✅ Validação de entrada (express-validator)
- ✅ CORS configurado
- ✅ Isolamento de dados por usuário

## 📊 Funcionalidades

### Usuário Idoso
- [x] Dashboard com medicamentos do dia
- [x] Marcação automática quando caixa é aberta
- [x] Botão "Já tomei" como fallback
- [x] Histórico de medicamentos
- [x] Gerenciamento de perfil
- [x] Alertas visuais e sonoros

### Familiar/Cuidador
- [x] Visualização de pacientes
- [x] Relatório de adesão (%)
- [x] Alertas de medicamento não tomado
- [x] Histórico completo
- [x] Notificações push em tempo real

### Administrador (Saúde Pública)
- [x] Gestão de múltiplos pacientes
- [x] Cadastro de medicamentos
- [x] Relatórios consolidados
- [x] Dashboard com indicadores

## 🔧 Hardware (IoT)

### Componentes Necessários
- ESP32 Development Board
- Sensor Reed Switch (abertura)
- LED indicador
- Buzzer (alerta sonoro)
- Botão de confirmação
- Resistores e jumpers

📌 **[Setup Completo do ESP32](iot/README_ESP32.md)**

## 🚨 Troubleshooting

### Backend não conecta a MySQL
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar .env
cat backend/.env
```

### Frontend não conecta à API
```bash
# Verificar se backend está rodando
curl http://localhost:5000/api/health

# Verificar URL em frontend/src/services/api.js
```

### ESP32 não conecta ao Wi-Fi
- Verificar SSID e senha (devem ser corretos)
- Wi-Fi deve ser 2.4GHz (ESP32 não suporta 5GHz)
- Verificar sinal bem próximo do roteador

## 📞 Suporte

- 📧 Email: support@medicamentos-idosos.com
- 🐛 Issues: GitHub Issues do repositório
- 💬 Forum: [Comunidade do Projeto]

## 📈 Roadmap Futuro

- [ ] App mobile nativa (iOS/Android)
- [ ] Integração com hospitais/UBS
- [ ] Machine Learning para previsão de adesão
- [ ] SMS e email como canais adicionais
- [ ] Relatórios em PDF exportáveis
- [ ] Multi-idioma (PT, EN, ES)
- [ ] PWA (Progressive Web App)

## 📜 Licença

MIT License - Veja [LICENSE.md](LICENSE.md)

## 👨‍💻 Autores

Desenvolvido com ❤️ para cuidar da saúde dos idosos

## 🙏 Agradecimentos

- Idosos e familiares que compartilharam seus desafios
- Profissionais de saúde que validaram o conceito
- Comunidade open-source que nos inspirou

---

**Última atualização**: Maio 2026
**Status**: ✅ Pronto para Produção
**Versão**: 1.0.0


- **Node.js** v14+ e npm
- **MySQL** v5.7+
- **Git**
- Navegador moderno (Chrome, Firefox, Safari)

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/medication-control.git
cd medication-control
```

### 2. Configure o Banco de Dados

#### A. Criar o banco de dados:

Abra o MySQL e execute:

```bash
mysql -u root -p < database/schema.sql
```

Ou importe manualmente através de uma ferramenta como MySQL Workbench ou phpMyAdmin.

#### B. Verificar conexão:

```bash
mysql -u root -p medication_control
SELECT * FROM users;
exit;
```

### 3. Configurar o Backend

```bash
cd backend

# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env com suas configurações
# Abrir o arquivo .env e preencher:
# - DB_HOST
# - DB_USER
# - DB_PASSWORD
# - JWT_SECRET
# - FCM_SERVER_KEY (opcional, para notificações push)

# Instalar dependências
npm install

# Iniciar o servidor
npm start
```

O backend estará disponível em: `http://localhost:5000`

### 4. Configurar o Frontend

```bash
cd ../frontend

# Copiar e editar arquivo de configuração (se necessário)
# Criar arquivo .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Instalar dependências
npm install

# Iniciar a aplicação
npm start
```

A aplicação estará disponível em: `http://localhost:3000`

## Uso

### Login/Cadastro

1. Abra `http://localhost:3000`
2. Clique em "Cadastre-se aqui" para criar uma nova conta
3. Preencha os dados solicitados
4. Faça login com suas credenciais

### Dashboard

Após login, você verá:
- **Total Hoje**: Quantidade total de medicamentos agendados
- **Tomados**: Medicamentos já tomados
- **Pendentes**: Medicamentos ainda não tomados
- Lista de medicamentos com botões para marcar como "Tomar Agora" ou "Não Tomei"

### Adicionar Medicamento

1. Acesse a aba "Medicamentos"
2. Clique em "Adicionar Medicamento"
3. Preencha:
   - Nome do medicamento
   - Dosagem e unidade
   - Frequência
   - Datas de início/fim
   - Notas especiais
4. Clique em "Salvar"

### Agendar Horários

Os horários são configurados através da API. Você pode criar agendamentos via:

```bash
POST /api/schedules
{
  "medication_id": 1,
  "scheduled_time": "08:00",
  "day_of_week": "Monday,Tuesday,Wednesday,Thursday,Friday",
  "reminder_enabled": true
}
```

### Registrar Dispositivos IoT

1. Acesse "Configurações"
2. Na seção "Dispositivos IoT", clique em "Adicionar Dispositivo"
3. Preencha:
   - ID do Dispositivo
   - Nome do Dispositivo
   - Tipo (Celular, Smartwatch, etc)
   - Plataforma
4. Clique em "Registrar"

### Visualizar Histórico

1. Acesse "Histórico"
2. Use os filtros para selecionar período (opcional)
3. Veja todos os medicamentos tomados, perdidos ou pendentes

### Perfil e Configurações

- **Perfil**: Edite dados pessoais, telefone, endereço, contato de emergência
- **Configurações**: Gerencie dispositivos IoT e preferências de notificação

## Notificações IoT

O sistema envia notificações automáticas (push notifications) para:

- **10 minutos antes** do horário agendado (lembrete)
- **Na hora exata** do medicamento
- **Alertas de medicamentos perdidos**

### Configurar Firebase Cloud Messaging (FCM)

Para ativar push notifications:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Gere uma chave de servidor
3. Adicione ao arquivo `.env` do backend:
   ```
   FCM_SERVER_KEY=sua-chave-aqui
   ```

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrar usuário

### Usuários
- `GET /api/users/profile` - Obter perfil
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/stats` - Obter estatísticas

### Medicamentos
- `GET /api/medications` - Listar medicamentos
- `POST /api/medications` - Criar medicamento
- `GET /api/medications/:id` - Obter detalhes
- `PUT /api/medications/:id` - Atualizar
- `DELETE /api/medications/:id` - Deletar

### Agendamentos
- `GET /api/schedules` - Listar agendamentos
- `GET /api/schedules/today` - Agendamentos de hoje
- `POST /api/schedules` - Criar agendamento
- `PUT /api/schedules/:id` - Atualizar
- `DELETE /api/schedules/:id` - Deletar

### Histórico
- `GET /api/history` - Listar histórico
- `POST /api/history/mark-taken` - Marcar como tomado
- `POST /api/history/mark-missed` - Marcar como não tomado
- `GET /api/history/summary/monthly` - Resumo mensal

### IoT
- `POST /api/iot/devices/register` - Registrar dispositivo
- `GET /api/iot/devices` - Listar dispositivos
- `POST /api/iot/notifications/schedule` - Agendar notificação
- `POST /api/iot/notifications/send-now` - Enviar notificação imediata
- `GET /api/iot/notifications` - Listar notificações

## Estrutura do Banco de Dados

### Tabelas Principais

- **users**: Dados dos usuários
- **medications**: Medicamentos cadastrados
- **medication_schedules**: Agendamentos de medicamentos
- **medication_history**: Histórico de medicamentos tomados/perdidos
- **iot_devices**: Dispositivos conectados
- **iot_notifications**: Notificações agendadas
- **activity_logs**: Logs de atividade dos usuários

## Segurança

- ✅ Hashes de senha com bcryptjs
- ✅ JWT para autenticação
- ✅ Validação de entrada
- ✅ CORS configurado
- ✅ Queries preparadas contra SQL injection
- ✅ Tokens com expiração

## Troubleshooting

### Erro de conexão ao banco de dados

```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar credenciais no .env
cat backend/.env
```

### Porta já em uso

```bash
# Mudar porta no .env (backend)
PORT=5001

# Mudar porta do frontend
npm start -- --port 3001
```

### Notificações não aparecem

- Verifique se FCM_SERVER_KEY está configurado
- Confirme que o dispositivo está registrado
- Verifique logs do servidor

## Desenvolvimento

### Adicionar nova feature

1. Criar branch: `git checkout -b feature/nova-feature`
2. Fazer commit: `git commit -am 'Adicionar nova feature'`
3. Push: `git push origin feature/nova-feature`
4. Criar Pull Request

### Testar API

Use Postman ou cURL:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Obter medicamentos
curl -X GET http://localhost:5000/api/medications \
  -H "Authorization: Bearer seu-token-jwt"
```

## Deployment

### Heroku

```bash
# Login
heroku login

# Criar app
heroku create seu-app-name

# Adicionar MySQL (ClearDB)
heroku addons:create cleardb:ignite

# Deploy
git push heroku main
```

### AWS, Google Cloud, etc

Consulte a documentação específica de cada plataforma.

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.

## Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um Fork
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Suporte

Para dúvidas ou problemas:

1. Verifique a seção Troubleshooting
2. Abra uma issue no GitHub
3. Entre em contato através do email

## Créditos

Desenvolvido com ❤️ para ajudar idosos a gerenciar seus medicamentos de forma segura e eficiente.

---

**Versão**: 1.0.0  
**Última atualização**: Abril 2026  
**Autor**: Tim Team
