// ============================================================
// MZAMO CHILD GUIDANCE - PROGRAMMES MANAGEMENT (SUPABASE)
// ============================================================

let programmes = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('programmesContainer');
    if (!container) return;

    loadProgrammes();
    setupEventListeners();
});

function setupEventListeners() {
    const showAddBtn = document.getElementById('showAddBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const programmeForm = document.getElementById('programmeForm');

    if (showAddBtn) {
        showAddBtn.addEventListener('click', function() {
            resetForm();
            const form = document.getElementById('addForm');
            form.classList.toggle('show');
            this.textContent = form.classList.contains('show') ? 'Cancel' : 'Add New Programme';
        });
    }

    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', function() {
            document.getElementById('addForm').classList.remove('show');
            document.getElementById('showAddBtn').textContent = 'Add New Programme';
            resetForm();
        });
    }

    if (programmeForm) {
        programmeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProgramme();
        });
    }
}

async function saveProgramme() {
    const name = document.getElementById('programmeName').value.trim();
    const target = document.getElementById('programmeTarget').value.trim();
    const description = document.getElementById('programmeDescription').value.trim();
    const status = document.getElementById('programmeStatus').value;
    const messageDiv = document.getElementById('formMessage');

    if (!name) {
        showFriendlyMessage(messageDiv, 'Please enter a programme name.', 'error');
        return;
    }
    if (name.length < 3) {
        showFriendlyMessage(messageDiv, 'Programme name is too short.', 'error');
        return;
    }
    if (!target) {
        showFriendlyMessage(messageDiv, 'Please enter a target group.', 'error');
        return;
    }

    try {
        if (editingId === null) {
            const { error } = await window.supabaseClient
                .from('programmes')
                .insert([{ name, target_group: target, description, status }]);
            if (error) throw error;
            showFriendlyMessage(messageDiv, 'Programme added successfully.', 'success');
        } else {
            const { error } = await window.supabaseClient
                .from('programmes')
                .update({ name, target_group: target, description, status, updated_at: new Date().toISOString() })
                .eq('id', editingId);
            if (error) throw error;
            showFriendlyMessage(messageDiv, 'Programme updated successfully.', 'success');
        }

        loadProgrammes();
        setTimeout(() => {
            document.getElementById('addForm').classList.remove('show');
            document.getElementById('showAddBtn').textContent = 'Add New Programme';
            resetForm();
        }, 1000);

    } catch (error) {
        console.error('Error saving programme:', error);
        showFriendlyMessage(messageDiv, getFriendlyError(error), 'error');
    }
}

async function loadProgrammes() {
    const container = document.getElementById('programmesContainer');
    if (!container) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('programmes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        programmes = data || [];

        if (programmes.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Programmes</h3><p>Add your first programme using the button above.</p></div>';
            return;
        }

        let html = '<div class="table-container"><table class="admin-table"><thead><tr>';
        html += '<th>Programme</th><th>Target Group</th><th>Description</th><th>Status</th><th>Actions</th>';
        html += '</tr></thead><tbody>';

        programmes.forEach(p => {
            const statusClass = p.status === 'Active' ? 'status-active' : 'status-inactive';
            html += '<tr>';
            html += '<td><strong>' + escapeHtml(p.name) + '</strong></td>';
            html += '<td>' + escapeHtml(p.target_group) + '</td>';
            html += '<td>' + escapeHtml(p.description || '-') + '</td>';
            html += '<td><span class="status-badge ' + statusClass + '">' + p.status + '</span></td>';
            html += '<td><div class="actions">';
            html += '<button class="btn-edit" onclick="editProgramme(' + p.id + ')">Edit</button>';
            html += '<button class="btn-toggle" onclick="toggleStatus(' + p.id + ', \'' + p.status + '\')">Toggle</button>';
            html += '<button class="btn-delete" onclick="deleteProgramme(' + p.id + ')">Delete</button>';
            html += '</div></td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        html += '<div class="table-count">Total: <strong>' + programmes.length + '</strong> programme(s)</div></div>';

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading programmes:', error);
        container.innerHTML = '<div class="empty-state"><h3>Error</h3><p>' + getFriendlyError(error) + '</p></div>';
    }
}

function editProgramme(id) {
    const programme = programmes.find(p => p.id === id);
    if (!programme) return;

    editingId = id;
    document.getElementById('programmeName').value = programme.name;
    document.getElementById('programmeTarget').value = programme.target_group;
    document.getElementById('programmeDescription').value = programme.description || '';
    document.getElementById('programmeStatus').value = programme.status;
    document.getElementById('formTitle').textContent = 'Edit Programme';
    document.getElementById('formSubmitBtn').textContent = 'Update Programme';
    document.getElementById('addForm').classList.add('show');
    document.getElementById('showAddBtn').textContent = 'Cancel';
    document.getElementById('formMessage').style.display = 'none';
    document.getElementById('addForm').scrollIntoView({ behavior: 'smooth' });
}

async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
        const { error } = await window.supabaseClient
            .from('programmes')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        loadProgrammes();
    } catch (error) {
        console.error('Error toggling status:', error);
        showGlobalError(getFriendlyError(error));
    }
}

async function deleteProgramme(id) {
    if (!confirm('Are you sure you want to delete this programme?')) return;
    try {
        const { error } = await window.supabaseClient
            .from('programmes')
            .delete()
            .eq('id', id);
        if (error) throw error;
        loadProgrammes();
    } catch (error) {
        console.error('Error deleting programme:', error);
        showGlobalError(getFriendlyError(error));
    }
}

function resetForm() {
    document.getElementById('programmeForm').reset();
    document.getElementById('formMessage').style.display = 'none';
    editingId = null;
    document.getElementById('formTitle').textContent = 'Add New Programme';
    document.getElementById('formSubmitBtn').textContent = 'Add Programme';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}