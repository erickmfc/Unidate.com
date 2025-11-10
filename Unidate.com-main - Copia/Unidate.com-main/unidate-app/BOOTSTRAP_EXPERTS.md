# Como Popular Especialistas no Firebase

Este guia explica como popular o Firebase com dados básicos de especialistas.

## Método 1: Via Console do Navegador

1. Abra a aplicação no navegador
2. Abra o Console do Desenvolvedor (F12)
3. Execute o seguinte comando:

```javascript
// Importar a função de bootstrap
import { bootstrapExperts } from './src/services/expertsBootstrap';

// Executar o bootstrap
await bootstrapExperts();
```

## Método 2: Via Código (Temporário)

Adicione temporariamente no início do arquivo `Materials.tsx` ou em qualquer componente:

```typescript
import { bootstrapExperts } from '../services/expertsBootstrap';

// Executar uma vez para popular
useEffect(() => {
  bootstrapExperts().catch(console.error);
}, []);
```

**⚠️ Importante:** Remova este código após popular os dados!

## Método 3: Via Script de Inicialização

Crie um arquivo `src/utils/initExperts.ts`:

```typescript
import { bootstrapExperts } from '../services/expertsBootstrap';

export async function initializeExperts() {
  try {
    await bootstrapExperts();
    console.log('✅ Especialistas inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar especialistas:', error);
  }
}
```

E chame no `App.tsx` ou em um componente de inicialização.

## Especialistas Incluídos

O bootstrap cria os seguintes especialistas:

1. **Prof. Aristóteles** - Filósofo Clássico
2. **Prof. René Descartes** - Filósofo Moderno
3. **Prof. Immanuel Kant** - Filósofo Iluminista
4. **Prof. Sócrates** - Filósofo Grego
5. **Prof. Platão** - Filósofo Clássico
6. **Prof. Friedrich Nietzsche** - Filósofo Existencial

## Verificação

Após executar o bootstrap, verifique no Firebase Console:
- Coleção: `experts`
- Deve conter 6 documentos

## Dados Padrão na Página

A página `Materials.tsx` já possui dados padrão que são exibidos caso não haja dados no Firebase. Quando os dados do Firebase são carregados, eles substituem os dados padrão automaticamente.

