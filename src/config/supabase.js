import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Connect to Supabase with the secret key (server only, never in the React app)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }, // a server doesn't keep its own login
})

export default supabase
