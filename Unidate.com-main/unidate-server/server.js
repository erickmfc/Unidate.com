const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Inicializar SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite.');
  }
});

// Criar tabelas se não existirem
db.serialize(() => {
  // Tabela de usuários
  db.run(`CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    displayName TEXT,
    userType TEXT,
    registrationNumber TEXT,
    university TEXT,
    course TEXT,
    year INTEGER,
    period INTEGER,
    bio TEXT,
    interests TEXT,
    isVerified INTEGER,
    isEmailVerified INTEGER,
    onboardingCompleted INTEGER,
    photoURL TEXT,
    createdAt TEXT,
    updatedAt TEXT
  )`);

  // Adicionar coluna password se não existir (migração para banco existente)
  db.run(`ALTER TABLE users ADD COLUMN password TEXT`, (err) => {
    // Ignora erro se coluna já existe
  });

  // Tabela de posts
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    titulo TEXT,
    conteudo TEXT,
    autorId TEXT,
    autorNome TEXT,
    autorAvatar TEXT,
    autorCurso TEXT,
    autorUniversidade TEXT,
    dataCriacao TEXT,
    curtidasPor TEXT, -- Salvar como array JSON [uid1, uid2...]
    numeroComentarios INTEGER,
    hashtags TEXT, -- Salvar como array JSON
    tipo TEXT
  )`);
  
    // Seed de usuários se a tabela estiver vazia (ou contiver apenas o próprio usuário)
  db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
    if (err) {
      console.error('Erro ao verificar usuários para seed:', err);
      return;
    }
    if (row && row.count <= 1) {
      console.log('🌱 Semeando usuários mock no banco SQLite...');
      const defaultMock = [
        {
          uid: 'mock_user_1',
          email: 'mariana.costa@ufrj.br',
          password: '123',
          displayName: 'Mariana Costa',
          userType: 'aluno',
          registrationNumber: '2023001',
          university: 'UFRJ - Universidade Federal do Rio de Janeiro',
          course: 'Medicina',
          year: 2023,
          period: 6,
          bio: 'Apaixonada por neurociência, livros de mistério e café. No tempo livre gosto de correr na praia e ouvir podcasts.',
          interests: JSON.stringify(['Estudos', 'Esportes', 'Leitura', 'Café']),
          isVerified: 1,
          isEmailVerified: 1,
          onboardingCompleted: 1,
          photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'
        },
        {
          uid: 'mock_user_2',
          email: 'lucas.souza@ufrj.br',
          password: '123',
          displayName: 'Lucas Souza',
          userType: 'aluno',
          registrationNumber: '2024002',
          university: 'UFRJ - Universidade Federal do Rio de Janeiro',
          course: 'Engenharia de Computação',
          year: 2024,
          period: 4,
          bio: 'Desenvolvedor nas horas vagas. Gosto de hackathons, basquete e pizzas nas sextas-feiras. Vamos programar algo juntos?',
          interests: JSON.stringify(['Programação', 'Jogos', 'Hackathons', 'Basquete']),
          isVerified: 0,
          isEmailVerified: 1,
          onboardingCompleted: 1,
          photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
        },
        {
          uid: 'mock_user_3',
          email: 'beatriz.santos@ufrj.br',
          password: '123',
          displayName: 'Beatriz Santos',
          userType: 'aluno',
          registrationNumber: '2022003',
          university: 'UFRJ - Universidade Federal do Rio de Janeiro',
          course: 'Psicologia',
          year: 2022,
          period: 8,
          bio: 'Interessada em comportamento humano, música indie e fotografia analógica. Adoro conhecer novos cafés pela cidade.',
          interests: JSON.stringify(['Música', 'Fotografia', 'Psicologia', 'Arte']),
          isVerified: 1,
          isEmailVerified: 1,
          onboardingCompleted: 1,
          photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'
        },
        {
          uid: 'mock_user_4',
          email: 'gabriel.lima@ufrj.br',
          password: '123',
          displayName: 'Gabriel Lima',
          userType: 'aluno',
          registrationNumber: '2025004',
          university: 'UFRJ - Universidade Federal do Rio de Janeiro',
          course: 'Administração',
          year: 2025,
          period: 2,
          bio: 'Sempre buscando novas ideias de negócios. Pratico crossfit, amo viajar e gosto de bater um papo sobre startups.',
          interests: JSON.stringify(['Empreendedorismo', 'Viagens', 'Crossfit', 'Networking']),
          isVerified: 0,
          isEmailVerified: 1,
          onboardingCompleted: 1,
          photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
        },
        {
          uid: 'mock_user_5',
          email: 'juliana.rocha@ufrj.br',
          password: '123',
          displayName: 'Juliana Rocha',
          userType: 'aluno',
          registrationNumber: '2023005',
          university: 'UFRJ - Universidade Federal do Rio de Janeiro',
          course: 'Design de Produto',
          year: 2023,
          period: 5,
          bio: 'Criativa nata. Desenho desde criança, amo museus, cinema cult e plantas. Minha casa parece uma floresta.',
          interests: JSON.stringify(['Design', 'Cinema', 'Desenho', 'Plantas']),
          isVerified: 1,
          isEmailVerified: 1,
          onboardingCompleted: 1,
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
        }
      ];

      const stmt = db.prepare(`INSERT OR IGNORE INTO users (
        uid, email, password, displayName, userType, registrationNumber, university, course, year, period, 
        bio, interests, isVerified, isEmailVerified, onboardingCompleted, photoURL, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      const now = new Date().toISOString();
      defaultMock.forEach(u => {
        stmt.run(
          u.uid, u.email, u.password, u.displayName, u.userType, u.registrationNumber, u.university, u.course, u.year, u.period,
          u.bio, u.interests, u.isVerified, u.isEmailVerified, u.onboardingCompleted, u.photoURL, now, now
        );
      });
      stmt.finalize();
      console.log('✅ Usuários semeados com sucesso.');
    }
  });

  console.log('✅ Tabelas prontas no SQLite.');
});

