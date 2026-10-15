// ============================================================
// MZAMO CHILD GUIDANCE - NEWS MANAGEMENT (SUPABASE)
// ============================================================

let newsItems = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('newsContainer');
    if (!container) return;

    loadNews();
    setupEventListeners();
});

function setupEventListeners() {
    const showAddBtn = document.getElementById('showAddBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const newsForm = document.getElementById('newsForm');

    if (showAddBtn) {
        showAddBtn.addEventListener('click', function() {
            resetForm();
            const form = document.getElementById('addForm');
            form.classList.toggle('show');
            this.textContent = form.classList.contains('show') ? 'Cancel' : 'Add New Article';
        });
    }

    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', function() {
            document.getElementById('addForm').classList.remove('show');
            document.getElementById('showAddBtn').textContent = 'Add New Article';
            resetForm();
        });
    }

    if (newsForm) {
        newsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNews();
        });
    }
}

async function saveNews() {
    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const status = document.getElementById('newsStatus').value;
    const messageDiv = document.getElementById('formMessage');

    if (!title) {
        showFriendlyMessage(messageDiv, 'Please enter an article title.', 'error');
        return;
    }
    if (title.length < 3) {
        showFriendlyMessage(messageDiv, 'Title is too short.', 'error');
        return;
    }
    if (!content) {
        showFriendlyMessage(messageDiv, 'Please enter the article content.', 'error');
        return;
    }
    if (content.length < 10) {
        showFriendlyMessage(messageDiv, 'Article content is too short.', 'error');
        return;
    }

    try {
        if (editingId === null) {
            const { error } = await window.supabaseClient
                .from('news')
                .insert([{ title, content, status }]);
            if (error) throw error;
            showFriendlyMessage(messageDiv, 'Article added successfully.', 'success');
        } else {
            const { error } = await window.supabaseClient
                .from('news')
                .update({ title, content, status, updated_at: new Date().toISOString() })
                .eq('id', editingId);
            if (error) throw error;
            showFriendlyMessage(messageDiv, 'Article updated successfully.', 'success');
        }

        loadNews();
        setTimeout(() => {
            document.getElementById('addForm').classList.remove('show');
            document.getElementById('showAddBtn').textContent = 'Add New Article';
            resetForm();
        }, 1000);

    } catch (error) {
        console.error('Error saving news:', error);
        showFriendlyMessage(messageDiv, getFriendlyError(error), 'error');
    }
}

async function loadNews() {
    const container = document.getElementById('newsContainer');
    if (!container) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        newsItems = data || [];

        if (newsItems.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No News Articles</h3><p>Add your first article using the button above.</p></div>';
            return;
        }

        let html = '<div class="table-container"><table class="admin-table"><thead><tr>';
        html += '<th>Title</th><th>Content</th><th>Date</th><th>Status</th><th>Actions</th>';
        html += '</tr></thead><tbody>';

        newsItems.forEach(item => {
            const statusClass = item.status === 'Published' ? 'status-published' :
                                item.status === 'Draft' ? 'status-draft' : 'status-upcoming';
            const date = new Date(item.created_at).toLocaleDateString();
            const preview = item.content.length > 80 ? item.content.substring(0, 80) + '...' : item.content;

            html += '<tr>';
            html += '<td><strong>' + escapeHtml(item.title) + '</strong></td>';
            html += '<td>' + escapeHtml(preview) + '</td>';
            html += '<td style="font-size:0.8rem;">' + date + '</td>';
            html += '<td><span class="status-badge ' + statusClass + '">' + item.status + '</span></td>';
            html += '<td><div class="actions">';
            html += '<button class="btn-edit" onclick="editNews(' + item.id + ')">Edit</button>';
            html += '<button class="btn-toggle" onclick="toggleStatus(' + item.id + ', \'' + item.status + '\')">Toggle</button>';
            html += '<button class="btn-delete" onclick="deleteNews(' + item.id + ')">Delete</button>';
            html += '</div></td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        html += '<div class="table-count">Total: <strong>' + newsItems.length + '</strong> article(s)</div></div>';

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<div class="empty-state"><h3>Error</h3><p>' + getFriendlyError(error) + '</p></div>';
    }
}

function editNews(id) {
    const item = newsItems.find(n => n.id === id);
    if (!item) return;

    editingId = id;
    document.getElementById('newsTitle').value = item.title;
    document.getElementById('newsContent').value = item.content;
    document.getElementById('newsStatus').value = item.status;
    document.getElementById('formTitle').textContent = 'Edit Article';
    document.getElementById('formSubmitBtn').textContent = 'Update Article';
    document.getElementById('addForm').classList.add('show');
    document.getElementById('showAddBtn').textContent = 'Cancel';
    document.getElementById('formMessage').style.display = 'none';
    document.getElementById('addForm').scrollIntoView({ behavior: 'smooth' });
}

async function toggleStatus(id, currentStatus) {
    const statuses = ['Published', 'Draft', 'Upcoming'];
    const currentIndex = statuses.indexOf(currentStatus);
    const newStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
        const { error } = await window.supabaseClient
            .from('news')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        loadNews();
    } catch (error) {
        console.error('Error toggling status:', error);
        showGlobalError(getFriendlyError(error));
    }
}

async function deleteNews(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
        const { error } = await window.supabaseClient
            .from('news')
            .delete()
            .eq('id', id);
        if (error) throw error;
        loadNews();
    } catch (error) {
        console.error('Error deleting article:', error);
        showGlobalError(getFriendlyError(error));
    }
}

function resetForm() {
    document.getElementById('newsForm').reset();
    document.getElementById('formMessage').style.display = 'none';
    editingId = null;
    document.getElementById('formTitle').textContent = 'Add New Article';
    document.getElementById('formSubmitBtn').textContent = 'Add Article';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}