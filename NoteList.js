import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async (query = '') => {
    try {
      const token = localStorage.getItem('token');
      const url = query ? `http://localhost:5000/api/notes/search?name=${query}` : 'http://localhost:5000/api/notes';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes(search);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchNotes();
      } catch (error) {
        alert('Error deleting note');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">All Notes</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex">
              <input
                type="text"
                placeholder="Search notes by title..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{note.description.substring(0, 100)}...</p>
                  {note.date && <p className="mt-1 text-xs text-gray-400">Date: {new Date(note.date).toLocaleDateString()}</p>}
                  <p className="mt-2 text-xs text-gray-400">By: {note.User?.name}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      note.status === 'public' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {note.status}
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => navigate(`/notes/edit/${note.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteList;