// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
class APIService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    // Update headers with token
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Make API request
    async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
        try {
            const options = {
                method,
                headers: this.getHeaders(requiresAuth)
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async register(userData) {
        return this.request('/register', 'POST', userData, false);
    }

    async login(credentials) {
        return this.request('/login', 'POST', credentials, false);
    }

    async getProfile() {
        return this.request('/profile', 'GET');
    }

    // Notes
    async getNotes() {
        return this.request('/notes', 'GET');
    }

    async getNote(id) {
        return this.request(`/notes/${id}`, 'GET');
    }

    async createNote(noteData) {
        return this.request('/notes', 'POST', noteData);
    }

    async updateNote(id, noteData) {
        return this.request(`/notes/${id}`, 'PUT', noteData);
    }

    async updateNoteStatus(id, status) {
        return this.request(`/notes/${id}/status`, 'PATCH', { status });
    }

    async deleteNote(id) {
        return this.request(`/notes/${id}`, 'DELETE');
    }

    async deleteAllNotes() {
        return this.request('/notes', 'DELETE');
    }

    async searchNotes(query, filters = {}) {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (filters.category) params.append('category', filters.category);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.tag) params.append('tag', filters.tag);
        
        return this.request(`/notes/search?${params.toString()}`, 'GET');
    }

    // File Upload
    async uploadFile(noteId, file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/notes/${noteId}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        return response.json();
    }
}

// Create global API instance
window.apiService = new APIService();