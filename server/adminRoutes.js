// const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const db = require('./db');
// const path = require('path');

// const router = express.Router();

// // router.get('/login', (req, res) => {
// //   res.sendFile(path.join(__dirname, '../public/admin-login.html'));
// // });
// // router.post('/login', async (req, res) => {
// //   const { username, password } = req.body;
  
// //   try {
// //     if (username !== process.env.ADMIN_USERNAME) {
// //       return res.status(401).json({ error: 'Invalid username' });
// //     }

// //     const passwordMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
// //     if (!passwordMatch) {
// //       return res.status(401).json({ error: 'Invalid credentials' });
// //     }

// //     const token = jwt.sign({ username: process.env.ADMIN_USERNAME }, process.env.JWT_SECRET, { expiresIn: '1h' });
// //     req.session.adminToken = token;
// //     res.json({ message: 'Admin logged in successfully', token });
// //   } catch (error) {
// //     console.error('Admin login error:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// // router.post('/logout', (req, res) => {
// //   req.session.destroy((err) => {
// //     if (err) {
// //       console.error('Logout error:', err);
// //       return res.status(500).json({ error: 'Internal server error' });
// //     }
// //     res.json({ message: 'Admin logged out successfully' });
// //   });
// // });

// router.post('/delete', authenticateAdmin, (req, res) => {
//   const { thoughtId } = req.body;
//   db.deleteThought(thoughtId);
//   // Emit socket event to update thoughts
//   req.app.get('io').emit('updateThoughts', db.getThoughts());
//   res.json({ success: true });
// });

// router.post('/block', authenticateAdmin, (req, res) => {
//   const { key, userIP } = req.body;
//   if(key===process.env.ADMIN_SECRET_KEY){
//     db.blockUser(userIP);
//     // Emit socket event to update thoughts
//     req.app.get('io').emit('updateThoughts', db.getThoughts());
//     res.json({ success: true });
//   }else{
//     res.status(401).json({ error: 'Unauthorized' });
//   }
// });

// function authenticateAdmin(req, res, next) {
//   const token = req.session.adminToken;
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }
//     req.adminId = decoded.adminId;
//     next();
//   });
// }

// module.exports = router;