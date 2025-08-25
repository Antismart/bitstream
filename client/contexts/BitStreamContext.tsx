"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Principal } from "@dfinity/principal"
import { useIdentityKit } from "@nfid/identitykit/react"
import { bitStreamAPI, StreamConfig, UserBalance, StreamStats, WalletType } from "@/lib/api"

interface AuthContextType {
  isAuthenticated: boolean
  principal: Principal | null
  walletType: WalletType | null
  login: (walletType?: WalletType) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  accounts: any[] | null
}

interface BitStreamContextType extends AuthContextType {
  // Stream management
  streams: StreamConfig[]
  createStream: (config: any) => Promise<{ success: boolean; error?: string; streamId?: string }>
  updateStreamStatus: (streamId: string, status: string) => Promise<{ success: boolean; error?: string }>
  executePayment: (streamId: string) => Promise<{ success: boolean; error?: string; paymentId?: string }>
  refreshStreams: () => Promise<void>
  
  // Analytics
  userBalance: UserBalance
  streamStats: StreamStats
  refreshAnalytics: () => Promise<void>
  
  // ICRC-2 Approval functions
  approveCanister: (amountSatoshis: number) => Promise<{ success: boolean; error?: string; blockIndex?: number }>
  getAllowance: () => Promise<number>
  
  // Loading states
  streamsLoading: boolean
  analyticsLoading: boolean
}

const BitStreamContext = createContext<BitStreamContextType | undefined>(undefined)

export function BitStreamProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  
  // Stream management state
  const [streams, setStreams] = useState<StreamConfig[]>([])
  const [streamsLoading, setStreamsLoading] = useState(false)
  
  // Analytics state
  const [userBalance, setUserBalance] = useState<UserBalance>({
    overall: "0",
    available: "0",
    monthlyProfits: "0",
    monthly: "0"
  })
  const [streamStats, setStreamStats] = useState<StreamStats>({
    totalStreams: BigInt(0),
    activeStreams: BigInt(0),
    totalVolume: "0",
    categories: []
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Load data when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && !auth.loading) {
      refreshStreams()
      refreshAnalytics()
    }
  }, [auth.isAuthenticated, auth.loading])

  async function refreshStreams() {
    if (!auth.isAuthenticated) return
    
    setStreamsLoading(true)
    try {
      const userStreams = await bitStreamAPI.getUserStreams()
      setStreams(userStreams)
    } catch (error) {
      console.error("Failed to fetch streams:", error)
    }
    setStreamsLoading(false)
  }

  async function refreshAnalytics() {
    if (!auth.isAuthenticated) return
    
    setAnalyticsLoading(true)
    try {
      const [balance, stats] = await Promise.all([
        bitStreamAPI.getUserBalance(),
        bitStreamAPI.getStreamStats()
      ])
      setUserBalance(balance)
      setStreamStats(stats)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
    setAnalyticsLoading(false)
  }

  async function createStream(config: any): Promise<{ success: boolean; error?: string; streamId?: string }> {
    try {
      const result = await bitStreamAPI.createStream(config)
      
      if (result.ok) {
        await refreshStreams() // Refresh the streams list
        await refreshAnalytics() // Refresh analytics
        return { success: true, streamId: result.ok }
      } else {
        return { success: false, error: result.err || "Unknown error" }
      }
    } catch (error) {
      console.error("Failed to create stream:", error)
      return { success: false, error: "Network error" }
    }
  }

  async function updateStreamStatus(streamId: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await bitStreamAPI.updateStreamStatus(streamId, status)
      
      if (result.ok !== undefined) {
        await refreshStreams() // Refresh the streams list
        await refreshAnalytics() // Refresh analytics
        return { success: true }
      } else {
        return { success: false, error: result.err || "Unknown error" }
      }
    } catch (error) {
      console.error("Failed to update stream:", error)
      return { success: false, error: "Network error" }
    }
  }

  async function executePayment(streamId: string): Promise<{ success: boolean; error?: string; paymentId?: string }> {
    try {
      const result = await bitStreamAPI.executePayment(streamId)
      
      if (result.ok) {
        await refreshStreams() // Refresh the streams list
        await refreshAnalytics() // Refresh analytics
        return { success: true, paymentId: result.ok }
      } else {
        return { success: false, error: result.err || "Unknown error" }
      }
    } catch (error) {
      console.error("Failed to execute payment:", error)
      return { success: false, error: "Network error" }
    }
  }

  async function approveCanister(amountSatoshis: number): Promise<{ success: boolean; error?: string; blockIndex?: number }> {
    try {
      const result = await bitStreamAPI.approveCanister(amountSatoshis)
      
      if (result.ok !== undefined) {
        return { success: true, blockIndex: result.ok }
      } else {
        return { success: false, error: result.err || "Unknown error" }
      }
    } catch (error) {
      console.error("Failed to approve canister:", error)
      return { success: false, error: "Network error" }
    }
  }

  async function getAllowance(): Promise<number> {
    try {
      return await bitStreamAPI.getAllowance()
    } catch (error) {
      console.error("Failed to get allowance:", error)
      return 0
    }
  }

  return (
    <BitStreamContext.Provider value={{
      ...auth,
      streams,
      createStream,
      updateStreamStatus,
      executePayment,
      refreshStreams,
      userBalance,
      streamStats,
      refreshAnalytics,
      approveCanister,
      getAllowance,
      streamsLoading,
      analyticsLoading
    }}>
      {children}
    </BitStreamContext.Provider>
  )
}

// Enhanced authentication hook with IdentityKit support
function useAuth() {
  const identityKit = useIdentityKit()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [principal, setPrincipal] = useState<Principal | null>(null)
  const [walletType, setWalletType] = useState<WalletType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [identityKit?.user?.principal, identityKit?.identity])

  async function checkAuth() {
    try {
      console.log('Checking authentication status...');
      
      // Check IdentityKit first (primary method)
      if (identityKit?.user?.principal) {
        console.log('IdentityKit user found');
        setIsAuthenticated(true)
        setPrincipal(identityKit.user.principal)
        setWalletType('identitykit')
        
        // Update the API with IdentityKit identity
        if (identityKit.identity) {
          bitStreamAPI['identity'] = identityKit.identity
          bitStreamAPI['currentWalletType'] = 'identitykit'
          await bitStreamAPI['updateActor']()
        }
      } else {
        // No authentication found
        setIsAuthenticated(false)
        setPrincipal(null)
        setWalletType(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
      setPrincipal(null)
      setWalletType(null)
    }
    setLoading(false)
  }

  const login = async (walletType: WalletType = 'identitykit'): Promise<boolean> => {
    try {
      console.log('Attempting to login with IdentityKit');
      
      if (identityKit?.connect) {
        await identityKit.connect()
        await checkAuth()
        return isAuthenticated
      } else {
        console.error('IdentityKit not available');
        return false
      }
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      if (identityKit?.disconnect) {
        await identityKit.disconnect()
      }
      
      setIsAuthenticated(false)
      setPrincipal(null)
      setWalletType(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return {
    isAuthenticated,
    principal,
    walletType,
    login,
    logout,
    loading,
    accounts: identityKit?.accounts || null
  }
}

export function useBitStream() {
  const context = useContext(BitStreamContext)
  if (context === undefined) {
    throw new Error("useBitStream must be used within a BitStreamProvider")
  }
  return context
}
