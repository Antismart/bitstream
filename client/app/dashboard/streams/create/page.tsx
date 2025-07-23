"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Bitcoin, Plus, Settings, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useBitStream } from "@/contexts/BitStreamContext"
import { useRouter } from "next/navigation"

interface StreamConfig {
  name: string
  description: string
  category: string
  amount: string
  currency: string
  frequency: string
  startDate: string
  endDate: string
  recipientType: string
  recipientAddress: string
  recipientEmail: string
  conditions: Array<{
    id: string
    type: string
    operator: string
    value: string
    oracle: string
  }>
  maxAmount: string
  failureHandling: string
  notifications: boolean
}

export default function CreateStreamPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createStream } = useBitStream()
  const router = useRouter()
  
  const [streamConfig, setStreamConfig] = useState<StreamConfig>({
    name: "",
    description: "",
    category: "",
    amount: "",
    currency: "BTC",
    frequency: "",
    startDate: "",
    endDate: "",
    recipientType: "",
    recipientAddress: "",
    recipientEmail: "",
    conditions: [],
    maxAmount: "",
    failureHandling: "pause",
    notifications: true,
  })

  const totalSteps = 3 // Simplified to 3 steps for now
  const progress = (currentStep / totalSteps) * 100

  const updateConfig = (field: string, value: any) => {
    setStreamConfig((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return streamConfig.name && streamConfig.category
      case 2:
        return streamConfig.amount && streamConfig.frequency
      case 3:
        return streamConfig.recipientType && (streamConfig.recipientAddress || streamConfig.recipientEmail)
      default:
        return false
    }
  }

  const handleCreateStream = async () => {
    setIsSubmitting(true)
    try {
      const result = await createStream({
        name: streamConfig.name,
        description: streamConfig.description,
        category: streamConfig.category,
        amount: streamConfig.amount,
        currency: streamConfig.currency,
        frequency: streamConfig.frequency,
        startDate: streamConfig.startDate,
        endDate: streamConfig.endDate,
        recipientType: streamConfig.recipientType,
        recipientAddress: streamConfig.recipientAddress,
        recipientEmail: streamConfig.recipientEmail,
        conditions: [],
        maxAmount: streamConfig.maxAmount,
        failureHandling: streamConfig.failureHandling,
        notifications: streamConfig.notifications,
      })

      if (result.success) {
        router.push('/dashboard/streams')
      } else {
        console.error("Failed to create stream:", result.error)
      }
    } catch (error) {
      console.error("Error creating stream:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/streams">
              <Button variant="ghost" className="text-white/70 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Streams
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Create Payment Stream</h1>
              <p className="text-white/60">Set up automated Bitcoin payments</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Setup Progress</h2>
              <span className="text-sm text-white/60">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between mt-4 text-sm">
              <span className={currentStep >= 1 ? "text-lime-400" : "text-white/40"}>Basic Info</span>
              <span className={currentStep >= 2 ? "text-lime-400" : "text-white/40"}>Payment Details</span>
              <span className={currentStep >= 3 ? "text-lime-400" : "text-white/40"}>Recipient</span>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="h-6 w-6 text-lime-400" />
                  <h3 className="text-xl font-semibold text-white">Basic Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Stream Name *</label>
                    <Input
                      placeholder="Monthly salary payment"
                      value={streamConfig.name}
                      onChange={(e) => updateConfig("name", e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Category *</label>
                    <Select
                      value={streamConfig.category}
                      onValueChange={(value) => updateConfig("category", value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="donation">Donation</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Description</label>
                  <Input
                    placeholder="Describe the purpose of this payment stream..."
                    value={streamConfig.description}
                    onChange={(e) => updateConfig("description", e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Payment Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Bitcoin className="h-6 w-6 text-lime-400" />
                  <h3 className="text-xl font-semibold text-white">Payment Details</h3>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Amount *</label>
                    <Input
                      placeholder="0.001"
                      value={streamConfig.amount}
                      onChange={(e) => updateConfig("amount", e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Currency</label>
                    <Select
                      value={streamConfig.currency}
                      onValueChange={(value) => updateConfig("currency", value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="SATS">Satoshis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Frequency *</label>
                    <Select
                      value={streamConfig.frequency}
                      onValueChange={(value) => updateConfig("frequency", value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Start Date</label>
                    <Input
                      type="date"
                      value={streamConfig.startDate}
                      onChange={(e) => updateConfig("startDate", e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">End Date (Optional)</label>
                    <Input
                      type="date"
                      value={streamConfig.endDate}
                      onChange={(e) => updateConfig("endDate", e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Recipient */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="h-6 w-6 text-lime-400" />
                  <h3 className="text-xl font-semibold text-white">Recipient Information</h3>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Recipient Type *</label>
                  <Select
                    value={streamConfig.recipientType}
                    onValueChange={(value) => updateConfig("recipientType", value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="address">Bitcoin Address</SelectItem>
                      <SelectItem value="email">Email Address</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {streamConfig.recipientType === "address" && (
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Bitcoin Address *</label>
                    <Input
                      placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                      value={streamConfig.recipientAddress}
                      onChange={(e) => updateConfig("recipientAddress", e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                )}

                {streamConfig.recipientType === "email" && (
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Email Address *</label>
                    <Input
                      placeholder="recipient@example.com"
                      type="email"
                      value={streamConfig.recipientEmail}
                      onChange={(e) => updateConfig("recipientEmail", e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                )}

                {/* Review Section */}
                <Card className="bg-gray-800 border-gray-700 mt-6">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-medium text-white mb-4">Stream Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Name:</span>
                        <span className="text-white">{streamConfig.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Category:</span>
                        <Badge variant="secondary" className="bg-gray-700 text-white">
                          {streamConfig.category}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Amount:</span>
                        <span className="text-white font-semibold">{streamConfig.amount} {streamConfig.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Frequency:</span>
                        <span className="text-white">{streamConfig.frequency}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-4">
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} disabled={!canProceed()} className="bg-lime-400 text-black hover:bg-lime-500">
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateStream}
                disabled={!canProceed() || isSubmitting}
                className="bg-lime-400 text-black hover:bg-lime-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Stream...
                  </>
                ) : (
                  <>
                    Create Stream
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
