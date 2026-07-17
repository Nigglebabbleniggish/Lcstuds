import { Search, Filter, CheckCircle, XCircle, MoreVertical } from 'lucide-react'

function Affiliates() {
  const affiliates = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'joined', joinedDate: '2024-01-15', commission: '$2,340' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'joined', joinedDate: '2024-01-10', commission: '$4,560' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'not_joined', joinedDate: '-', commission: '$0' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', status: 'joined', joinedDate: '2024-01-05', commission: '$1,890' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', status: 'not_joined', joinedDate: '-', commission: '$0' },
    { id: 6, name: 'Diana Prince', email: 'diana@example.com', status: 'joined', joinedDate: '2024-01-20', commission: '$3,210' },
    { id: 7, name: 'Eve Adams', email: 'eve@example.com', status: 'not_joined', joinedDate: '-', commission: '$0' },
    { id: 8, name: 'Frank Miller', email: 'frank@example.com', status: 'joined', joinedDate: '2024-01-12', commission: '$5,430' },
  ]

  const joinedCount = affiliates.filter(a => a.status === 'joined').length
  const notJoinedCount = affiliates.filter(a => a.status === 'not_joined').length

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Affiliates Management</h2>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Joined Affiliates</p>
              <p className="text-2xl font-bold text-gray-900">{joinedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Not Joined</p>
              <p className="text-2xl font-bold text-gray-900">{notJoinedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search affiliates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      {/* Affiliates Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Joined Date</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Commission</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map((affiliate) => (
              <tr key={affiliate.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">
                        {affiliate.name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{affiliate.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{affiliate.email}</td>
                <td className="px-6 py-4">
                  {affiliate.status === 'joined' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle size={16} />
                      Joined
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      <XCircle size={16} />
                      Not Joined
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">{affiliate.joinedDate}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{affiliate.commission}</td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={20} className="text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Affiliates
