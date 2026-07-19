import { useState } from 'react'
import { Eye, ExternalLink, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function ViewTracker() {
  const { profile } = useAuth()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [socialKitKey, setSocialKitKey] = useState(localStorage.getItem('SOCIALKIT_API_KEY') || 'dmGn2xI9O07xVa')
  const [twitterApiKey, setTwitterApiKey] = useState(localStorage.getItem('TWITTER_API_KEY') || 'new1_4932481c056c446cabbafbadb00f41a8')
  const [captapiKey, setCaptapiKey] = useState(localStorage.getItem('CAPTAPI_KEY') || '')

  const detectPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('threads.net') || url.includes('threads.com')) return 'threads'
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
        // Scrape Instagram page HTML via CORS proxy with fallbacks
        viewCount = await scrapeInstagramViews(url)
      } else if (platform === 'threads') {
        // Scrape Threads page HTML via CORS proxy with fallbacks
        viewCount = await scrapeThreadsViews(url)
      } else if (platform === 'tiktok') {
        // Scrape TikTok page HTML via CORS proxy with fallbacks
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
      // Extract tweet ID from URL
      const tweetIdMatch = url.match(/status\/(\d+)/) || url.match(/\/(\d+)/)
      if (!tweetIdMatch) {
        throw new Error('Could not extract tweet ID from URL')
      }
      const tweetId = tweetIdMatch[1]

      // Try SocialKit API for Twitter/X (same key as Instagram)
      if (socialKitKey) {
        try {
          const socialKitUrl = `https://api.socialkit.dev/twitter/tweet?access_key=${socialKitKey}&url=${encodeURIComponent(url)}`
          const response = await fetch(socialKitUrl)
          if (response.ok) {
            const data = await response.json()
            // SocialKit returns tweet object with views
            if (data?.data?.tweet?.views) {
              return data.data.tweet.views
            }
          }
        } catch (e) {
          console.log('SocialKit failed, trying TwitterAPI.io...')
        }
      }

      // Try TwitterAPI.io first (requires API key) - use API key as query param
      if (twitterApiKey) {
        try {
          const twitterApiUrl = `https://api.twitterapi.io/twitter/tweets?tweet_ids=${tweetId}&api_key=${twitterApiKey}`
          const response = await fetch(twitterApiUrl)
          if (response.ok) {
            const data = await response.json()
            // TwitterAPI.io returns tweets array with public_metrics
            if (data?.tweets && data.tweets.length > 0) {
              const tweet = data.tweets[0]
              if (tweet?.public_metrics?.view_count) {
                return tweet.public_metrics.view_count
              }
              // Also check for impression_count as fallback
              if (tweet?.public_metrics?.impression_count) {
                return tweet.public_metrics.impression_count
              }
            }
          }
        } catch (e) {
          console.log('TwitterAPI.io failed, trying proxies...')
        }
      }

      // Try multiple CORS proxies with better handling
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        `https://corsproxy.htmldriven.com/?url=${encodeURIComponent(url)}`,
        `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`,
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
      ]
      
      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl)
          let html = ''
          
          if (proxyUrl.includes('allorigins')) {
            const data = await response.json()
            html = data.contents || ''
          } else if (proxyUrl.includes('codetabs')) {
            const data = await response.json()
            html = data || ''
          } else if (proxyUrl.includes('rss2json')) {
            const data = await response.json()
            html = data?.contents || ''
          } else {
            html = await response.text()
          }
          
          if (!html) continue
          
          // Try to extract view count from Twitter/X HTML
          const patterns = [
            /(\d+(?:,\d+)*)\s*views?/i,
            /"viewCount":\s*(\d+)/,
            /data-testid="views">(\d+(?:,\d+)*)/,
            /impression_count":\s*(\d+)/,
            /public_metrics":\s*{\s*"view_count":\s*(\d+)/,
            /views">\s*(\d+(?:,\d+)*)/
          ]
          
          for (const pattern of patterns) {
            const match = html.match(pattern)
            if (match) {
              const count = parseInt(match[1].replace(/,/g, '')) || 0
              if (count > 0) {
                return count
              }
            }
          }
        } catch (e) {
          console.log('Proxy failed, trying next...', e)
          continue
        }
      }
      
      throw new Error('Could not extract view count from Twitter page')
    } catch (err) {
      throw new Error(`Twitter scraping failed: ${err.message}`)
    }
  }

  const scrapeInstagramViews = async (url) => {
    try {
      // Try SocialKit API (free tier, requires API key)
      if (socialKitKey) {
        try {
          const socialKitUrl = `https://api.socialkit.dev/instagram/stats?access_key=${socialKitKey}&url=${encodeURIComponent(url)}`
          const response = await fetch(socialKitUrl)
          if (response.ok) {
            const data = await response.json()
            if (data?.data?.views) {
              return data.data.views
            }
          }
        } catch (e) {
          console.log('SocialKit failed, trying other methods...')
        }
      }

      // Extract shortcode from Instagram URL
      const shortcodeMatch = url.match(/instagram\.com\/reel\/([^\/\?]+)/) || url.match(/instagram\.com\/p\/([^\/\?]+)/)
      if (!shortcodeMatch) {
        throw new Error('Could not extract Instagram shortcode from URL')
      }
      const shortcode = shortcodeMatch[1]

      // Try Instagram GraphQL API (reverse-engineered, no auth required)
      try {
        const graphqlUrl = 'https://www.instagram.com/graphql/query'
        const queryHash = 'd4d882acee38a175e3a6d1c6c0b8b8f0'
        const variables = JSON.stringify({
          shortcode: shortcode,
          first: 10
        })
        
        const response = await fetch(`${graphqlUrl}?query_hash=${queryHash}&variables=${encodeURIComponent(variables)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.instagram.com/'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data?.data?.shortcode_media?.video_view_count) {
            return data.data.shortcode_media.video_view_count
          }
        }
      } catch (e) {
        console.log('GraphQL API failed, trying proxies...')
      }

      // Try Instagram oEmbed API
      try {
        const oembedUrl = `https://www.instagram.com/oembed?url=${encodeURIComponent(url)}`
        const response = await fetch(oembedUrl)
        if (response.ok) {
          const data = await response.json()
          if (data.html) {
            const viewMatch = data.html.match(/(\d+(?:,\d+)*)\s*views?/i)
            if (viewMatch) {
              return parseInt(viewMatch[1].replace(/,/g, '')) || 0
            }
          }
        }
      } catch (e) {
        console.log('oEmbed failed, trying proxies...')
      }

      // Try multiple CORS proxies - best working ones first
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        `https://corsproxy.htmldriven.com/?url=${encodeURIComponent(url)}`,
        `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`,
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`,
        `https://json2jsonp.com/?url=${encodeURIComponent(url)}&callback=cb`
      ]
      
      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl)
          let html = ''
          
          if (proxyUrl.includes('allorigins')) {
            html = await response.text()
          } else if (proxyUrl.includes('codetabs')) {
            const data = await response.json()
            html = data || ''
          } else if (proxyUrl.includes('rss2json')) {
            const data = await response.json()
            html = data?.contents || ''
          } else {
            html = await response.text()
          }
          
          if (!html) continue
          
          // Collect all potential view counts and pick the largest reasonable one
          const allCounts = []
          
          // Try to extract view count from Instagram HTML with better patterns
          const patterns = [
            /"video_view_count":\s*(\d+)/g,
            /edge_media_to_viewed_count":\s*{\s*"count":\s*(\d+)/g,
            /video_view_count":\s*(\d+)/g,
            /data-video-views="(\d+)"/g,
            /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:views|view)/gi,
            /"viewCount":\s*(\d+)/g,
            /play_count":\s*(\d+)/g,
            /"play_count":\s*"(\d+)"/g
          ]
          
          for (const pattern of patterns) {
            const matches = html.matchAll(pattern)
            for (const match of matches) {
              const countStr = match[1].replace(/,/g, '').replace(/\./g, '')
              const count = parseInt(countStr)
              // Only include counts that are reasonable (not too small for a viral video)
              if (count > 10) {
                allCounts.push(count)
              }
            }
          }
          
          // Return the largest count found (most likely to be the actual view count)
          if (allCounts.length > 0) {
            return Math.max(...allCounts)
          }
        } catch (e) {
          console.log('Proxy failed, trying next...', e)
          continue
        }
      }
      
      throw new Error('Instagram requires API key for reliable view counts. Get free key at socialkit.dev')
    } catch (err) {
      throw new Error(`Instagram scraping failed: ${err.message}`)
    }
  }

  const scrapeThreadsViews = async (url) => {
    try {
      // Try Captapi for Threads (100 free credits, no OAuth)
      if (captapiKey) {
        try {
          const captapiUrl = `https://api.captapi.com/v1/threads/post-details?url=${encodeURIComponent(url)}&api_key=${captapiKey}`
          const response = await fetch(captapiUrl)
          if (response.ok) {
            const data = await response.json()
            if (data?.views) {
              return data.views
            }
          }
        } catch (e) {
          console.log('Captapi failed, trying proxies...')
        }
      }

      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        `https://corsproxy.htmldriven.com/?url=${encodeURIComponent(url)}`,
        `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`
      ]
      
      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl)
          let html = ''
          
          if (proxyUrl.includes('allorigins')) {
            const data = await response.json()
            html = data.contents || ''
          } else if (proxyUrl.includes('codetabs')) {
            const data = await response.json()
            html = data || ''
          } else {
            html = await response.text()
          }
          
          if (!html) continue
          
          // Try to extract view count from Threads HTML
          const patterns = [
            /(\d+(?:,\d+)*)\s*views?/i,
            /"viewCount":\s*(\d+)/,
            /data-testid="views">(\d+(?:,\d+)*)/,
            /views">\s*(\d+(?:,\d+)*)/
          ]
          
          for (const pattern of patterns) {
            const match = html.match(pattern)
            if (match) {
              const count = parseInt(match[1].replace(/,/g, '')) || 0
              if (count > 0) {
                return count
              }
            }
          }
        } catch (e) {
          console.log('Proxy failed, trying next...', e)
          continue
        }
      }
      
      throw new Error('Could not extract view count from Threads page')
    } catch (err) {
      throw new Error(`Threads scraping failed: ${err.message}`)
    }
  }

  const scrapeTikTokViews = async (url) => {
    try {
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
      ]
      
      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl)
          let html = ''
          
          if (proxyUrl.includes('allorigins')) {
            const data = await response.json()
            html = data.contents || ''
          } else if (proxyUrl.includes('codetabs')) {
            const data = await response.json()
            html = data || ''
          } else {
            html = await response.text()
          }
          
          if (!html) continue
          
          const viewMatch = html.match(/(\d+(?:,\d+)*)\s*views?/i) ||
                           html.match(/"viewCount":(\d+)/) ||
                           html.match(/data-e2e="video-views">(\d+)/) ||
                           html.match(/play_count":(\d+)/)
          
          if (viewMatch) {
            return parseInt(viewMatch[1].replace(/,/g, '')) || 0
          }
        } catch (e) {
          console.log('Proxy failed, trying next...', e)
          continue
        }
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
            <button
              onClick={fetchViewCount}
              disabled={loading || !url}
              className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          </div>
        </div>

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
            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Threads (Auto)</span>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs">Instagram Reels (Auto)</span>
            <span className="px-3 py-1 bg-black/20 text-white rounded-full text-xs">TikTok (Auto)</span>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            All platforms fetch view counts automatically via web scraping with multiple proxy fallbacks.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ViewTracker
