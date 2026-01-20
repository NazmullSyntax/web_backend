// Note Management System
class NoteManager {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        
        if (!this.currentUser) {
            window.location.href = 'index.html';
        }
    }
    
    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }
    
    createNote(title, content, category = 'personal', priority = 'medium', tags = []) {
        const newNote = {
            id: Date.now().toString(),
            title,
            content,
            category,
            priority,
            tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            status: 'active',
            attachments: [],
            createdBy: this.currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.push(newNote);
        this.saveNotes();
        return newNote;
    }
    
    getNotes() {
        return this.notes.filter(note => note.createdBy === this.currentUser.id);
    }
    
    getNoteById(id) {
        return this.notes.find(note => note.id === id && note.createdBy === this.currentUser.id);
    }
    
    updateNote(id, updates) {
        const index = this.notes.findIndex(note => note.id === id && note.createdBy === this.currentUser.id);
        
        if (index !== -1) {
            updates.updatedAt = new Date().toISOString();
            this.notes[index] = { ...this.notes[index], ...updates };
            this.saveNotes();
            return this.notes[index];
        }
        
        return null;
    }
    
    updateNoteStatus(id, status) {
        return this.updateNote(id, { status });
    }
    
    deleteNote(id) {
        return this.updateNoteStatus(id, 'deleted');
    }
    
    deleteAllNotes() {
        const userNotes = this.getNotes();
        userNotes.forEach(note => {
            this.updateNoteStatus(note.id, 'deleted');
        });
    }
    
    searchNotes(query, filters = {}) {
        let results = this.getNotes().filter(note => note.status !== 'deleted');
        
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(note => 
                note.title.toLowerCase().includes(searchTerm) ||
                note.content.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.category) {
            results = results.filter(note => note.category === filters.category);
        }
        
        if (filters.priority) {
            results = results.filter(note => note.priority === filters.priority);
        }
        
        if (filters.tag) {
            results = results.filter(note => note.tags.includes(filters.tag));
        }
        
        if (filters.status) {
            results = results.filter(note => note.status === filters.status);
        }
        
        if (filters.dateFrom) {
            results = results.filter(note => new Date(note.createdAt) >= new Date(filters.dateFrom));
        }
        
        if (filters.dateTo) {
            results = results.filter(note => new Date(note.createdAt) <= new Date(filters.dateTo));
        }
        
        return results;
    }
    
    getStats() {
        const userNotes = this.getNotes();
        const activeNotes = userNotes.filter(note => note.status === 'active').length;
        const archivedNotes = userNotes.filter(note => note.status === 'archived').length;
        const attachmentsCount = userNotes.reduce((total, note) => total + note.attachments.length, 0);
        
        return {
            total: userNotes.length,
            active: activeNotes,
            archived: archivedNotes,
            attachments: attachmentsCount
        };
    }
}

// File Management System
class FileManager {
    constructor() {
        this.uploads = JSON.parse(localStorage.getItem('uploads')) || [];
    }
    
    saveUploads() {
        localStorage.setItem('uploads', JSON.stringify(this.uploads));
    }
    
    uploadFile(file, noteId) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const upload = {
                    id: Date.now().toString(),
                    filename: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    noteId: noteId,
                    uploadedAt: new Date().toISOString(),
                    uploadedBy: JSON.parse(localStorage.getItem('currentUser')).id
                };
                
                this.uploads.push(upload);
                this.saveUploads();
                resolve(upload);
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    getFilesByNoteId(noteId) {
        return this.uploads.filter(upload => upload.noteId === noteId);
    }
    
    deleteFile(fileId) {
        this.uploads = this.uploads.filter(upload => upload.id !== fileId);
        this.saveUploads();
    }
}

// Initialize Managers
const noteManager = new NoteManager();
const fileManager = new FileManager();

// DOM Elements
const pageTitle = document.getElementById('page-title');
const username = document.getElementById('username');
const userEmail = document.getElementById('user-email');
const userRole = document.getElementById('user-role');
const welcomeUsername = document.getElementById('welcome-username');
const lastLogin = document.getElementById('last-login');

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show corresponding section
        const section = item.getAttribute('data-section');
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
        
        // Update page title
        pageTitle.textContent = item.querySelector('span').textContent;
        
        // Load section data
        loadSectionData(section);
    });
});

// Load user data
function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        username.textContent = currentUser.username;
        userEmail.textContent = currentUser.email;
        userRole.textContent = currentUser.role;
        welcomeUsername.textContent = currentUser.username;
        
        // Hide admin section if not admin
        if (currentUser.role !== 'admin') {
            document.getElementById('admin-section').style.display = 'none';
        }
        
        // Set last login
        lastLogin.textContent = new Date().toLocaleDateString();
    }
}

