# UniDate 🎓💜

> **Sua faculdade. Suas conexões.**

UniDate é uma plataforma social hiperlocal e exclusiva para estudantes universitários, projetada para facilitar conexões sociais, acadêmicas e românticas dentro do ecossistema de uma faculdade.

## 🌟 Características

### 🎯 **Descoberta de Perfis**
- Interface estilo Tinder para conhecer pessoas do campus
- Sistema de match quando há interesse mútuo
- Chat privado habilitado apenas entre matches

### 📱 **UniVerso Feed**
- Timeline pública e cronológica do campus
- Posts de texto, imagem e enquetes
- Sistema de hashtags (#CALCULO1, #FESTADODIREITO)
- Função especial **#TeVi** - "Eu te vi em [Local], você estava vestindo [Roupa]"

### 👥 **Sistema de Grupos**
- Criar e descobrir grupos públicos
- Chat em tempo real dentro de cada grupo
- Comunidades por interesses e cursos

### ⚙️ **Painel Administrativo**
- Dashboard com métricas em tempo real
- Gerenciamento de usuários
- Moderação de conteúdo
- Controle de eventos e anúncios

## 🚀 Tecnologias

- **Frontend:** React.js + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Analytics:** Firebase Analytics
- **Icons:** Lucide React
- **Routing:** React Router
- **PWA:** Service Worker para funcionalidades offline e instalação

## 📦 Instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure o Firebase:**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication, Firestore e Storage
   - Copie as credenciais para `Unidate.com-main/unidate-app/src/firebase/config.ts`

3. **Execute o projeto:**
```bash
cd "Unidate.com-main/unidate-app"
npm start
```

## 🔧 Configuração do Firebase

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id",
  measurementId: "G-XXXXXXXXXX"
};
```

## 🎨 Design System

### Cores
- **Primária:** Gradiente roxo-rosa (#8B5CF6 → #EC4899)
- **Secundária:** Tons de cinza e branco
- **Accent:** Azul e verde para elementos especiais

### Logo
- **Símbolo:** Graduation cap + Heart integrados
- **Gradiente:** Roxo para rosa
- **Tipografia:** Bold, moderna

## 📱 Funcionalidades

### Para Usuários
- ✅ Cadastro com e-mail institucional
- ✅ Onboarding multi-step
- ✅ Perfil modular com "cards"
- ✅ Sistema de swipe/match
- ✅ Chat em tempo real
- ✅ Feed público do campus
- ✅ Grupos e comunidades
- ✅ Suporte a PWA (Progressive Web App)

### Para Administradores
- ✅ Dashboard com KPIs
- ✅ Gerenciamento de usuários
- ✅ Moderação de conteúdo
- ✅ Controle de eventos
- ✅ Sistema de permissões
- ✅ Autenticação 2FA

## 🏗️ Estrutura do Projeto

```
Unidate.com-main/
├── unidate-app/          # Aplicação React principal
│   ├── public/
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── contexts/     # Context API (Auth, Admin)
│   │   ├── firebase/     # Configuração e funções Firebase
│   │   ├── pages/        # Páginas da aplicação
│   │   └── App.tsx
│   ├── package.json
│   └── README.md
└── README.md             # Este arquivo
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente do Firebase
3. Deploy automático a cada push

### Firebase Hosting
```bash
cd "Unidate.com-main/unidate-app"
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

Desenvolvido por estudantes para estudantes.

## 📞 Contato

- **Email:** contato@unidate.com
- **Website:** [unidate.com](https://unidate.com)

---

**UniDate** - Conectando estudantes universitários através de tecnologia e empatia. 🎓💜

