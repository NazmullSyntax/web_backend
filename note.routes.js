const express = require('express');
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteAllNotes,
  deleteNote,
  searchNotes,
} = require('../controllers/note.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/', authMiddleware, createNote);
router.get('/', authMiddleware, getAllNotes);
router.get('/search', authMiddleware, searchNotes);
router.get('/:id', authMiddleware, getNoteById);
router.put('/:id', authMiddleware, updateNote);
router.delete('/', authMiddleware, roleMiddleware(['admin']), deleteAllNotes);
router.delete('/:id', authMiddleware, deleteNote);

module.exports = router;