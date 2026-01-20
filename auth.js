// User Management System
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.token = localStorage.getItem('token') || null;
        
        // Check if we have a valid token from localStorage
        if (this.token && !this.currentUser) {
            this.fetchProfile();
        }
    }
    
    async fetchProfile() {
        try {
            const result = await apiService.getProfile();
            this.currentUser = result.data;
            localStorage.setItem('currentUser', JSON.stringify(result.data));
        } catch (error) {
            console.log('Session expired, logging out...');
            this.logout();
        }
    }
    
    async register(username, email, password, role = 'user') {
        try {
            const result = await apiService.register({ username, email, password, role });
            
            if (result.success) {
                this.currentUser = result.data.user;
                this.token = result.data.token;
                
                localStorage.setItem('currentUser', JSON.stringify(result.data.user));
                localStorage.setItem('token', result.data.token);
                
                return { success: true, data: result.data };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    async login(email, password) {
        try {
            const result = await apiService.login({ email, password });
            
            if (result.success) {
                this.currentUser = result.data.user;
                this.token = result.data.token;
                
                localStorage.setItem('currentUser', JSON.stringify(result.data.user));
                localStorage.setItem('token', result.data.token);
                
                return { success: true, data: result.data };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
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
    
    async deleteUser(userId) {
        // Note: This would require admin endpoint
        alert('Admin user deletion requires backend implementation');
    }
}

// Initialize User Manager
const userManager = new UserManager();

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
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
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        
        // Attempt login via API
        const result = await userManager.login(email, password);
        
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            // Show success message
            showNotification('Login successful! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard after 1 second
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
    registerForm.addEventListener('submit', async (e) => {
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
        
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;
        
        // Attempt registration via API
        const result = await userManager.register(username, email, password, role);
        
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            // Show success message
            showNotification('Registration successful! You are now logged in.', 'success');
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showError(document.getElementById('register-email'), result.message);
        }
    });
}

// Notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for slideIn animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Logout functionality
window.logout = function() {
    userManager.logout();
};

// Helper functions
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