const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  deleteImage,
  setCover,
  updateCaption
} = require('../controllers/projectController');

router.get('/', getAllProjects);
router.get('/:id', getProject);
router.post('/', auth, upload.array('images', 10), createProject);
router.put('/:id', auth, upload.array('images', 10), updateProject);
router.delete('/:id', auth, deleteProject);
router.delete('/:id/images/:imageId', auth, deleteImage);
router.put('/:id/images/:imageId/cover', auth, setCover);
router.put('/:id/images/:imageId/caption', auth, updateCaption);

module.exports = router;