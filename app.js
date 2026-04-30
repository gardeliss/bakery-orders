/* ============================================
   CORE APP.JS - Utilities & Auth
   ============================================ */

// Supabase Configuration
const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// AUTH SYSTEM
// ============================================
const Auth = {
    // Check if user is logged in
    isAuthenticated() {
        return localStorage.getItem('user') !== null;
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Login
    async login(email, password) {
        try {
            showLoading();
            
            // Simple auth - In production, use proper password hashing
            const { data, error } = await _supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                throw new Error('Email ή κωδικός λάθος');
            }

            // For demo: password check (in production use bcrypt)
            // Check against stored password_hash
            if (data.password_hash !== password) {
                throw new Error('Email ή κωδικός λάθος');
            }

            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify({
                id: data.id,
                email: data.email,
                full_name: data.full_name,
                role: data.role
            }));

            // Log activity
            await this.logActivity('login', 'user', data.id);

            hideLoading();
            showToast('Επιτυχής σύνδεση!', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);

        } catch (err) {
            hideLoading();
            showToast(err.message, 'error');
        }
    },

    // Logout
    logout() {
        const user = this.getCurrentUser();
        if (user) {
            this.logActivity('logout', 'user', user.id);
        }
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    },

    // Check if user has admin role
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // Protect pages
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    },

    // Require admin
    requireAdmin() {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            showToast('Δεν έχετε δικαίωμα πρόσβασης', 'error');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    },

    // Log activity
    async logActivity(action, entity_type, entity_id, details = {}) {
        const user = this.getCurrentUser();
        if (!user) return;

        try {
            await _supabase.from('activity_log').insert([{
                user_id: user.id,
                action: action,
                entity_type: entity_type,
                entity_id: entity_id,
                details: details
            }]);
        } catch (err) {
            console.error('Failed to log activity:', err);
        }
    }
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    
    // Icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = '<div class="toast-icon">' + (icons[type] || icons.info) + '</div>' +
        '<div class="toast-message">' + message + '</div>' +
        '<div class="toast-close" onclick="this.parentElement.remove()">×</div>';

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// LOADING OVERLAY
// ============================================
function showLoading() {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============================================
// MODAL SYSTEM
// ============================================
function showModal(title, content, buttons = []) {
    // Remove existing modal
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    // Create modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = '<h3 class="modal-title">' + title + '</h3>' +
        '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">×</button>';
    
    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.innerHTML = content;
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'btn ' + (btn.class || 'btn-secondary');
        button.textContent = btn.text;
        button.onclick = () => {
            if (btn.onClick) btn.onClick();
            overlay.remove();
        };
        footer.appendChild(button);
    });
    
    modal.appendChild(header);
    modal.appendChild(body);
    if (buttons.length > 0) modal.appendChild(footer);
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

function confirmDialog(message, onConfirm) {
    showModal('Επιβεβαίωση', '<p>' + message + '</p>', [
        {
            text: 'Ακύρωση',
            class: 'btn-secondary'
        },
        {
            text: 'Επιβεβαίωση',
            class: 'btn-danger',
            onClick: onConfirm
        }
    ]);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format date for display (DD-MM-YYYY)
function formatDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.split('-').reverse().join('-');
}

// Format date for input (YYYY-MM-DD)
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return dateStr; // Already in correct format
    }
    return parts.reverse().join('-');
}

// Format currency
function formatCurrency(amount) {
    return parseFloat(amount || 0).toFixed(2) + '€';
}

// Get Greek day name
function getGreekDayName(dateStr) {
    const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
    const date = new Date(dateStr);
    return days[date.getDay()];
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// NAVBAR COMPONENT
// ============================================
function renderNavbar() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const currentPage = window.location.pathname.split('/').pop();
    
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let adminLinks = '';
    if (user.role === 'admin') {
        adminLinks = '<a href="activity-log.html" class="nav-link ' + (currentPage === 'activity-log.html' ? 'active' : '') + '">📝 Ιστορικό</a>' +
            '<a href="backup.html" class="nav-link ' + (currentPage === 'backup.html' ? 'active' : '') + '">💾 Backup</a>' +
            '<a href="users.html" class="nav-link ' + (currentPage === 'users.html' ? 'active' : '') + '">👤 Χρήστες</a>';
    }

    navbar.innerHTML = '<div class="navbar-content">' +
        '<div class="navbar-brand">' +
            '<img src="banner.png" alt="Ζάχαρη" class="logo-nav">' +
            '<span class="brand-text">Ζάχαρη</span>' +
        '</div>' +
        '<div class="navbar-menu">' +
            '<a href="dashboard.html" class="nav-link ' + (currentPage === 'dashboard.html' ? 'active' : '') + '">📊 Dashboard</a>' +
            '<a href="order-form.html" class="nav-link ' + (currentPage === 'order-form.html' ? 'active' : '') + '">➕ Νέα Παραγγελία</a>' +
            '<a href="orders-list.html" class="nav-link ' + (currentPage === 'orders-list.html' ? 'active' : '') + '">📋 Παραγγελίες</a>' +
            '<a href="calendar.html" class="nav-link ' + (currentPage === 'calendar.html' ? 'active' : '') + '">📅 Ημερολόγιο</a>' +
            '<a href="customers.html" class="nav-link ' + (currentPage === 'customers.html' ? 'active' : '') + '">👥 Πελάτες</a>' +
            adminLinks +
        '</div>' +
        '<div class="user-menu">' +
            '<div class="user-info">' +
                '<div class="user-name">' + user.full_name + '</div>' +
                '<div class="user-role">' + (user.role === 'admin' ? 'Διαχειριστής' : 'Χρήστης') + '</div>' +
            '</div>' +
            '<button class="btn btn-sm btn-danger" onclick="Auth.logout()">Έξοδος</button>' +
        '</div>' +
    '</div>';
}

// ============================================
// PRINT FUNCTIONS
// ============================================
function renderAndPrint(htmlContent) {
    const printArea = document.getElementById('printArea');
    if (!printArea) {
        console.error('Print area not found');
        return;
    }
    
    printArea.innerHTML = '<div style="text-align:center; margin-bottom:20px;">' +
        '<img src="banner.png" style="max-width:250px;">' +
        '</div>' + htmlContent;
    
    window.print();
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Render navbar if element exists
    if (document.getElementById('navbar')) {
        renderNavbar();
    }
});
