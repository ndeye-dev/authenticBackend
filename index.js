const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');  // Assurez-vous que le fichier authRoutes.js existe bien dans le dossier routes

const app = express();

// Middleware
app.use(express.json());  // Pour analyser le corps des requêtes JSON
app.use(cors());          // Pour permettre les requêtes depuis le frontend (React)

// Connexion à MongoDB
mongoose.connect('mongodb+srv://projetapp:basedonnee@cluster0.lzatl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connexion réussie à MongoDB');
  })
  .catch((error) => {
    console.error('Erreur lors de la connexion à MongoDB :', error);
  });

// Routes d'authentification
app.use('/api/auth/', authRoutes);

// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
