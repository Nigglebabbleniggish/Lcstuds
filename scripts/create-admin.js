#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

// Load environment variables
require('dotenv').config({ path: '../.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials.')
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SECRET_KEY in .env file')
  console.error('Note: For admin creation, use the service_role key from Supabase dashboard')
  process.exit(1)
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validatePassword(password) {
  return password.length >= 6
}

async function createAdminUser(email, password, fullName) {
  try {
    console.log('\n🔐 Creating admin user...')
    console.log(`Email: ${email}`)
    console.log(`Name: ${fullName || 'Admin'}`)
    
    // Create user with admin role
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || 'Admin',
        role: 'admin',
        is_admin: true
      }
    })

    if (error) {
      console.error('\n❌ Admin creation failed:', error.message)
      return false
    }

    console.log('\n✅ Admin user created successfully!')
    console.log(`User ID: ${data.user.id}`)
    console.log(`Email: ${data.user.email}`)
    console.log(`Role: Admin`)
    
    // Update profile with admin role
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName || 'Admin',
          is_admin: true,
          role: 'admin'
        })
        .eq('id', data.user.id)

      if (profileError) {
        console.warn('⚠️  Warning: Could not update profile with admin role:', profileError.message)
      } else {
        console.log('✅ Profile updated with admin privileges')
      }
    } catch (profileError) {
      console.warn('⚠️  Warning: Profile update failed:', profileError.message)
    }
    
    return true
  } catch (error) {
    console.error('\n❌ Error during admin creation:', error.message)
    return false
  }
}

async function main() {
  console.log('🔐 Affiliate Dashboard - Admin Account Creation')
  console.log('==============================================\n')
  console.log('⚠️  This will create a user with admin privileges')
  console.log('⚠️  Make sure you have the SUPABASE_SECRET_KEY in your .env file\n')

  try {
    // Get email
    let email
    while (true) {
      email = await question('Enter admin email: ')
      if (validateEmail(email)) {
        break
      } else {
        console.log('❌ Invalid email format. Please try again.')
      }
    }

    // Get password
    let password
    while (true) {
      password = await question('Enter admin password (min 6 characters): ')
      if (validatePassword(password)) {
        const confirmPassword = await question('Confirm password: ')
        if (password === confirmPassword) {
          break
        } else {
          console.log('❌ Passwords do not match. Please try again.')
        }
      } else {
        console.log('❌ Password must be at least 6 characters. Please try again.')
      }
    }

    // Get full name
    const fullName = await question('Enter admin full name (optional, press Enter to skip): ')

    // Confirm
    console.log('\n📋 Admin Account Summary:')
    console.log(`Email: ${email}`)
    console.log(`Name: ${fullName || 'Admin'}`)
    console.log(`Role: Admin`)
    
    const confirm = await question('\nCreate this admin account? (y/n): ')
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Admin creation cancelled')
      rl.close()
      return
    }

    // Create admin
    const success = await createAdminUser(email, password, fullName)

    if (success) {
      console.log('\n🎉 Admin account created successfully!')
      console.log('You can now sign in at http://localhost:3000 with admin privileges')
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
  } finally {
    rl.close()
  }
}

// Support command line arguments
if (process.argv.length >= 4) {
  const email = process.argv[2]
  const password = process.argv[3]
  const fullName = process.argv[4] || 'Admin'

  if (!validateEmail(email)) {
    console.error('❌ Invalid email format')
    process.exit(1)
  }

  if (!validatePassword(password)) {
    console.error('❌ Password must be at least 6 characters')
    process.exit(1)
  }

  createAdminUser(email, password, fullName)
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('❌ Error:', error.message)
      process.exit(1)
    })
} else {
  main()
}
