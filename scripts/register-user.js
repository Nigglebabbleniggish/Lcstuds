#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

// Load environment variables
require('dotenv').config({ path: '../.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  // Minimum 6 characters
  return password.length >= 6
}

async function registerUser(email, password, fullName) {
  try {
    console.log('\n📝 Registering new user...')
    console.log(`Email: ${email}`)
    console.log(`Name: ${fullName || 'Not provided'}`)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    })

    if (error) {
      console.error('\n❌ Registration failed:', error.message)
      return false
    }

    console.log('\n✅ Registration successful!')
    console.log(`User ID: ${data.user.id}`)
    console.log(`Email: ${data.user.email}`)
    
    if (data.user.email_confirmed_at) {
      console.log('✅ Email is already confirmed')
    } else {
      console.log('⚠️  Please check your email to confirm your account')
    }
    
    return true
  } catch (error) {
    console.error('\n❌ Error during registration:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Affiliate Dashboard - User Registration CLI')
  console.log('==========================================\n')

  try {
    // Get email
    let email
    while (true) {
      email = await question('Enter Gmail address: ')
      if (validateEmail(email)) {
        if (email.includes('@gmail.com') || email.includes('@googlemail.com')) {
          break
        } else {
          console.log('⚠️  Warning: Please use a Gmail address for best results')
          const confirm = await question('Continue anyway? (y/n): ')
          if (confirm.toLowerCase() === 'y') break
        }
      } else {
        console.log('❌ Invalid email format. Please try again.')
      }
    }

    // Get password
    let password
    while (true) {
      password = await question('Enter password (min 6 characters): ')
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

    // Get full name (optional)
    const fullName = await question('Enter full name (optional, press Enter to skip): ')

    // Register user
    const success = await registerUser(email, password, fullName)

    if (success) {
      console.log('\n🎉 You can now sign in at http://localhost:3000')
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
  } finally {
    rl.close()
  }
}

// Also support command line arguments
if (process.argv.length >= 4) {
  const email = process.argv[2]
  const password = process.argv[3]
  const fullName = process.argv[4] || ''

  if (!validateEmail(email)) {
    console.error('❌ Invalid email format')
    process.exit(1)
  }

  if (!validatePassword(password)) {
    console.error('❌ Password must be at least 6 characters')
    process.exit(1)
  }

  registerUser(email, password, fullName)
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
