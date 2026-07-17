# Affiliate Dashboard

A modern dashboard for managing affiliates, verifications, and social media accounts with Supabase authentication.

## Features

- **User Authentication**: Sign up and sign in with Supabase Auth
- **Dashboard Overview**: Key metrics and recent activity
- **Affiliates Management**: Track joined/not joined affiliates with commission tracking
- **Verifier System**: Manage identity and business verification requests
- **Social Media Integration**: Monitor multiple social media platforms
- **Earnings Tracking**: Store and track user earnings in database

## Tech Stack

- React 18
- Vite
- TailwindCSS
- Lucide Icons
- Supabase (Authentication & Database)

## Setup Instructions

### 🚀 Quick Setup (One Command)

Run the automated setup script that handles everything:

```bash
node setup.js
```

This script will:
- Check Node.js and npm versions
- Install all dependencies
- Set up `.env` file with Supabase credentials
- Guide you through database setup
- Optionally register your first user
- Optionally start the development server

### Manual Setup

If you prefer manual setup, follow these steps:

#### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for your project to be ready (2-3 minutes)

#### 2. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the SQL schema from `src/lib/supabase.js` (the commented section at the top)
4. This will create all necessary tables: profiles, affiliates, earnings, verifications, social_accounts

#### 3. Get Supabase Credentials

1. In Supabase dashboard, go to Project Settings → API
2. Copy your Project URL and Anon Key
3. Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### 4. Install Dependencies

```bash
npm install
```

#### 5. Start Development Server

```bash
npm run dev
```

#### 6. Build for Production

```bash
npm run build
```

## CLI User Registration

### Regular User Registration

You can register regular users via command line:

**Interactive Mode:**
```bash
node scripts/register-user.js
```

**Direct Command:**
```bash
node scripts/register-user.js your-email@gmail.com yourpassword "Full Name"
```

### Admin Account Creation

Create admin accounts with elevated privileges:

**Interactive Mode:**
```bash
node scripts/create-admin.js
```

**Direct Command:**
```bash
node scripts/create-admin.js admin-email@gmail.com adminpassword "Admin Name"
```

**Features:**
- Gmail validation (recommends @gmail.com addresses)
- Password validation (minimum 6 characters)
- Password confirmation
- Optional full name
- Direct integration with Supabase Auth
- Admin accounts get special role and privileges
- Stores user in database with earnings tracking

**Example Usage:**
```bash
# Create regular user
node scripts/register-user.js john.doe@gmail.com mypassword123 "John Doe"

# Create admin user
node scripts/create-admin.js admin@company.com adminpass123 "System Administrator"
```

## GitHub Pages Deployment

### Quick Setup

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create a new repository (name it `affiliate-dashboard` or your preferred name)
   - Upload your project files

2. **Update Vite Config**
   - Edit `vite.config.js`
   - Change `base: '/affiliate-dashboard/'` to match your repository name
   - If your repo is `my-dashboard`, use `base: '/my-dashboard/'`

3. **Configure GitHub Secrets**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Enable GitHub Pages**
   - Go to repository → Settings → Pages
   - Source: GitHub Actions (recommended) or Deploy from a branch
   - If using branch: Source → Deploy from a branch → Branch: gh-pages

5. **Push and Deploy**
   - Push your code to GitHub
   - The workflow will automatically build and deploy
   - Your site will be available at: `https://yourusername.github.io/affiliate-dashboard/`

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the project
npm run build

# Install gh-pages if not already installed
npm install -g gh-pages

# Deploy to GitHub Pages
gh-pages -d dist
```

## Free Hosting Recommendations

### 1. **Vercel** (Recommended)
- **Free Tier**: Unlimited deployments, 100GB bandwidth/month
- **Runtime**: 24/7 with global CDN
- **Custom Domain**: Free
- **Best for**: React applications, excellent performance
- **Deploy**: Connect GitHub repository or use Vercel CLI
- **Website**: https://vercel.com

### 2. **Netlify**
- **Free Tier**: 300GB bandwidth/month, 100k build minutes
- **Runtime**: 24/7 with global CDN
- **Custom Domain**: Free
- **Best for**: Static sites, React apps
- **Deploy**: Connect GitHub repository or drag-and-drop
- **Website**: https://netlify.com

### 3. **Cloudflare Pages**
- **Free Tier**: Unlimited bandwidth, 500 builds/month
- **Runtime**: 24/7 with global CDN (fastest network)
- **Custom Domain**: Free
- **Best for**: Performance-focused deployments
- **Deploy**: Connect GitHub repository or direct upload
- **Website**: https://pages.cloudflare.com

### 4. **GitHub Pages**
- **Free Tier**: 1GB storage, 100GB bandwidth/month
- **Runtime**: 24/7
- **Custom Domain**: Free
- **Best for**: Open source projects, simple static sites
- **Deploy**: Push to gh-pages branch
- **Website**: https://pages.github.com

### 5. **Render**
- **Free Tier**: 750 hours/month (web services)
- **Runtime**: 24/7 (spins down on inactivity after 15 mins on free tier)
- **Custom Domain**: Free
- **Best for**: Full-stack applications
- **Deploy**: Connect GitHub repository
- **Website**: https://render.com

### 6. **Railway**
- **Free Tier**: $5 credit/month (enough for small apps)
- **Runtime**: 24/7
- **Custom Domain**: Free
- **Best for**: Full-stack apps with databases
- **Deploy**: Connect GitHub repository
- **Website**: https://railway.app

## Quick Deployment Guide

### Deploy to Vercel (Easiest)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite + React
6. Click "Deploy"

### Deploy to Netlify

1. Run `npm run build` to create the `dist` folder
2. Go to https://netlify.com
3. Drag and drop the `dist` folder
4. Your site will be live instantly

### Deploy to Cloudflare Pages

1. Push your code to GitHub
2. Go to https://pages.cloudflare.com
3. Click "Create a project"
4. Connect your GitHub repository
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click "Save and Deploy"

## Custom Domain Setup

All recommended platforms offer free custom domains:
1. Buy a domain from Namecheap, GoDaddy, or Cloudflare Registrar
2. Add the domain in your hosting platform dashboard
3. Update DNS records as instructed
4. SSL certificate is automatically provided (free)

## Recommendation

**Best Choice**: Vercel
- Fastest deployment
- Best performance
- Excellent developer experience
- Generous free tier
- Perfect for React applications

**Runner-up**: Cloudflare Pages
- Fastest global network
- Unlimited bandwidth
- Great performance

## Notes

- The CSS lint warnings about @tailwind and @apply are normal - they're Tailwind CSS directives
- All hosting platforms provide free SSL certificates
- Free tiers are sufficient for most small to medium applications
- Consider upgrading to paid tiers for high-traffic production apps
