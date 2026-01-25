const Note = require('../models/note.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');

const createNote = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const note = await Note.create({
      title,
      description,
      date: date || new Date(),
      userId,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getAllNotes = async (req, res) => {
  try {
    let notes;
    if (req.user.role === 'admin') {
      notes = await Note.findAll({ include: User });
    } else {
      notes = await Note.findAll({
        where: { userId: req.user.id },
        include: User,
      });
    }
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id, { include: User });
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (req.user.role !== 'admin' && note.userId !== req.user.id && note.status !== 'public') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;
    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (req.user.role !== 'admin' && note.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await note.update({ title, description, date });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteAllNotes = async (req, res) => {
  try {
    await Note.destroy({ where: {} });
    res.json({ message: 'All notes deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (req.user.role !== 'admin' && note.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await note.destroy();
    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateNoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (req.user.role !== 'admin' && note.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await note.update({ status });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const searchNotes = async (req, res) => {
  try {
    const { name } = req.query;
    let whereCondition = { title: { [Op.iLike]: `%${name}%` } };

    if (req.user.role !== 'admin') {
      whereCondition = {
        [Op.and]: [
          whereCondition,
          { userId: req.user.id },
        ],
      };
    }

    const notes = await Note.findAll({
      where: whereCondition,
      include: User,
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteAllNotes,
  deleteNote,
  searchNotes,
};