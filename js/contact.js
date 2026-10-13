
 // ============================================================
 // MZAMO CHILD GUIDANCE - CONTACT FORM HANDLER (SUPABASE)
 // ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('enquiryForm');
    const messageDiv = document.getElementById('formMessage');

    if (!form) {
        console.error('Contact form not found: enquiryForm');
        return;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validate required fields
        if (!name || !email || !message) {
            showMessage(
                'Please fill in all required fields.',
                'error'
            );
            return;
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showMessage(
                'Please enter a valid email address.',
                'error'
            );
            return;
        }

        // Check that Supabase was initialized
        if (!window.supabaseClient) {
            console.error('Supabase client is not initialized.');

            showMessage(
                'Connection error. Please try again later.',
                'error'
            );
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector(
            'button[type="submit"]'
        );

        const originalText = submitBtn
            ? submitBtn.textContent
            : '';

        if (submitBtn) {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
        }

        try {
            // Save enquiry to Supabase without requesting
            // the inserted row back
            const { error } = await window.supabaseClient
                .from('enquiries')
                .insert([
                    {
                        name: name,
                        email: email,
                        phone: phone || null,
                        message: message,
                        status: 'New'
                    }
                ]);

            if (error) {
                console.error('Supabase error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });

                showMessage(
                    'Error submitting enquiry. Please try again.',
                    'error'
                );

                return;
            }

            // Success
            console.log('Enquiry saved to Supabase successfully.');

            showMessage(
                'Thank you! Your enquiry has been submitted successfully.',
                'success'
            );

            form.reset();

        } catch (err) {
            console.error('Unexpected submission error:', err);

            showMessage(
                'An unexpected error occurred. Please try again.',
                'error'
            );

        } finally {
            // Restore the submit button
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });

    // ============================================================
    // HELPER FUNCTION: DISPLAY FORM MESSAGES
    // ============================================================

    function showMessage(text, type) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = 'form-message ' + type;
            messageDiv.style.display = 'block';

            setTimeout(function () {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
});
