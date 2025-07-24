import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

// Types matching the Motoko backend
export interface Condition {
  id: string;
  conditionType: string;
  operator: string;
  value: string;
  oracle: string;
}

export interface Oracle {
  id: string;
  name: string;
  endpoint: string;
  category: string;
  status: string;
  uptime: string;
  lastUpdate: bigint;
  feeds: bigint;
  apiKey: string | null;
  isActive: boolean;
}

export interface StreamConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  amount: string;
  currency: string;
  frequency: string;
  startDate: string;
  endDate: string;
  recipientType: string;
  recipientAddress: string;
  recipientEmail: string;
  conditions: Condition[];
  maxAmount: string;
  failureHandling: string;
  notifications: boolean;
  creator: Principal;
  createdAt: bigint;
  status: string;
}

export interface UserBalance {
  overall: string;
  available: string;
  monthlyProfits: string;
  monthly: string;
}

export interface StreamStats {
  totalStreams: bigint;
  activeStreams: bigint;
  totalVolume: string;
  categories: [string, bigint][];
}

// IDL for the PaymentStream actor
const idlFactory = ({ IDL }: any) => {
  const Condition = IDL.Record({
    'id': IDL.Text,
    'conditionType': IDL.Text,
    'operator': IDL.Text,
    'value': IDL.Text,
    'oracle': IDL.Text,
  });

  const StreamConfig = IDL.Record({
    'id': IDL.Text,
    'name': IDL.Text,
    'description': IDL.Text,
    'category': IDL.Text,
    'amount': IDL.Text,
    'currency': IDL.Text,
    'frequency': IDL.Text,
    'startDate': IDL.Text,
    'endDate': IDL.Text,
    'recipientType': IDL.Text,
    'recipientAddress': IDL.Text,
    'recipientEmail': IDL.Text,
    'conditions': IDL.Vec(Condition),
    'maxAmount': IDL.Text,
    'failureHandling': IDL.Text,
    'notifications': IDL.Bool,
    'creator': IDL.Principal,
    'createdAt': IDL.Int,
    'status': IDL.Text,
  });

  const UserBalance = IDL.Record({
    'overall': IDL.Text,
    'available': IDL.Text,
    'monthlyProfits': IDL.Text,
    'monthly': IDL.Text,
  });

  const StreamStats = IDL.Record({
    'totalStreams': IDL.Nat,
    'activeStreams': IDL.Nat,
    'totalVolume': IDL.Text,
    'categories': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
  });

  const Oracle = IDL.Record({
    'id': IDL.Text,
    'name': IDL.Text,
    'endpoint': IDL.Text,
    'category': IDL.Text,
    'status': IDL.Text,
    'uptime': IDL.Text,
    'lastUpdate': IDL.Int,
    'feeds': IDL.Nat,
    'apiKey': IDL.Opt(IDL.Text),
    'isActive': IDL.Bool,
  });

  const Result = IDL.Variant({
    'ok': IDL.Text,
    'err': IDL.Text,
  });

  const ResultVoid = IDL.Variant({
    'ok': IDL.Null,
    'err': IDL.Text,
  });

  const ResultBool = IDL.Variant({
    'ok': IDL.Bool,
    'err': IDL.Text,
  });

  const ResultStream = IDL.Variant({
    'ok': StreamConfig,
    'err': IDL.Text,
  });

  const ResultOracle = IDL.Variant({
    'ok': Oracle,
    'err': IDL.Text,
  });

  return IDL.Service({
    'createStream': IDL.Func([StreamConfig], [Result], []),
    'getStream': IDL.Func([IDL.Text], [ResultStream], ['query']),
    'getUserStreams': IDL.Func([IDL.Principal], [IDL.Vec(StreamConfig)], ['query']),
    'getAllStreams': IDL.Func([], [IDL.Vec(StreamConfig)], ['query']),
    'updateStreamStatus': IDL.Func([IDL.Text, IDL.Text], [ResultVoid], []),
    'validateConditions': IDL.Func([IDL.Text], [ResultBool], []),
    'getUserBalance': IDL.Func([IDL.Principal], [UserBalance], ['query']),
    'getStreamStats': IDL.Func([IDL.Principal], [StreamStats], ['query']),
    'getOracles': IDL.Func([], [IDL.Vec(Oracle)], ['query']),
    'getOracle': IDL.Func([IDL.Text], [ResultOracle], ['query']),
    'addOracle': IDL.Func([Oracle], [Result], []),
    'updateOracleStatus': IDL.Func([IDL.Text, IDL.Text], [ResultVoid], []),
  });
};

