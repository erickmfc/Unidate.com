# UniDate - Plataforma Social Universitária

UniDate é uma plataforma social hiperlocal e exclusiva para estudantes universitários, projetada para facilitar conexões sociais, acadêmicas e românticas dentro do ecossistema de uma faculdade.

## 🎯 Conceito

A plataforma integra três pilares principais:
- **Descoberta de perfis** (estilo Tinder)
- **Feed de notícias público do campus** (estilo Twitter)
- **Grupos de interesse**

## 🚀 Tecnologias Utilizadas

### Frontend
- **React.js** com TypeScript
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Lucide React** para ícones
- **Firebase SDK** para integração

### Backend & Serviços
- **Firebase Authentication** para autenticação
- **Firebase Firestore** para banco de dados
- **Firebase Storage** para armazenamento de mídia

### Hospedagem
- **Vercel** (Frontend)
- **Firebase Hosting** (alternativa)

## 📱 Funcionalidades Implementadas

### ✅ Sprint 1: Fundação e Autenticação
- [x] Configuração da arquitetura do projeto
- [x] Sistema de cadastro com verificação de e-mail institucional
- [x] Sistema de login e recuperação de senha
- [x] Contexto de autenticação global

### ✅ Sprint 2: Perfis e Sistema de Match
- [x] Criação e edição de perfil
- [x] Interface de swipe para descoberta
- [x] Sistema de match
- [x] Visualização de perfis

### ✅ Sprint 3: Chat e Feed
- [x] Chat 1-para-1 em tempo real
- [x] Feed "UniVerso" público
- [x] Criação e visualização de posts
- [x] Sistema de curtidas e comentários

### ✅ Sprint 4: Grupos e Recursos
- [x] Sistema de criação e participação em grupos
- [x] Chat em grupo
- [x] Configurações de usuário
- [x] Sistema de notificações

## 🎨 Design System

### Paleta de Cores
- **Primária**: Índigo (#6366f1) - Confiança e tecnologia
- **Secundária**: Âmbar (#f59e0b) - Energia e criatividade
- **Destaque**: Rosa (#ec4899) - Paixão e conexão
- **Sucesso**: Verde (#10b981) - Crescimento e harmonia

### Componentes
- Sistema de design consistente com Tailwind CSS
- Componentes reutilizáveis
- Animações suaves e modernas
- Design responsivo para todos os dispositivos

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Firebase

### Passos para instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd unidate-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Authentication, Firestore e Storage
   - Copie as configurações do Firebase
   - Atualize o arquivo `src/firebase/config.ts`

4. **Execute o projeto**
```bash
npm start
```

O projeto estará disponível em `
http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Auth/           # Componentes de autenticação
│   ├── Layout/         # Componentes de layout
│   └── UI/             # Componentes de interface
├── contexts/           # Contextos React
├── firebase/           # Configuração e serviços Firebase
├── pages/              # Páginas da aplicação
├── App.tsx             # Componente principal
└── index.css           # Estilos globais
```

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm build` - Cria build de produção
- `npm test` - Executa os testes
- `npm run eject` - Ejecta do Create React App

## 🌟 Funcionalidades Principais

### 1. Sistema de Descoberta
- Interface de swipe intuitiva
- Algoritmo de matching baseado em interesses
- Perfis detalhados com informações acadêmicas

### 2. Feed UniVerso
- Timeline pública do campus
- Posts com texto e imagens
- Sistema de curtidas e comentários
- Eventos e anúncios

### 3. Sistema de Grupos
- Criação de grupos por interesse
- Chat em tempo real
- Eventos e atividades
- Moderação de conteúdo

### 4. Chat Integrado
- Mensagens 1-para-1
- Chat em grupo
- Status online/offline
- Notificações em tempo real

## 🔐 Segurança

- Autenticação obrigatória com e-mail institucional
- Verificação de e-mail para ativação de conta
- Dados protegidos com Firebase Security Rules
- Validação de entrada em todos os formulários

## 📱 Responsividade

O UniDate foi desenvolvido com foco na experiência mobile-first, garantindo:
- Interface otimizada para smartphones
- Navegação intuitiva em tablets
- Experiência completa em desktop

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Firebase Hosting
```bash
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

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@unidate.com
- Discord: [Link do servidor]
- GitHub Issues: [Link para issues]

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] App mobile com React Native
- [ ] Sistema de notificações push
- [ ] Integração com calendário acadêmico
- [ ] Sistema de reputação
- [ ] Moderação automática com IA
- [ ] Integração com redes sociais

---

**UniDate** - Conectando estudantes universitários em todo o Brasil! 🎓✨