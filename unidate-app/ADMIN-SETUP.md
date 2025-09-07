# 🛡️ Painel de Administração UniDate

## 📋 Como Acessar o Admin

### 1. **URLs de Acesso**
```
http://localhost:3000/admin
http://localhost:3000/admin/login
```

### 2. **Acesso pelo Footer**
- Role até o final da página
- Na seção "Legal", clique em "Admin"
- Será redirecionado para o login do admin

### 3. **Credenciais Padrão**
- **E-mail:** `admin@unidate.com`
- **Senha:** `admin123`
- **2FA:** `123456` (se solicitado)

### 4. **Primeiro Acesso**

#### Opção A: Usar Credenciais Padrão
1. Acesse `http://localhost:3000/admin`
2. Digite as credenciais acima
3. Se solicitado 2FA, use `123456`
4. Clique em "Acessar Painel"

#### Opção B: Criar Novo Admin (Desenvolvedor)
```typescript
// Execute no console do navegador ou crie um script
import { setupFirstAdmin } from './src/scripts/setupAdmin';

// Criar primeiro admin
await setupFirstAdmin();
```

## 🔧 Funcionalidades do Admin

### **Dashboard Principal**
- 📊 Métricas em tempo real
- 👥 Usuários online
- 📈 Estatísticas de crescimento
- 🚨 Atividades recentes

### **Gerenciamento de Usuários**
- 👤 Listar todos os usuários
- 🔍 Buscar usuários
- ⚠️ Suspender/Banir usuários
- 📧 Enviar notificações

### **Moderação de Conteúdo**
- 📝 Moderar posts
- 🗑️ Remover conteúdo inapropriado
- 🏷️ Gerenciar hashtags
- 📊 Relatórios de denúncias

### **Gerenciamento de Eventos**
- 📅 Aprovar eventos
- 🎯 Promover eventos
- 📊 Estatísticas de eventos
- 🏷️ Categorias de eventos

### **Configurações do Sistema**
- ⚙️ Configurações gerais
- 🔐 Gerenciar admins
- 📊 Logs do sistema
- 🛡️ Configurações de segurança

## 🚨 Segurança

### **Autenticação**
- ✅ Login com e-mail e senha
- 🔐 Autenticação 2FA (opcional)
- 🛡️ Sessões seguras
- 📝 Logs de acesso

### **Permissões**
- **Super Admin:** Acesso total
- **Moderador:** Moderação de conteúdo e usuários

### **Monitoramento**
- 📊 Todas as ações são logadas
- 🚨 Alertas de segurança
- 📈 Relatórios de atividade

## 🔄 Comandos Úteis

### **Criar Novo Admin**
```typescript
import { createAdminUser } from './src/firebase/realAdminAuth';

await createAdminUser(
  'novo@admin.com',
  'senha123',
  'Nome do Admin',
  'moderator' // ou 'super-admin'
);
```

### **Verificar Admins Existentes**
```typescript
import { getAllAdmins } from './src/firebase/realAdminAuth';

const admins = await getAllAdmins();
console.log(admins);
```

### **Atualizar Permissões**
```typescript
import { updateAdminPermissions } from './src/firebase/realAdminAuth';

await updateAdminPermissions('uid-do-admin', {
  canManageUsers: true,
  canModerateContent: true,
  canManageEvents: false
});
```

## 📱 Acesso Mobile

O painel admin é responsivo e funciona em:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## 🆘 Suporte

### **Problemas Comuns**

1. **Não consegue fazer login**
   - Verifique se o Firebase está configurado
   - Confirme as credenciais
   - Verifique se o usuário é admin

2. **Erro de 2FA**
   - Use o código `123456` para teste
   - Em produção, configure app autenticador

3. **Permissões insuficientes**
   - Verifique o role do usuário
   - Confirme as permissões no Firestore

### **Logs de Debug**
```typescript
// Habilitar logs detalhados
localStorage.setItem('debug', 'admin:*');
```

## 🔗 Links Úteis

- **Admin Login:** `/admin`
- **Admin Dashboard:** `/admin/dashboard`
- **Gerenciar Usuários:** `/admin/users`
- **Moderação:** `/admin/moderation`
- **Configurações:** `/admin/settings`

---

**⚠️ Importante:** Este é um sistema de administração real. Use com responsabilidade e mantenha as credenciais seguras.
