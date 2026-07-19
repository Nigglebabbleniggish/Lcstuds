import { useState } from 'react'
import { Eye, ExternalLink, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function ViewTracker() {
  const { profile } = useAuth()
  const [url, setUrl] = useState('')
  const [manualViewCount, setManualViewCount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const detectPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('threads.net')) return 'threads'
    if (url.includes('instagram.com/reel') || url.includes('instagram.com/reels')) return 'instagram'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    if (url.includes('tiktok.com')) return 'tiktok'
    return null
  }

  const fetchViewCount = async () => {
    const platform = detectPlatform(url)
    if (!platform) {
      setError('Could not detect platform. Please enter a valid YouTube, Threads, Instagram Reel, Twitter, or TikTok URL.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      let viewCount = 0

      if (platform === 'youtube') {
        // Extract video ID from URL
        const videoId = extractYouTubeId(url)
        if (!videoId) throw new Error('Invalid YouTube URL')

        const apiKey = localStorage.getItem('YOUTUBE_API_KEY') || 'AIzaSyA7NWd90TxdR1PPDSKZWSPdZiRfb8OzAEQ'
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`
        )
        const data = await response.json()
        
        if (data.items && data.items.length > 0) {
          viewCount = parseInt(data.items[0].statistics.viewCount) || 0
        } else {
          throw new Error('Video not found')
        }
      } else if (platform === 'twitter') {
        // Scrape Twitter/X page HTML via CORS proxy
        viewCount = await scrapeTwitterViews(url)
      } else if (platform === 'instagram') {
        // Instagram has strong CORS protection, use manual input
        if (!manualViewCount) {
          throw new Error('Instagram has strong CORS protection. Please manually enter the view count.')
        }
        viewCount = parseInt(manualViewCount) || 0
      } else if (platform === 'threads') {
        // Scrape Threads page HTML via CORS proxy
        viewCount = await scrapeThreadsViews(url)
      } else if (platform === 'tiktok') {
        // Scrape TikTok page HTML via CORS proxy
        viewCount = await scrapeTikTokViews(url)
      }

      setResult({
        platform,
        url,
        viewCount,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      setError(err.message || 'Failed to fetch view count')
    } finally {
      setLoading(false)
    }
  }

  const extractYouTubeId = (url) => {
    // Handle regular YouTube URLs, short URLs, and live URLs
    const regex = /(?:youtube\.com\/(?:live\/|[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const scrapeTwitterViews = async (url) => {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      const data = await response.json()
      
      if (!data.contents) throw new Error('Failed to fetch page')
      
      const html = data.contents
      // Try to extract view count from Twitter HTML
      const viewMatch = html.match(/(\d+(?:,\d+)*)\s*views?/i) || 
                       html.match(/"viewCount":(\d+)/) ||
                       html.match(/data-testid="views">(\d+)/)
      
      if (viewMatch) {
        return parseInt(viewMatch[1].replace(/,/g, '')) || 0
      }
      
      throw new Error('Could not extract view count from Twitter page')
    } catch (err) {
      throw new Error(`Twitter scraping failed: ${err.message}`)
    }
  }

  const scrapeThreadsViews = async (url) => {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      const data = await response.json()
      
      if (!data.contents) throw new Error('Failed to fetch page')
      
      const html = data.contents
      // Try to extract view count from Threads HTML
      const viewMatch = html.match(/(\d+(?:,\d+)*)\s*views?/i) ||
                       html.match(/"viewCount":(\d+)/)
      
      if (viewMatch) {
        return parseInt(viewMatch[1].replace(/,/g, '')) || 0
      }
      
      throw new Error('Could not extract view count from Threads page')
    } catch (err) {
      throw new Error(`Threads scraping failed: ${err.message}`)
    }
  }

  const scrapeTikTokViews = async (url) => {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      const data = await response.json()
      
      if (!data.contents) throw new Error('Failed to fetch page')
      
      const html = data.contents
      // Try to extract view count from TikTok HTML
      const viewMatch = html.match(/(\d+(?:,\d+)*)\s*views?/i) ||
                       html.match(/"viewCount":(\d+)/) ||
                       html.match(/data-e2e="video-views">(\d+)/)
      
      if (viewMatch) {
        return parseInt(viewMatch[1].replace(/,/g, '')) || 0
      }
      
      throw new Error('Could not extract view count from TikTok page')
    } catch (err) {
      throw new Error(`TikTok scraping failed: ${err.message}`)
    }
  }

  if (!profile?.is_admin) {
    return null
  }

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Eye className="text-white" size={24} />
        <h2 className="text-2xl font-bold text-white">View Tracker</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Enter Social Media URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://threads.net/..."
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {url && detectPlatform(url) && (detectPlatform(url) === 'instagram' || detectPlatform(url) === 'threads' || detectPlatform(url) === 'tiktok') && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Manual View Count (for {detectPlatform(url)})
            </label>
            <input
              type="number"
              value={manualViewCount}
              onChange={(e) => setManualViewCount(e.target.value)}
              placeholder="Enter view count manually"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white"
            />
          </div>
        )}

        <button
          onClick={fetchViewCount}
          disabled={loading || !url}
          className="w-full px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Loading...
            </>
          ) : (
            <>
              <Eye size={20} />
              Check Views
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-6 bg-zinc-800 rounded-xl border border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm capitalize">Platform</p>
                <p className="text-white font-semibold">{result.platform}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">View Count</p>
                <p className="text-3xl font-bold text-white">{result.viewCount.toLocaleString()}</p>
              </div>
            </div>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 text-sm hover:underline"
            >
              <ExternalLink size={16} />
              Open in new tab
            </a>
          </div>
        )}

        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <p className="text-gray-400 text-sm mb-2">Supported Platforms:</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">YouTube (Auto)</span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Twitter (Auto)</span>
            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Threads (Manual)</span>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs">Instagram Reels (Manual)</span>
            <span className="px-3 py-1 bg-black/20 text-white rounded-full text-xs">TikTok (Manual)</span>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            YouTube and Twitter fetch automatically. Instagram, Threads, and TikTok require manual input due to CORS protection.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ViewTracker
