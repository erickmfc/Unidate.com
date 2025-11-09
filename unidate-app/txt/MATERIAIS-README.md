# 📚 Sistema de Materiais Educacionais - UniDate

## Visão Geral

O Sistema de Materiais Educacionais do UniDate permite que estudantes compartilhem e descubram materiais de estudo de qualidade, incluindo resumos, livros, vídeos, links e muito mais.

## 🎯 Funcionalidades Principais

### 1. **Tipos de Materiais Suportados**

#### 📝 Resumos e Anotações
- **Formatos**: PDF, DOC, TXT
- **Conteúdo**: Resumos de aulas, anotações pessoais, mapas mentais
- **Exemplo**: "Resumo de Cálculo I - Derivadas e Integrais"
- **Tags**: #calculo, #resumo, #derivadas

#### 📖 Livros e E-books
- **Formatos**: PDF, EPUB
- **Conteúdo**: Livros digitais, capítulos específicos, bibliografias
- **Exemplo**: "Física I - Halliday & Resnick - Capítulo 5"
- **Tags**: #fisica, #livro, #mecanica

#### 🎥 Vídeos Educativos
- **Formatos**: MP4, AVI, links do YouTube
- **Conteúdo**: Aulas gravadas, tutoriais, explicações
- **Exemplo**: "Tutorial de Programação em Python - Listas"
- **Tags**: #programacao, #python, #tutorial

#### 🔗 Links e Recursos Online
- **Formatos**: URLs, artigos, sites educacionais
- **Conteúdo**: Sites de exercícios, simuladores, calculadoras
- **Exemplo**: "Calculadora de Derivadas Online"
- **Tags**: #calculo, #ferramenta, #online

### 2. **Sistema de Categorização**

#### Por Matéria:
- Matemática (Cálculo, Álgebra, Estatística)
- Física (Mecânica, Termodinâmica, Eletromagnetismo)
- Química (Orgânica, Inorgânica, Físico-Química)
- Programação (Python, Java, C++)
- Humanas (História, Literatura, Filosofia)
- Biologia, Engenharia, Medicina, Direito, Economia

#### Por Tipo:
- Resumos
- Exercícios
- Provas Antigas
- Tutoriais
- Ferramentas

#### Por Dificuldade:
- 🟢 **Iniciante** - Conteúdo básico e introdutório
- 🟡 **Intermediário** - Conteúdo de nível médio
- 🔴 **Avançado** - Conteúdo complexo e especializado

### 3. **Sistema de Avaliação**

#### ⭐ Rating por Estrelas (1-5):
- ⭐ (1) - Muito ruim
- ⭐⭐ (2) - Ruim
- ⭐⭐⭐ (3) - Regular
- ⭐⭐⭐⭐ (4) - Bom
- ⭐⭐⭐⭐⭐ (5) - Excelente

#### 💬 Comentários e Reviews:
- "Muito útil para a prova!"
- "Faltou explicar melhor as integrais"
- "Perfeito para revisar antes da aula"

## 🏗️ Arquitetura Técnica

### Estrutura de Arquivos

```
src/
├── types/
│   └── materials.ts              # Tipos TypeScript
├── services/
│   └── materialsService.ts       # Serviço Firestore
├── components/Materials/
│   ├── MaterialCard.tsx          # Card de material
│   ├── MaterialFilters.tsx       # Sistema de filtros
│   ├── MaterialUploadModal.tsx   # Modal de upload
│   └── RatingSystem.tsx          # Sistema de avaliação
└── pages/
    ├── Materials.tsx             # Página principal
    └── MaterialDetails.tsx       # Página de detalhes
```

### Tecnologias Utilizadas

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase Firestore
- **Storage**: Firebase Storage
- **Icons**: Lucide React

## 🚀 Como Usar

### Para Estudantes

1. **Navegar para Materiais**
   - Acesse o menu "Materiais" na barra de navegação
   - Explore materiais por categoria, matéria ou dificuldade

2. **Filtrar e Buscar**
   - Use os filtros na sidebar para refinar resultados
   - Digite termos na barra de busca
   - Combine múltiplos filtros para resultados precisos

3. **Visualizar Material**
   - Clique em "Ver Detalhes" para abrir a página completa
   - Veja estatísticas, avaliações e materiais relacionados

4. **Fazer Download**
   - Clique no botão "Download" para baixar arquivos
   - Para links externos, use "Abrir Link"

