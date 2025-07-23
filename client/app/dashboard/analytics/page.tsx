import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, Activity, DollarSign } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-white/60">Insights into your payment streams and Bitcoin usage</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-lime-400" />
              <Badge className="bg-lime-400/20 text-lime-400">+15.2%</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">98.5%</div>
            <div className="text-sm text-white/60">Success Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-blue-400" />
              <Badge className="bg-blue-400/20 text-blue-400">-0.3s</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">2.1s</div>
            <div className="text-sm text-white/60">Avg Execution</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-purple-400" />
              <Badge className="bg-red-400/20 text-red-400">+0.02%</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">0.12%</div>
            <div className="text-sm text-white/60">Total Fees</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-orange-400" />
              <Badge className="bg-orange-400/20 text-orange-400">+8.7%</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">45.2₿</div>
            <div className="text-sm text-white/60">Monthly Volume</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Volume Chart */}
        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Payment Volume Trend</h3>
              <Badge className="bg-lime-400/20 text-lime-400">+12.5%</Badge>
            </div>
            <div className="h-64 flex items-end justify-between">
              {[40, 65, 45, 80, 70, 90, 55, 85, 75, 95, 60, 88].map((height, i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <div
                    className="bg-lime-400 rounded-t-lg transition-all duration-300 hover:bg-lime-300"
                    style={{ height: `${height * 2}px`, width: "20px" }}
                  />
                  <span className="text-xs text-white/60">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-4">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </CardContent>
        </Card>

        {/* Stream Categories */}
        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold text-white mb-6">Stream Categories</h3>
            <div className="space-y-4">
              {[
                { name: "Freelance", percentage: 45, color: "bg-lime-400" },
                { name: "Investment", percentage: 30, color: "bg-blue-400" },
                { name: "Subscription", percentage: 20, color: "bg-purple-400" },
                { name: "Insurance", percentage: 5, color: "bg-orange-400" },
              ].map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                      <span className="text-white">{category.name}</span>
                    </div>
                    <span className="text-white font-semibold">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`${category.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold text-white mb-4">Top Performing Streams</h3>
            <div className="space-y-4">
              {[
                { name: "DCA Strategy", performance: "+15.2%", amount: "2.4₿" },
                { name: "Freelance Dev", performance: "+12.8%", amount: "0.8₿" },
                { name: "SaaS Tools", performance: "+8.5%", amount: "0.12₿" },
              ].map((stream, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                  <div>
                    <div className="font-medium text-white">{stream.name}</div>
                    <div className="text-sm text-white/60">{stream.amount}</div>
                  </div>
                  <Badge className="bg-lime-400/20 text-lime-400">{stream.performance}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
            <div className="space-y-4">
              {[
                { type: "Network Fees", amount: "0.0012₿", percentage: "52%" },
                { type: "Protocol Fees", amount: "0.0008₿", percentage: "35%" },
                { type: "Oracle Fees", amount: "0.0003₿", percentage: "13%" },
              ].map((cost, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{cost.type}</span>
                    <span className="text-white font-semibold">{cost.amount}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: cost.percentage }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: "Stream Created", time: "2 min ago", type: "success" },
                { action: "Payment Executed", time: "5 min ago", type: "success" },
                { action: "Condition Failed", time: "1 hour ago", type: "warning" },
                { action: "Oracle Updated", time: "2 hours ago", type: "info" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-lime-400"
                        : activity.type === "warning"
                          ? "bg-yellow-400"
                          : "bg-blue-400"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{activity.action}</div>
                    <div className="text-xs text-white/60">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
