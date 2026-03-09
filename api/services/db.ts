import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase environment variables missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
}

// Service key is used because this is the backend and it needs full access
export const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

// Keep default export for backwards compatibility
export default supabase;
