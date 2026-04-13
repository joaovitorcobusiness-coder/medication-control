# Guia de Início Rápido - Meus Remédios

## ⚡ Setup em 5 Minutos

### Passo 1: Preparar Banco de Dados (1 min)

```bash
# Abra o MySQL
mysql -u root -p

# Execute no MySQL
CREATE DATABASE medication_control;
USE medication_control;
SOURCE D:\copilot\database\schema.sql;
EXIT;
```

Ou importe pelo MySQL Workbench/phpMyAdmin

### Passo 2: Configurar Backend (2 min)

```bash
cd D:\copilot\backend

# Copiar arquivo de configuração
copy .env.example .env

# Editar .env
notepad .env

# Adicionar estas linhas:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD= (deixe vazio se não tem senha)
# JWT_SECRET=sua-chave-secreta-super-segura
# PORT=5000

# Instalar dependências
npm install

# Iniciar servidor
npm start
```

✅ Backend rodando em http://localhost:5000

### Passo 3: Configurar Frontend (2 min)

```bash
cd D:\copilot\frontend

# Criar arquivo .env
echo REACT_APP_API_URL=http://localhost:5000/api > .env

# Instalar dependências
npm install

# Iniciar app
npm start
```

✅ App aberto em http://localhost:3000

## 🔐 Conta de Teste

Após iniciar a app:

1. Clique em "Cadastre-se aqui"
2. Preencha os dados:
   - Nome: João Silva
   - Email: joao@example.com
   - Senha: senha123
   - Telefone: (11) 98765-4321
   - CPF: 123.456.789-00
3. Clique em Cadastrar

Depois faça login com as mesmas credenciais.

## 📱 Adicionar um Medicamento

1. Na aba "Medicamentos", clique em "Adicionar Medicamento"
2. Preencha:
   - Nome: Dipirona
   - Dosagem: 500
   - Unidade: mg
   - Frequência: 2x ao dia
3. Salve

## ⏰ Agendar Horários

Via API (Postman ou cURL):

```bash
POST http://localhost:5000/api/schedules
Authorization: Bearer {seu-token-jwt}
Content-Type: application/json

{
  "medication_id": 1,
  "scheduled_time": "08:00",
  "day_of_week": "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
  "reminder_enabled": true
}
```

## 📊 Ver Dashboard

Após adicionar medicamentos:
- Acesse http://localhost:3000
- Veja as estatísticas de hoje
- Clique em "Tomar Agora" quando tomar o medicamento

## 🔧 Troubleshooting Rápido

### Erro: "Cannot connect to database"

```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Se não funcionar, reinicie o MySQL:
# Windows: Services > MySQL > Restart
# Mac: brew services restart mysql
# Linux: sudo systemctl restart mysql
```

### Erro: "Port 5000 already in use"

```bash
# Mudar porta no .env backend
PORT=5001

# Depois restart do npm start
```

### Erro: "Module not found"

```bash
# Reinstalar dependências
rm -r node_modules
npm install

# Se ainda não funcionar
npm cache clean --force
npm install
```

## 📚 Próximos Passos

1. **Configurar Notificações IoT**
   - Ler: `iot/README.md`
   - Setup Firebase: [console.firebase.google.com](https://console.firebase.google.com)

2. **Adicionar mais usuários**
   - Repetir processo de cadastro

3. **Deploy para produção**
   - Ver instruções em `README.md`

## 💡 Dicas Úteis

### Resetar banco de dados

```bash
mysql -u root -p medication_control < database/schema.sql
```

### Ver logs do servidor

```bash
# Terminal do backend mostrará:
Server running on port 5000
Serviço de notificações IoT inicializado
```

### Testar API

```bash
# Get medicamentos
curl http://localhost:5000/api/medications \
  -H "Authorization: Bearer {token}"
```

## 🎯 Checklist de Verificação

- [ ] MySQL instalado e rodando
- [ ] Banco `medication_control` criado
- [ ] Backend com `npm start` rodando
- [ ] Frontend com `npm start` rodando
- [ ] App acessível em http://localhost:3000
- [ ] Login funcionando
- [ ] Medicamentos podem ser adicionados
- [ ] Dashboard mostrando dados

## 📞 Suporte

Se algo não funcionar:
1. Verifique os logs do terminal
2. Leia a seção de Troubleshooting no README.md
3. Confirme que portas 3000 e 5000 estão livres
4. Tente desinstalar/reinstalar dependências

---

**Pronto para começar?** Execute os 3 passos acima! 🚀
