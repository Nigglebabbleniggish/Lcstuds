import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react'

function Dashboard() {
  const stats = [
    { label: 'Total Affiliates', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Campaigns', value: '56', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Revenue', value: '$45,678', icon: DollarSign, color: 'bg-yellow-500' },
    { label: 'Conversion Rate', value: '12.5%', icon: Activity, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New affiliate joined</p>
              <p className="text-sm text-gray-500">John Doe registered 2 hours ago</p>
            </div>
            <span className="text-sm text-gray-400">2h ago</span>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Commission earned</p>
              <p className="text-sm text-gray-500">$250 from campaign #1234</p>
            </div>
            <span className="text-sm text-gray-400">5h ago</span>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Activity size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Campaign milestone reached</p>
              <p className="text-sm text-gray-500">Summer Sale hit 1000 conversions</p>
            </div>
            <span className="text-sm text-gray-400">1d ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
