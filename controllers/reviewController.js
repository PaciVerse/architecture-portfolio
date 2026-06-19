const db = require('../db');

// Get all reviews for a project
exports.getProjectReviews = (req, res) => {
  db.query(
    `SELECT reviews.*, visitors.username 
     FROM reviews 
     JOIN visitors ON reviews.visitor_id = visitors.id 
     WHERE reviews.project_id = ?
     ORDER BY reviews.created_at DESC`,
    [req.params.projectId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error fetching reviews' });
      res.json(results);
    }
  );
};

// Add a review
exports.addReview = (req, res) => {
  const { rating, comment } = req.body;
  const visitor_id = req.visitor.id;
  const project_id = req.params.projectId;

  db.query(
    'SELECT * FROM reviews WHERE visitor_id = ? AND project_id = ?',
    [visitor_id, project_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (results.length > 0)
        return res.status(400).json({ message: 'You already reviewed this project' });

      db.query(
        'INSERT INTO reviews (visitor_id, project_id, rating, comment) VALUES (?, ?, ?, ?)',
        [visitor_id, project_id, rating, comment],
        (err, result) => {
          if (err) return res.status(500).json({ message: 'Error adding review' });
          res.status(201).json({ message: 'Review added successfully' });
        }
      );
    }
  );
};

// Delete a review
exports.deleteReview = (req, res) => {
  db.query(
    'DELETE FROM reviews WHERE id = ? AND visitor_id = ?',
    [req.params.id, req.visitor.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error deleting review' });
      if (result.affectedRows === 0)
        return res.status(403).json({ message: 'Not authorized to delete this review' });
      res.json({ message: 'Review deleted' });
    }
  );
};