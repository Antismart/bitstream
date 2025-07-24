"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Principal } from "@dfinity/principal"
import { bitStreamAPI, StreamConfig, UserBalance, StreamStats } from "@/lib/api"

interface AuthContextType {
  isAuthenticated: boolean
  principal: Principal | null
  login: () => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
}

interface BitStreamContextType extends AuthContextType {
  // Stream management
  streams: StreamConfig[]
  createStream: (config: any) => Promise<{ success: boolean; error?: string; streamId?: string }>
  updateStreamStatus: (streamId: string, status: string) => Promise<{ success: boolean; error?: string }>
  refreshStreams: () => Promise<void>
  
  // Analytics
  userBalance: UserBalance
  streamStats: StreamStats
  refreshAnalytics: () => Promise<void>
  
  // Loading states
  streamsLoading: boolean
  analyticsLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const BitStreamContext = createContext<BitStreamContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [principal, setPrincipal] = useState<Principal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      console.log('Checking authentication status...');
      
      // Initialize API if not already done
      await bitStreamAPI.init()
      
      const authenticated = await bitStreamAPI.isAuthenticated()
      console.log('Authentication status:', authenticated);
      setIsAuthenticated(authenticated)
      
      if (authenticated) {
        const userPrincipal = await bitStreamAPI.getPrincipal()
        console.log('User principal:', userPrincipal?.toString());
        setPrincipal(userPrincipal)
      } else {
        setPrincipal(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
      setPrincipal(null)
    }
    setLoading(false)
  }

  async function login(): Promise<boolean> {
    try {
      console.log('Attempting to login...');
      const success = await bitStreamAPI.login()
      console.log('Login result:', success);
      
      if (success) {
        // Re-check authentication status after successful login
        await checkAuth()
      } else {
        console.log('Login failed');
      }
      return success
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  async function logout() {
    try {
      await bitStreamAPI.logout()
      setIsAuthenticated(false)
      setPrincipal(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      principal,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

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

  return (
    <BitStreamContext.Provider value={{
      ...auth,
      streams,
      createStream,
      updateStreamStatus,
      refreshStreams,
      userBalance,
      streamStats,
      refreshAnalytics,
      streamsLoading,
      analyticsLoading
    }}>
      {children}
    </BitStreamContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useBitStream() {
  const context = useContext(BitStreamContext)
  if (context === undefined) {
    throw new Error("useBitStream must be used within a BitStreamProvider")
  }
  return context
}