// Helper para converter arrays/objetos em JSON string para SQLite
function toJSON(data) {
  return JSON.stringify(data || []);
}

function fromJSON(str) {
  try {
    return JSON.parse(str || '[]');
  } catch (e) {
    return [];
  }
}

// === ENDPOINTS DE AUTENTICAÇÃO ===

// Registrar
app.post('/api/auth/register', (req, res) => {
  const {
    email,
    password,
    displayName,
    registrationNumber,
    university,
    course,
    year,
    period,
    userType = 'aluno'
  } = req.body;

  const uid = 'sqlite_' + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  
  const query = `INSERT INTO users (
    uid, email, password, displayName, userType, registrationNumber, university, course, year, period, 
    bio, interests, isVerified, isEmailVerified, onboardingCompleted, photoURL, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    uid, email, password || '', displayName, userType, registrationNumber, university, course, year, period,
    'Estudante Universitário', toJSON([]), 1, 1, 1, '/api/placeholder/40/40', now, now
  ];

  db.run(query, values, function(err) {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: 'E-mail ou matrícula já cadastrados' });
    }
    
    // Retornar usuário criado
    db.get('SELECT * FROM users WHERE uid = ?', [uid], (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: 'Erro ao registrar usuário' });
      }
      user.interests = fromJSON(user.interests);
      res.status(201).json({ user });
    });
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!user) {
      return res.status(404).json({ error: 'E-mail não encontrado. Verifique ou cadastre-se.' });
    }

    // Verificar senha
    if (user.password && password && user.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }
    
    user.interests = fromJSON(user.interests);
    res.json({ user });
  });
});

// Login por matrícula
app.post('/api/auth/login-registration', (req, res) => {
  const { registrationNumber, password } = req.body;

  db.get('SELECT * FROM users WHERE registrationNumber = ?', [registrationNumber], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Matrícula não encontrada' });
    }
    
    user.interests = fromJSON(user.interests);
    res.json({ user });
  });
});

// === ENDPOINTS DE USUÁRIOS/PERFIL ===

// Buscar Perfil
// Listar todos os usuários (necessário para feed sugerido e descoberta offline)
app.get('/api/users', (req, res) => {
  db.all('SELECT uid, email, displayName, userType, university, course, year, period, bio, photoURL, isVerified, createdAt, updatedAt FROM users', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
    const users = rows.map(user => ({
      ...user,
      interests: fromJSON(user.interests)
    }));
    res.json(users);
  });
});

app.get('/api/users/:uid', (req, res) => {
  const { uid } = req.params;
  db.get('SELECT * FROM users WHERE uid = ?', [uid], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    user.interests = fromJSON(user.interests);
    res.json(user);
  });
});

// Atualizar Perfil
app.put('/api/users/:uid', (req, res) => {
  const { uid } = req.params;
  const updates = req.body;
  const now = new Date().toISOString();

  // Construir query dinamicamente
  const fields = [];
  const values = [];

  for (const [key, val] of Object.entries(updates)) {
    if (['displayName', 'bio', 'interests', 'photoURL', 'course', 'university', 'year', 'period'].includes(key)) {
      fields.push(`${key} = ?`);
      values.push(key === 'interests' ? toJSON(val) : val);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Nenhum campo válido para atualização fornecido' });
  }

  fields.push(`updatedAt = ?`);
  values.push(now);
  values.push(uid);

  const query = `UPDATE users SET ${fields.join(', ')} WHERE uid = ?`;

  db.run(query, values, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
    
    db.get('SELECT * FROM users WHERE uid = ?', [uid], (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: 'Erro ao carregar perfil atualizado' });
      }
      user.interests = fromJSON(user.interests);
      res.json(user);
    });
  });
});

// === ENDPOINTS DE POSTS ===

// Listar Posts
app.get('/api/posts', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY dataCriacao DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao carregar posts' });
    }
    const posts = rows.map(post => ({
      ...post,
      curtidasPor: fromJSON(post.curtidasPor),
      hashtags: fromJSON(post.hashtags)
    }));
    res.json(posts);
  });
});

// Criar Post
app.post('/api/posts', (req, res) => {
  const {
    titulo,
    conteudo,
    autorId,
    autorNome,
    autorAvatar,
    autorCurso,
    autorUniversidade,
    tipo = 'texto'
  } = req.body;

  const id = 'post_' + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  
  // Extrair hashtags
  const hashtagRegex = /#\w+/g;
  const matches = conteudo.match(hashtagRegex);
  const hashtags = matches ? matches.map(tag => tag.toLowerCase()) : [];

  const query = `INSERT INTO posts (
    id, titulo, conteudo, autorId, autorNome, autorAvatar, autorCurso, autorUniversidade, 
    dataCriacao, curtidasPor, numeroComentarios, hashtags, tipo
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    id, titulo, conteudo, autorId, autorNome, autorAvatar, autorCurso, autorUniversidade,
    now, toJSON([]), 0, toJSON(hashtags), tipo
  ];

  db.run(query, values, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao criar post' });
    }
    res.status(201).json({ id });
  });
});

// Curtir / Descurtir
app.post('/api/posts/:postId/like', (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  db.get('SELECT curtidasPor FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err || !post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    let curtidasPor = fromJSON(post.curtidasPor);
    if (curtidasPor.includes(userId)) {
      // Remove
      curtidasPor = curtidasPor.filter(id => id !== userId);
    } else {
      // Add
      curtidasPor.push(userId);
    }

    db.run('UPDATE posts SET curtidasPor = ? WHERE id = ?', [toJSON(curtidasPor), postId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao curtir post' });
      }
      res.json({ success: true, curtidasPor });
    });
  });
});

// Deletar Post
app.delete('/api/posts/:postId', (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  db.get('SELECT autorId FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err || !post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    if (post.autorId !== userId) {
      return res.status(403).json({ error: 'Sem permissão para deletar este post' });
    }

    db.run('DELETE FROM posts WHERE id = ?', [postId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao deletar post' });
      }
      res.json({ success: true });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend SQLite rodando na porta ${PORT}`);
});
