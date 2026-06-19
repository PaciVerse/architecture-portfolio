const db = require('../db');

// Send a message
exports.sendMessage = (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ message: 'All fields are required' });

  db.query(
    'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error sending message' });
      res.status(201).json({ message: 'Message sent successfully' });
    }
  );
};

// Get all messages (admin only)
exports.getMessages = (req, res) => {
  db.query(
    'SELECT * FROM contacts ORDER BY created_at DESC',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error fetching messages' });
      res.json(results);
    }
  );
};

// Delete a message (admin only)
exports.deleteMessage = (req, res) => {
  db.query(
    'DELETE FROM contacts WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error deleting message' });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Message not found' });
      res.json({ message: 'Message deleted' });
    }
  );
};