// ============================================================
// MZAMO CHILD GUIDANCE - TWO-FACTOR AUTHENTICATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;

    if (currentPage.includes('admin-2fa-setup')) {
        initSetup();
    } else if (currentPage.includes('admin-2fa-verify')) {
        initVerify();
    }
});

// ============================================================
// SETUP PAGE - Enroll authenticator app
// ============================================================

async function initSetup() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'admin-login.html';
        return;
    }

    const { data: factorsData, error: listError } = await window.supabaseClient.auth.mfa.listFactors();

    if (listError) {
        console.error('Error listing factors:', listError);
    }

    if (factorsData && factorsData.totp && factorsData.totp.length > 0) {
        console.log('Found existing factors, cleaning up...');
        for (const factor of factorsData.totp) {
            try {
                await window.supabaseClient.auth.mfa.unenroll({ factorId: factor.id });
                console.log('Removed old factor:', factor.id);
            } catch (err) {
                console.error('Error removing old factor:', err);
            }
        }
    }

    try {
        const { data, error } = await window.supabaseClient.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: 'Mzamo Admin ' + Date.now()
        });

        if (error) throw error;

        document.getElementById('qrCode').src = data.totp.qr_code;
        document.getElementById('secretKey').textContent = data.totp.secret;

        const factorId = data.id;

        document.getElementById('verifyForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            await verifySetupCode(factorId);
        });

    } catch (error) {
        console.error('Error enrolling 2FA:', error);
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.textContent = getFriendlyError(error);
        errorMsg.style.display = 'block';
    }
}

async function verifySetupCode(factorId) {
    const code = document.getElementById('verifyCode').value.trim();
    const messageDiv = document.getElementById('verifyMessage');

    if (!code || code.length !== 6) {
        showFriendlyMessage(messageDiv, 'Please enter a valid 6-digit code.', 'error');
        return;
    }

    if (!/^\d{6}$/.test(code)) {
        showFriendlyMessage(messageDiv, 'The code must contain only numbers.', 'error');
        return;
    }

    try {
        const { data: challengeData, error: challengeError } = await window.supabaseClient.auth.mfa.challenge({
            factorId: factorId
        });

        if (challengeError) throw challengeError;

        const { error } = await window.supabaseClient.auth.mfa.verify({
            factorId: factorId,
            challengeId: challengeData.id,
            code: code
        });

        if (error) throw error;

        showFriendlyMessage(messageDiv, '2FA setup successful. Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 1500);

    } catch (error) {
        console.error('Error verifying code:', error);
        showFriendlyMessage(messageDiv, getFriendlyError(error), 'error');
    }
}

// ============================================================
// VERIFY PAGE - Enter 6-digit code on login
// ============================================================

async function initVerify() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'admin-login.html';
        return;
    }

    const { data: factorsData } = await window.supabaseClient.auth.mfa.listFactors();
    
    if (!factorsData || !factorsData.totp || factorsData.totp.length === 0) {
        window.location.href = 'admin-2fa-setup.html';
        return;
    }

    const verifiedFactor = factorsData.totp.find(f => f.status === 'verified');

    if (!verifiedFactor) {
        window.location.href = 'admin-2fa-setup.html';
        return;
    }

    const factorId = verifiedFactor.id;

    document.getElementById('verifyForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await verifyLoginCode(factorId);
    });
}

async function verifyLoginCode(factorId) {
    const code = document.getElementById('verifyCode').value.trim();
    const messageDiv = document.getElementById('verifyMessage');

    if (!code || code.length !== 6) {
        showFriendlyMessage(messageDiv, 'Please enter a valid 6-digit code.', 'error');
        return;
    }

    if (!/^\d{6}$/.test(code)) {
        showFriendlyMessage(messageDiv, 'The code must contain only numbers.', 'error');
        return;
    }

    try {
        const { data: challengeData, error: challengeError } = await window.supabaseClient.auth.mfa.challenge({
            factorId: factorId
        });

        if (challengeError) throw challengeError;

        const { error } = await window.supabaseClient.auth.mfa.verify({
            factorId: factorId,
            challengeId: challengeData.id,
            code: code
        });

        if (error) throw error;

        showFriendlyMessage(messageDiv, 'Verified. Redirecting...', 'success');
        sessionStorage.setItem('mfaVerified', 'true');

        setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 1000);

    } catch (error) {
        console.error('Error verifying code:', error);
        showFriendlyMessage(messageDiv, getFriendlyError(error), 'error');
        document.getElementById('verifyCode').value = '';
    }
}

console.log('2FA JavaScript loaded');