// Configuration following IC authentication best practices
const isDevelopment = false; // Force production mode for mainnet

// Network configuration
const DFX_NETWORK = "ic"; // Force IC network
const IC_HOST = "https://ic0.app"; // Force IC host

// Canister IDs - force to use the correct mainnet canister ID
const CANISTER_ID_SERVER = "wbyay-dyaaa-aaaag-aue3q-cai";

// Internet Identity configuration - ALWAYS use production Internet Identity
const IDENTITY_PROVIDER = "https://identity.ic0.app";

// Authentication configuration
const AUTH_MAX_TIME_TO_LIVE = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000); // 7 days in nanoseconds

class BitStreamAPI {
  private authClient: AuthClient | null = null;
  private actor: any = null;
  private agent: HttpAgent | null = null;
  private mockMode: boolean = false;
  private identity: Identity | null = null;

  async init() {
    try {
      console.log('Initializing BitStream API...');
      console.log('Environment:', isDevelopment ? 'development' : 'production');
      console.log('Network:', DFX_NETWORK);
      console.log('Host:', IC_HOST);
      console.log('Canister ID:', CANISTER_ID_SERVER);
      console.log('Identity Provider:', IDENTITY_PROVIDER);
      console.log('process.env.NEXT_PUBLIC_CANISTER_ID_SERVER:', process.env.NEXT_PUBLIC_CANISTER_ID_SERVER);
      console.log('process.env.DFX_NETWORK:', process.env.DFX_NETWORK);
      console.log('process.env.NODE_ENV:', process.env.NODE_ENV);

      // Create auth client with proper configuration
      this.authClient = await AuthClient.create({
        idleOptions: {
          // Disable idle logout for development
          disableIdle: isDevelopment,
          // 30 minutes idle timeout
          idleTimeout: 30 * 60 * 1000,
        },
      });
      
      // Check if already authenticated
      const isAuthenticated = await this.authClient.isAuthenticated();
      if (isAuthenticated) {
        this.identity = this.authClient.getIdentity();
        console.log('Already authenticated with principal:', this.identity.getPrincipal().toString());
      }

      // Create agent
      this.agent = new HttpAgent({ 
        host: IC_HOST,
        identity: this.identity || undefined
      });

      // Create actor for IC network
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: CANISTER_ID_SERVER,
      });

