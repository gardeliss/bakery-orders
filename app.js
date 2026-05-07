/* ============================================
   CORE APP.JS v3.0 - Enhanced Features
   - File Upload (Supabase Storage)
   - Username-based Login
   - Email Auto-sync
   - CSV UTF-8 with BOM
   ============================================ */

const SUPABASE_URL = 'https://qfbivcxyhtndpdgndldw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYml2Y3h5aHRuZHBkZ25kbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAzNjUsImV4cCI6MjA5MjYzNjM2NX0.StykJvRcACbDAV8S9AnHALxUv8sIrXpJeKxdayp4jHM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const STORAGE_BUCKET = 'order-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ============================================
// AUTH SYSTEM - USERNAME BASED
// ============================================
const Auth = {
    isAuthenticated() {
        return localStorage.getItem('user') !== null;
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    async login(username, password) {
        try {
            showLoading();
            
            const { data, error } = await _supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error || !data) {
                throw new Error('Username ή κωδικός λάθος');
            }

            if (data.password_hash !== password) {
                throw new Error('Username ή κωδικός λάθος');
            }

            localStorage.setItem('user', JSON.stringify({
                id: data.id,
                username: data.username,
                email: data.email,
                full_name: data.full_name,
                role: data.role
            }));

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

    logout() {
        const user = this.getCurrentUser();
        if (user) {
            this.logActivity('logout', 'user', user.id);
        }
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    },

    requireAdmin() {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            showToast('Δεν έχετε δικαίωμα πρόσβασης', 'error');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    },

   async logActivity(action, entity_type, entity_id, details = {}) {
       const user = this.getCurrentUser();
       if (!user) return;
   
       try {
           const { error } = await _supabase.from('activity_log').insert([{
               user_id: user.id,
               action: action,
               entity_type: entity_type,
               entity_id: entity_id ? String(entity_id) : null,  // ← Convert to string
               details: JSON.stringify(details)
               // Remove created_at - let database handle it
           }]);
           
           if (error) {
               console.error('Log activity error:', error);
           }
       } catch (err) {
           console.error('Failed to log activity:', err);
       }
   }
};

// ============================================
// FILE UPLOAD SYSTEM
// ============================================
const FileUpload = {
    async uploadImage(file, orderId) {
        if (!file) return null;
        
        // Validate file type
        if (!file.type.match('image/(jpeg|jpg|png)')) {
            throw new Error('Μόνο JPEG/PNG αρχεία επιτρέπονται');
        }
        
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error('Το αρχείο είναι πολύ μεγάλο (max 5MB)');
        }
        
        const fileExt = file.name.split('.').pop();
        const fileName = orderId + '_' + Date.now() + '.' + fileExt;
        const filePath = fileName;

        const { data, error } = await _supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = _supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    },

    async uploadMultiple(files, orderId) {
        const urls = [];
        for (const file of files) {
            try {
                const url = await this.uploadImage(file, orderId);
                if (url) urls.push(url);
            } catch (err) {
                console.error('Upload failed:', err);
            }
        }
        return urls;
    },

    async deleteImage(imageUrl) {
        try {
            const fileName = imageUrl.split('/').pop();
            await _supabase.storage.from(STORAGE_BUCKET).remove([fileName]);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    }
};

// ============================================
// IMAGE LIGHTBOX
// ============================================
function showLightbox(imageUrl) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = 
        '<div class="lightbox-content">' +
            '<img src="' + imageUrl + '" alt="Order Image">' +
            '<div class="lightbox-close">×</div>' +
        '</div>';
    
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.className === 'lightbox-close') {
            overlay.remove();
        }
    });
}

function renderImageGallery(imageUrls, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !imageUrls || imageUrls.length === 0) return;
    
    const gallery = document.createElement('div');
    gallery.className = 'image-gallery';
    
    imageUrls.forEach(url => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = '<img src="' + url + '" alt="Order Image">';
        item.addEventListener('click', () => showLightbox(url));
        gallery.appendChild(item);
    });
    
    container.appendChild(gallery);
}