5. **Avaliar Material**
   - Dê uma nota de 1 a 5 estrelas
   - Adicione comentários opcionais
   - Veja avaliações de outros usuários

### Para Compartilhar Materiais

1. **Criar Material**
   - Clique em "Compartilhar Material"
   - Preencha as informações obrigatórias
   - Selecione o tipo e categoria apropriados

2. **Upload de Arquivo**
   - Arraste e solte ou clique para selecionar
   - Formatos suportados: PDF, DOC, TXT, EPUB, MP4, AVI, JPG, PNG
   - Tamanho máximo: 50MB

3. **Adicionar Tags**
   - Use tags relevantes para facilitar a descoberta
   - Exemplo: #calculo, #derivadas, #resumo

4. **Aguardar Aprovação**
   - Materiais são revisados antes de serem publicados
   - Você receberá notificação quando aprovado

## 🔧 Configuração

### 1. Regras do Firestore

Adicione as regras do arquivo `firestore-rules-materials.txt` ao seu projeto Firebase:

```bash
# No Console do Firebase
# Firestore Database > Rules
# Cole e publique as regras
```

### 2. Configuração do Storage

Certifique-se de que o Firebase Storage está configurado:

```javascript
// firebase/config.ts
import { storage } from 'firebase/storage';

export { storage };
```

### 3. Estrutura do Banco de Dados

O sistema criará automaticamente a coleção `materials` com a seguinte estrutura:

```javascript
{
  id: "material_id",
  title: "Título do Material",
  description: "Descrição detalhada",
  type: "resumo", // resumo, livro, video, link, exercicio, prova
  subject: "matematica", // matematica, fisica, quimica, etc.
  category: "resumos", // resumos, exercicios, provas_antigas, etc.
  difficulty: "iniciante", // iniciante, intermediario, avancado
  tags: ["calculo", "derivadas"],
  authorId: "user_id",
  authorName: "Nome do Autor",
  fileUrl: "https://storage.url/file.pdf",
  fileSize: 1024000,
  fileName: "resumo.pdf",
  externalUrl: "https://example.com",
  ratings: [
    {
      userId: "user_id",
      rating: 5,
      comment: "Excelente material!",
      createdAt: "2024-01-01T00:00:00Z"
    }
  ],
  averageRating: 4.5,
  totalRatings: 10,
  downloads: [
    {
      userId: "user_id",
      downloadedAt: "2024-01-01T00:00:00Z"
    }
  ],
  totalDownloads: 25,
  views: 100,
  isApproved: true,
  isPublic: true,
  reportedCount: 0,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  language: "pt-BR"
}
```

## 📊 Estatísticas e Analytics

O sistema coleta automaticamente:

- **Visualizações**: Cada vez que alguém acessa o material
- **Downloads**: Cada download realizado
- **Avaliações**: Notas e comentários dos usuários
- **Engajamento**: Tempo de visualização, compartilhamentos

## 🛡️ Moderação e Segurança

### Sistema de Aprovação
- Todos os materiais passam por moderação
- Apenas administradores podem aprovar/rejeitar
- Materiais inapropriados são removidos

### Validação de Conteúdo
- Verificação de tipos de arquivo
- Limitação de tamanho (50MB)
- Validação de URLs externas
- Filtro de conteúdo malicioso

### Relatórios
- Usuários podem reportar materiais inadequados
- Sistema de denúncia com categorias
- Ação rápida da moderação

## 🎨 Personalização

### Temas e Cores
- Sistema de cores baseado em dificuldade
- Ícones específicos para cada tipo de material
- Layout responsivo para mobile e desktop

### Filtros Avançados
- Filtro por múltiplas categorias
- Busca por texto livre
- Ordenação por popularidade, data, avaliação

## 🔮 Funcionalidades Futuras

- [ ] Sistema de favoritos
- [ ] Recomendações personalizadas
- [ ] Integração com calendário acadêmico
- [ ] Chat para discussões sobre materiais
- [ ] Sistema de badges e conquistas
- [ ] Exportação de materiais em PDF
- [ ] Integração com Google Drive/Dropbox
- [ ] Sistema de tradução automática
- [ ] Análise de sentimento nas avaliações
- [ ] Dashboard de estatísticas para autores

## 🤝 Contribuição

Para contribuir com o sistema de materiais:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste thoroughly
5. Submeta um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:

- 📧 Email: suporte@unidate.com
- 💬 Discord: [Link do servidor]
- 📱 WhatsApp: [Número de suporte]

---

**Desenvolvido com ❤️ pela equipe UniDate**
