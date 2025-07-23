import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Plus, Settings, CheckCircle, AlertCircle, Clock } from "lucide-react"

export default function OraclesPage() {
  const oracles = [
    {
      name: "GitHub API",
      type: "Development",
      status: "active",
      lastUpdate: "2 min ago",
      feeds: 5,
      uptime: "99.9%",
      endpoint: "api.github.com",
    },
    {
      name: "CoinGecko",
      type: "Market Data",
      status: "active",
      lastUpdate: "1 min ago",
      feeds: 8,
      uptime: "99.8%",
      endpoint: "api.coingecko.com",
    },
    {
      name: "FlightAware",
      type: "Travel",
      status: "active",
      lastUpdate: "5 min ago",
      feeds: 3,
      uptime: "98.5%",
      endpoint: "flightxml.flightaware.com",
    },
    {
      name: "Weather API",
      type: "Weather",
      status: "active",
      lastUpdate: "3 min ago",
      feeds: 4,
      uptime: "99.2%",
      endpoint: "api.openweathermap.org",
    },
    {
      name: "Sports Data",
      type: "Sports",
      status: "maintenance",
      lastUpdate: "1 hour ago",
      feeds: 2,
      uptime: "95.1%",
      endpoint: "api.sportsdata.io",
    },
    {
      name: "News Sentiment",
      type: "News",
      status: "active",
      lastUpdate: "4 min ago",
      feeds: 2,
      uptime: "97.8%",
      endpoint: "newsapi.org",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Data Sources</h1>
          <p className="text-white/60">Manage oracle connections and data feeds</p>
        </div>
        <Button className="bg-lime-400 text-black hover:bg-lime-500 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Oracle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <Globe className="h-8 w-8 text-lime-400" />
              <Badge className="bg-lime-400/20 text-lime-400">All Active</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">8</div>
            <div className="text-sm text-white/60">Active Oracles</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-blue-400" />
              <Badge className="bg-blue-400/20 text-blue-400">Real-time</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">24</div>
            <div className="text-sm text-white/60">Data Feeds</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-purple-400" />
              <Badge className="bg-purple-400/20 text-purple-400">30 days</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">99.1%</div>
            <div className="text-sm text-white/60">Avg Uptime</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="h-8 w-8 text-orange-400" />
              <Badge className="bg-orange-400/20 text-orange-400">1 Alert</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">1.2s</div>
            <div className="text-sm text-white/60">Avg Response</div>
          </CardContent>
        </Card>
      </div>

      {/* Oracle Categories */}
      <Card className="bg-gray-900 border-gray-800 rounded-2xl p-4">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {["All", "Active", "Maintenance", "Error"].map((filter, index) => (
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
              {["Development", "Market Data", "Travel", "Weather", "Sports", "News"].map((type) => (
                <Badge key={type} className="bg-gray-800 text-white/70 hover:bg-gray-700 rounded-full px-3 py-1">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oracles List */}
      <div className="space-y-4">
        {oracles.map((oracle, index) => (
          <Card key={index} className="bg-gray-900 border-gray-800 rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{oracle.name}</h3>
                    <p className="text-sm text-white/60">{oracle.endpoint}</p>
                    <Badge className="mt-1 text-xs bg-gray-800 text-white/70">{oracle.type}</Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{oracle.feeds}</div>
                    <div className="text-xs text-white/60">Feeds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{oracle.uptime}</div>
                    <div className="text-xs text-white/60">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">{oracle.lastUpdate}</div>
                    <div className="text-xs text-white/60">Last Update</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      className={`rounded-full ${
                        oracle.status === "active"
                          ? "bg-lime-400/20 text-lime-400"
                          : oracle.status === "maintenance"
                            ? "bg-yellow-400/20 text-yellow-400"
                            : "bg-red-400/20 text-red-400"
                      }`}
                    >
                      {oracle.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