// Load section data
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'notes':
            loadNotes();
            break;
        case 'create':
            // Nothing to load
            break;
        case 'search':
            // Nothing to load
            break;
        case 'upload':
            loadUploads();
            break;
        case 'admin':
            loadAdminPanel();
            break;
    }
}

// Dashboard
function loadDashboard() {
    const stats = noteManager.getStats();
    
    document.getElementById('total-notes').textContent = stats.total;
    document.getElementById('active-notes').textContent = stats.active;
    document.getElementById('archived-notes').textContent = stats.archived;
    document.getElementById('attachments-count').textContent = stats.attachments;
    document.getElementById('notes-count').textContent = stats.active;
    
    // Load recent notes
    const recentNotes = noteManager.getNotes()
        .filter(note => note.status === 'active')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    
    const recentNotesGrid = document.getElementById('recent-notes-grid');
    
    if (recentNotes.length === 0) {
        recentNotesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <p>No notes yet. Create your first note!</p>
            </div>
        `;
    } else {
        recentNotesGrid.innerHTML = recentNotes.map(note => `
            <div class="note-card priority-${note.priority}" onclick="viewNote('${note.id}')">
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <span class="note-category">${note.category}</span>
                </div>
                <p class="note-content">${note.content.substring(0, 100)}...</p>
                <div class="note-footer">
                    <div class="note-tags">
                        ${note.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <span>${new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }
}

// Notes Management
function loadNotes() {
    const filterCategory = document.getElementById('filter-category').value;
    const filterStatus = document.getElementById('filter-status').value;
    
    let notes = noteManager.getNotes();
    
    if (filterCategory) {
        notes = notes.filter(note => note.category === filterCategory);
    }
    
    if (filterStatus) {
        notes = notes.filter(note => note.status === filterStatus);
    }
    
    const notesList = document.getElementById('notes-list');
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <p>No notes found</p>
            </div>
        `;
    } else {
        notesList.innerHTML = notes.map(note => `
            <div class="note-card priority-${note.priority}">
                <div class="note-header">
                    <div>
                        <h3 class="note-title">${note.title}</h3>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                            <span class="note-category">${note.category}</span>
                            <span class="note-category" style="background: ${getStatusColor(note.status)}">${note.status}</span>
                        </div>
                    </div>
                    <div class="note-actions">
                        <button class="btn-icon" onclick="editNote('${note.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="deleteNote('${note.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${note.status === 'active' ? 
                            `<button class="btn-icon" onclick="archiveNote('${note.id}')" title="Archive">
                                <i class="fas fa-archive"></i>
                            </button>` : 
                            `<button class="btn-icon" onclick="activateNote('${note.id}')" title="Activate">
                                <i class="fas fa-check"></i>
                            </button>`
                        }
                    </div>
                </div>
                <p class="note-content">${note.content.substring(0, 200)}...</p>
                <div class="note-footer">
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <span>${new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'active': return '#10b981';
        case 'archived': return '#f59e0b';
        case 'deleted': return '#ef4444';
        default: return '#9ca3af';
    }
}

function refreshNotes() {
    loadNotes();
}

// Create Note
document.getElementById('create-note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const category = document.getElementById('note-category').value;
    const priority = document.getElementById('note-priority').value;
    const tags = document.getElementById('note-tags').value;
    
    const note = noteManager.createNote(title, content, category, priority, tags);
    
    alert('Note created successfully!');
    clearNoteForm();
    
    // Switch to notes section
    document.querySelector('[data-section="notes"]').click();
});

function clearNoteForm() {
    document.getElementById('create-note-form').reset();
}

// Search Notes
function searchNotes() {
    const query = document.getElementById('search-query').value;
    const category = document.getElementById('search-category').value;
    const priority = document.getElementById('search-priority').value;
    const tag = document.getElementById('search-tag').value;
    const dateFrom = document.getElementById('search-date-from').value;
    const dateTo = document.getElementById('search-date-to').value;
    
    const filters = { category, priority, tag, dateFrom, dateTo };
    const results = noteManager.searchNotes(query, filters);
    
    const resultsContainer = document.getElementById('search-results');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No notes found matching your search criteria</p>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = results.map(note => `
            <div class="note-card priority-${note.priority}">
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <span class="note-category">${note.category}</span>
                </div>
                <p class="note-content">${note.content.substring(0, 150)}...</p>
                <div class="note-footer">
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div>
                        <span style="margin-right: 1rem;">Priority: ${note.priority}</span>
                        <span>${new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Upload Files
function loadUploads() {
    const fileList = document.getElementById('file-list');
    const uploads = fileManager.uploads.filter(upload => upload.uploadedBy === noteManager.currentUser.id);
    
    if (uploads.length === 0) {
        fileList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-upload"></i>
                <p>No files uploaded yet</p>
            </div>
        `;
    } else {
        fileList.innerHTML = uploads.map(upload => `
            <div class="file-item">
                <div class="file-icon">
                    <i class="fas fa-file"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${upload.filename}</div>
                    <div class="file-size">${formatFileSize(upload.size)}</div>
                </div>
                <button class="btn-icon" onclick="downloadFile('${upload.id}')" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon" onclick="deleteFile('${upload.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// File Upload Handling
const uploadDropzone = document.getElementById('upload-dropzone');
const fileInput = document.getElementById('file-input');

uploadDropzone.addEventListener('click', () => {
    fileInput.click();
});

uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.style.borderColor = 'var(--primary-color)';
    uploadDropzone.style.background = '#f0f9ff';
});

uploadDropzone.addEventListener('dragleave', () => {
    uploadDropzone.style.borderColor = '#e5e7eb';
    uploadDropzone.style.background = 'white';
});

uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropzone.style.borderColor = '#e5e7eb';
    uploadDropzone.style.background = 'white';
    
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
});

async function handleFiles(files) {
    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert(`File ${file.name} is too large. Maximum size is 5MB.`);
            continue;
        }
        
        await fileManager.uploadFile(file, null);
    }
    
    loadUploads();
    alert('Files uploaded successfully!');
}

function downloadFile(fileId) {
    const file = fileManager.uploads.find(u => u.id === fileId);
    if (file) {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.filename;
        link.click();
    }
}

function deleteFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        fileManager.deleteFile(fileId);
        loadUploads();
    }
}

// Admin Panel
function loadAdminPanel() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const notes = noteManager.notes;
    const uploads = fileManager.uploads;
    
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-notes-admin').textContent = notes.length;
    document.getElementById('total-attachments').textContent = uploads.length;
    
    const usersTableBody = document.getElementById('users-table-body');
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="user-role">${user.role}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-icon" onclick="deleteUser('${user.id}')" ${user.role === 'admin' ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        // Note: In a real app, you would need to handle user deletion properly
        alert('User deletion would be implemented in a real backend system.');
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This will delete all notes and files.')) {
        localStorage.clear();
        alert('All data cleared. Page will reload.');
        setTimeout(() => location.reload(), 1000);
    }
}

function exportData() {
    const data = {
        users: JSON.parse(localStorage.getItem('users')) || [],
        notes: JSON.parse(localStorage.getItem('notes')) || [],
        uploads: JSON.parse(localStorage.getItem('uploads')) || [],
        currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
        token: localStorage.getItem('token') || null
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notespro-backup.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('Importing data will overwrite current data. Continue?')) {
                    localStorage.clear();
                    
                    if (data.users) localStorage.setItem('users', JSON.stringify(data.users));
                    if (data.notes) localStorage.setItem('notes', JSON.stringify(data.notes));
                    if (data.uploads) localStorage.setItem('uploads', JSON.stringify(data.uploads));
                    if (data.currentUser) localStorage.setItem('currentUser', JSON.stringify(data.currentUser));
                    if (data.token) localStorage.setItem('token', data.token);
                    
                    alert('Data imported successfully! Page will reload.');
                    setTimeout(() => location.reload(), 1000);
                }
            } catch (error) {
                alert('Error importing data: Invalid file format');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Note Actions
function editNote(noteId) {
    const note = noteManager.getNoteById(noteId);
    if (note) {
        document.getElementById('edit-note-id').value = note.id;
        document.getElementById('edit-note-title').value = note.title;
        document.getElementById('edit-note-content').value = note.content;
        document.getElementById('edit-note-status').value = note.status;
        
        document.getElementById('edit-note-modal').classList.add('active');
    }
}

function closeModal() {
    document.getElementById('edit-note-modal').classList.remove('active');
}

document.getElementById('edit-note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-note-id').value;
    const title = document.getElementById('edit-note-title').value;
    const content = document.getElementById('edit-note-content').value;
    const status = document.getElementById('edit-note-status').value;
    
    noteManager.updateNote(id, { title, content, status });
    closeModal();
    loadNotes();
    loadDashboard();
});

function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        noteManager.deleteNote(noteId);
        loadNotes();
        loadDashboard();
    }
}

function archiveNote(noteId) {
    noteManager.updateNoteStatus(noteId, 'archived');
    loadNotes();
    loadDashboard();
}

function activateNote(noteId) {
    noteManager.updateNoteStatus(noteId, 'active');
    loadNotes();
    loadDashboard();
}

function viewNote(noteId) {
    const note = noteManager.getNoteById(noteId);
    if (note) {
        alert(`Title: ${note.title}\n\nContent: ${note.content}\n\nCategory: ${note.category}\nPriority: ${note.priority}\nTags: ${note.tags.join(', ')}`);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadDashboard();
    
    // Setup sidebar toggle
    document.querySelector('.sidebar-toggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Setup filter change listeners
    document.getElementById('filter-category').addEventListener('change', loadNotes);
    document.getElementById('filter-status').addEventListener('change', loadNotes);
});