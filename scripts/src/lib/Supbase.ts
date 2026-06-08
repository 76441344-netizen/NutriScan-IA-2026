import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TU_URL_SUPABASE'
const supabaseKey = 'TU_ANON_KEY'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
) 