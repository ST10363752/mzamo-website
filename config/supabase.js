
 // ============================================================
 // SUPABASE CONFIGURATION
 // Mzamo Child Guidance & Training Initiative of KZN
 // ============================================================

const SUPABASE_URL = 'https://hbgcrcepcutxfqjjdgra.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_NiSOJOsemB6bQJhdvlpvIQ_L4R2z9kh';

// Initialize Supabase
const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Make the client available to other JavaScript files
window.supabaseClient = supabaseClient;

console.log('Supabase client initialized');
console.log('URL:', SUPABASE_URL);
