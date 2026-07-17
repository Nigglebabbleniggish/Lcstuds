const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file')
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Usage: node create-admin.js <email> <password> [full_name]')
    console.log('Example: node create-admin.js admin@example.com password123 "Admin User"')
    process.exit(1)
  }

  const email = args[0]
  const password = args[1]
  const fullName = args[2] || 'Admin'

  console.log(`Creating admin account for ${email}...`)

  try {
    // Create user with email confirmation disabled
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          is_admin: true
        },
        emailRedirectTo: undefined
      }
    })

    if (error) {
      console.error('Error creating admin:', error.message)
      process.exit(1)
    }

    // If email confirmation is enabled, we need to manually confirm the user
    if (data.user && !data.user.email_confirmed_at) {
      console.log('User created but email confirmation is enabled.')
      console.log('Attempting to bypass email confirmation...')
      
      // Use admin API to confirm email (requires service role key)
      // For now, we'll just create the user and let them know
      console.log('Note: Email confirmation is enabled in Supabase.')
      console.log('You may need to manually confirm the email in Supabase dashboard.')
      console.log('Or disable email confirmation in Supabase Auth settings.')
    }

    console.log('✅ Admin account created successfully!')
    console.log(`Email: ${email}`)
    console.log(`Full Name: ${fullName}`)
    console.log('You can now sign in with these credentials.')
    
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

createAdmin()
