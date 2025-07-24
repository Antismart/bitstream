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
import _Cycles "mo:base/ExperimentalCycles";
import _Timer "mo:base/Timer";
import Float "mo:base/Float";
import Blob "mo:base/Blob";
import _Debug "mo:base/Debug";

actor PaymentStream {
    // HTTP Outcall Management Actor
    let ic : actor {
        http_request : HttpRequestArgs -> async HttpResponsePayload;
    } = actor "aaaaa-aa";

    // ckBTC Minter Canister ID (mainnet)
    private let _ckBTC_MINTER_CANISTER_ID = "mqygn-kiaaa-aaaar-qaadq-cai";
    
    // ckBTC Ledger Canister ID (mainnet) 
    private let _ckBTC_LEDGER_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";

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

    // Oracle Types
    type Oracle = {
        id: Text;
        name: Text;
        endpoint: Text;
        category: Text;
        status: Text;
        uptime: Text;
        lastUpdate: Time.Time;
        feeds: Nat;
        apiKey: ?Text;
        isActive: Bool;
    };

    // HTTP Outcall Types
    type HttpRequestArgs = {
        url : Text;
        max_response_bytes : ?Nat64;
        headers : [HttpHeader];
        body : ?[Nat8];
        method : HttpMethod;
        transform : ?TransformRawResponseFunction;
    };

    type HttpHeader = {
        name : Text;
        value : Text;
    };

    type HttpMethod = {
        #get;
        #post;
        #head;
    };

    type HttpResponsePayload = {
        status : Nat;
        headers : [HttpHeader];
        body : [Nat8];
    };

    type TransformRawResponseFunction = {
        function : shared query TransformRawResponse -> async HttpResponsePayload;
        context : Blob;
    };

    type TransformRawResponse = {
        status : Nat;
        body : [Nat8];
        headers : [HttpHeader];
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
    
    // Oracle Storage
    private stable var oracleEntries: [(Text, Oracle)] = [];
    private var oracles = HashMap.HashMap<Text, Oracle>(0, Text.equal, Text.hash);
    
    private stable var idCounter: Nat = 0;

    private func generateId(): Text {
        idCounter := idCounter + 1;
        Text.concat("stream-", Nat.toText(idCounter))
    };

    // Initialize default oracles
    private func initializeOracles() : () {
        let defaultOracles = [
            {
                id = "oracle-1";
                name = "CoinGecko";
                endpoint = "https://api.coingecko.com/api/v3";
                category = "Market Data";
                status = "active";
                uptime = "99.8%";
                lastUpdate = Time.now();
                feeds = 8;
                apiKey = null;
                isActive = true;
            },
            {
                id = "oracle-2";
                name = "GitHub API";
                endpoint = "https://api.github.com";
                category = "Development";
                status = "active";
                uptime = "99.9%";
                lastUpdate = Time.now();
                feeds = 5;
                apiKey = null;
                isActive = true;
            },
            {
                id = "oracle-3";
                name = "Weather API";
                endpoint = "https://api.openweathermap.org/data/2.5";
                category = "Weather";
                status = "active";
                uptime = "99.2%";
                lastUpdate = Time.now();
                feeds = 4;
                apiKey = null;
                isActive = true;
            }
        ];

        for (oracle in defaultOracles.vals()) {
            oracles.put(oracle.id, oracle);
        };
    };

    // Oracle Management Functions
    public query func getOracles(): async [Oracle] {
        Iter.toArray(oracles.vals())
    };

    public query func getOracle(oracleId: Text): async Result.Result<Oracle, Text> {
        switch (oracles.get(oracleId)) {
            case (?oracle) { #ok(oracle) };
            case null { #err("Oracle not found") };
        }
    };

    public shared(_msg) func addOracle(oracle: Oracle): async Result.Result<Text, Text> {
        if (oracle.name == "" or oracle.endpoint == "") {
            return #err("Missing required oracle fields");
        };

        oracles.put(oracle.id, oracle);
        #ok(oracle.id)
    };

    public shared(_msg) func updateOracleStatus(oracleId: Text, status: Text): async Result.Result<(), Text> {
        switch (oracles.get(oracleId)) {
            case (?oracle) {
                let updatedOracle = {
                    oracle with 
                    status = status;
                    lastUpdate = Time.now();
                };
                oracles.put(oracleId, updatedOracle);
                #ok(())
            };
            case null { #err("Oracle not found") };
        }
    };

    // HTTP Request Helper
    private func makeHttpRequest(url: Text): async Result.Result<Text, Text> {
        let request: HttpRequestArgs = {
            url = url;
            max_response_bytes = ?2048;
            headers = [];
            body = null;
            method = #get;
            transform = null;
        };

        try {
            let response = await ic.http_request(request);
            let responseText = switch (Text.decodeUtf8(Blob.fromArray(response.body))) {
                case (?text) { text };
                case null { "Invalid UTF-8 response" };
            };
            #ok(responseText)
        } catch (_error) {
            #err("HTTP request failed")
        }
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
                    
                    // Validate condition using oracle data
                    switch (await validateConditionWithOracle(condition)) {
                        case (#err(msg)) { return #err(msg) };
                        case (#ok(false)) { return #ok(false) };
                        case (#ok(true)) { /* continue */ };
                    };
                };
                #ok(true)
            };
            case null { #err("Stream not found") };
        }
    };

    // Validate individual condition with oracle
    private func validateConditionWithOracle(condition: Condition): async Result.Result<Bool, Text> {
        switch (oracles.get(condition.oracle)) {
            case (?oracle) {
                if (not oracle.isActive) {
                    return #err("Oracle is not active");
                };

                // Update oracle last access time
                let updatedOracle = {
                    oracle with 
                    lastUpdate = Time.now();
                };
                oracles.put(oracle.id, updatedOracle);

                // For market data oracles (like CoinGecko), check price conditions
                if (oracle.category == "Market Data") {
                    return await validateMarketCondition(condition, oracle);
                };

                // For weather oracles, check weather conditions
                if (oracle.category == "Weather") {
                    return await validateWeatherCondition(condition, oracle);
                };

                // For development oracles (like GitHub), check repository conditions
                if (oracle.category == "Development") {
                    return await validateDevelopmentCondition(condition, oracle);
                };

                // Default validation for other oracle types
                #ok(true)
            };
            case null { #err("Oracle not found") };
        }
    };

    // Market data validation (e.g., Bitcoin price)
    private func validateMarketCondition(condition: Condition, oracle: Oracle): async Result.Result<Bool, Text> {
        switch (condition.conditionType) {
            case ("price") {
                let url = oracle.endpoint # "/simple/price?ids=bitcoin&vs_currencies=usd";
                switch (await makeHttpRequest(url)) {
                    case (#ok(response)) {
                        // Simple price extraction (in production, use proper JSON parsing)
                        if (Text.contains(response, #text "bitcoin")) {
                            // Mock price validation - in production, parse JSON and compare
                            switch (condition.operator) {
                                case (">=") { #ok(true) };
                                case ("<=") { #ok(true) };
                                case ("==") { #ok(true) };
                                case (_) { #err("Invalid operator") };
                            }
                        } else {
                            #err("Failed to fetch price data")
                        }
                    };
                    case (#err(msg)) { #err(msg) };
                }
            };
            case (_) { #err("Unsupported market condition type") };
        }
    };

    // Weather condition validation
    private func validateWeatherCondition(condition: Condition, oracle: Oracle): async Result.Result<Bool, Text> {
        switch (condition.conditionType) {
            case ("temperature") {
                let url = oracle.endpoint # "/weather?q=London&appid=demo";
                switch (await makeHttpRequest(url)) {
                    case (#ok(_response)) {
                        // Mock weather validation - in production, parse weather data
                        #ok(true)
                    };
                    case (#err(msg)) { #err(msg) };
                }
            };
            case (_) { #err("Unsupported weather condition type") };
        }
    };

    // Development condition validation (e.g., GitHub repository stats)
    private func validateDevelopmentCondition(condition: Condition, oracle: Oracle): async Result.Result<Bool, Text> {
        switch (condition.conditionType) {
            case ("repository_stars") {
                let url = oracle.endpoint # "/repos/" # condition.value;
                switch (await makeHttpRequest(url)) {
                    case (#ok(_response)) {
                        // Mock GitHub validation - in production, parse repository data
                        #ok(true)
                    };
                    case (#err(msg)) { #err(msg) };
                }
            };
            case (_) { #err("Unsupported development condition type") };
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
        oracleEntries := Iter.toArray(oracles.entries());
    };

    system func postupgrade() {
        streams := HashMap.fromIter<Text, StreamConfig>(streamEntries.vals(), 0, Text.equal, Text.hash);
        streamEntries := [];
        
        oracles := HashMap.fromIter<Text, Oracle>(oracleEntries.vals(), 0, Text.equal, Text.hash);
        oracleEntries := [];
        
        // Initialize default oracles if none exist
        if (oracles.size() == 0) {
            initializeOracles();
        };
    };
};