"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, Plus, Settings, Globe, Activity, CheckCircle, LogOut, Wallet } from "lucide-react"
import { useBitStream } from "@/contexts/BitStreamContext"
import { ConnectWallet } from "@nfid/identitykit/react"

export default function Dashboard() {
  const { 
    isAuthenticated, 
    logout, 
    loading, 
    userBalance, 
    streamStats, 
    analyticsLoading,
    principal,
    walletType
  } = useBitStream()

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
                Simple, automated Bitcoin payment streams powered by Internet Computer.
              </p>
              
              <ConnectWallet 
                connectButtonComponent={(props: any) => {
                  const { children, type, size, ...buttonProps } = props
                  return (
                    <Button 
                      {...buttonProps}
                      type={type as "button" | "submit" | "reset" | undefined}
                      size={size as "default" | "sm" | "lg" | "icon" | null | undefined}
                      className="w-full bg-lime-400 text-black hover:bg-lime-500"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </Button>
                  )
                }}
              />
              
              <div className="mt-4 space-y-2">
                <p className="text-xs text-white/40">
                  Choose from multiple ICP-compatible wallets
                </p>
                <div className="text-xs text-white/30 text-center">
                  Internet Identity • NFID • Plug • Stoic • AstroX
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <Button
              variant="default"
              className="rounded-full px-4 py-2 text-sm font-medium transition-all bg-white text-black hover:bg-white/90"
            >
              Dashboard
            </Button>
            <Link href="/dashboard/streams">
              <Button
                variant="ghost"
                className="rounded-full px-4 py-2 text-sm font-medium transition-all text-white/70 hover:text-white hover:bg-white/10"
              >
                Streams
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button
                variant="ghost"
                className="rounded-full px-4 py-2 text-sm font-medium transition-all text-white/70 hover:text-white hover:bg-white/10"
              >
                Settings
              </Button>
            </Link>
          </nav>

          {/* Profile Section */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">Welcome back!</div>
              <div className="text-xs text-white/60 font-mono">
                {principal?.toString().slice(0, 8)}...
              </div>
              <div className="text-xs text-white/40">
                Multi-Wallet Connected
              </div>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="text-white bg-lime-500">
                {principal ? 'US' : 'AN'}
              </AvatarFallback>
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

        {/* Dashboard Content */}
        <DashboardContent />
      </div>
    </div>
  )

  function DashboardContent() {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Monitor your Bitcoin payment streams</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {analyticsLoading ? "..." : `₿${userBalance.available}`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-lime-400 rounded-lg flex items-center justify-center">
                  <Bitcoin className="h-6 w-6 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Streams</p>
                  <p className="text-2xl font-bold text-white">
                    {analyticsLoading ? "..." : Number(streamStats.totalStreams)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Active Streams</p>
                  <p className="text-2xl font-bold text-white">
                    {analyticsLoading ? "..." : Number(streamStats.activeStreams)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Volume</p>
                  <p className="text-2xl font-bold text-white">
                    {analyticsLoading ? "..." : `₿${streamStats.totalVolume}`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/dashboard/streams/create">
                  <Button className="w-full bg-lime-400 text-black hover:bg-lime-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Stream
                  </Button>
                </Link>
                <Link href="/dashboard/streams">
                  <Button 
                    variant="outline" 
                    className="w-full bg-lime-400 text-black hover:bg-lime-500"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    View All Streams
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button 
                    variant="outline" 
                    className="w-full bg-lime-400 text-black hover:bg-lime-500"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Network Status</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Internet Computer</p>
                    <p className="text-xs text-white/60">Network Connected</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bitcoin className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">ckBTC Integration</p>
                    <p className="text-xs text-white/60">Payment system ready</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}