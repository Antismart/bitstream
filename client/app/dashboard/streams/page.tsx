"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Pause, Edit, Trash2, Plus, Activity, TrendingUp, Users, Calendar, Loader2, Bitcoin, LogOut, Settings, Globe, AlertCircle } from "lucide-react"
import { useBitStream } from "@/contexts/BitStreamContext"
import Link from "next/link"

export default function StreamsPage() {
  const { streams, streamsLoading, updateStreamStatus, executePayment, logout, principal, userBalance } = useBitStream()
  const [executingPayment, setExecutingPayment] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)


  const handleToggleStream = async (streamId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active"
    const result = await updateStreamStatus(streamId, newStatus)
    
    if (!result.success) {
      console.error("Failed to update stream:", result.error)
    }
  }

  const handleExecutePayment = async (streamId: string) => {
    const stream = streams.find(s => s.id === streamId)
    if (!stream) return

    // Clear previous errors
    setPaymentError(null)
    
    // Check balance first
    const streamAmount = parseFloat(stream.amount)
    const availableBalance = parseFloat(userBalance.available)
    
    if (availableBalance < streamAmount) {
      setPaymentError(`Insufficient balance. Need ${stream.amount} ckBTC, but only ${userBalance.available} ckBTC available. Please add funds to your wallet.`)
      return
    }

    setExecutingPayment(streamId)
    try {
      const result = await executePayment(streamId)
      
      if (result.success) {
        console.log("Payment executed successfully:", result.paymentId)
        setPaymentError(null)
        // Success feedback
      } else {
        console.error("Failed to execute payment:", result.error)
        setPaymentError(result.error || "Payment failed")
      }
    } catch (error) {
      console.error("Payment execution error:", error)
      setPaymentError("Network error occurred during payment")
    } finally {
      setExecutingPayment(null)
    }
  }

  if (streamsLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Streams</h1>
            <p className="text-white/60">Manage your automated Bitcoin payment streams</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
          <span className="ml-2 text-white/60">Loading streams...</span>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Bitcoin className="h-5 w-5 text-black" />
            </div>
            <h1 className="text-xl font-bold">BitStream</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex space-x-2">
            <Link href="/dashboard">
              <Button 
                variant="ghost"
                className="text-white hover:bg-gray-800"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/streams">
              <Button 
                variant="default"
                className="bg-lime-400 text-black hover:bg-lime-500"
              >
                Streams
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button 
                variant="ghost"
                className="text-white hover:bg-gray-800"
              >
                Settings
              </Button>
            </Link>
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                Welcome back!
              </div>
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
              onClick={logout}
              variant="ghost" 
              size="sm"
              className="text-white/60 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Streams</h1>
          <p className="text-white/60">Manage your automated Bitcoin payment streams</p>
          <div className="mt-2 text-sm text-white/50">
            💡 New streams start as <span className="text-blue-400 font-medium">pending</span> - click <Play className="h-3 w-3 inline mx-1" /> to activate
          </div>
        </div>
        <Link href="/dashboard/streams/create">
          <Button className="bg-lime-400 text-black hover:bg-lime-500">
            <Plus className="h-4 w-4 mr-2" />
            Create Stream
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-lime-400" />
              <div>
                <p className="text-sm text-white/60">Total Streams</p>
                <p className="text-2xl font-bold text-white">{streams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-white/60">Active Streams</p>
                <p className="text-2xl font-bold text-white">
                  {streams.filter(s => s.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-sm text-white/60">Categories</p>
                <p className="text-2xl font-bold text-white">
                  {[...new Set(streams.map(s => s.category))].length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-white/60">This Month</p>
                <p className="text-2xl font-bold text-white">
                  {streams.filter(s => s.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {paymentError && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h3 className="text-sm font-medium text-red-400">Payment Error</h3>
                <p className="text-sm text-red-300">{paymentError}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPaymentError(null)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Info */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-white">Your Wallet Balance</h3>
              <p className="text-lg font-semibold text-lime-400">{userBalance.available} ckBTC</p>
              <p className="text-xs text-white/60">Total: {userBalance.overall} ckBTC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streams List */}
      {streams.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <Activity className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No payment streams yet</h3>
            <p className="text-white/60 mb-6">
              Create your first automated Bitcoin payment stream with smart conditions
            </p>
            <Link href="/dashboard/streams/create">
              <Button className="bg-lime-400 text-black hover:bg-lime-500">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Stream
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {streams.map((stream) => {
            const getStatusColor = (status: string) => {
              switch (status) {
                case "active": return "bg-green-500"
                case "paused": return "bg-yellow-500"
                case "pending": return "bg-blue-500"
                default: return "bg-gray-500"
              }
            }

            const getRecipient = () => {
              if (stream.recipientEmail) return stream.recipientEmail
              if (stream.recipientAddress) return `${stream.recipientAddress.slice(0, 12)}...`
              return "No recipient"
            }


            const getStatusInfo = () => {
              switch (stream.status) {
                case "active":
                  if (stream.nextExecution) {
                    const nextDate = new Date(Number(stream.nextExecution) / 1000000) // Convert from nanoseconds
                    const now = new Date()
                    const diffMs = nextDate.getTime() - now.getTime()
                    
                    if (diffMs > 0) {
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                      const diffDays = Math.floor(diffHours / 24)
                      
                      if (diffDays > 0) {
                        return { label: `Next payment in ${diffDays}d ${diffHours % 24}h`, color: "text-green-400" }
                      } else if (diffHours > 0) {
                        return { label: `Next payment in ${diffHours}h`, color: "text-green-400" }
                      } else {
                        return { label: "Payment due soon", color: "text-lime-400" }
                      }
                    }
                  }
                  return { label: "Auto payments active", color: "text-green-400" }
                case "paused":
                  return { label: "Temporarily paused", color: "text-yellow-400" }
                case "pending":
                  return { label: "Click ▶ to activate", color: "text-blue-400" }
                default:
                  return { label: "Unknown status", color: "text-gray-400" }
              }
            }

            return (
              <Card key={stream.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(stream.status)}`}></div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{stream.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge variant="secondary" className="bg-gray-800 text-white/70">
                            {stream.category}
                          </Badge>
                          <span className="text-sm text-white/60">{stream.frequency}</span>
                          <span className="text-sm text-white/60">{stream.currency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-white/60">Amount</p>
                        <p className="text-lg font-semibold text-white">{stream.amount}₿</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-white/60">Recipient</p>
                        <p className="text-sm text-white/60">{getRecipient()}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-white/60">Status</p>
                        <div className="text-sm font-semibold text-white capitalize">{stream.status}</div>
                      </div>

                      <div className="text-right w-32">
                        <p className="text-sm text-white/60">Status Info</p>
                        <div className={`text-sm font-medium ${getStatusInfo().color}`}>
                          {getStatusInfo().label}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExecutePayment(stream.id)}
                          className="text-lime-400 hover:text-lime-300"
                          disabled={stream.status !== "active" || executingPayment === stream.id}
                          title={
                            stream.status !== "active" ? 
                            "Activate stream first to execute payments" : 
                            "Execute payment now (manual trigger)"
                          }
                        >
                          {executingPayment === stream.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Bitcoin className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStream(stream.id, stream.status)}
                          className="text-white/70 hover:text-white"
                          disabled={false}
                          title={
                            stream.status === "active" ? "Pause Stream" :
                            stream.status === "pending" ? "Activate Stream" :
                            "Resume Stream"
                          }
                        >
                          {stream.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" title="Edit Stream">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" title="Delete Stream">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {stream.description && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-sm text-white/60">{stream.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
