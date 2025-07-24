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
  totalStreams: number;
  activeStreams: number;
  totalVolume: string;
  categories: [string, number][];
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

  return IDL.Service({
    'createStream': IDL.Func([StreamConfig], [Result], []),
    'getStream': IDL.Func([IDL.Text], [ResultStream], ['query']),
    'getUserStreams': IDL.Func([IDL.Principal], [IDL.Vec(StreamConfig)], ['query']),
    'getAllStreams': IDL.Func([], [IDL.Vec(StreamConfig)], ['query']),
    'updateStreamStatus': IDL.Func([IDL.Text, IDL.Text], [ResultVoid], []),
    'validateConditions': IDL.Func([IDL.Text], [ResultBool], []),
    'getUserBalance': IDL.Func([IDL.Principal], [UserBalance], ['query']),
    'getStreamStats': IDL.Func([IDL.Principal], [StreamStats], ['query']),
  });
};

// Configuration following IC authentication best practices
const isDevelopment = process.env.NODE_ENV !== 'production';

// Network configuration
const DFX_NETWORK = process.env.DFX_NETWORK || (isDevelopment ? "local" : "ic");
const IC_HOST = DFX_NETWORK === "local" ? "http://127.0.0.1:4943" : "https://icp-api.io";

// Canister IDs
const CANISTER_ID_SERVER = process.env.NEXT_PUBLIC_CANISTER_ID_SERVER || "rrkah-fqaaa-aaaaa-aaaaq-cai";

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

      // Fetch root key for local development
      if (DFX_NETWORK === "local") {
        try {
          console.log('Fetching root key for local development...');
          await this.agent.fetchRootKey();
          console.log('Root key fetched successfully');
        } catch (error) {
          console.warn('Failed to fetch root key, enabling mock mode:', error);
          this.mockMode = true;
        }
      }

      // Create actor if not in mock mode
      if (!this.mockMode) {
        this.actor = Actor.createActor(idlFactory, {
          agent: this.agent,
          canisterId: CANISTER_ID_SERVER,
        });
      }

      console.log('BitStream API initialized successfully', this.mockMode ? '(Mock Mode)' : '');
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

      if (DFX_NETWORK === "local") {
        await this.agent.fetchRootKey();
      }

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
      totalStreams: 2,
      activeStreams: 1,
      totalVolume: "45.321",
      categories: [["Housing", 1], ["Investment", 1]]
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
        totalStreams: 0,
        activeStreams: 0,
        totalVolume: "0",
        categories: []
      };
    }
    return await this.actor.getStreamStats(principal);
  }
}

// Export singleton instance
export const bitStreamAPI = new BitStreamAPI();
