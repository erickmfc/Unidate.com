# Instruções para Fazer Commit e Push

Execute os seguintes comandos no PowerShell ou Terminal na raiz do projeto:

## 1. Inicializar repositório Git (se ainda não foi feito)
```powershell
git init
```

## 2. Adicionar todos os arquivos
```powershell
git add .
```

## 3. Fazer commit
```powershell
git commit -m "Organização do projeto: remoção de arquivos duplicados e estruturação correta"
```

## 4. Configurar o remote (se ainda não foi configurado)
```powershell
git remote add origin https://github.com/erickmfc/Unidate.com.git
```

Ou, se já existe um remote:
```powershell
git remote set-url origin https://github.com/erickmfc/Unidate.com.git
```

## 5. Verificar/criar branch main
```powershell
git branch -M main
```

## 6. Fazer push
```powershell
git push -u origin main
```

**Nota:** Se for a primeira vez fazendo push, você pode precisar fazer pull primeiro:
```powershell
git pull origin main --allow-unrelated-histories
```

Depois tente o push novamente.

## Alternativa: Usar o script PowerShell

Você também pode executar o script `git-commit.ps1` que foi criado:
```powershell
powershell -ExecutionPolicy Bypass -File git-commit.ps1
```

