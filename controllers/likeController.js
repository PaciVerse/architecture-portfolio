const db = require('../db');

// Get likes count for a project
exports.getProjectLikes = (req, res) => {
  db.query(
    'SELECT COUNT(*) as likes FROM likes WHERE project_id = ?',
    [req.params.projectId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error fetching likes' });
      res.json(results[0]);
    }
  );
};

// Check if visitor liked a project
exports.checkLike = (req, res) => {
  db.query(
    'SELECT * FROM likes WHERE visitor_id = ? AND project_id = ?',
    [req.visitor.id, req.params.projectId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ liked: results.length > 0 });
    }
  );
};

// Toggle like
exports.toggleLike = (req, res) => {
  const visitor_id = req.visitor.id;
  const project_id = req.params.projectId;

  db.query(
    'SELECT * FROM likes WHERE visitor_id = ? AND project_id = ?',
    [visitor_id, project_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      if (results.length > 0) {
        // Unlike
        db.query(
          'DELETE FROM likes WHERE visitor_id = ? AND project_id = ?',
          [visitor_id, project_id],
          (err) => {
            if (err) return res.status(500).json({ message: 'Error unliking' });
            res.json({ message: 'Unliked', liked: false });
          }
        );
      } else {
        // Like
        db.query(
          'INSERT INTO likes (visitor_id, project_id) VALUES (?, ?)',
          [visitor_id, project_id],
          (err) => {
            if (err) return res.status(500).json({ message: 'Error liking' });
            res.json({ message: 'Liked', liked: true });
          }
        );
      }
    }
  );
};