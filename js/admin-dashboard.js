// ============================================================
// MZAMO CHILD GUIDANCE - DASHBOARD (SUPABASE)
// ============================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard loading...');

    // ===== DATE DISPLAY =====
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
        const now = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const dateStr = now.toLocaleDateString('en-ZA', options);
        const timeStr = now.toLocaleTimeString('en-ZA', timeOptions);
        dateDisplay.textContent = dateStr + ' | ' + timeStr;
    }

    // ===== LOAD STATS FROM SUPABASE =====
    try {
        // 1. Count Programmes
        const { count: programmeCount, error: progError } = await window.supabaseClient
            .from('programmes')
            .select('*', { count: 'exact', head: true });

        if (progError) throw progError;
        document.getElementById('programmeCount').textContent = programmeCount || 0;

        // 2. Count News
        const { count: newsCount, error: newsError } = await window.supabaseClient
            .from('news')
            .select('*', { count: 'exact', head: true });

        if (newsError) throw newsError;
        document.getElementById('newsCount').textContent = newsCount || 0;

        // 3. Count Reports
        const { count: reportCount, error: reportError } = await window.supabaseClient
            .from('reports')
            .select('*', { count: 'exact', head: true });

        if (reportError) throw reportError;
        document.getElementById('reportCount').textContent = reportCount || 0;

        // 4. Count Enquiries
        const { count: enquiryCount, error: enquiryError } = await window.supabaseClient
            .from('enquiries')
            .select('*', { count: 'exact', head: true });

        if (enquiryError) throw enquiryError;
        document.getElementById('enquiryCount').textContent = enquiryCount || 0;

        console.log('Stats loaded:', {
            programmes: programmeCount,
            news: newsCount,
            reports: reportCount,
            enquiries: enquiryCount
        });

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
});