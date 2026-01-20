// Note Management System
class NoteManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.token = localStorage.getItem('token') || null;
        
        if (!this.currentUser) {
            window.location.href = 'index.html';
        }
    }
    
    // Get notes from backend API
    async getNotes() {
        try {
            const result = await apiService.getNotes();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching notes:', error);
            showNotification('Failed to fetch notes', 'error');
            return [];
        }
    }
    
    // Create note via backend API
    async createNote(title, content, category = 'personal', priority = 'medium', tags = []) {
        try {
            const result = await apiService.createNote({
                title,
                content,
                category,
                priority,
                tags
            });
            
            showNotification('Note created successfully!', 'success');
            return result.data;
        } catch (error) {
            console.error('Error creating note:', error);
            showNotification('Failed to create note: ' + error.message, 'error');
            return null;
        }
    }
    
    // Update note via backend API
    async updateNote(id, updates) {
        try {
            const result = await apiService.updateNote(id, updates);
            showNotification('Note updated successfully!', 'success');
            return result.data;
        } catch (error) {
            console.error('Error updating note:', error);
            showNotification('Failed to update note', 'error');
            return null;
        }
    }
    
    // Update note status via backend API
    async updateNoteStatus(id, status) {
        try {
            const result = await apiService.updateNoteStatus(id, status);
            showNotification('Note status updated!', 'success');
            return result.data;
        } catch (error) {
            console.error('Error updating note status:', error);
            showNotification('Failed to update note status', 'error');
            return null;
        }
    }
    
    // Delete note via backend API
    async deleteNote(id) {
        try {
            await apiService.deleteNote(id);
            showNotification('Note deleted successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting note:', error);
            showNotification('Failed to delete note', 'error');
            return false;
        }
    }
    
    // Delete all notes via backend API
    async deleteAllNotes() {
        try {
            await apiService.deleteAllNotes();
            showNotification('All notes deleted!', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting all notes:', error);
            showNotification('Failed to delete all notes', 'error');
            return false;
        }
    }
    
    // Search notes via backend API
    async searchNotes(query, filters = {}) {
        try {
            const result = await apiService.searchNotes(query, filters);
            return result.data || [];
        } catch (error) {
            console.error('Error searching notes:', error);
            showNotification('Failed to search notes', 'error');
            return [];
        }
    }
    
    // Get note by ID via backend API
    async getNoteById(id) {
        try {
            const result = await apiService.getNote(id);
            return result.data;
        } catch (error) {
            console.error('Error fetching note:', error);
            showNotification('Failed to fetch note', 'error');
            return null;
        }
    }
    
    // Get statistics
    async getStats() {
        try {
            const notes = await this.getNotes();
            const activeNotes = notes.filter(note => note.status === 'active').length;
            const archivedNotes = notes.filter(note => note.status === 'archived').length;
            const attachmentsCount = notes.reduce((total, note) => total + (note.attachments?.length || 0), 0);
            
            return {
                total: notes.length,
                active: activeNotes,
                archived: archivedNotes,
                attachments: attachmentsCount
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return { total: 0, active: 0, archived: 0, attachments: 0 };
        }
    }
}