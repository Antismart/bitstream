import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Cycles "mo:base/ExperimentalCycles";
import Timer "mo:base/Timer";
import Float "mo:base/Float";

actor PaymentStream {
    // ckBTC Minter Canister ID (mainnet)
    private let ckBTC_MINTER_CANISTER_ID = "mqygn-kiaaa-aaaar-qaadq-cai";
    
    // ckBTC Ledger Canister ID (mainnet) 
    private let ckBTC_LEDGER_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";

    // Bitcoin Integration Types
    type Satoshi = Nat64;
    type BitcoinAddress = Text;
    type BitcoinNetwork = { #mainnet; #testnet };
    
    // ckBTC Types
    type Account = { owner : Principal; subaccount : ?[Nat8] };
    type TransferArgs = {
        from_subaccount: ?[Nat8];
        to: Account;
        amount: Nat;
        fee: ?Nat;
        memo: ?[Nat8];
        created_at_time: ?Nat64;
    };
    
    type TransferResult = {
        #Ok: Nat;
        #Err: {
            #BadFee: { expected_fee: Nat };
            #BadBurn: { min_burn_amount: Nat };
            #InsufficientFunds: { balance: Nat };
            #TooOld;
            #CreatedInFuture: { ledger_time: Nat64 };
            #Duplicate: { duplicate_of: Nat };
            #TemporarilyUnavailable;
            #GenericError: { error_code: Nat; message: Text };
        };
    };

    type Condition = {
        id: Text;
        conditionType: Text;
        operator: Text;
        value: Text;
        oracle: Text;
    };

    type StreamConfig = {
        id: Text;
        name: Text;
        description: Text;
        category: Text;
        amount: Text;
        currency: Text;
        frequency: Text;
        startDate: Text;
        endDate: Text;
        recipientType: Text;
        recipientAddress: Text;
        recipientEmail: Text;
        conditions: [Condition];
        maxAmount: Text;
        failureHandling: Text;
        notifications: Bool;
        creator: Principal;
        createdAt: Time.Time;
        status: Text;
    };

    type UserBalance = {
        overall: Text;
        available: Text;
        monthlyProfits: Text;
        monthly: Text;
    };

    type StreamStats = {
        totalStreams: Nat;
        activeStreams: Nat;
        totalVolume: Text;
        categories: [(Text, Nat)];
    };

    private stable var streamEntries: [(Text, StreamConfig)] = [];
    private var streams = HashMap.HashMap<Text, StreamConfig>(0, Text.equal, Text.hash);
    private stable var idCounter: Nat = 0;

    private func generateId(): Text {
        idCounter := idCounter + 1;
        Text.concat("stream-", Nat.toText(idCounter))
    };

    public shared(msg) func createStream(config: StreamConfig): async Result.Result<Text, Text> {
        let streamId = generateId();
        let newStream: StreamConfig = {
            id = streamId;
            name = config.name;
            description = config.description;
            category = config.category;
            amount = config.amount;
            currency = config.currency;
            frequency = config.frequency;
            startDate = config.startDate;
            endDate = config.endDate;
            recipientType = config.recipientType;
            recipientAddress = config.recipientAddress;
            recipientEmail = config.recipientEmail;
            conditions = config.conditions;
            maxAmount = config.maxAmount;
            failureHandling = config.failureHandling;
            notifications = config.notifications;
            creator = msg.caller;
            createdAt = Time.now();
            status = "pending";
        };

        if (config.name == "" or config.category == "" or config.amount == "" or config.recipientType == "") {
            return #err("Missing required fields");
        };

        streams.put(streamId, newStream);
        #ok(streamId)
    };

    public query func getStream(streamId: Text): async Result.Result<StreamConfig, Text> {
        switch (streams.get(streamId)) {
            case (?stream) { #ok(stream) };
            case null { #err("Stream not found") };
        }
    };

    public query func getUserStreams(caller: Principal): async [StreamConfig] {
        let userStreams = Buffer.Buffer<StreamConfig>(0);
        for ((_, stream) in streams.entries()) {
            if (stream.creator == caller) {
                userStreams.add(stream);
            };
        };
        Buffer.toArray(userStreams)
    };

    public shared(msg) func updateStreamStatus(streamId: Text, status: Text): async Result.Result<(), Text> {
        switch (streams.get(streamId)) {
            case (?stream) {
                if (stream.creator != msg.caller) {
                    return #err("Unauthorized");
                };
                let updatedStream: StreamConfig = {
                    id = stream.id;
                    name = stream.name;
                    description = stream.description;
                    category = stream.category;
                    amount = stream.amount;
                    currency = stream.currency;
                    frequency = stream.frequency;
                    startDate = stream.startDate;
                    endDate = stream.endDate;
                    recipientType = stream.recipientType;
                    recipientAddress = stream.recipientAddress;
                    recipientEmail = stream.recipientEmail;
                    conditions = stream.conditions;
                    maxAmount = stream.maxAmount;
                    failureHandling = stream.failureHandling;
                    notifications = stream.notifications;
                    creator = stream.creator;
                    createdAt = stream.createdAt;
                    status = status;
                };
                streams.put(streamId, updatedStream);
                #ok(())
            };
            case null { #err("Stream not found") };
        }
    };

    public shared func validateConditions(streamId: Text): async Result.Result<Bool, Text> {
        switch (streams.get(streamId)) {
            case (?stream) {
                for (condition in stream.conditions.vals()) {
                    if (condition.oracle == "") {
                        return #err("Invalid oracle");
                    };
                };
                #ok(true)
            };
            case null { #err("Stream not found") };
        }
    };

    public query func getUserBalance(caller: Principal): async UserBalance {
        // In production, integrate with ckBTC ledger to get real balance
        // For now, returning enhanced mock data with user-specific calculations
        let userStreams = Buffer.Buffer<StreamConfig>(0);
        var totalStreamAmount: Float = 0.0;
        
        for ((_, stream) in streams.entries()) {
            if (stream.creator == caller) {
                userStreams.add(stream);
                // Parse amount and add to total (simplified parsing for demo)
                // In production, would use proper decimal parsing
                let amountText = stream.amount;
                if (Text.size(amountText) > 0) {
                    totalStreamAmount += 0.1; // Simplified - add fixed amount per stream
                };
            };
        };

        // Calculate realistic balances based on user activity
        let baseBalance: Float = 2.513;
        let streamReserved = totalStreamAmount * 0.1; // Reserve 10% for active streams
        let available = baseBalance - streamReserved;
        
        {
            overall = Float.toText(baseBalance + totalStreamAmount * 0.05);
            available = Float.toText(if (available > 0) available else 0.1);
            monthlyProfits = Float.toText(totalStreamAmount * 0.025);
            monthly = Float.toText(totalStreamAmount * 0.08);
        }
    };

    public query func getStreamStats(caller: Principal): async StreamStats {
        let userStreams = Buffer.Buffer<StreamConfig>(0);
        let categoryCount = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);
        
        for ((_, stream) in streams.entries()) {
            if (stream.creator == caller) {
                userStreams.add(stream);
                
                // Count categories
                switch (categoryCount.get(stream.category)) {
                    case (?count) { categoryCount.put(stream.category, count + 1) };
                    case null { categoryCount.put(stream.category, 1) };
                };
            };
        };

        let activeCount = Buffer.toArray(userStreams) |> Array.filter(_, func(s: StreamConfig): Bool { s.status == "active" }) |> Array.size(_);
        
        {
            totalStreams = userStreams.size();
            activeStreams = activeCount;
            totalVolume = "45.321"; // Mock data
            categories = Iter.toArray(categoryCount.entries());
        }
    };

    public query func getAllStreams(): async [StreamConfig] {
        Iter.toArray(streams.vals())
    };

    // Bitcoin integration functions for future implementation
    public func getBitcoinAddress(_caller: Principal): async Result.Result<Text, Text> {
        // This would integrate with ckBTC minter to get real Bitcoin address
        // For now, returning mock address
        #ok("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")
    };

    public shared(msg) func executePayment(streamId: Text, amount: Nat64): async Result.Result<Text, Text> {
        switch (streams.get(streamId)) {
            case (?stream) {
                if (stream.creator != msg.caller) {
                    return #err("Unauthorized");
                };
                
                // In production, this would:
                // 1. Check ckBTC balance
                // 2. Validate conditions via oracles
                // 3. Execute transfer via ckBTC ledger
                // 4. Update stream status
                
                // For now, simulate successful payment
                #ok("payment-tx-" # Nat64.toText(amount))
            };
            case null { #err("Stream not found") };
        }
    };

    system func preupgrade() {
        streamEntries := Iter.toArray(streams.entries());
    };

    system func postupgrade() {
        streams := HashMap.fromIter<Text, StreamConfig>(streamEntries.vals(), 0, Text.equal, Text.hash);
        streamEntries := [];
    };
};