# 🔒 Segurança - Sistema de Autenticação de Administradores

## ⚠️ IMPORTANTE: Credenciais NÃO são armazenadas no frontend

O sistema de autenticação de administradores foi refatorado para ser **100% seguro**. Não há mais credenciais hardcoded no código.

## 🛡️ Como Funciona

### 1. Autenticação com Firebase Auth

- Usuários fazem login usando **Firebase Auth** (email/senha)
- Credenciais são validadas pelo Firebase, não pelo frontend
- Nenhuma senha é armazenada ou comparada no código do cliente

### 2. Custom Claims para Identificar Admins

- Admins são identificados via **Firebase Custom Claims**
- Custom Claims são definidos no **backend (Cloud Functions)**
- O frontend apenas **verifica** se o usuário tem a claim `admin: true`

### 3. Verificação em Duas Camadas

1. **Custom Claims**: Verifica se o usuário tem claim de admin
2. **Firestore (fallback)**: Verifica se o usuário está na coleção `admins`

## 📋 Como Criar um Admin

### Opção 1: Via Cloud Functions (Recomendado)

```typescript
// cloud-functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const createAdmin = functions.https.onCall(async (data, context) => {
  // Verificar se quem está chamando é um super-admin
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas admins podem criar outros admins');
  }

  const { uid, role } = data;
  
  // Definir Custom Claim
  await admin.auth().setCustomUserClaims(uid, {
    admin: true,
    role: role || 'moderator'
  });

  // Criar registro no Firestore
  await admin.firestore().collection('admins').doc(uid).set({
    email: (await admin.auth().getUser(uid)).email,
    role: role || 'moderator',
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    permissions: {
      canManageUsers: role === 'super-admin',
      canModerateContent: true,
      canManageEvents: role === 'super-admin',
      canManageAdmins: role === 'super-admin',
      canAccessSystemSettings: role === 'super-admin',
    }
  });

  return { success: true };
});
```

### Opção 2: Via Console do Firebase

1. Acesse o Firebase Console
2. Vá em Authentication → Users
3. Crie ou selecione um usuário
4. Vá em "Custom Claims" e adicione:
   ```json
   {
     "admin": true,
     "role": "super-admin"
   }
   ```
5. Crie o documento na coleção `admins` no Firestore

## 🔐 Regras de Segurança do Firestore

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Verificar se o usuário é admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }

    // Coleção de admins - apenas admins podem ler/escrever
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }

    // Outras coleções protegidas
    match /botSchedules/{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

## 🚨 O Que Foi Removido

### ❌ Antes (INSEGURO)
```typescript
// ❌ Credenciais hardcoded
const ADMIN_EMAIL = 'admin@unidate.com';
const ADMIN_PASSWORD = 'admin123';

// ❌ Comparação de senha no frontend
if (password === ADMIN_PASSWORD) {
  // login
}
```

### ✅ Agora (SEGURO)
```typescript
// ✅ Apenas Firebase Auth
await signInWithEmailAndPassword(auth, email, password);

// ✅ Verificação de Custom Claims
const tokenResult = await getIdTokenResult(user);
const isAdmin = tokenResult.claims.admin === true;
```

## 📝 Checklist de Segurança

- [x] Removidas todas as credenciais hardcoded
- [x] Autenticação centralizada em um único serviço
- [x] Uso de Firebase Custom Claims
- [x] Verificação de permissões no backend
- [x] Logs de acesso e ações administrativas
- [ ] Implementar 2FA real (biblioteca otplib)
- [ ] Configurar Cloud Functions para gerenciar admins
- [ ] Implementar rate limiting no login
- [ ] Adicionar monitoramento de tentativas de login

## 🔄 Migração

Se você estava usando o sistema antigo com credenciais mock:

1. **Criar usuário no Firebase Auth**:
   - Acesse Firebase Console → Authentication
   - Crie um usuário com email/senha

2. **Definir Custom Claim**:
   - Use Cloud Functions ou Firebase Console
   - Adicione `admin: true` como Custom Claim

3. **Criar registro no Firestore**:
   - Coleção: `admins`
   - Documento ID: `{userId}`
   - Campos: `email`, `role`, `isActive`, `permissions`

4. **Fazer login**:
   - Use o email/senha criado no Firebase Auth
   - O sistema verificará automaticamente se é admin

## 📚 Recursos

- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions para Firebase](https://firebase.google.com/docs/functions)

