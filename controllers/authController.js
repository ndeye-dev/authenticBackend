const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); 


// Demander une réinitialisation de mot de passe
const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  try {
    // Vérifier si l'utilisateur existe avec cet email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Générer un jeton de réinitialisation unique
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Définir la date d'expiration du jeton (par exemple 1 heure)
    const resetPasswordExpire = Date.now() + 3600000;

    // Sauvegarder le jeton et la date d'expiration dans la base de données
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Créer un lien de réinitialisation contenant le jeton
    const resetLink = `https://extraordinary-biscotti-eb6433.netlify.app/reset-password/${resetToken}`;

    // Configurer le transporteur d'email avec nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'gningngone50@gmail.com',  // Remplacez par votre email
        pass: 'rkkybzdfbaehcffa',  // Remplacez par votre mot de passe
      },
    });

    // Configurer les options d'email
    const mailOptions = {
      to: email,
      subject: 'Réinitialisation du mot de passe',
      text: `Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le lien suivant pour réinitialiser votre mot de passe: ${resetLink}`,
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    // Répondre avec un message de succès
    res.status(200).json({ message: 'Un email avec les instructions de réinitialisation a été envoyé.' });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation du mot de passe', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

// controllers/authController.js
const resetPassword = async (req, res) => {
  const { newPassword } = req.body;  // Récupère le nouveau mot de passe envoyé depuis le frontend
  const { resetToken } = req.params;  // Récupère le token de réinitialisation dans l'URL

  try {
    // Vérification du jeton de réinitialisation et de son expiration
    const user = await User.findOne({
      resetPasswordToken: resetToken,  // Cherche l'utilisateur avec le jeton spécifié
      resetPasswordExpire: { $gt: Date.now() },  // Vérifie si le jeton n'est pas expiré
    });

    if (!user) {
      // Si aucun utilisateur n'est trouvé ou si le jeton est expiré, renvoyer une erreur
      return res.status(400).json({ message: 'Jeton invalide ou expiré. Veuillez vérifier votre lien.' });
    }

    // Met à jour le mot de passe de l'utilisateur
    user.password = newPassword;
    user.resetPasswordToken = undefined;  // Supprime le jeton de réinitialisation
    user.resetPasswordExpire = undefined;  // Supprime l'expiration du jeton
    await user.save();  // Sauvegarde l'utilisateur avec le nouveau mot de passe

    // Réponse de succès
    res.status(200).json({ message: 'Votre mot de passe a été réinitialisé avec succès.' });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ message: 'Erreur interne du serveur. Veuillez réessayer plus tard.' });
  }
};



const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, 'votre_clé_secrète', { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    console.error('Erreur lors de l\'inscription', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ userId: user._id }, 'votre_clé_secrète', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

module.exports = { registerUser, loginUser, resetPasswordRequest, resetPassword};