// ============================================
// CUSTOMER EMAIL AUTO-SYNC
// ============================================
async function syncCustomerEmail(phone, email, firstName, lastName) {
    if (!email || !phone) return;
    
    try {
        const { data: existing } = await _supabase
            .from('customers')
            .select('id')
            .eq('phone', phone)
            .single();

        if (existing) {
            await _supabase
                .from('customers')
                .update({
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    updated_at: new Date().toISOString()
                })
                .eq('phone', phone);
        }
    } catch (err) {
        console.error('Email sync failed:', err);
    }
}

// ============================================
// CSV EXPORT WITH UTF-8 BOM
// ============================================
function exportToCSVWithBOM(data, filename) {
    const BOM = '\uFEFF';
    const csvContent = BOM + data;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    
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
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = '<h3 class="modal-title">' + title + '</h3>' +
        '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">×</button>';
    
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.innerHTML = content;
    
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
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

function confirmDialog(message, onConfirm) {
    showModal('Επιβεβαίωση', '<p>' + message + '</p>', [
        { text: 'Ακύρωση', class: 'btn-secondary' },
        { text: 'Επιβεβαίωση', class: 'btn-danger', onClick: onConfirm }
    ]);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.split('-').reverse().join('-');
}

function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return dateStr;
    }
    return parts.reverse().join('-');
}

function formatCurrency(amount) {
    return parseFloat(amount || 0).toFixed(2) + '€';
}

function getGreekDayName(dateStr) {
    const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
    const date = new Date(dateStr);
    return days[date.getDay()];
}

// Convert UTC to Greek time
function formatGreekDateTime(utcDateStr) {
    const date = new Date(utcDateStr);
    // Add 3 hours for Greek timezone (UTC+3 in summer, UTC+2 in winter)
    // Using Intl API for automatic DST handling
    const greekDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Athens' }));
    return {
        date: greekDate.toLocaleDateString('el-GR'),
        time: greekDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
    };
}

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
// NAVIGATION RENDERING
// ============================================
function renderNavigation() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const currentPage = window.location.pathname.split('/').pop();
    
    // Desktop Navigation
    const navbar = document.getElementById('navbar');
    if (navbar) {
        let adminLinks = '';
        if (user.role === 'admin') {
            adminLinks = '<a href="activity-log.html" class="nav-link ' + (currentPage === 'activity-log.html' ? 'active' : '') + '">📝 Ιστορικό</a>' +
                '<a href="backup.html" class="nav-link ' + (currentPage === 'backup.html' ? 'active' : '') + '">💾 Backup</a>' +
                '<a href="users.html" class="nav-link ' + (currentPage === 'users.html' ? 'active' : '') + '">👤 Χρήστες</a>';
        }

        navbar.innerHTML = '<div class="navbar-content">' +
            '<a href="dashboard.html" class="nav-link ' + (currentPage === 'dashboard.html' ? 'active' : '') + '">📊 Dashboard</a>' +
            '<a href="order-form.html" class="nav-link ' + (currentPage === 'order-form.html' ? 'active' : '') + '">➕ Νέα</a>' +
            '<a href="orders-list.html" class="nav-link ' + (currentPage === 'orders-list.html' ? 'active' : '') + '">📋 Παραγγελίες</a>' +
            '<a href="calendar.html" class="nav-link ' + (currentPage === 'calendar.html' ? 'active' : '') + '">📅 Ημερολόγιο</a>' +
            '<a href="customers.html" class="nav-link ' + (currentPage === 'customers.html' ? 'active' : '') + '">👥 Πελάτες</a>' +
            adminLinks +
        '</div>';
    }

    // Mobile Bottom Navigation
    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
        bottomNav.innerHTML = 
            '<a href="dashboard.html" class="bottom-nav-item ' + (currentPage === 'dashboard.html' ? 'active' : '') + '">' +
                '<div class="bottom-nav-icon">🏠</div>' +
                '<div class="bottom-nav-label">Home</div>' +
            '</a>' +
            '<a href="orders-list.html" class="bottom-nav-item ' + (currentPage === 'orders-list.html' ? 'active' : '') + '">' +
                '<div class="bottom-nav-icon">📋</div>' +
                '<div class="bottom-nav-label">Παραγγελίες</div>' +
            '</a>' +
            '<a href="customers.html" class="bottom-nav-item ' + (currentPage === 'customers.html' ? 'active' : '') + '">' +
                '<div class="bottom-nav-icon">👥</div>' +
                '<div class="bottom-nav-label">Πελάτες</div>' +
            '</a>' +
            '<a href="calendar.html" class="bottom-nav-item ' + (currentPage === 'calendar.html' ? 'active' : '') + '">' +
                '<div class="bottom-nav-icon">📅</div>' +
                '<div class="bottom-nav-label">Ημερολόγιο</div>' +
            '</a>' +
            '<div class="bottom-nav-item" onclick="showMobileMenu()">' +
                '<div class="bottom-nav-icon">⋮</div>' +
                '<div class="bottom-nav-label">Άλλα</div>' +
            '</div>';
    }

    // Desktop User Menu
    const userMenuTop = document.getElementById('userMenuTop');
    if (userMenuTop) {
        userMenuTop.innerHTML = 
            '<div class="user-info-top">' +
                '<div class="user-name-top">' + user.full_name + '</div>' +
                '<div class="user-role-top">' + (user.role === 'admin' ? 'Διαχειριστής' : 'Χρήστης') + '</div>' +
            '</div>' +
            '<button class="btn btn-sm btn-danger" onclick="Auth.logout()">Έξοδος</button>';
    }

    // Mobile User Icon
    const mobileUserIcon = document.getElementById('mobileUserIcon');
    if (mobileUserIcon) {
        mobileUserIcon.addEventListener('click', showMobileUserMenu);
    }
}

