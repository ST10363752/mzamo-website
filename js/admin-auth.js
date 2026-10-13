// ============================================================
// MZAMO CHILD GUIDANCE - ADMIN AUTHENTICATION (SUPABASE)
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginMessage = document.getElementById('loginMessage');

    // ===== LOGIN FUNCTIONALITY =====
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value.trim();

            if (!email || !password) {
                showMessage('Please enter both email and password.', 'error');
                return;
            }

            // Show loading
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            try {
                // Sign in with Supabase Auth
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    console.error('Login error:', error);
                    showMessage('Invalid email or password. Please try again.', 'error');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                console.log('Login successful:', data.user.email);
                showMessage('Login successful! Redirecting...', 'success');

                setTimeout(function() {
                    window.location.href = 'admin-dashboard.html';
                }, 1000);

            } catch (err) {
                console.error('Error:', err);
                showMessage('An unexpected error occurred.', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ===== CHECK AUTH STATUS ON ADMIN PAGES =====
    checkAuth();

    // ===== LOGOUT FUNCTIONALITY =====
    const logoutBtn = document.getElementById('logoutBtn') || document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await window.supabaseClient.auth.signOut();
            window.location.href = 'admin-login.html';
        });
    }

    // ===== AUTH CHECK FUNCTION =====
    async function checkAuth() {
        const currentPage = window.location.pathname;
        const adminPages = [
            'admin-dashboard.html',
            'admin-programmes.html',
            'admin-news.html',
            'admin-reports.html',
            'admin-enquiries.html'
        ];

        const isAdminPage = adminPages.some(page => currentPage.includes(page));

        if (isAdminPage) {
            const { data: { session } } = await window.supabaseClient.auth.getSession();

            if (!session) {
                window.location.href = 'admin-login.html';
                return;
            }

            // Display admin name
            const nameSpan = document.getElementById('adminName');
            if (nameSpan && session.user) {
                nameSpan.textContent = session.user.email.split('@')[0];
            }

            console.log('Admin authenticated:', session.user.email);
        }
    }

    // ===== HELPER FUNCTION =====
    function showMessage(text, type) {
        if (loginMessage) {
            loginMessage.textContent = text;
            loginMessage.className = 'form-message ' + type;
            loginMessage.style.display = 'block';
        }
    }
});