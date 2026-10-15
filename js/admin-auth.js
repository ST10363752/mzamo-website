// ============================================================
// MZAMO CHILD GUIDANCE - ADMIN AUTHENTICATION (With Error Handling)
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value.trim();

            if (!email) {
                showFriendlyMessage(loginMessage, 'Please enter your email address.', 'error');
                return;
            }
            if (!password) {
                showFriendlyMessage(loginMessage, 'Please enter your password.', 'error');
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                showFriendlyMessage(loginMessage, 'Please enter a valid email address.', 'error');
                return;
            }

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            try {
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) throw error;

                const { data: factorsData } = await window.supabaseClient.auth.mfa.listFactors();

                if (factorsData && factorsData.totp && factorsData.totp.length > 0) {
                    const { data: aalData } = await window.supabaseClient.auth.mfa.getAuthenticatorAssuranceLevel();

                    if (aalData.currentLevel === 'aal2') {
                        showFriendlyMessage(loginMessage, 'Login successful. Redirecting...', 'success');
                        setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 800);
                    } else {
                        showFriendlyMessage(loginMessage, 'Please enter your 2FA code...', 'success');
                        setTimeout(() => { window.location.href = 'admin-2fa-verify.html'; }, 800);
                    }
                } else {
                    showFriendlyMessage(loginMessage, 'Setting up 2FA...', 'success');
                    setTimeout(() => { window.location.href = 'admin-2fa-setup.html'; }, 800);
                }

            } catch (err) {
                console.error('Login error:', err);
                showFriendlyMessage(loginMessage, getFriendlyError(err), 'error');
                document.getElementById('adminPassword').value = '';
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    checkAuth();

    const logoutBtn = document.getElementById('logoutBtn') || document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await window.supabaseClient.auth.signOut();
            sessionStorage.removeItem('mfaVerified');
            window.location.href = 'admin-login.html';
        });
    }

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
        if (!isAdminPage) return;

        try {
            const { data: { session } } = await window.supabaseClient.auth.getSession();

            if (!session) {
                window.location.href = 'admin-login.html';
                return;
            }

            const { data: factorsData } = await window.supabaseClient.auth.mfa.listFactors();
            if (factorsData && factorsData.totp && factorsData.totp.length > 0) {
                const { data: aalData } = await window.supabaseClient.auth.mfa.getAuthenticatorAssuranceLevel();
                if (aalData.currentLevel !== 'aal2') {
                    window.location.href = 'admin-2fa-verify.html';
                    return;
                }
            }

            const nameSpan = document.getElementById('adminName');
            if (nameSpan && session.user) {
                nameSpan.textContent = session.user.email.split('@')[0];
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
});