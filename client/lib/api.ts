import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

// Types matching the Motoko backend
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
  maxAmount: string;
  failureHandling: string;
  notifications: boolean;
  creator: Principal;
  createdAt: bigint;
  status: string;
  lastExecution?: bigint;
  nextExecution?: bigint;
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
    'maxAmount': IDL.Text,
    'failureHandling': IDL.Text,
    'notifications': IDL.Bool,
    'creator': IDL.Principal,
    'createdAt': IDL.Int,
    'status': IDL.Text,
    'lastExecution': IDL.Opt(IDL.Int),
    'nextExecution': IDL.Opt(IDL.Int),
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
    'getUserBalance': IDL.Func([IDL.Principal], [UserBalance], []),
    'getStreamStats': IDL.Func([IDL.Principal], [StreamStats], ['query']),
    'getCkBTCInfo': IDL.Func([], [IDL.Variant({'ok': IDL.Record({'name': IDL.Text, 'symbol': IDL.Text, 'decimals': IDL.Nat8, 'fee': IDL.Nat}), 'err': IDL.Text})], []),
    'executePayment': IDL.Func([IDL.Text], [Result], []),
    'approveCanister': IDL.Func([IDL.Nat], [IDL.Variant({'ok': IDL.Nat, 'err': IDL.Text})], []),
    'getAllowance': IDL.Func([], [IDL.Nat], []),
    'getCanisterAddress': IDL.Func([], [IDL.Text], ['query']),
    'getCanisterBalance': IDL.Func([], [IDL.Nat], []),
  });
};

// Configuration following IC authentication best practices
const isDevelopment = false; // Force production mode for mainnet

// Network configuration
const DFX_NETWORK = "ic"; // Force IC network
const IC_HOST = "https://ic0.app"; // Force IC host

// Canister IDs - force to use the correct mainnet canister ID
const CANISTER_ID_SERVER = "35epn-uiaaa-aaaag-aufsq-cai";

// Internet Identity configuration - ALWAYS use production Internet Identity
const IDENTITY_PROVIDER = "https://identity.ic0.app";

// IdentityKit configuration
// No specific URL needed as IdentityKit handles wallet discovery

// Authentication configuration
const AUTH_MAX_TIME_TO_LIVE = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000); // 7 days in nanoseconds

// Wallet types - IdentityKit supports multiple wallets
export type WalletType = 'internet-identity' | 'identitykit';

class BitStreamAPI {
  private authClient: AuthClient | null = null;
  private identityKitProvider: any = null;
  private actor: any = null;
  private agent: HttpAgent | null = null;
  private identity: Identity | null = null;
  private currentWalletType: WalletType | null = null;

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

      // Create agent with proper configuration
      this.agent = await HttpAgent.create({
        host: IC_HOST,
        identity: this.identity || undefined,
        retryTimes: 3,
        verifyQuerySignatures: false // Disable for better compatibility with wallets
      });

