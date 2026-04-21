const express = require('express');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

// --- DONNÉES EN MÉMOIRE ---
let accounts = [];

// --- 1. CONFIGURATION SWAGGER (L'affichage) ---
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Mon compte Bancaire API - Devoir 304',
    version: '1.0.0',
    description: 'Système de gestion bancaire'
  },
  paths: {
    '/api/accounts': {
      get: { 
        summary: 'Liste des comptes',
        responses: { '200': { description: 'Succès' } } 
      },
      post: {
        summary: 'Créer un compte',
        requestBody: {
          content: { 'application/json': { schema: { 
            type: 'object', 
            properties: { 
                owner: { type: 'string', example: "Marc" }, 
                initialBalance: { type: 'number', example: 500 } 
            } 
          } } }
        },
        responses: { '201': { description: 'Créé' } }
      }
    },
    '/api/accounts/{id}': {
  get: {
    summary: 'Détails d un compte',
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: { '200': { description: 'OK' }, '404': { description: 'Non trouvé' } }
  }
},
    '/api/accounts/{id}/deposit': {
      post: {
        summary: 'Faire un dépôt',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { 
            type: 'object', properties: { amount: { type: 'number', example: 100 } } 
          } } }
        },
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/accounts/{id}/withdraw': {
      post: {
        summary: 'Faire un retrait',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { 
            type: 'object', properties: { amount: { type: 'number', example: 50 } } 
          } } }
        },
        responses: { '200': { description: 'OK' } }
      }
    }
  }
};

// Activation de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- 2. LES ROUTES API (La logique) ---

// Lister les comptes
app.get('/api/accounts', (req, res) => {
    res.json(accounts);
});

// Créer un compte
app.post('/api/accounts', (req, res) => {
  const { owner, initialBalance } = req.body;
  const newAccount = {
    id: Date.now().toString(),
    owner: owner || "Inconnu",
    balance: parseFloat(initialBalance) || 0,
    accountNumber: `ACC-${Math.floor(Math.random() * 9000)}`
  };
  accounts.push(newAccount);
  res.status(201).json(newAccount);
});
app.get('/api/accounts/:id', (req, res) => {
    const account = accounts.find(a => a.id === req.params.id);
    if (!account) return res.status(404).json({ error: "Compte non trouvé" });
    res.json(account);
});

// Faire un dépôt
app.post('/api/accounts/:id/deposit', (req, res) => {
    const accountId = req.params.id;
    const amount = parseFloat(req.body.amount);
    const account = accounts.find(a => a.id === accountId);

    if (!account) {
        return res.status(404).json({ error: "Compte non trouvé." });
    }

    account.balance += amount;
    res.json({ message: "Dépôt réussi", newBalance: account.balance });
});

// Faire un retrait
app.post('/api/accounts/:id/withdraw', (req, res) => {
    const accountId = req.params.id;
    const amount = parseFloat(req.body.amount);
    const account = accounts.find(a => a.id === accountId);

    if (!account) {
        return res.status(404).json({ error: "Compte non trouvé." });
    }
    if (amount > account.balance) {
        return res.status(400).json({ error: "Solde insuffisant." });
    }

    account.balance -= amount;
    res.json({ message: "Retrait réussi", newBalance: account.balance });
});

// Route d'accueil
app.get('/', (req, res) => {
  res.send('<h1>Serveur Node.js Port 5000</h1><p><a href="/api-docs/">Aller vers Swagger</a></p>');
});

// Lancement
// Remplace ton PORT fixe par ceci :
const PORT = process.env.PORT || 10000; // Render utilise souvent le port 10000 par défaut

app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
  console.log(`🔗 DOCUMENTATION : http://localhost:${PORT}/api-docs/`);
});