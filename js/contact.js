// ============================================================
// MZAMO CHILD GUIDANCE - CONTACT FORM (With Error Handling)
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('enquiryForm');
    const messageDiv = document.getElementById('formMessage');

    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validation
        if (!name) {
            showFriendlyMessage(messageDiv, 'Please enter your full name.', 'error');
            return;
        }
        if (!email) {
            showFriendlyMessage(messageDiv, 'Please enter your email address.', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showFriendlyMessage(messageDiv, 'Please enter a valid email address.', 'error');
            return;
        }

        if (!message) {
            showFriendlyMessage(messageDiv, 'Please enter your message.', 'error');
            return;
        }

        if (message.length < 10) {
            showFriendlyMessage(messageDiv, 'Your message is too short. Please provide more detail.', 'error');
            return;
        }

        if (!window.supabaseClient) {
            showFriendlyMessage(messageDiv, 'Connection error. Please refresh the page.', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';

        if (submitBtn) {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
        }

        try {
            const { error } = await window.supabaseClient
                .from('enquiries')
                .insert([{ name, email, phone: phone || null, message, status: 'New' }]);

            if (error) throw error;

            showFriendlyMessage(messageDiv, 'Thank you. Your enquiry has been submitted successfully.', 'success');
            form.reset();

        } catch (err) {
            console.error('Enquiry submission error:', err);
            showFriendlyMessage(messageDiv, getFriendlyError(err), 'error');
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });
});