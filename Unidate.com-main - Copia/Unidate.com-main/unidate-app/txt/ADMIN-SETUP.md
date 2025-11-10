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

## �� **REGRAS SIMPLIFICADAS E FUNCIONAIS**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // FUNÇÕES AUXILIARES SIMPLES
    // ========================================
    
    // Verificar se usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Verificar se é admin
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // ========================================
    // REGRAS PARA USUÁRIOS
    // ========================================
    
    match /users/{userId} {
      // Usuários podem ler e escrever apenas seus próprios dados
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      
      // Admins podem ler todos os usuários
      allow read: if isAdmin();
    }
    
    // ========================================
    // REGRAS PARA ADMINISTRADORES
    // ========================================
    
    match /admins/{adminId} {
      // Apenas admins podem acessar
      allow read, write: if isAdmin();
    }
    
    // ========================================
    // REGRAS PARA POSTS (FEED UNIVERSO)
    // ========================================
    
    match /posts/{postId} {
      // Usuários autenticados podem ler posts
      allow read: if isAuthenticated();
      
      // Usuários podem criar posts
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.autorId;
      
      // Usuários podem atualizar apenas seus próprios posts
      allow update: if isAuthenticated() && 
        request.auth.uid == resource.data.autorId;
      
      // Usuários podem deletar apenas seus próprios posts
      allow delete: if isAuthenticated() && 
        request.auth.uid == resource.data.autorId;
      
      // Usuários podem curtir posts (atualizar curtidasPor)
      allow update: if isAuthenticated() && 
        request.resource.data.keys().hasAll(['curtidasPor']) &&
        request.resource.data.keys().hasOnly(['curtidasPor', 'numeroComentarios']);
      
      // Admins podem fazer tudo
      allow read, write: if isAdmin();
    }
    
    // ========================================
    // REGRAS PARA GRUPOS
    // ========================================
    
    match /groups/{groupId} {
      // Usuários autenticados podem ler grupos
      allow read: if isAuthenticated();
      
      // Usuários podem criar grupos
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.createdBy;
      
      // Usuários podem entrar/sair de grupos
      allow update: if isAuthenticated() && 
        request.resource.data.keys().hasOnly(['members', 'lastActivity', 'updatedAt']);
      
      // Criador pode deletar grupo
      allow delete: if isAuthenticated() && 
        request.auth.uid == resource.data.createdBy;
      
      // Admins podem fazer tudo
      allow read, write: if isAdmin();
    }
    
    // ========================================
    // REGRAS PARA CHATS PRIVADOS
    // ========================================
    
    match /chats/{chatId} {
      // Apenas participantes podem acessar
      allow read, write: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
    }
    
    // Mensagens de chat
    match /chats/{chatId}/messages/{messageId} {
      // Apenas participantes podem ler e enviar mensagens
      allow read, create: if isAuthenticated() && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
    
    // ========================================
    // REGRAS PARA MATCHES
    // ========================================
    
    match /matches/{matchId} {
      // Usuários podem acessar apenas seus próprios matches
      allow read, write: if isAuthenticated() && 
        (request.auth.uid == resource.data.user1Id || request.auth.uid == resource.data.user2Id);
    }
    
    // ========================================
    // REGRAS PARA DENÚNCIAS
    // ========================================
    
    match /reports/{reportId} {
      // Usuários podem criar denúncias
      allow create: if isAuthenticated();
      
      // Apenas admins podem ler denúncias
      allow read, update, delete: if isAdmin();
    }
    
    // ========================================
    // REGRAS PARA NOTIFICAÇÕES
    // ========================================
    
    match /notifications/{notificationId} {
      // Usuários podem ler apenas suas notificações
      allow read: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      
      // Usuários podem marcar como lida
      allow update: if isAuthenticated() && 
        request.auth.uid == resource.data.userId &&
        request.resource.data.keys().hasOnly(['read', 'readAt']);
    }
    
    // ========================================
    // REGRA PADRÃO - NEGA TUDO MAIS
    // ========================================
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## ✅ **PRINCIPAIS SIMPLIFICAÇÕES:**

### **🔧 Removido:**
- Funções complexas que podem causar erro
- Regras para funcionalidades não implementadas
- Verificações muito específicas
- Subscoleções complexas

### **✅ Mantido:**
- Segurança básica essencial
- Controle de acesso por usuário
- Sistema de admins
- Funcionalidades principais (posts, grupos, chat)

## 🚀 **COMO IMPLEMENTAR:**

1. **Acesse Firebase Console**
2. **Firestore Database → Rules**
3. **Cole as regras acima**
4. **Clique em "Publish"**

## 🧪 **TESTE AS REGRAS:**

```javascript
<code_block_to_apply_changes_from>
```

**Essas regras são mais simples e devem funcionar sem erros!** 🎯

**Quer que eu teste alguma funcionalidade específica ou precisa de ajuda com algum erro específico?**

## 🔧 **REGRAS MAIS PERMISSIVAS PARA DESENVOLVIMENTO**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // REGRAS SIMPLIFICADAS PARA DESENVOLVIMENTO
    // ========================================
    
    // Verificar se usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // ========================================
    // REGRAS PARA USUÁRIOS
    // ========================================
    
    match /users/{userId} {
      // Usuários autenticados podem ler e escrever
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // REGRAS PARA POSTS
    // ========================================
    
    match /posts/{postId} {
      // Usuários autenticados podem fazer tudo
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // REGRAS PARA GRUPOS (MAIS PERMISSIVAS)
    // ========================================
    
    match /groups/{groupId} {
      // Usuários autenticados podem fazer tudo
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // REGRAS PARA CHATS
    // ========================================
    
    match /chats/{chatId} {
      // Usuários autenticados podem fazer tudo
      allow read, write: if isAuthenticated();
    }
    
    match /chats/{chatId}/messages/{messageId} {
      // Usuários autenticados podem fazer tudo
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // REGRAS PARA MATCHES
    // ========================================
    
    match /matches/{matchId} {
      // Usuários autenticados podem fazer tudo
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // REGRAS PARA NOTIFICAÇÕES
    // ========================================
    
    match /notifications/{notificationId} {
      // Usuários autenticados podem fazer tudo
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // REGRAS PARA ADMINISTRADORES
    // ========================================
    
    match /admins/{adminId} {
      // Usuários autenticados podem fazer tudo (para desenvolvimento)
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // REGRAS PARA DENÚNCIAS
    // ========================================
    
    match /reports/{reportId} {
      // Usuários autenticados podem fazer tudo
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // REGRA PADRÃO - PERMITE TUDO PARA DESENVOLVIMENTO
    // ========================================
    
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

## 🚀 **COMO IMPLEMENTAR:**

### **1. Aplicar as Regras:**
1. **Acesse Firebase Console**
2. **Firestore Database → Rules**
3. **Cole as regras acima**
4. **Clique em "Publish"**

### **2. Verificar se Funcionou:**
1. **Recarregue a página** do UniDate
2. **Tente entrar em um grupo**
3. **Verifique o console** do navegador (F12) para erros

##  **DEBUGGING - VERIFICAR PROBLEMAS:**

### **1. Verificar Autenticação:**
```javascript
// No console do navegador (F12)
console.log('Usuário logado:', firebase.auth().currentUser);
```

### **2. Verificar Dados do Grupo:**
```javascript
// Verificar se o grupo existe
import { db } from './firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const groupId = 'ID_DO_GRUPO';
const groupRef = doc(db, 'groups', groupId);
const groupDoc = await getDoc(groupRef);
console.log('Grupo existe:', groupDoc.exists());
console.log('Dados do grupo:', groupDoc.data());
```

### **3. Verificar Permissões:**
```javascript
// Testar se consegue atualizar o grupo
import { updateDoc, arrayUnion } from 'firebase/firestore';

try {
  await updateDoc(groupRef, {
    members: arrayUnion('SEU_UID'),
    lastActivity: new Date()
  });
  console.log('✅ Permissão OK');
} catch (error) {
  console.error('❌ Erro de permissão:', error);
}
```

## 🛠️ **ALTERNATIVA - REGRAS TEMPORÁRIAS (MÁXIMA PERMISSÃO):**

Se ainda não funcionar, use estas regras **TEMPORÁRIAS** para desenvolvimento:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // PERMITE TUDO PARA DESENVOLVIMENTO
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ATENÇÃO:** Essas regras são **apenas para desenvolvimento**. Em produção, use regras mais restritivas!

## 🎯 **TESTE RÁPIDO:**

1. **Aplique as regras permissivas**
2. **Recarregue a página**
3. **Tente entrar em um grupo**
4. **Se funcionar, o problema era nas regras**

**Funcionou? Se não, me diga qual erro específico aparece no console!** 🚀