      // Create actor for IC network
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: CANISTER_ID_SERVER,
      });

      console.log('BitStream API initialized successfully for IC mainnet');
    } catch (error) {
      console.error('Failed to initialize BitStream API:', error);
      console.log('API initialization failed - will show empty states');
      // Don't enable mock mode - let the UI show empty states instead
    }
  }

  async login(walletType: WalletType = 'internet-identity'): Promise<boolean> {
    if (walletType === 'internet-identity') {
      return this.loginWithInternetIdentity();
    } else if (walletType === 'identitykit') {
      return this.loginWithIdentityKit();
    }
    return false;
  }

  private async loginWithInternetIdentity(): Promise<boolean> {
    if (!this.authClient) await this.init();

    return new Promise((resolve) => {
      this.authClient!.login({
        identityProvider: IDENTITY_PROVIDER,
        maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
        windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
        onSuccess: async () => {
          console.log('Internet Identity login successful...');
          this.identity = this.authClient!.getIdentity();
          this.currentWalletType = 'internet-identity';
          console.log('New identity principal:', this.identity.getPrincipal().toString());
          await this.updateActor();
          resolve(true);
        },
        onError: (error) => {
          console.error("Internet Identity login error:", error);
          resolve(false);
        },
      });
    });
  }

  private async loginWithIdentityKit(): Promise<boolean> {
    try {
      console.log('Connecting with IdentityKit...');
      
      // This method will be implemented after we update the context to use IdentityKit
      // The actual connection logic will be handled by IdentityKit provider
      console.warn('IdentityKit connection should be handled by IdentityKitProvider');
      return false;
    } catch (error: any) {
      console.error('IdentityKit connection failed:', error);
      return false;
    }
  }

  async logout() {
    if (this.currentWalletType === 'internet-identity' && this.authClient) {
      await this.authClient.logout();
    } else if (this.currentWalletType === 'identitykit' && this.identityKitProvider) {
      // IdentityKit logout will be handled by the provider
      this.identityKitProvider = null;
    }
    
    this.identity = null;
    this.currentWalletType = null;
    await this.updateActor();
  }

  async isAuthenticated(): Promise<boolean> {
    if (this.currentWalletType === 'internet-identity') {
      if (!this.authClient) await this.init();
      return await this.authClient!.isAuthenticated();
    } else if (this.currentWalletType === 'identitykit') {
      return this.identityKitProvider !== null && this.identity !== null;
    }
    return false;
  }

  getWalletType(): WalletType | null {
    return this.currentWalletType;
  }

  async getPrincipal(): Promise<Principal | null> {
    if (!this.authClient) return null;
    if (!this.identity) {
      this.identity = this.authClient.getIdentity();
    }
    return this.identity.getPrincipal();
  }

  private async updateActor() {
    try {
      let currentIdentity = null;
      
      if (this.currentWalletType === 'internet-identity' && this.authClient) {
        if (await this.authClient.isAuthenticated()) {
          currentIdentity = this.authClient.getIdentity();
          console.log('Updating actor with Internet Identity:', currentIdentity.getPrincipal().toString());
        }
      } else if (this.currentWalletType === 'identitykit' && this.identity) {
        currentIdentity = this.identity;
        console.log('Updating actor with IdentityKit identity:', currentIdentity.getPrincipal().toString());
      }
      
      if (!currentIdentity) {
        console.log('Updating actor with anonymous identity');
      }

      this.agent = await HttpAgent.create({
        host: IC_HOST,
        identity: currentIdentity || undefined,
        retryTimes: 3,
        verifyQuerySignatures: false // Disable for better compatibility with wallets
      });

      // Create actor for IC mainnet
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: CANISTER_ID_SERVER,
      });
      
      console.log('Actor updated successfully');
    } catch (error) {
      console.error('Failed to update actor:', error);
      console.log('Actor update failed - API calls will fail gracefully');
    }
  }

  // Helper method to execute requests with retry logic and better error handling
  private async executeWithRetry<T>(operation: () => Promise<T>, operationName: string, maxRetries: number = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        console.error(`${operationName} attempt ${attempt} failed:`, error);
        
        // If it's an ingress_expiry error, try to refresh the agent
        if (error.message?.includes('ingress_expiry') && attempt < maxRetries) {
          console.log('Attempting to refresh agent due to ingress_expiry error...');
          try {
            await this.updateActor();
          } catch (updateError) {
            console.warn('Failed to update actor:', updateError);
          }
        }
        
        // If it's the last attempt or a non-retryable error, throw
        if (attempt === maxRetries || error.message?.includes('not supported by the signer')) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    throw new Error(`${operationName} failed after ${maxRetries} attempts`);
  }

  // API Methods
  async createStream(config: Omit<StreamConfig, 'id' | 'creator' | 'createdAt' | 'status' | 'lastExecution' | 'nextExecution'>): Promise<{ ok?: string; err?: string }> {
    if (!this.actor) await this.init();
    
    // Convert frontend types to backend types
    const backendConfig = {
      ...config,
      id: "", // Will be set by backend
      creator: Principal.anonymous(), // Will be set by backend
      createdAt: BigInt(0), // Will be set by backend
      status: "pending", // Will be set by backend
      lastExecution: [], // Empty array represents None/null for optional types
      nextExecution: [] // Empty array represents None/null for optional types
    };
    
    return await this.actor.createStream(backendConfig);
  }

  async getStream(streamId: string): Promise<{ ok?: StreamConfig; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.getStream(streamId);
  }

  async getUserStreams(): Promise<StreamConfig[]> {
    try {
      if (!this.actor) await this.init();
      const principal = await this.getPrincipal();
      if (!principal) return [];
      
      return await this.executeWithRetry(
        () => this.actor.getUserStreams(principal),
        'getUserStreams'
      );
    } catch (error) {
      console.error('Failed to fetch user streams:', error);
      return []; // Return empty array instead of mock data
    }
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
    try {
      if (!this.actor) await this.init();
      const principal = await this.getPrincipal();
      if (!principal) {
        return {
          overall: "0.00000000",
          available: "0.00000000",
          monthlyProfits: "0.00000000",
          monthly: "0.00000000"
        };
      }
      
      return await this.executeWithRetry(
        () => this.actor.getUserBalance(principal),
        'getUserBalance'
      );
    } catch (error) {
      console.error('Failed to fetch user balance:', error);
      return {
        overall: "0.00000000",
        available: "0.00000000",
        monthlyProfits: "0.00000000",
        monthly: "0.00000000"
      };
    }
  }

  async getStreamStats(): Promise<StreamStats> {
    try {
      if (!this.actor) await this.init();
      const principal = await this.getPrincipal();
      if (!principal) {
        return {
          totalStreams: BigInt(0),
          activeStreams: BigInt(0),
          totalVolume: "0.00000000",
          categories: []
        };
      }
      
      return await this.executeWithRetry(
        () => this.actor.getStreamStats(principal),
        'getStreamStats'
      );
    } catch (error) {
      console.error('Failed to fetch stream stats:', error);
      return {
        totalStreams: BigInt(0),
        activeStreams: BigInt(0),
        totalVolume: "0.00000000",
        categories: []
      };
    }
  }

  // ckBTC specific methods
  async getCkBTCInfo(): Promise<{ ok?: { name: string; symbol: string; decimals: number; fee: bigint }; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.getCkBTCInfo();
  }

  async executePayment(streamId: string): Promise<{ ok?: string; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.executePayment(streamId);
  }

  // Get canister address for deposits
  async getCanisterAddress(): Promise<string> {
    if (!this.actor) await this.init();
    return await this.actor.getCanisterAddress();
  }

  // Get canister balance
  async getCanisterBalance(): Promise<number> {
    try {
      if (!this.actor) await this.init();
      const balance = await this.actor.getCanisterBalance();
      return Number(balance);
    } catch (error) {
      console.error('Failed to fetch canister balance:', error);
      return 0;
    }
  }

  // Approve canister to spend ckBTC for automatic payments
  async approveCanister(amountSatoshis: number): Promise<{ ok?: number; err?: string }> {
    if (!this.actor) await this.init();
    return await this.actor.approveCanister(amountSatoshis);
  }

  // Get current allowance for the canister
  async getAllowance(): Promise<number> {
    try {
      if (!this.actor) await this.init();
      const allowance = await this.actor.getAllowance();
      return Number(allowance);
    } catch (error) {
      console.error('Failed to fetch allowance:', error);
      return 0;
    }
  }

}

// Export singleton instance
export const bitStreamAPI = new BitStreamAPI();
