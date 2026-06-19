const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register visitor
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO visitors (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY')
            return res.status(400).json({ message: 'Email already registered' });
          return res.status(500).json({ message: 'Error registering visitor' });
        }
        res.status(201).json({ message: 'Registered successfully' });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login visitor
exports.login = async (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM visitors WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const visitor = results[0];
    const match = await bcrypt.compare(password, visitor.password);

    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: visitor.id, username: visitor.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, username: visitor.username });
  });
};