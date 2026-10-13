// ============================================================
// MZAMO CHILD GUIDANCE - REPORTS MANAGEMENT (SUPABASE)
// ============================================================

let reports = [];

document.addEventListener('DOMContentLoaded', function() {
    // Only run if we're on the reports page
    const reportsContainer = document.getElementById('reportsContainer');
    if (!reportsContainer) return;

    loadReports();
    setupEventListeners();
});

function setupEventListeners() {
    const showUploadBtn = document.getElementById('showUploadBtn');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const reportForm = document.getElementById('reportUploadForm');

    if (showUploadBtn) {
        showUploadBtn.addEventListener('click', function() {
            const form = document.getElementById('uploadForm');
            if (form) {
                form.classList.toggle('show');
                this.textContent = form.classList.contains('show') ? 'Cancel' : 'Upload New Report';
            }
        });
    }

    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', function() {
            const form = document.getElementById('uploadForm');
            if (form) form.classList.remove('show');
            if (showUploadBtn) showUploadBtn.textContent = 'Upload New Report';
            if (reportForm) reportForm.reset();
        });
    }

    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            uploadReport();
        });
    }
}

async function uploadReport() {
    const titleEl = document.getElementById('reportTitle');
    const descEl = document.getElementById('reportDescription');
    const visEl = document.getElementById('reportVisibility');
    const fileInput = document.getElementById('reportFile');

    if (!titleEl || !fileInput) return;

    const title = titleEl.value.trim();
    const description = descEl ? descEl.value.trim() : '';
    const visibility = visEl ? visEl.value : 'Public';

    if (!title) {
        showUploadMessage('Please enter a report title.', 'error');
        return;
    }
    if (!fileInput.files || fileInput.files.length === 0) {
        showUploadMessage('Please select a file.', 'error');
        return;
    }

    const file = fileInput.files[0];

    if (file.size > 5 * 1024 * 1024) {
        showUploadMessage('File is too large. Maximum size is 5MB.', 'error');
        return;
    }

    try {
        showUploadMessage('Uploading...', 'success');

        const fileName = Date.now() + '_' + file.name;

        const { error: uploadError } = await window.supabaseClient
            .storage
            .from('reports')
            .upload(fileName, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            showUploadMessage('Error uploading file: ' + uploadError.message, 'error');
            return;
        }

        const { data: urlData } = window.supabaseClient
            .storage
            .from('reports')
            .getPublicUrl(fileName);

        const fileUrl = urlData.publicUrl;

        const { error: dbError } = await window.supabaseClient
            .from('reports')
            .insert([{
                title: title,
                description: description || null,
                visibility: visibility,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                file_url: fileUrl
            }]);

        if (dbError) throw dbError;

        showUploadMessage('Report uploaded successfully.', 'success');
        document.getElementById('reportUploadForm').reset();
        document.getElementById('uploadForm').classList.remove('show');
        document.getElementById('showUploadBtn').textContent = 'Upload New Report';

        loadReports();

    } catch (error) {
        console.error('Error uploading report:', error);
        showUploadMessage('Error uploading report. Please try again.', 'error');
    }
}

async function loadReports() {
    const container = document.getElementById('reportsContainer');
    if (!container) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        reports = data || [];

        if (reports.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Reports Yet</h3><p>Upload your first report using the button above.</p></div>';
            return;
        }

        let html = '<div class="table-container"><table class="admin-table"><thead><tr>';
        html += '<th>Title</th><th>Description</th><th>Date</th><th>Visibility</th><th>Actions</th>';
        html += '</tr></thead><tbody>';

        reports.forEach(r => {
            const statusClass = r.visibility === 'Public' ? 'status-public' : 'status-internal';
            const date = new Date(r.created_at).toLocaleDateString();

            html += '<tr>';
            html += '<td><strong>' + escapeHtml(r.title) + '</strong></td>';
            html += '<td>' + escapeHtml(r.description || '-') + '</td>';
            html += '<td style="font-size:0.8rem;">' + date + '</td>';
            html += '<td><span class="status-badge ' + statusClass + '">' + r.visibility + '</span></td>';
            html += '<td><div class="actions">';
            html += '<a href="' + r.file_url + '" target="_blank" class="btn-download">Download</a>';
            html += '<button class="btn-delete" onclick="deleteReport(' + r.id + ')">Delete</button>';
            html += '</div></td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        html += '<div class="table-count">Total: <strong>' + reports.length + '</strong> report(s)</div></div>';

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading reports:', error);
        container.innerHTML = '<div class="empty-state"><h3>Error</h3><p>Could not load reports.</p></div>';
    }
}

async function deleteReport(id) {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
        const report = reports.find(r => r.id === id);

        if (report && report.file_url) {
            const fileName = report.file_url.split('/').pop();
            await window.supabaseClient.storage.from('reports').remove([fileName]);
        }

        const { error } = await window.supabaseClient
            .from('reports')
            .delete()
            .eq('id', id);

        if (error) throw error;
        loadReports();

    } catch (error) {
        console.error('Error deleting report:', error);
        alert('Error deleting report.');
    }
}

function showUploadMessage(text, type) {
    const messageDiv = document.getElementById('uploadMessage');
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = 'form-message ' + type;
    messageDiv.style.display = 'block';
    setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}