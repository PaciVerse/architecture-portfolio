const db = require('../db');

// Get all projects
exports.getAllProjects = (req, res) => {
  db.query('SELECT * FROM projects ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching projects' });
    res.json(results);
  });
};

// Get single project
exports.getProject = (req, res) => {
  db.query('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Project not found' });
    res.json(results[0]);
  });
};

// Create project
exports.createProject = (req, res) => {
  const { title, description, category, year } = req.body;
  const image = req.file ? req.file.filename : null;

  // Create uploads dir if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  db.query(
    'INSERT INTO projects (title, description, category, year, image) VALUES (?, ?, ?, ?, ?)',
    [title, description, category, year, image],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error creating project' });
      res.status(201).json({ message: 'Project created', id: result.insertId });
    }
  );
};

// Update project
exports.updateProject = (req, res) => {
  const { title, description, category, year } = req.body;
  const image = req.file ? req.file.filename : null;

  const query = image
    ? 'UPDATE projects SET title=?, description=?, category=?, year=?, image=? WHERE id=?'
    : 'UPDATE projects SET title=?, description=?, category=?, year=? WHERE id=?';

  const params = image
    ? [title, description, category, year, image, req.params.id]
    : [title, description, category, year, req.params.id];

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ message: 'Error updating project' });
    res.json({ message: 'Project updated' });
  });
};

// Delete project
exports.deleteProject = (req, res) => {
  db.query('DELETE FROM projects WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting project' });
    res.json({ message: 'Project deleted' });
  });
};