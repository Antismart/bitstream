"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, Plus, Settings, Shield, Globe, Activity, Edit, CheckCircle, LogIn, LogOut } from "lucide-react"
import { useBitStream } from "@/contexts/BitStreamContext"
import StreamsPage from "./streams/page"
import AnalyticsPage from "./analytics/page"
import OraclesPage from "./oracles/page"
import PaymentPage from "./payment/page"
import CashFlowPage from "./cashflow/page"
import SettingsPage from "./settings/page"

export default function Dashboard() {
  const { 
    isAuthenticated, 
    login, 
    logout, 
    loading, 
    userBalance, 
    streamStats, 
    analyticsLoading,
    principal 
  } = useBitStream()
  
  const [activeTab, setActiveTab] = useState("Dashboard")

  const navigationTabs = ["Dashboard", "Streams", "Analytics", "Oracles", "Payment", "Cash Flow", "Settings"]

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
            <Bitcoin className="h-5 w-5 text-black" />
          </div>
          <h2 className="text-xl font-bold mb-2">BitStream</h2>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <Bitcoin className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to BitStream</h1>
              <p className="text-white/60 mb-6">
                Programmable Bitcoin payment streams with smart conditions and oracle integration.
              </p>
              <Button 
                onClick={login}
                className="w-full bg-lime-400 text-black hover:bg-lime-500"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Connect with Internet Identity
              </Button>
              <p className="text-xs text-white/40 mt-4">
                Secure authentication powered by Internet Computer
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Streams":
        return <StreamsPage />
      case "Analytics":
        return <AnalyticsPage />
      case "Oracles":
        return <OraclesPage />
      case "Payment":
        return <PaymentPage />
      case "Cash Flow":
        return <CashFlowPage />
      case "Settings":
        return <SettingsPage />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <header className="flex items-center justify-between mb-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Bitcoin className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg">BitStream</span>
          </div>

          {/* Navigation Container */}
          <nav className="bg-[#3B3B3B] rounded-full p-1 flex items-center space-x-1">
            {navigationTabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-white text-black hover:bg-white/90"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </nav>

          {/* Profile Section */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">BitStream User</div>
              <div className="text-xs text-white/60 font-mono">
                {principal?.toString().slice(0, 8)}...
              </div>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-orange-500 text-white">BU</AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Dynamic Content */}
        {renderContent()}
      </div>
    </div>
  )

  function DashboardContent() {
    return (
      <div className="grid grid-cols-12 gap-6">
        {/* Left Section - Stream Management */}
        <div className="col-span-4 space-y-6">
          {/* Auto Payment Card */}
          <Card className="bg-gray-900 border-gray-800 rounded-3xl p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Stream Payment</h2>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${Number(streamStats.totalStreams) > 0 ? (Number(streamStats.activeStreams) / Number(streamStats.totalStreams) * 100) * 1.75 : 0} ${100 * 1.75}`}
                      className="text-lime-400"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {Number(streamStats.totalStreams) > 0 ? Math.round((Number(streamStats.activeStreams) / Number(streamStats.totalStreams)) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-xs text-white/60 mb-1">Overall balance</div>
                  <div className="text-xl font-bold text-white">
                    {analyticsLoading ? "..." : `${userBalance.overall}₿`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Monthly profits</div>
                  <div className="text-xl font-bold text-white">
                    {analyticsLoading ? "..." : `${userBalance.monthlyProfits}₿`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Available</div>
                  <div className="text-xl font-bold text-white">
                    {analyticsLoading ? "..." : `${userBalance.available}₿`}
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {streamStats.categories.length > 0 ? (
                  streamStats.categories.map(([category, count], index) => (
                    <Badge
                      key={category}
                      variant={index === 0 ? "default" : "secondary"}
                      className={`rounded-full px-3 py-1 text-xs ${
                        index === 0
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-gray-800 text-white/70 hover:bg-gray-700"
                      }`}
                    >
                      {category} ({Number(count)})
                    </Badge>
                  ))
                ) : (
                  ["All", "Freelance", "DCA", "Insurance", "SaaS", "Trading", "Staking"].map((category, index) => (
                    <Badge
                      key={category}
                      variant={index === 0 ? "default" : "secondary"}
                      className={`rounded-full px-3 py-1 text-xs ${
                        index === 0
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-gray-800 text-white/70 hover:bg-gray-700"
                      }`}
                    >
                      {category}
                    </Badge>
                  ))
                )}
                <Button 
                  size="sm" 
                  className="rounded-full w-8 h-8 p-0 bg-lime-400 text-black hover:bg-lime-500"
                  onClick={() => setActiveTab("Streams")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Service Cards */}
          <div className="space-y-4">
            <Card className="bg-gray-900 border-gray-800 rounded-2xl p-4">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Bitcoin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">ckBTC</div>
                    <div className="text-xs text-white/60">Integration</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 rounded-2xl p-4">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Oracle</div>
                    <div className="text-xs text-white/60">Data Sources</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Center Section - Stream Details */}
        <div className="col-span-5 space-y-6">
          {/* Stream Configuration */}
          <Card className="bg-gray-900 border-gray-800 rounded-3xl p-6">
            <CardContent className="p-0">
              {/* Project Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-white">BitStream</span>
                </div>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Avatar key={i} className="w-8 h-8 border-2 border-gray-800">
                      <AvatarFallback className="bg-orange-500 text-white text-xs">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  <Button size="sm" className="rounded-full w-8 h-8 p-0 bg-gray-800 text-white hover:bg-gray-700">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Stream Progress</span>
                  <span className="text-sm text-white/60">
                    {Number(streamStats.totalStreams) > 0 ? Math.round((Number(streamStats.activeStreams) / Number(streamStats.totalStreams)) * 100) : 0}% Active
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-lime-400 h-2 rounded-full" 
                    style={{ 
                      width: `${Number(streamStats.totalStreams) > 0 ? (Number(streamStats.activeStreams) / Number(streamStats.totalStreams) * 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className={`w-3 h-3 rounded-full ${Number(streamStats.activeStreams) > 0 ? 'bg-lime-400' : 'bg-gray-600'}`}></div>
                  <div className={`w-3 h-3 rounded-full ${Number(streamStats.activeStreams) > 1 ? 'bg-lime-400' : 'bg-gray-600'}`}></div>
                  <div className={`w-3 h-3 rounded-full ${Number(streamStats.activeStreams) > 2 ? 'bg-lime-400' : 'bg-gray-600'}`}></div>
                </div>
              </div>

              {/* Calendar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-white">Date of payment</span>
                  <span className="text-sm font-medium text-white">Payment plan</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {/* Mini Calendar */}
                  <div className="bg-gray-800 rounded-2xl p-4">
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {Array.from({ length: 35 }, (_, i) => {
                        const day = i - 6
                        const isToday = day === 23 // Current date from context
                        return (
                          <div
                            key={i}
                            className={`w-6 h-6 flex items-center justify-center rounded ${
                              day > 0 && day <= 31
                                ? isToday
                                  ? "bg-lime-400 text-black font-bold"
                                  : "text-white/70 hover:bg-gray-700"
                                : "text-transparent"
                            }`}
                          >
                            {day > 0 && day <= 31 ? day : ""}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Payment Plans */}
                  <div className="space-y-2">
                    {["Professional", "Organization", "Enterprise"].map((plan, index) => (
                      <Badge
                        key={plan}
                        variant={index === 2 ? "default" : "secondary"}
                        className={`w-full justify-center py-2 rounded-xl ${
                          index === 2
                            ? "bg-lime-400 text-black hover:bg-lime-500"
                            : "bg-gray-800 text-white/70 hover:bg-gray-700"
                        }`}
                      >
                        {plan}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Stats */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xs text-white/60 mb-1">Total Volume</div>
                  <div className="text-lg font-bold text-white">
                    {analyticsLoading ? "..." : `${streamStats.totalVolume}₿`}
                  </div>
                  <div className="text-xs text-white/60">/ total</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Total Streams</div>
                  <div className="text-lg font-bold text-white">
                    {analyticsLoading ? "..." : streamStats.totalStreams}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Active Streams</div>
                  <div className="text-lg font-bold text-white">
                    {analyticsLoading ? "..." : streamStats.activeStreams}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Payment method</div>
                  <div className="text-lg font-bold text-white">ckBTC</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Payment Methods & Stats */}
        <div className="col-span-3 space-y-4">
          {/* Pay From Card */}
          <Card className="bg-lime-400 text-black rounded-3xl p-6">
            <CardContent className="p-0">
              <div className="text-sm font-medium mb-4">Pay from</div>
              <div className="space-y-3">
                <div className="bg-black/10 rounded-2xl p-3">
                  <div className="text-xs opacity-70 mb-1">BTC Balance</div>
                  <div className="text-lg font-bold">
                    {analyticsLoading ? "..." : `${userBalance.overall}₿`}
                  </div>
                </div>
                <div className="bg-black/10 rounded-2xl p-3">
                  <div className="text-xs opacity-70 mb-1">Available</div>
                  <div className="text-lg font-bold">
                    {analyticsLoading ? "..." : `${userBalance.available}₿`}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Badge className="bg-black text-white hover:bg-black/80">ckBTC</Badge>
                <Badge className="bg-black/20 text-black hover:bg-black/30">Lightning</Badge>
                <Badge className="bg-black/20 text-black hover:bg-black/30">Native</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Service Cards */}
          <Card className="bg-white text-black rounded-2xl p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Oracle Security</span>
                </div>
                <Button variant="ghost" size="sm" className="text-black/70 hover:text-black">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-right">
                <div className="text-xs text-black/60 mb-1">Monthly, every 17th</div>
                <div className="text-2xl font-bold">Active</div>
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-black rounded-2xl p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">ICP Network</span>
                </div>
                <Button variant="ghost" size="sm" className="text-black/70 hover:text-black">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-right">
                <div className="text-xs text-black/60 mb-1">Internet Computer</div>
                <div className="text-2xl font-bold">Connected</div>
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto mt-1" />
              </div>
            </CardContent>
          </Card>

          {/* Bottom Service Cards */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800 rounded-2xl p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Activity className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">Stream</div>
                        <div className="text-xs text-white/60">
                          {i < streamStats.activeStreams ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-white/70 hover:text-white p-1">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }
}
