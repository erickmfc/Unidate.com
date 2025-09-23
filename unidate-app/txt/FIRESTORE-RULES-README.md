# 🔥 Regras do Firestore - UniDate

Este documento explica as regras de segurança do Firestore implementadas para o UniDate.

## 📋 Funcionalidades Cobertas

### ✅ **Sistema de Comentários Redesenhado**
- **Coleção**: `comments`
- **Permissões**: Usuários podem criar, ler, editar e deletar seus próprios comentários
- **Funcionalidade**: Sistema inline sem balão preto, com suporte a curtidas

### ✅ **Sistema de Grupos Melhorado**
- **Coleção**: `groups`
- **Permissões**: 
  - Todos podem ler grupos
  - Membros podem alterar foto do grupo
  - Usuários podem entrar/sair de grupos
  - Criador pode deletar grupo

### ✅ **Chat de Grupos**
- **Coleção**: `groupMessages`
- **Permissões**: Apenas membros do grupo podem ler e enviar mensagens
- **Funcionalidade**: Controle de acesso baseado em participação

### ✅ **Chat Privado (1-para-1)**
- **Coleções**: `chats` e `messages`
- **Permissões**: Apenas participantes podem acessar
- **Funcionalidade**: Sistema completo de mensagens privadas

### ✅ **Status Online/Offline**
- **Coleção**: `userStatus`
- **Permissões**: Usuários podem gerenciar seu próprio status
- **Funcionalidade**: Rastreamento de presença em tempo real

### ✅ **Sistema de Sintonia (Matches)**
- **Coleção**: `matches`
- **Permissões**: Usuários podem gerenciar apenas seus próprios matches
- **Funcionalidade**: Sistema de conexões entre usuários

### ✅ **Sistema de Colegas Universitários**
- **Coleção**: `friendships`
- **Permissões**: Usuários podem gerenciar suas amizades
- **Funcionalidade**: Sistema de amigos/colegas

## 🛡️ Segurança Implementada

### **Controle de Acesso por Função**
- **Usuários**: Podem gerenciar apenas seus próprios dados
- **Membros de Grupo**: Podem acessar chat e alterar foto do grupo
- **Administradores**: Acesso total ao sistema

### **Validação de Propriedade**
- Usuários só podem editar seus próprios posts, comentários e mensagens
- Verificação de participação em grupos para acesso ao chat
- Controle de propriedade para recursos sensíveis

### **Operações Específicas**
- **Curtir/Apoiar**: Atualização apenas de campos específicos
- **Entrar/Sair de Grupos**: Atualização apenas do array de membros
- **Alterar Foto**: Apenas membros podem alterar foto do grupo

## 📁 Estrutura das Coleções

```
📦 Firestore Database
├── 👤 users/{userId}
├── 📊 userStatus/{userId}
├── 📝 posts/{postId}
├── 💬 comments/{commentId}
├── 👥 groups/{groupId}
│   └── 📨 groupMessages/{messageId}
├── 💬 chats/{chatId}
├── 📨 messages/{messageId}
├── 💕 matches/{matchId}
├── 👫 friendships/{friendshipId}
├── 🔔 notifications/{notificationId}
├── 📁 uploads/{userId}/{allPaths}
└── 👨‍💼 admins/{adminId}
```

## 🚀 Como Aplicar as Regras

### **1. Versão Completa (Recomendada)**
```bash
# Use o arquivo: firestore-rules-complete.txt
# Inclui todas as funcionalidades e controles avançados
```

### **2. Versão Simples (Para Testes)**
```bash
# Use o arquivo: firestore-rules-simple.txt
# Versão simplificada para desenvolvimento
```

### **3. Aplicar no Firebase Console**
1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto UniDate
3. Vá em **Firestore Database** > **Regras**
4. Cole o conteúdo do arquivo escolhido
5. Clique em **Publicar**

## 🔧 Funcionalidades Específicas

### **Sistema de Comentários**
```javascript
// Usuários podem:
- Ler todos os comentários
- Criar comentários em posts
- Editar/deletar seus próprios comentários
- Curtir comentários de outros
```

### **Sistema de Grupos**
```javascript
// Membros podem:
- Alterar foto do grupo
- Entrar/sair de grupos
- Acessar chat do grupo
- Ver outros membros

// Criadores podem:
- Deletar o grupo
- Gerenciar editores
- Atualizar informações do grupo
```

### **Chat de Grupos**
```javascript
// Apenas membros podem:
- Ler mensagens do grupo
- Enviar mensagens
- Editar suas próprias mensagens
- Deletar suas próprias mensagens
```

### **Status Online/Offline**
```javascript
// Usuários podem:
- Atualizar seu próprio status
- Ver status de outros usuários
- Definir grupo atual
- Marcar como online/offline
```

## ⚠️ Considerações de Segurança

### **Validação de Dados**
- Todas as operações verificam autenticação
- Validação de propriedade para recursos sensíveis
- Controle de acesso baseado em roles

### **Prevenção de Ataques**
- Regra padrão nega tudo não especificado
- Validação de campos alterados
- Controle de acesso granular

### **Auditoria**
- Logs de todas as operações
- Rastreamento de mudanças
- Controle de versões

## 🎯 Próximos Passos

1. **Aplicar as regras** no Firebase Console
2. **Testar funcionalidades** com usuários reais
3. **Monitorar logs** de segurança
4. **Ajustar regras** conforme necessário

## 📞 Suporte

Para dúvidas sobre as regras do Firestore:
- Consulte a [documentação oficial](https://firebase.google.com/docs/firestore/security/get-started)
- Verifique os logs no Firebase Console
- Teste as regras no simulador do Firebase

---

**UniDate** - Sistema de regras de segurança completo e robusto! 🔒✨
