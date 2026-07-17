import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react'

function Dashboard() {
  const stats = [
    { label: 'Total Affiliates', value: '0', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Campaigns', value: '0', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Revenue', value: '$0', icon: DollarSign, color: 'bg-yellow-500' },
    { label: 'Conversion Rate', value: '0%', icon: Activity, color: 'bg-purple-500' },
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
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
