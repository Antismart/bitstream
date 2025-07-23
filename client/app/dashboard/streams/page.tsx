"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Edit, Trash2, Plus, Activity, TrendingUp, Users, Calendar, Loader2 } from "lucide-react"
import { useBitStream } from "@/contexts/BitStreamContext"
import Link from "next/link"

export default function StreamsPage() {
  const { streams, streamsLoading, updateStreamStatus } = useBitStream()

  const handleToggleStream = async (streamId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active"
    const result = await updateStreamStatus(streamId, newStatus)
    
    if (!result.success) {
      console.error("Failed to update stream:", result.error)
    }
  }

  if (streamsLoading) {
    return (
      <div className="space-y-6">
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
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Streams</h1>
          <p className="text-white/60">Manage your automated Bitcoin payment streams</p>
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

            const getConditionSummary = () => {
              if (stream.conditions.length === 0) return "No conditions"
              if (stream.conditions.length === 1) {
                const condition = stream.conditions[0]
                return `${condition.conditionType} ${condition.operator} ${condition.value}`
              }
              return `${stream.conditions.length} conditions`
            }

            const getProgress = () => {
              return stream.status === "active" ? Math.floor(Math.random() * 40) + 60 : 
                     stream.status === "paused" ? Math.floor(Math.random() * 30) + 30 : 0
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
                        <p className="text-sm text-white/60">Condition</p>
                        <div className="text-sm font-semibold text-white">{getConditionSummary()}</div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-white/60">Status</p>
                        <div className="text-sm font-semibold text-white capitalize">{stream.status}</div>
                      </div>

                      <div className="text-right w-20">
                        <p className="text-sm text-white/60">Progress</p>
                        <div className="text-sm font-semibold text-white">{getProgress()}%</div>
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                          <div
                            className="bg-lime-400 h-1 rounded-full transition-all"
                            style={{ width: `${getProgress()}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStream(stream.id, stream.status)}
                          className="text-white/70 hover:text-white"
                          disabled={stream.status === "pending"}
                        >
                          {stream.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
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
  )
}
