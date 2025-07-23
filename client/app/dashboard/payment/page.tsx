import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Bitcoin, Calendar, Filter } from "lucide-react"

export default function PaymentPage() {
  const transactions = [
    {
      id: 1,
      type: "payment",
      description: "Frontend Developer Payment",
      amount: -0.05,
      timestamp: "2025-01-19 14:30",
      status: "completed",
      txHash: "bc1q...7x8z",
      recipient: "john.doe@email.com",
    },
    {
      id: 2,
      type: "deposit",
      description: "ckBTC Deposit",
      amount: +0.5,
      timestamp: "2025-01-18 09:15",
      status: "completed",
      txHash: "bc1q...9a2b",
      recipient: "Your Wallet",
    },
    {
      id: 3,
      type: "payment",
      description: "DCA Strategy Purchase",
      amount: -0.02,
      timestamp: "2025-01-17 12:00",
      status: "completed",
      txHash: "bc1q...3c4d",
      recipient: "Investment Pool",
    },
    {
      id: 4,
      type: "refund",
      description: "Insurance Payout",
      amount: +0.005,
      timestamp: "2025-01-16 16:45",
      status: "completed",
      txHash: "bc1q...5e6f",
      recipient: "Your Wallet",
    },
    {
      id: 5,
      type: "payment",
      description: "SaaS Subscription",
      amount: -0.001,
      timestamp: "2025-01-15 10:20",
      status: "pending",
      txHash: "bc1q...1g2h",
      recipient: "StreamCorp",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payments</h1>
          <p className="text-white/60">View all your Bitcoin transactions and payments</p>
        </div>
        <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 rounded-full bg-transparent">
          <Calendar className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <ArrowUpRight className="h-8 w-8 text-red-400" />
              <Badge className="bg-red-400/20 text-red-400">This month</Badge>
            </div>
            <div className="text-2xl font-bold text-red-400 mb-1">-1.245₿</div>
            <div className="text-sm text-white/60">Total Sent</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <ArrowDownRight className="h-8 w-8 text-lime-400" />
              <Badge className="bg-lime-400/20 text-lime-400">This month</Badge>
            </div>
            <div className="text-2xl font-bold text-lime-400 mb-1">+0.892₿</div>
            <div className="text-sm text-white/60">Total Received</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <Bitcoin className="h-8 w-8 text-orange-400" />
              <Badge className="bg-orange-400/20 text-orange-400">247 txns</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">2.513₿</div>
            <div className="text-sm text-white/60">Current Balance</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-purple-400" />
              <Badge className="bg-purple-400/20 text-purple-400">+12.5%</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">0.0023₿</div>
            <div className="text-sm text-white/60">Total Fees</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800 rounded-2xl p-4">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {["All", "Payments", "Deposits", "Refunds"].map((filter, index) => (
                <Badge
                  key={filter}
                  className={`rounded-full px-4 py-2 cursor-pointer ${
                    index === 0
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-gray-800 text-white/70 hover:bg-gray-700"
                  }`}
                >
                  {filter}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              {["Completed", "Pending", "Failed"].map((status) => (
                <Badge key={status} className="bg-gray-800 text-white/70 hover:bg-gray-700 rounded-full px-3 py-1">
                  {status}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
        <CardContent className="p-0">
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl ${
                      tx.type === "payment"
                        ? "bg-red-400/20"
                        : tx.type === "deposit"
                          ? "bg-lime-400/20"
                          : "bg-blue-400/20"
                    }`}
                  >
                    {tx.type === "payment" ? (
                      <ArrowUpRight className="h-5 w-5 text-red-400" />
                    ) : tx.type === "deposit" ? (
                      <ArrowDownRight className="h-5 w-5 text-lime-400" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{tx.description}</div>
                    <div className="text-sm text-white/60">{tx.recipient}</div>
                    <div className="text-xs text-white/40 font-mono">{tx.txHash}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${tx.amount > 0 ? "text-lime-400" : "text-red-400"}`}>
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}₿
                  </div>
                  <div className="text-sm text-white/60">{tx.timestamp}</div>
                  <Badge
                    className={`mt-1 ${
                      tx.status === "completed"
                        ? "bg-lime-400/20 text-lime-400"
                        : tx.status === "pending"
                          ? "bg-yellow-400/20 text-yellow-400"
                          : "bg-red-400/20 text-red-400"
                    }`}
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
