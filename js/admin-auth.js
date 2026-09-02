// ============================================================
// MZAMO CHILD GUIDANCE - ADMIN AUTHENTICATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginMessage = document.getElementById('loginMessage');

    // ===== LOGIN FUNCTIONALITY =====
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value.trim();

            // Demo credentials
            const DEMO_EMAIL = 'admin@mzamo.org';
            const DEMO_PASSWORD = 'admin123';

            if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
                // Store login session
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminEmail', email);

                showMessage('Login successful! Redirecting...', 'success');

                // Redirect to dashboard
                setTimeout(function() {
                    window.location.href = 'admin-dashboard.html';
                }, 1500);
            } else {
                showMessage('Invalid email or password. Please try again.', 'error');
                document.getElementById('adminPassword').value = '';
                document.getElementById('adminPassword').focus();
            }
        });
    }

    // ===== CHECK LOGIN STATUS =====
    function checkAuth() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
        const currentPage = window.location.pathname;

        // List of admin pages
        const adminPages = [
            'admin-dashboard.html',
            'admin-programmes.html',
            'admin-news.html',
            'admin-reports.html',
            'admin-enquiries.html'
        ];

        const isAdminPage = adminPages.some(page => currentPage.includes(page));

        if (isAdminPage && isLoggedIn !== 'true') {
            window.location.href = 'admin-login.html';
        }

        if (isAdminPage && isLoggedIn === 'true') {
            const nameSpan = document.getElementById('adminName');
            if (nameSpan) {
                const email = sessionStorage.getItem('adminEmail');
                nameSpan.textContent = email ? email.split('@')[0] : 'Administrator';
            }
        }
    }

    // ===== LOGOUT FUNCTIONALITY =====
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminEmail');
            window.location.href = 'admin-login.html';
        });
    }

    // ===== HELPER FUNCTION =====
    function showMessage(text, type) {
        if (loginMessage) {
            loginMessage.textContent = text;
            loginMessage.className = 'form-message ' + type;
            loginMessage.style.display = 'block';
        }
    }

    // ===== CHECK AUTH ON PAGE LOAD =====
    checkAuth();
});