function showMobileMenu() {
    const user = Auth.getCurrentUser();
    let adminItems = '';
    
    if (user && user.role === 'admin') {
        adminItems = 
            '<a href="activity-log.html" style="display:block; padding:15px; border-bottom:1px solid #eee; text-decoration:none; color:#2c3e50; font-size:1rem;">📝 Ιστορικό Ενεργειών</a>' +
            '<a href="backup.html" style="display:block; padding:15px; border-bottom:1px solid #eee; text-decoration:none; color:#2c3e50; font-size:1rem;">💾 Backup & Restore</a>' +
            '<a href="users.html" style="display:block; padding:15px; border-bottom:1px solid #eee; text-decoration:none; color:#2c3e50; font-size:1rem;">👤 Διαχείριση Χρηστών</a>';
    }
    
    const content = 
        '<div style="padding:0;">' +
            '<a href="order-form.html" style="display:block; padding:15px; border-bottom:1px solid #eee; text-decoration:none; color:#2c3e50; font-size:1rem;">➕ Νέα Παραγγελία</a>' +
            adminItems +
        '</div>';
    
    showModal('📱 Μενού', content, [
        { text: 'Κλείσιμο', class: 'btn-secondary' }
    ]);
}

function showMobileUserMenu() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    
    const content = 
        '<div style="text-align:center; padding:20px;">' +
            '<div style="width:80px; height:80px; background:#2a5a5a; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 15px;">👤</div>' +
            '<h3 style="margin-bottom:5px;">' + user.full_name + '</h3>' +
            '<p style="color:#6c757d; margin-bottom:5px;">' + user.username + '</p>' +
            '<span style="display:inline-block; padding:5px 15px; background:#2a5a5a; color:white; border-radius:20px; font-size:0.85rem;">' + (user.role === 'admin' ? 'Διαχειριστής' : 'Χρήστης') + '</span>' +
        '</div>';
    
    showModal('Προφίλ', content, [
        { text: 'Έξοδος', class: 'btn-danger', onClick: () => Auth.logout() },
        { text: 'Κλείσιμο', class: 'btn-secondary' }
    ]);
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
    
    printArea.innerHTML = '<div style="text-align:center; margin-bottom:20px;"><img src="banner.png" style="max-width:250px;"></div>' + htmlContent;
    window.print();
}

// ============================================
// PASSWORD TOGGLE
// ============================================
function initPasswordToggle() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        if (input.parentElement.classList.contains('password-wrapper')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'password-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        const toggle = document.createElement('span');
        toggle.className = 'password-toggle';
        toggle.innerHTML = '👁️';
        toggle.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                toggle.innerHTML = '🙈';
            } else {
                input.type = 'password';
                toggle.innerHTML = '👁️';
            }
        });
        wrapper.appendChild(toggle);
    });
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderNavigation();
    initPasswordToggle();
});
