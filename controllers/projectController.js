const db = require('../db');

// Get all projects
exports.getAllProjects = (req, res) => {
  db.query(
    `SELECT p.*, 
    (SELECT image FROM project_images WHERE project_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
    FROM projects p ORDER BY p.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error fetching projects' });
      res.json(results);
    }
  );
};

// Get single project with all images
exports.getProject = (req, res) => {
  db.query('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Project not found' });

    const project = results[0];

    db.query(
      'SELECT * FROM project_images WHERE project_id = ? ORDER BY is_cover DESC',
      [req.params.id],
      (err, images) => {
        if (err) return res.status(500).json({ message: 'Error fetching images' });
        project.images = images;
        res.json(project);
      }
    );
  });
};

// Create project
exports.createProject = (req, res) => {
  const { title, description, category, year } = req.body;
  const files = req.files || [];
  const captions = req.body.captions || [];

  db.query(
    'INSERT INTO projects (title, description, category, year) VALUES (?, ?, ?, ?)',
    [title, description, category, year],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error creating project' });

      const projectId = result.insertId;

      if (files.length === 0)
        return res.status(201).json({ message: 'Project created', id: projectId });

      const imageValues = files.map((file, index) => [
        projectId,
        file.path,
        index === 0 ? 1 : 0,
        Array.isArray(captions) ? (captions[index] || null) : (index === 0 ? captions : null)
      ]);

      db.query(
        'INSERT INTO project_images (project_id, image, is_cover, caption) VALUES ?',
        [imageValues],
        (err) => {
          if (err) return res.status(500).json({ message: 'Error saving images' });
          res.status(201).json({ message: 'Project created', id: projectId });
        }
      );
    }
  );
};

// Update project
exports.updateProject = (req, res) => {
  const { title, description, category, year } = req.body;
  const files = req.files || [];
  const captions = req.body.captions || [];

  db.query(
    'UPDATE projects SET title=?, description=?, category=?, year=? WHERE id=?',
    [title, description, category, year, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating project' });

      if (files.length === 0)
        return res.json({ message: 'Project updated' });

      const imageValues = files.map((file, index) => [
        req.params.id,
        file.path,
        index === 0 ? 1 : 0,
        Array.isArray(captions) ? (captions[index] || null) : (index === 0 ? captions : null)
      ]);

      db.query(
        'INSERT INTO project_images (project_id, image, is_cover, caption) VALUES ?',
        [imageValues],
        (err) => {
          if (err) return res.status(500).json({ message: 'Error saving images' });
          res.json({ message: 'Project updated' });
        }
      );
    }
  );
};

// Delete project
exports.deleteProject = (req, res) => {
  db.query('DELETE FROM projects WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting project' });
    res.json({ message: 'Project deleted' });
  });
};

// Delete a single image
exports.deleteImage = (req, res) => {
  db.query(
    'DELETE FROM project_images WHERE id = ? AND project_id = ?',
    [req.params.imageId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error deleting image' });
      res.json({ message: 'Image deleted' });
    }
  );
};

// Set cover image
exports.setCover = (req, res) => {
  db.query(
    'UPDATE project_images SET is_cover = 0 WHERE project_id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating cover' });
      db.query(
        'UPDATE project_images SET is_cover = 1 WHERE id = ? AND project_id = ?',
        [req.params.imageId, req.params.id],
        (err) => {
          if (err) return res.status(500).json({ message: 'Error setting cover' });
          res.json({ message: 'Cover image updated' });
        }
      );
    }
  );
};

// Update image caption
exports.updateCaption = (req, res) => {
  const { caption } = req.body;
  db.query(
    'UPDATE project_images SET caption = ? WHERE id = ? AND project_id = ?',
    [caption, req.params.imageId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating caption' });
      res.json({ message: 'Caption updated' });
    }
  );
};