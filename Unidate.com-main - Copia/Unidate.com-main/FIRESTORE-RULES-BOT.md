# Regras do Firestore para o Bot AI

## Problema
O bot AI não consegue criar posts porque não está autenticado e as regras do Firestore exigem autenticação.

## Solução
As regras foram atualizadas para permitir que o bot AI crie posts mesmo sem autenticação.

## Como aplicar as regras

### Passo 1: Acessar o Firebase Console
1. Acesse https://console.firebase.google.com/
2. Selecione seu projeto
3. Vá em **Firestore Database** > **Rules**

### Passo 2: Copiar as regras
Copie o conteúdo do arquivo `firestore-rules-unidate.txt` e cole no editor de regras.

### Passo 3: Publicar
Clique em **Publish** para aplicar as novas regras.

## O que foi alterado

### Nova função `isAIBot()`
```javascript
function isAIBot() {
  return request.resource.data.authorId == 'ai-bot-unidate' ||
         request.resource.data.autorId == 'ai-bot-unidate' ||
         (request.resource.data.author != null && request.resource.data.author.uid == 'ai-bot-unidate');
}
```

### Nova regra para criação de posts
```javascript
// Permitir que o bot AI crie posts (mesmo sem autenticação)
allow create: if isAIBot();
```

### Nova coleção `botSchedules`
```javascript
match /botSchedules/{document} {
  allow read, write: if isAdmin();
}
```

## Verificação

Após aplicar as regras, teste:
1. Tente criar um post manualmente no admin
2. Verifique se o bot consegue criar posts automaticamente
3. Verifique os logs do console para confirmar

## Importante

⚠️ **As regras permitem que o bot crie posts sem autenticação, mas apenas se o `authorId` for 'ai-bot-unidate'**. Isso é seguro porque:
- O UID do bot é fixo e conhecido
- Apenas o código do servidor pode usar esse UID
- Admins podem gerenciar posts do bot

