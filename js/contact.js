// ============================================================
// MZAMO CHILD GUIDANCE - CONTACT FORM HANDLER
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('enquiryForm');
    const messageDiv = document.getElementById('formMessage');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const message = document.getElementById('message').value.trim();

            // Validate
            if (!name || !email || !message) {
                showMessage('Please fill in all required fields (*).', 'error');
                return;
            }

            // Validate email format
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Get existing enquiries or create new array
            let enquiries = JSON.parse(localStorage.getItem('enquiries') || '[]');
            
            // Add new enquiry
            enquiries.push({
                id: Date.now(),
                name: name,
                email: email,
                phone: phone || '',
                message: message,
                date: new Date().toISOString(),
                status: 'New'
            });
            
            // Save back to localStorage
            localStorage.setItem('enquiries', JSON.stringify(enquiries));

            console.log('Enquiry saved! Total enquiries:', enquiries.length);

            // Show success message
            showMessage('Thank you! Your enquiry has been submitted successfully. We will get back to you soon.', 'success');

            // Reset form
            form.reset();
        });
    }

    // ===== HELPER FUNCTION =====
    function showMessage(text, type) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = 'form-message ' + type;
            messageDiv.style.display = 'block';

            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
});