// ============================================================
// MZAMO CHILD GUIDANCE - ENQUIRIES MANAGEMENT (SUPABASE)
// ============================================================

let enquiries = [];
let currentEnquiryIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
    loadEnquiries();
});

async function loadEnquiries() {
    const container = document.getElementById('enquiriesContainer');

    try {
        const { data, error } = await window.supabaseClient
            .from('enquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        enquiries = data || [];

        if (enquiries.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Enquiries Yet</h3><p>When someone submits an enquiry, it will appear here.</p></div>';
            return;
        }

        // Count stats
        const newCount = enquiries.filter(e => e.status === 'New' || !e.status).length;
        const progressCount = enquiries.filter(e => e.status === 'In Progress').length;
        const resolvedCount = enquiries.filter(e => e.status === 'Resolved').length;

        let statsHTML = '<div class="stats-banner">';
        statsHTML += '<div class="stat-box new"><span class="number">' + newCount + '</span><span class="label">New</span></div>';
        statsHTML += '<div class="stat-box progress"><span class="number">' + progressCount + '</span><span class="label">In Progress</span></div>';
        statsHTML += '<div class="stat-box resolved"><span class="number">' + resolvedCount + '</span><span class="label">Resolved</span></div>';
        statsHTML += '</div>';

        let html = '<div class="table-container"><table class="admin-table"><thead><tr>';
        html += '<th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th><th>Status</th><th>Actions</th>';
        html += '</tr></thead><tbody>';

        enquiries.forEach((enquiry, index) => {
            const statusClass = enquiry.status === 'Resolved' ? 'status-resolved' :
                                enquiry.status === 'In Progress' ? 'status-in-progress' : 'status-new';
            const date = new Date(enquiry.created_at).toLocaleDateString() + ' ' + new Date(enquiry.created_at).toLocaleTimeString();
            const preview = enquiry.message.length > 40 ? enquiry.message.substring(0, 40) + '...' : enquiry.message;

            html += '<tr>';
            html += '<td><strong>' + escapeHtml(enquiry.name) + '</strong></td>';
            html += '<td>' + escapeHtml(enquiry.email) + '</td>';
            html += '<td>' + escapeHtml(enquiry.phone || '-') + '</td>';
            html += '<td><span class="message-preview" onclick="viewEnquiry(' + index + ')" title="Click to view">' + escapeHtml(preview) + '</span></td>';
            html += '<td style="font-size:0.8rem;">' + date + '</td>';
            html += '<td><span class="status-badge ' + statusClass + '">' + (enquiry.status || 'New') + '</span></td>';
            html += '<td><div class="actions">';
            html += '<button class="btn-view" onclick="viewEnquiry(' + index + ')">View</button>';
            if (enquiry.status !== 'In Progress') {
                html += '<button class="btn-progress" onclick="updateStatus(' + enquiry.id + ', \'In Progress\')">Progress</button>';
            }
            if (enquiry.status !== 'Resolved') {
                html += '<button class="btn-resolve" onclick="updateStatus(' + enquiry.id + ', \'Resolved\')">Resolve</button>';
            }
            html += '<button class="btn-delete" onclick="deleteEnquiry(' + enquiry.id + ')">Delete</button>';
            html += '</div></td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        html += '<div class="table-count">Total: <strong>' + enquiries.length + '</strong> enquiry(ies)</div></div>';

        container.innerHTML = statsHTML + html;

    } catch (error) {
        console.error('Error loading enquiries:', error);
        container.innerHTML = '<div class="empty-state"><h3>Error</h3><p>Could not load enquiries.</p></div>';
    }
}

function viewEnquiry(index) {
    const enquiry = enquiries[index];
    if (!enquiry) return;

    currentEnquiryIndex = index;

    const date = new Date(enquiry.created_at).toLocaleDateString() + ' ' + new Date(enquiry.created_at).toLocaleTimeString();

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML =
        '<div class="detail-row"><span class="label">Name</span><span class="value"><strong>' + escapeHtml(enquiry.name) + '</strong></span></div>' +
        '<div class="detail-row"><span class="label">Email</span><span class="value">' + escapeHtml(enquiry.email) + '</span></div>' +
        '<div class="detail-row"><span class="label">Phone</span><span class="value">' + escapeHtml(enquiry.phone || 'Not provided') + '</span></div>' +
        '<div class="detail-row" style="flex-direction:column; align-items:flex-start; gap:5px;"><span class="label" style="width:100%;">Message</span><span class="value" style="background:#f8f9fa; padding:12px; border-radius:8px; width:100%; line-height:1.6;">' + escapeHtml(enquiry.message) + '</span></div>' +
        '<div class="detail-row"><span class="label">Date</span><span class="value">' + date + '</span></div>' +
        '<div class="detail-row"><span class="label">Status</span><span class="value">' + (enquiry.status || 'New') + '</span></div>' +
        '<div class="modal-actions">' +
        (enquiry.status !== 'In Progress' ? '<button class="btn-progress" onclick="updateStatusFromModal(' + enquiry.id + ', \'In Progress\')">Mark In Progress</button>' : '') +
        (enquiry.status !== 'Resolved' ? '<button class="btn-resolve" onclick="updateStatusFromModal(' + enquiry.id + ', \'Resolved\')">Mark Resolved</button>' : '') +
        '<button class="btn-close-modal" onclick="closeModal()">Close</button>' +
        '</div>';

    document.getElementById('enquiryModal').classList.add('show');
}

function closeModal() {
    document.getElementById('enquiryModal').classList.remove('show');
}

async function updateStatus(id, newStatus) {
    try {
        const { error } = await window.supabaseClient
            .from('enquiries')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        loadEnquiries();
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status.');
    }
}

async function updateStatusFromModal(id, newStatus) {
    await updateStatus(id, newStatus);
    closeModal();
}

async function deleteEnquiry(id) {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    try {
        const { error } = await window.supabaseClient
            .from('enquiries')
            .delete()
            .eq('id', id);

        if (error) throw error;
        loadEnquiries();
    } catch (error) {
        console.error('Error deleting enquiry:', error);
        alert('Error deleting enquiry.');
    }
}

document.getElementById('enquiryModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}