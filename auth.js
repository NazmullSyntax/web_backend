// User Management System
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.token = localStorage.getItem('token') || null;
        
        // Initialize with admin user if no users exist
        if (this.users.length === 0) {
            this.createAdminUser();
        }
    }
    
    createAdminUser() {
        const adminUser = {
            id: '1',
            username: 'admin',
            email: 'admin@notespro.com',
            password: 'admin123', // In real app, this would be hashed
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        this.users.push(adminUser);
        this.saveUsers();
    }
    
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
    
    generateToken(userId) {
        // Simple token generation for demo purposes
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2);
        return btoa(`${userId}:${timestamp}:${random}`);
    }
    
    register(username, email, password, role = 'user') {
        // Validate inputs
        if (!username || !email || !password) {
            return { success: false, message: 'All fields are required' };
        }
        
        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters' };
        }
        
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }
        
        // Check if user already exists
        const userExists = this.users.find(u => u.email === email || u.username === username);
        if (userExists) {
            return { success: false, message: 'User already exists with this email or username' };
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password, // In real app, this would be hashed
            role,
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this.saveUsers();
        
        // Auto login after registration
        return this.login(email, password);
    }
    
    login(email, password) {
        // Find user
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, message: 'Invalid credentials' };
        }
        
        // Check password (in real app, compare hashed passwords)
        if (user.password !== password) {
            return { success: false, message: 'Invalid credentials' };
        }
        
        // Generate token
        const token = this.generateToken(user.id);
        
        // Set current user and token
        this.currentUser = user;
        this.token = token;
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', token);
        
        return { 
            success: true, 
            data: { 
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token 
            } 
        };
    }
    
    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isAuthenticated() {
        return !!this.currentUser && !!this.token;
    }
    
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    deleteUser(userId) {
        if (this.currentUser && this.currentUser.id === userId) {
            return { success: false, message: 'Cannot delete your own account' };
        }
        
        const initialLength = this.users.length;
        this.users = this.users.filter(u => u.id !== userId);
        
        if (this.users.length < initialLength) {
            this.saveUsers();
            return { success: true, message: 'User deleted successfully' };
        }
        
        return { success: false, message: 'User not found' };
    }
}

// Initialize User Manager
const userManager = new UserManager();

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Clear previous errors
        clearError(document.getElementById('login-email'));
        clearError(document.getElementById('login-password'));
        
        // Validate
        let hasError = false;
        
        if (!email) {
            showError(document.getElementById('login-email'), 'Email is required');
            hasError = true;
        } else if (!validateEmail(email)) {
            showError(document.getElementById('login-email'), 'Please enter a valid email');
            hasError = true;
        }
        
        if (!password) {
            showError(document.getElementById('login-password'), 'Password is required');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Attempt login
        const result = userManager.login(email, password);
        
        if (result.success) {
            // Show success message
            alert('Login successful! Redirecting to dashboard...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showError(document.getElementById('login-email'), result.message);
            showError(document.getElementById('login-password'), result.message);
        }
    });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const role = document.getElementById('register-role').value;
        
        // Clear previous errors
        clearError(document.getElementById('register-username'));
        clearError(document.getElementById('register-email'));
        clearError(document.getElementById('register-password'));
        clearError(document.getElementById('register-confirm-password'));
        
        // Validate
        let hasError = false;
        
        if (!username) {
            showError(document.getElementById('register-username'), 'Username is required');
            hasError = true;
        } else if (username.length < 3) {
            showError(document.getElementById('register-username'), 'Username must be at least 3 characters');
            hasError = true;
        }
        
        if (!email) {
            showError(document.getElementById('register-email'), 'Email is required');
            hasError = true;
        } else if (!validateEmail(email)) {
            showError(document.getElementById('register-email'), 'Please enter a valid email');
            hasError = true;
        }
        
        if (!password) {
            showError(document.getElementById('register-password'), 'Password is required');
            hasError = true;
        } else if (password.length < 6) {
            showError(document.getElementById('register-password'), 'Password must be at least 6 characters');
            hasError = true;
        }
        
        if (!confirmPassword) {
            showError(document.getElementById('register-confirm-password'), 'Please confirm your password');
            hasError = true;
        } else if (password !== confirmPassword) {
            showError(document.getElementById('register-confirm-password'), 'Passwords do not match');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Attempt registration
        const result = userManager.register(username, email, password, role);
        
        if (result.success) {
            // Show success message
            alert('Registration successful! You are now logged in.');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showError(document.getElementById('register-email'), result.message);
        }
    });
}

// Logout functionality
window.logout = function() {
    userManager.logout();
};

// Helper functions from script.js
function showError(input, message) {
    const formGroup = input.parentElement;
    const errorElement = formGroup.querySelector('.error-message');
    errorElement.textContent = message;
    input.style.borderColor = '#ef4444';
}

function clearError(input) {
    const formGroup = input.parentElement;
    const errorElement = formGroup.querySelector('.error-message');
    errorElement.textContent = '';
    input.style.borderColor = '#e5e7eb';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}