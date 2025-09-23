# 🔐 Configuração do Google Authentication

## 📋 **Passos para Configurar Google Auth no Firebase**

### 1. **Acessar Firebase Console**
- Vá para: https://console.firebase.google.com
- Selecione o projeto: `unidate-2bcbc`

### 2. **Habilitar Google Authentication**
1. No menu lateral, clique em **"Authentication"**
2. Clique na aba **"Sign-in method"**
3. Clique em **"Google"**
4. Ative o toggle **"Enable"**
5. Configure:
   - **Project support email**: `matheusfc777@gmail.com`
   - **Project public-facing name**: `UniDate`
6. Clique em **"Save"**

### 3. **Configurar Domínios Autorizados**
1. Na aba **"Settings"** do Authentication
2. Em **"Authorized domains"**, adicione:
   - `localhost` (para desenvolvimento)
   - `unidate.com` (para produção)
   - `unidate-2bcbc.firebaseapp.com` (domínio do Firebase)

### 4. **Configurar OAuth 2.0 (Opcional)**
1. Vá para: https://console.developers.google.com
2. Selecione o projeto: `project-717555700125`
3. Em **"Credentials"**, configure:
   - **OAuth consent screen**
   - **OAuth 2.0 Client IDs**

### 5. **Testar a Configuração**
1. Execute o site: `npm start`
2. Acesse: http://localhost:3000
3. Clique em "Entrar"
4. Teste o botão "Continuar com Google"

## 🚨 **Problemas Comuns e Soluções**

### **Erro: "This app is not verified"**
- **Solução**: Configure o OAuth consent screen no Google Cloud Console
- Adicione domínios autorizados
- Configure informações do app

### **Erro: "Invalid client"**
- **Solução**: Verifique se o Google Auth está habilitado no Firebase
- Confirme se os domínios estão autorizados

### **Erro: "Popup blocked"**
- **Solução**: Use `signInWithRedirect` em vez de `signInWithPopup`
- Ou configure o navegador para permitir popups

## 📱 **Configuração para Mobile (Futuro)**

### **Android**
1. Adicione SHA-1 fingerprint no Firebase Console
2. Configure `google-services.json`
3. Atualize `build.gradle`

### **iOS**
1. Adicione SHA-1 fingerprint no Firebase Console
2. Configure `GoogleService-Info.plist`
3. Atualize `Info.plist`

## 🔧 **Código de Exemplo**

```typescript
// Login com Google
import { signInWithGooglePopup } from './firebase/googleAuth';

const handleGoogleLogin = async () => {
  try {
    const result = await signInWithGooglePopup();
    console.log('Usuário logado:', result.user);
  } catch (error) {
    console.error('Erro no login:', error);
  }
};
```

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Confirme se o Firebase está configurado corretamente
3. Teste em modo incógnito
4. Verifique se os domínios estão autorizados

---

**✅ Após configurar, o login com Google funcionará automaticamente!**
