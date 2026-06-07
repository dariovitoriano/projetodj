require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


const users = [];

const JWT_SECRET = process.env.JWT_SECRET || 'segredoJWT';

// Rota de registro
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(409).json({ message: 'Usuário já cadastrado.' });
  }

  const user = { email, password };
  users.push(user);

  return res.status(201).json({ message: 'Usuário registrado com sucesso.' });
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

  return res.json({ token });
});


function autenticarJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const dados = jwt.verify(token, JWT_SECRET);
    req.user = dados;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido.' });
  }
}

// Lista de músicas
const musicas = [
  { id: 1, titulo: 'Música A', artista: 'DJ A' },
  { id: 2, titulo: 'Música B', artista: 'DJ B' },
  { id: 3, titulo: 'Música C', artista: 'DJ C' }
];


app.get('/musicas', autenticarJWT, (req, res) => {
  return res.json(musicas);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});