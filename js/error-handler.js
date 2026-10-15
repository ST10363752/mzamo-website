// ============================================================
// MZAMO CHILD GUIDANCE - CENTRALISED ERROR HANDLER
// ============================================================

/**
 * Turn raw errors into friendly, human-readable messages.
 */
function getFriendlyError(error) {
    // Network / connection errors
    if (!navigator.onLine) {
        return 'No internet connection. Please check your network and try again.';
    }

    if (!error) {
        return 'Something went wrong. Please try again.';
    }

    const message = (error.message || error.toString()).toLowerCase();

    // Network-level errors
    if (
        message.includes('failed to fetch') ||
        message.includes('network') ||
        message.includes('err_name_not_resolved') ||
        message.includes('err_internet_disconnected')
    ) {
        return 'Cannot connect to the server. Please check your internet connection.';
    }

    // Timeout
    if (message.includes('timeout') || message.includes('timed out')) {
        return 'The server is taking too long to respond. Please try again.';
    }

    // Authentication
    if (
        message.includes('invalid login credentials') ||
        message.includes('invalid email or password')
    ) {
        return 'Invalid email or password. Please check and try again.';
    }

    if (message.includes('email not confirmed')) {
        return 'Please confirm your email address before logging in.';
    }

    if (message.includes('user already registered')) {
        return 'An account with this email already exists.';
    }

    if (message.includes('password should be at least')) {
        return 'Password is too short. Please use at least 6 characters.';
    }

    if (message.includes('rate limit') || message.includes('too many requests')) {
        return 'Too many attempts. Please wait a few minutes and try again.';
    }

    // Database errors
    if (message.includes('row-level security') || message.includes('rls')) {
        return 'You do not have permission to perform this action.';
    }

    if (message.includes('duplicate key') || message.includes('already exists')) {
        return 'This record already exists. Please use a different value.';
    }

    if (message.includes('violates not-null') || message.includes('null value')) {
        return 'Please fill in all required fields.';
    }

    if (message.includes('permission denied')) {
        return 'Permission denied. Please contact the administrator.';
    }

    // File upload errors
    if (message.includes('file too large') || message.includes('exceeded')) {
        return 'The file is too large. Maximum size is 5MB.';
    }

    if (message.includes('mime type') || message.includes('file type')) {
        return 'This file type is not supported. Please use PDF, DOC, or DOCX.';
    }

    // 2FA errors
    if (message.includes('invalid totp') || message.includes('invalid code')) {
        return 'The verification code is incorrect. Please try again.';
    }

    if (message.includes('expired')) {
        return 'This code has expired. Please generate a new one from your authenticator app.';
    }

    // 401/403
    if (message.includes('401') || message.includes('unauthorized')) {
        return 'Your session has expired. Please log in again.';
    }

    if (message.includes('403') || message.includes('forbidden')) {
        return 'You do not have access to this resource.';
    }

    // 404
    if (message.includes('404') || message.includes('not found')) {
        return 'The requested resource was not found.';
    }

    // 500
    if (message.includes('500') || message.includes('server error')) {
        return 'The server encountered an error. Please try again later.';
    }

    // Default
    return 'Something went wrong. Please try again or contact support.';
}

/**
 * Show a message in an element.
 */
function showFriendlyMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = 'form-message ' + type;
    element.style.display = 'block';

    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => { element.style.display = 'none'; }, 5000);
    }
}

/**
 * Show a global error banner (for unexpected crashes).
 */
function showGlobalError(text) {
    let banner = document.getElementById('globalErrorBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'globalErrorBanner';
        banner.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc3545;
            color: white;
            padding: 14px 28px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 9999;
            font-weight: 500;
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(banner);
    }
    banner.textContent = text;
    banner.style.display = 'block';

    setTimeout(() => { banner.style.display = 'none'; }, 6000);
}

/**
 * Wrap an async operation with error handling.
 */
async function safeAsync(operation, errorElement) {
    try {
        return await operation();
    } catch (error) {
        console.error('Operation failed:', error);
        const message = getFriendlyError(error);
        if (errorElement) {
            showFriendlyMessage(errorElement, message, 'error');
        } else {
            showGlobalError(message);
        }
        return null;
    }
}

// Global safety net for uncaught errors
window.addEventListener('error', function(e) {
    console.error('Uncaught error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    if (e.reason && (e.reason.message || '').includes('fetch')) {
        showGlobalError('Lost connection to the server. Please check your internet.');
    }
});

// Online / offline detection
window.addEventListener('offline', function() {
    showGlobalError('You are offline. Please check your internet connection.');
});

window.addEventListener('online', function() {
    showGlobalError('You are back online.');
});

console.log('Error handler loaded');