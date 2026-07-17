import { Facebook, Twitter, Instagram, TrendingUp, Users, Share2, Heart } from 'lucide-react'

function SocialMedia() {
  const platforms = [
    { name: 'Facebook', icon: Facebook, followers: '12.5K', engagement: '4.2%', color: 'bg-blue-600' },
    { name: 'Twitter', icon: Twitter, followers: '8.3K', engagement: '3.8%', color: 'bg-sky-500' },
    { name: 'Instagram', icon: Instagram, followers: '25.7K', engagement: '5.1%', color: 'bg-pink-600' },
  ]

  const recentPosts = [
    { id: 1, platform: 'Instagram', content: 'New affiliate program launch! 🚀', likes: 234, shares: 45, date: '2 hours ago' },
    { id: 2, platform: 'Twitter', content: 'Join our affiliate network and earn commissions', likes: 156, shares: 89, date: '5 hours ago' },
    { id: 3, platform: 'Facebook', content: 'Success story: How our top affiliate earned $10K', likes: 432, shares: 67, date: '1 day ago' },
  ]

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Facebook':
        return Facebook
      case 'Twitter':
        return Twitter
      case 'Instagram':
        return Instagram
      default:
        return Share2
    }
  }

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Facebook':
        return 'bg-blue-600'
      case 'Twitter':
        return 'bg-sky-500'
      case 'Instagram':
        return 'bg-pink-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Social Media Management</h2>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {platforms.map((platform) => {
          const Icon = platform.icon
          return (
            <div key={platform.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Followers</span>
                  <span className="font-medium text-gray-900">{platform.followers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Engagement</span>
                  <span className="font-medium text-gray-900">{platform.engagement}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">51.7K</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Followers</p>
              <p className="text-2xl font-bold text-gray-900">51.7K</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Heart size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">12.4K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Recent Posts</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentPosts.map((post) => {
            const Icon = getPlatformIcon(post.platform)
            return (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${getPlatformColor(post.platform)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart size={16} />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 size={16} />
                          {post.shares}
                        </span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {post.platform}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SocialMedia
