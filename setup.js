#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function execCommand(command, description) {
  try {
    console.log(`\n📋 ${description}...`)
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} completed`)
    return true
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    return false
  }
}

function execCommandSilent(command) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim()
  } catch (error) {
    return null
  }
}

async function checkNodeVersion() {
  const nodeVersion = execCommandSilent('node --version')
  if (nodeVersion) {
    console.log(`✅ Node.js version: ${nodeVersion}`)
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    if (majorVersion < 16) {
      console.error('❌ Node.js version 16 or higher is required')
      return false
    }
    return true
  } else {
    console.error('❌ Node.js is not installed')
    return false
  }
}

async function checkNpmVersion() {
  const npmVersion = execCommandSilent('npm --version')
  if (npmVersion) {
    console.log(`✅ npm version: ${npmVersion}`)
    return true
  } else {
    console.error('❌ npm is not installed')
    return false
  }
}

async function setupEnvFile() {
  const envPath = path.join(process.cwd(), '.env')
  const envExamplePath = path.join(process.cwd(), '.env.example')

  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists')
    const overwrite = await question('Overwrite existing .env file? (y/n): ')
    if (overwrite.toLowerCase() !== 'y') {
      return true
    }
  }

  console.log('\n🔧 Setting up environment variables...')
  console.log('You need Supabase credentials. Get them from: https://supabase.com/dashboard')
  
  const supabaseUrl = await question('Enter your Supabase Project URL: ')
  const supabaseAnonKey = await question('Enter your Supabase Anon Key: ')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials are required')
    return false
  }

  const envContent = `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}
`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env file created')
  return true
}

async function displaySupabaseInstructions() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUPABASE DATABASE SETUP REQUIRED')
  console.log('='.repeat(60))
  console.log('\n1. Go to your Supabase project dashboard')
  console.log('2. Navigate to SQL Editor')
  console.log('3. Copy and run the SQL schema from: src/lib/supabase.js')
  console.log('   (The commented section at the top of the file)')
  console.log('\nThis will create tables for:')
  console.log('  - profiles (user profiles)')
  console.log('  - affiliates (affiliate management)')
  console.log('  - earnings (earnings tracking)')
  console.log('  - verifications (verification requests)')
  console.log('  - social_accounts (social media connections)')
  console.log('\n' + '='.repeat(60))
  
  const ready = await question('Have you set up the database? (y/n): ')
  return ready.toLowerCase() === 'y'
}

async function registerFirstUser() {
  console.log('\n👤 Register first user account')
  const register = await question('Register a user account now? (y/n): ')
  
  if (register.toLowerCase() === 'y') {
    const email = await question('Enter Gmail address: ')
    const password = await question('Enter password (min 6 characters): ')
    const fullName = await question('Enter full name (optional, press Enter to skip): ')

    try {
      console.log('\n📝 Registering user...')
      execSync(`node scripts/register-user.js "${email}" "${password}" "${fullName}"`, { stdio: 'inherit' })
      return true
    } catch (error) {
      console.error('❌ User registration failed')
      return false
    }
  }
  return true
}

async function startDevServer() {
  console.log('\n🚀 Starting development server...')
  const start = await question('Start the development server now? (y/n): ')
  
  if (start.toLowerCase() === 'y') {
    console.log('\n🎉 Setup complete! Starting development server...')
    console.log('The dashboard will be available at: http://localhost:3000')
    console.log('Press Ctrl+C to stop the server\n')
    
    execSync('npm run dev', { stdio: 'inherit' })
  }
}

async function main() {
  console.log('🚀 Affiliate Dashboard - Complete Setup Script')
  console.log('============================================\n')

  // Check prerequisites
  console.log('🔍 Checking prerequisites...')
  const nodeOk = await checkNodeVersion()
  const npmOk = await checkNpmVersion()

  if (!nodeOk || !npmOk) {
    console.error('\n❌ Please install Node.js 16+ and npm to continue')
    console.log('Download from: https://nodejs.org/')
    rl.close()
    process.exit(1)
  }

  // Install dependencies
  console.log('\n📦 Installing dependencies...')
  const installSuccess = execCommand('npm install', 'Installing npm packages')
  
  if (!installSuccess) {
    console.error('\n❌ Failed to install dependencies')
    rl.close()
    process.exit(1)
  }

  // Setup environment file
  const envSuccess = await setupEnvFile()
  if (!envSuccess) {
    console.error('\n❌ Environment setup failed')
    rl.close()
    process.exit(1)
  }

  // Database setup instructions
  const dbReady = await displaySupabaseInstructions()
  if (!dbReady) {
    console.log('\n⚠️  Please set up the database before using the application')
    console.log('You can set it up later by running the SQL schema in Supabase')
  }

  // Register first user
  await registerFirstUser()

  // Start dev server
  await startDevServer()

  console.log('\n✅ Setup complete!')
  console.log('\n📝 Next steps:')
  console.log('1. Make sure Supabase database is set up (if not done already)')
  console.log('2. Run: npm run dev (to start development server)')
  console.log('3. Open: http://localhost:3000')
  console.log('4. Sign in with your registered account')
  console.log('\n📚 For CLI user registration:')
  console.log('   node scripts/register-user.js <email> <password> <name>')
  
  rl.close()
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message)
  rl.close()
  process.exit(1)
})

main()
