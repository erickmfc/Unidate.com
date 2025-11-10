# 🛡️ Configuração Segura do Painel de Administração

## ⚠️ IMPORTANTE: Sistema Seguro Implementado

O sistema de autenticação foi **completamente refatorado** para remover credenciais hardcoded. Agora usa **Firebase Auth com Custom Claims**.

## 📋 Como Configurar o Primeiro Admin

### Método 1: Via Firebase Console (Recomendado para Desenvolvimento)

1. **Criar usuário no Firebase Auth**:
   - Acesse [Firebase Console](https://console.firebase.google.com)
   - Vá em **Authentication** → **Users**
   - Clique em **Add User**
   - Digite email e senha
   - Clique em **Add**

2. **Definir Custom Claim**:
   - No Firebase Console, vá em **Authentication** → **Users**
   - Clique no usuário criado
   - Role até **Custom Claims**
   - Clique em **Add Custom Claim**
   - Adicione:
     ```json
     {
       "admin": true,
       "role": "super-admin"
     }
     ```
   - Clique em **Save**

3. **Criar registro no Firestore**:
   - Vá em **Firestore Database**
   - Crie a coleção `admins` (se não existir)
   - Crie um documento com ID = `{userId}` (o UID do usuário)
   - Adicione os campos:
     ```json
     {
       "email": "seu-email@exemplo.com",
       "displayName": "Nome do Admin",
       "role": "super-admin",
       "isActive": true,
       "twoFactorEnabled": false,
       "createdAt": "2024-01-01T00:00:00Z",
       "permissions": {
         "canManageUsers": true,
         "canModerateContent": true,
         "canManageEvents": true,
         "canManageAdmins": true,
         "canAccessSystemSettings": true
       }
     }
     ```

4. **Fazer Login**:
   - Acesse `http://localhost:3000/admin/login`
   - Use o email/senha criado no Firebase Auth
   - O sistema verificará automaticamente se você é admin

### Método 2: Via Cloud Functions (Recomendado para Produção)

Crie uma Cloud Function para gerenciar admins:

```typescript
// cloud-functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const createAdmin = functions.https.onCall(async (data, context) => {
  // Verificar se quem está chamando é um super-admin
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied', 
      'Apenas admins podem criar outros admins'
    );
  }

  const { email, role = 'moderator' } = data;
  
  // Buscar usuário pelo email
  const user = await admin.auth().getUserByEmail(email);
  
  // Definir Custom Claim
  await admin.auth().setCustomUserClaims(user.uid, {
    admin: true,
    role: role
  });

  // Criar/atualizar registro no Firestore
  const permissions = {
    'super-admin': {
      canManageUsers: true,
      canModerateContent: true,
      canManageEvents: true,
      canManageAdmins: true,
      canAccessSystemSettings: true,
    },
    'moderator': {
      canManageUsers: true,
      canModerateContent: true,
      canManageEvents: false,
      canManageAdmins: false,
      canAccessSystemSettings: false,
    }
  };

  await admin.firestore().collection('admins').doc(user.uid).set({
    email: user.email,
    displayName: user.displayName || 'Admin',
    role: role,
    isActive: true,
    twoFactorEnabled: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    permissions: permissions[role]
  }, { merge: true });

  return { success: true, uid: user.uid };
});
```

## 🔐 Segurança

### O Que Foi Removido

- ❌ Credenciais hardcoded (`admin@unidate.com` / `admin123`)
- ❌ Comparação de senhas no frontend
- ❌ Sistema mock inseguro
- ❌ Autenticação duplicada

### O Que Foi Implementado

- ✅ Firebase Auth para autenticação
- ✅ Custom Claims para identificar admins
- ✅ Verificação de permissões no backend
- ✅ Autenticação centralizada em um único serviço
- ✅ Logs de acesso e ações

## 🚨 Troubleshooting

### "Usuário não possui permissões de administrador"

**Causa**: O usuário não tem Custom Claim de admin ou não está na coleção `admins`.

**Solução**:
1. Verifique se o Custom Claim foi definido no Firebase Console
2. Verifique se o documento existe na coleção `admins` no Firestore
3. Certifique-se de que `isActive: true` no documento

### "Firebase Auth não inicializado"

**Causa**: Firebase não foi inicializado corretamente.

**Solução**:
1. Verifique se `firebase/config.ts` está configurado
2. Verifique se as variáveis de ambiente estão definidas
3. Verifique se o Firebase está conectado

### "Conta de administrador desativada"

**Causa**: O campo `isActive` está `false` no Firestore.

**Solução**:
1. Acesse Firestore → `admins` → `{userId}`
2. Altere `isActive` para `true`

## 📚 Próximos Passos

1. **Implementar Cloud Functions** para gerenciar admins
2. **Configurar Firestore Rules** para proteger dados
3. **Implementar 2FA real** usando biblioteca `otplib`
4. **Adicionar rate limiting** no login
5. **Implementar monitoramento** de tentativas de login

## 🔗 Recursos

- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions](https://firebase.google.com/docs/functions)