      console.log('BitStream API initialized successfully for IC mainnet');
    } catch (error) {
      console.error('Failed to initialize BitStream API:', error);
      console.log('Enabling mock mode for development');
      this.mockMode = true;
    }
  }

  async login(): Promise<boolean> {
    if (!this.authClient) await this.init();

    return new Promise((resolve) => {
      this.authClient!.login({
        identityProvider: IDENTITY_PROVIDER,
        maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
        windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
        onSuccess: async () => {
          console.log('Login successful, updating identity and actor...');
          this.identity = this.authClient!.getIdentity();
          console.log('New identity principal:', this.identity.getPrincipal().toString());
          await this.updateActor();
          resolve(true);
        },
        onError: (error) => {
          console.error("Login error:", error);
          resolve(false);
        },
      });
    });
  }

  async logout() {
    if (this.authClient) {
      await this.authClient.logout();
      this.identity = null;
      await this.updateActor();
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.authClient) await this.init();
    return await this.authClient!.isAuthenticated();
  }

  async getPrincipal(): Promise<Principal | null> {
    if (!this.authClient) return null;
    if (!this.identity) {
      this.identity = this.authClient.getIdentity();
    }
    return this.identity.getPrincipal();
  }

  private async updateActor() {
    if (!this.authClient) return;

    if (this.mockMode) {
      console.log('Mock mode enabled, skipping actor update');
      return;
    }

    try {
      // Update identity if authenticated
      if (await this.authClient.isAuthenticated()) {
        this.identity = this.authClient.getIdentity();
        console.log('Updating actor with authenticated identity:', this.identity.getPrincipal().toString());
      } else {
        this.identity = null;
        console.log('Updating actor with anonymous identity');
      }

      this.agent = new HttpAgent({ 
        host: IC_HOST,
        identity: this.identity || undefined
      });

      // Create actor for IC mainnet
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: CANISTER_ID_SERVER,
      });
      
      console.log('Actor updated successfully');
    } catch (error) {
      console.error('Failed to update actor:', error);
      console.log('Falling back to mock mode');
      this.mockMode = true;
    }
  }

  // Mock data for development
  private getMockStreams(): StreamConfig[] {
    return [
      {
        id: "stream-1",
        name: "Monthly Rent Payment",
        description: "Automated rent payment to landlord",
        category: "Housing",
        amount: "0.025",
        currency: "BTC",
        frequency: "monthly",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        recipientType: "address",
        recipientAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        recipientEmail: "",
        conditions: [
          {
            id: "cond-1",
            conditionType: "price",
            operator: ">=",
            value: "95000",
            oracle: "coinbase"
          }
        ],
        maxAmount: "0.1",
        failureHandling: "pause",
        notifications: true,
        creator: Principal.anonymous(),
        createdAt: BigInt(Date.now() * 1000000),
        status: "active"
      },
      {
        id: "stream-2", 
        name: "DCA Investment",
        description: "Dollar cost averaging into Bitcoin",
        category: "Investment",
        amount: "0.01",
        currency: "BTC",
        frequency: "weekly",
        startDate: "2025-01-01",
        endDate: "",
        recipientType: "email",
        recipientAddress: "",
        recipientEmail: "investment@example.com",
        conditions: [],
        maxAmount: "",
        failureHandling: "retry",
        notifications: true,
        creator: Principal.anonymous(),
        createdAt: BigInt(Date.now() * 1000000),
        status: "pending"
      }
    ];
  }

  private getMockBalance(): UserBalance {
    return {
      overall: "2.513",
      available: "18.718", 
      monthlyProfits: "0.340",
      monthly: "0.520"
    };
  }

  private getMockStats(): StreamStats {
    return {
      totalStreams: BigInt(2),
      activeStreams: BigInt(1),
      totalVolume: "45.321",
      categories: [["Housing", BigInt(1)], ["Investment", BigInt(1)]]
    };
  }

  // API Methods
  async createStream(config: Omit<StreamConfig, 'id' | 'creator' | 'createdAt' | 'status'>): Promise<{ ok?: string; err?: string }> {
    if (!this.actor) await this.init();
    
    // Convert frontend types to backend types
    const backendConfig = {
      ...config,
      id: "", // Will be set by backend
      creator: Principal.anonymous(), // Will be set by backend
      createdAt: BigInt(0), // Will be set by backend
      status: "pending" // Will be set by backend
    };
    
    return await this.actor.createStream(backendConfig);
  }

  async getStream(streamId: string): Promise<{ ok?: StreamConfig; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.getStream(streamId);
  }

  async getUserStreams(): Promise<StreamConfig[]> {
    if (this.mockMode) {
      console.log('Using mock streams data');
      return this.getMockStreams();
    }
    
    if (!this.actor) await this.init();
    const principal = await this.getPrincipal();
    if (!principal) return [];
    return await this.actor.getUserStreams(principal);
  }

  async getAllStreams(): Promise<StreamConfig[]> {
    if (!this.actor) await this.init();
    return await this.actor.getAllStreams();
  }

  async updateStreamStatus(streamId: string, status: string): Promise<{ ok?: null; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.updateStreamStatus(streamId, status);
  }

  async validateConditions(streamId: string): Promise<{ ok?: boolean; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.validateConditions(streamId);
  }

  async getUserBalance(): Promise<UserBalance> {
    if (this.mockMode) {
      console.log('Using mock balance data');
      return this.getMockBalance();
    }
    
    if (!this.actor) await this.init();
    const principal = await this.getPrincipal();
    if (!principal) {
      return {
        overall: "0",
        available: "0",
        monthlyProfits: "0",
        monthly: "0"
      };
    }
    return await this.actor.getUserBalance(principal);
  }

  async getStreamStats(): Promise<StreamStats> {
    if (this.mockMode) {
      console.log('Using mock stats data');
      return this.getMockStats();
    }
    
    if (!this.actor) await this.init();
    const principal = await this.getPrincipal();
    if (!principal) {
      return {
        totalStreams: BigInt(0),
        activeStreams: BigInt(0),
        totalVolume: "0",
        categories: []
      };
    }
    return await this.actor.getStreamStats(principal);
  }

  // Oracle API Methods
  async getOracles(): Promise<Oracle[]> {
    console.log('getOracles called, mockMode:', this.mockMode)
    if (this.mockMode) {
      console.log('Using mock oracles data');
      return this.getMockOracles();
    }
    
    if (!this.actor) {
      console.log('No actor found, initializing...')
      await this.init();
    }
    
    console.log('Calling actor.getOracles...')
    const result = await this.actor.getOracles();
    console.log('Actor getOracles result:', result)
    return result;
  }

  async getOracle(oracleId: string): Promise<{ ok?: Oracle; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.getOracle(oracleId);
  }

  async addOracle(oracle: Oracle): Promise<{ ok?: string; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.addOracle(oracle);
  }

  async updateOracleStatus(oracleId: string, status: string): Promise<{ ok?: null; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.updateOracleStatus(oracleId, status);
  }

  private getMockOracles(): Oracle[] {
    return [
      {
        id: "oracle-1",
        name: "CoinGecko",
        endpoint: "https://api.coingecko.com/api/v3",
        category: "Market Data",
        status: "active",
        uptime: "99.8%",
        lastUpdate: BigInt(Date.now() * 1000000),
        feeds: BigInt(8),
        apiKey: null,
        isActive: true
      },
      {
        id: "oracle-2", 
        name: "GitHub API",
        endpoint: "https://api.github.com",
        category: "Development",
        status: "active",
        uptime: "99.9%",
        lastUpdate: BigInt(Date.now() * 1000000),
        feeds: BigInt(5),
        apiKey: null,
        isActive: true
      },
      {
        id: "oracle-3",
        name: "Weather API",
        endpoint: "https://api.openweathermap.org/data/2.5",
        category: "Weather", 
        status: "active",
        uptime: "99.2%",
        lastUpdate: BigInt(Date.now() * 1000000),
        feeds: BigInt(4),
        apiKey: null,
        isActive: true
      },
      {
        id: "oracle-4",
        name: "FlightAware",
        endpoint: "https://flightxml.flightaware.com",
        category: "Travel",
        status: "active",
        uptime: "98.5%",
        lastUpdate: BigInt(Date.now() * 1000000),
        feeds: BigInt(3),
        apiKey: null,
        isActive: true
      },
      {
        id: "oracle-5",
        name: "Sports Data",
        endpoint: "https://api.sportsdata.io",
        category: "Sports",
        status: "maintenance",
        uptime: "95.1%",
        lastUpdate: BigInt(Date.now() * 1000000),
        feeds: BigInt(2),
        apiKey: null,
        isActive: false
      },
      {
        id: "oracle-6",
        name: "News Sentiment",
        endpoint: "https://newsapi.org",
        category: "News",
        status: "active",
        uptime: "97.8%",
        lastUpdate: BigInt(Date.now() * 1000000),
        feeds: BigInt(2),
        apiKey: null,
        isActive: true
      }
    ];
  }
}

// Export singleton instance
export const bitStreamAPI = new BitStreamAPI();
