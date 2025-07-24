"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Plus, Settings, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { bitStreamAPI, Oracle } from "@/lib/api"

export default function OraclesPage() {
  const [oracles, setOracles] = useState<Oracle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newOracle, setNewOracle] = useState({
    name: "",
    endpoint: "",
    category: "",
    apiKey: ""
  })

  useEffect(() => {
    console.log('Oracle page mounted, loading oracles...')
    loadOracles()
  }, [])

  async function loadOracles() {
    try {
      console.log('Loading oracles...')
      setLoading(true)
      const oracleData = await bitStreamAPI.getOracles()
      console.log('Oracles loaded:', oracleData)
      setOracles(oracleData)
    } catch (error) {
      console.error('Failed to load oracles:', error)
      // Show error in UI
      setOracles([])
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(oracleId: string, newStatus: string) {
    try {
      const result = await bitStreamAPI.updateOracleStatus(oracleId, newStatus)
      if (result.ok !== undefined) {
        // Refresh oracles list
        await loadOracles()
      } else {
        console.error('Failed to update oracle status:', result.err)
      }
    } catch (error) {
      console.error('Error updating oracle status:', error)
    }
  }

  async function handleAddOracle() {
    try {
      if (!newOracle.name || !newOracle.endpoint || !newOracle.category) {
        alert('Please fill in all required fields')
        return
      }

      const oracle: Oracle = {
        id: `oracle-${Date.now()}`, // Generate a unique ID
        name: newOracle.name,
        endpoint: newOracle.endpoint,
        category: newOracle.category,
        status: "active",
        uptime: "0%",
        lastUpdate: BigInt(Date.now() * 1000000),
        feeds: BigInt(0),
        apiKey: newOracle.apiKey || null,
        isActive: true
      }

      const result = await bitStreamAPI.addOracle(oracle)
      if (result.ok) {
        // Reset form and close dialog
        setNewOracle({ name: "", endpoint: "", category: "", apiKey: "" })
        setShowAddDialog(false)
        // Refresh oracles list
        await loadOracles()
        console.log('Oracle added successfully:', result.ok)
      } else {
        console.error('Failed to add oracle:', result.err)
        alert('Failed to add oracle: ' + result.err)
      }
    } catch (error) {
      console.error('Error adding oracle:', error)
      alert('Error adding oracle: ' + error)
    }
  }

  const filteredOracles = oracles.filter(oracle => {
    const statusMatch = filter === "All" || 
                       (filter === "Active" && oracle.status === "active") ||
                       (filter === "Maintenance" && oracle.status === "maintenance") ||
                       (filter === "Error" && oracle.status === "error")
    
    const categoryMatch = !categoryFilter || oracle.category === categoryFilter
    
    return statusMatch && categoryMatch
  })

  const activeOracles = oracles.filter(o => o.status === "active").length
  const totalFeeds = oracles.reduce((sum, o) => sum + Number(o.feeds), 0)
  const avgUptime = oracles.length > 0 
    ? (oracles.reduce((sum, o) => sum + parseFloat(o.uptime.replace('%', '')), 0) / oracles.length).toFixed(1) + '%'
    : '0%'

  const categories = [...new Set(oracles.map(o => o.category))]

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Date.now()
    const time = Number(timestamp) / 1000000 // Convert nanoseconds to milliseconds
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) === 1 ? '' : 's'} ago`
    return `${Math.floor(diffMins / 1440)} day${Math.floor(diffMins / 1440) === 1 ? '' : 's'} ago`
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white">Loading oracles...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Data Sources</h1>
          <p className="text-white/60">Manage oracle connections and data feeds</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-lime-400 text-black hover:bg-lime-500 rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Oracle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Add New Oracle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white/80">Oracle Name</Label>
                <Input
                  id="name"
                  value={newOracle.name}
                  onChange={(e) => setNewOracle(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., CoinGecko API"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="endpoint" className="text-white/80">API Endpoint</Label>
                <Input
                  id="endpoint"
                  value={newOracle.endpoint}
                  onChange={(e) => setNewOracle(prev => ({ ...prev, endpoint: e.target.value }))}
                  placeholder="https://api.example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-white/80">Category</Label>
                <Select value={newOracle.category} onValueChange={(value) => setNewOracle(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Market Data" className="text-white">Market Data</SelectItem>
                    <SelectItem value="Weather" className="text-white">Weather</SelectItem>
                    <SelectItem value="Sports" className="text-white">Sports</SelectItem>
                    <SelectItem value="News" className="text-white">News</SelectItem>
                    <SelectItem value="Development" className="text-white">Development</SelectItem>
                    <SelectItem value="Travel" className="text-white">Travel</SelectItem>
                    <SelectItem value="Other" className="text-white">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="apiKey" className="text-white/80">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={newOracle.apiKey}
                  onChange={(e) => setNewOracle(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter API key if required"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 bg-transparent border-gray-600 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddOracle}
                  className="flex-1 bg-lime-400 text-black hover:bg-lime-500"
                >
                  Add Oracle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <Globe className="h-8 w-8 text-lime-400" />
              <Badge className="bg-lime-400/20 text-lime-400">All Active</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{activeOracles}</div>
            <div className="text-sm text-white/60">Active Oracles</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-blue-400" />
              <Badge className="bg-blue-400/20 text-blue-400">Real-time</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{totalFeeds}</div>
            <div className="text-sm text-white/60">Data Feeds</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 rounded-2xl p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-purple-400" />
              <Badge className="bg-purple-400/20 text-purple-400">30 days</Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{avgUptime}</div>
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

      {/* Filter Bar */}
      <Card className="bg-gray-900 border-gray-800 rounded-2xl p-4">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            {/* Status Filters */}
            <div className="flex gap-2">
              {["All", "Active", "Maintenance", "Error"].map((status) => (
                <div
                  key={status}
                  className={`inline-flex items-center border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent rounded-full px-4 py-2 cursor-pointer ${
                    filter === status
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-gray-800 text-white/70 hover:bg-gray-700"
                  }`}
                  onClick={() => setFilter(status)}
                >
                  {status}
                </div>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className={`inline-flex items-center border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent rounded-full px-3 py-1 cursor-pointer ${
                    categoryFilter === category
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-gray-800 text-white/70 hover:bg-gray-700"
                  }`}
                  onClick={() => setCategoryFilter(categoryFilter === category ? "" : category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oracles List */}
      <div className="space-y-4">
        {filteredOracles.map((oracle) => (
          <Card key={oracle.id} className="bg-gray-900 border-gray-800 rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{oracle.name}</h3>
                    <p className="text-sm text-white/60">{oracle.endpoint}</p>
                    <Badge className="mt-1 text-xs bg-gray-800 text-white/70">{oracle.category}</Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{Number(oracle.feeds)}</div>
                    <div className="text-xs text-white/60">Feeds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{oracle.uptime}</div>
                    <div className="text-xs text-white/60">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">{formatTimeAgo(oracle.lastUpdate)}</div>
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white/70 hover:text-white"
                      onClick={() => handleUpdateStatus(oracle.id, oracle.status === "active" ? "maintenance" : "active")}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOracles.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white/60 mb-2">No oracles found</h3>
          <p className="text-white/40">Try adjusting your filters or add a new oracle.</p>
        </div>
      )}
    </div>
  )
}
