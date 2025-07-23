import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ArrowRight, Calendar } from "lucide-react"

export default function CashFlowPage() {
  const cashFlowData = [
    { month: "Jan", inflow: 0.8, outflow: 0.6, net: 0.2 },
    { month: "Feb", inflow: 1.2, outflow: 0.9, net: 0.3 },
    { month: "Mar", inflow: 0.9, outflow: 1.1, net: -0.2 },
    { month: "Apr", inflow: 1.5, outflow: 1.0, net: 0.5 },
    { month: "May", inflow: 1.1, outflow: 0.8, net: 0.3 },
    { month: "Jun", inflow: 1.3, outflow: 1.2, net: 0.1 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Cash Flow</h1>
        <p className="text-white/60">Monitor your Bitcoin inflows and outflows</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-lime-400" />
              <Badge className="bg-lime-400/20 text-lime-400">+15.2%</Badge>
            </div>
            <div className="text-2xl font-bold text-lime-400 mb-1">+2.45₿</div>
            <div className="text-sm text-white/60">Total Inflow</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="h-8 w-8 text-red-400" />
              <Badge className="bg-red-400/20 text-red-400">+8.7%</Badge>
            </div>
            <div className="text-2xl font-bold text-red-400 mb-1">-1.89₿</div>
            <div className="text-sm text-white/60">Total Outflow</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <ArrowRight className="h-8 w-8 text-blue-400" />
              <Badge className="bg-blue-400/20 text-blue-400">+22.1%</Badge>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">+0.56₿</div>
            <div className="text-sm text-white/60">Net Flow</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-purple-400" />
              <Badge className="bg-purple-400/20 text-purple-400">This month</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">12</div>
            <div className="text-sm text-white/60">Active Streams</div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Monthly Cash Flow</h3>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-lime-400 rounded-full"></div>
                <span className="text-sm text-white/60">Inflow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-sm text-white/60">Outflow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-white/60">Net</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between">
            {cashFlowData.map((data, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 flex-1">
                <div className="flex items-end space-x-1 h-48">
                  <div
                    className="bg-lime-400 rounded-t-lg"
                    style={{ height: `${data.inflow * 80}px`, width: "12px" }}
                  />
                  <div
                    className="bg-red-400 rounded-t-lg"
                    style={{ height: `${data.outflow * 80}px`, width: "12px" }}
                  />
                  <div
                    className={`${data.net > 0 ? "bg-blue-400" : "bg-orange-400"} rounded-t-lg`}
                    style={{ height: `${Math.abs(data.net) * 80}px`, width: "12px" }}
                  />
                </div>
                <span className="text-xs text-white/60">{data.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flow Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold text-white mb-4">Inflow Sources</h3>
            <div className="space-y-4">
              {[
                { source: "Freelance Payments", amount: "1.2₿", percentage: 49 },
                { source: "Investment Returns", amount: "0.8₿", percentage: 33 },
                { source: "Insurance Payouts", amount: "0.3₿", percentage: 12 },
                { source: "Other", amount: "0.15₿", percentage: 6 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{item.source}</span>
                    <span className="text-white font-semibold">{item.amount}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-lime-400 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold text-white mb-4">Outflow Categories</h3>
            <div className="space-y-4">
              {[
                { category: "DCA Investments", amount: "0.9₿", percentage: 48 },
                { category: "Subscriptions", amount: "0.4₿", percentage: 21 },
                { category: "Network Fees", amount: "0.3₿", percentage: 16 },
                { category: "Other Payments", amount: "0.29₿", percentage: 15 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{item.category}</span>
                    <span className="text-white font-semibold">{item.amount}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
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
