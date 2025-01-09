const express = require('express');
const { registerUser, loginUser , resetPasswordRequest ,resetPassword } = require('../controllers/authController');
const authRoutes = express.Router();

// Route pour l'inscription
authRoutes.post('/register', registerUser);

// Route pour la connexion
authRoutes.post('/login', loginUser);

authRoutes.post('/reset-password', resetPasswordRequest);

// Route pour la réinitialisation du mot de passe
authRoutes.post('/reset-password/:resetToken', resetPassword);


module.exports = authRoutes;
