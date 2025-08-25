import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import _Cycles "mo:base/ExperimentalCycles";
import _Timer "mo:base/Timer";
import Float "mo:base/Float";
import Blob "mo:base/Blob";
import _Debug "mo:base/Debug";

persistent actor PaymentStream {

    // ckBTC Ledger Canister ID (mainnet) 
    private transient let ckBTC_LEDGER_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";
    
    // ckBTC Minter Canister ID (mainnet) - for future use
    private transient let _ckBTC_MINTER_CANISTER_ID = "mqygn-kiaaa-aaaar-qaadq-cai";

    // ICRC-1 Standard Types for ckBTC
    type Account = { owner : Principal; subaccount : ?Blob };
    type Subaccount = Blob;
    type Tokens = Nat;
    type Memo = Blob;
    type Timestamp = Nat64;
    
    // ICRC-1 Transfer Arguments
    type TransferArgs = {
        from_subaccount: ?Subaccount;
        to: Account;
        amount: Tokens;
        fee: ?Tokens;
        memo: ?Memo;
        created_at_time: ?Timestamp;
    };
    
    // ICRC-1 Transfer Result
    type TransferResult = {
        #Ok: Nat;
        #Err: TransferError;
    };
    
    type TransferError = {
        #BadFee: { expected_fee: Tokens };
        #BadBurn: { min_burn_amount: Tokens };
        #InsufficientFunds: { balance: Tokens };
        #TooOld;
        #CreatedInFuture: { ledger_time: Timestamp };
        #Duplicate: { duplicate_of: Nat };
        #TemporarilyUnavailable;
        #GenericError: { error_code: Nat; message: Text };
    };

    // ICRC-2 Approve Arguments
    type ApproveArgs = {
        from_subaccount: ?Subaccount;
        spender: Account;
        amount: Tokens;
        expected_allowance: ?Tokens;
        expires_at: ?Timestamp;
        fee: ?Tokens;
        memo: ?Memo;
        created_at_time: ?Timestamp;
    };

    // ICRC-2 Approve Result
    type ApproveResult = {
        #Ok: Nat;
        #Err: ApproveError;
    };

    type ApproveError = {
        #BadFee: { expected_fee: Tokens };
        #InsufficientFunds: { balance: Tokens };
        #AllowanceChanged: { current_allowance: Tokens };
        #Expired: { ledger_time: Timestamp };
        #TooOld;
        #CreatedInFuture: { ledger_time: Timestamp };
        #Duplicate: { duplicate_of: Nat };
        #TemporarilyUnavailable;
        #GenericError: { error_code: Nat; message: Text };
    };

    // ICRC-2 Transfer From Arguments
    type TransferFromArgs = {
        spender_subaccount: ?Subaccount;
        from: Account;
        to: Account;
        amount: Tokens;
        fee: ?Tokens;
        memo: ?Memo;
        created_at_time: ?Timestamp;
    };

    // ICRC-2 Transfer From Result
    type TransferFromResult = {
        #Ok: Nat;
        #Err: TransferFromError;
    };

    type TransferFromError = {
        #BadFee: { expected_fee: Tokens };
        #BadBurn: { min_burn_amount: Tokens };
        #InsufficientFunds: { balance: Tokens };
        #InsufficientAllowance: { allowance: Tokens };
        #TooOld;
        #CreatedInFuture: { ledger_time: Timestamp };
        #Duplicate: { duplicate_of: Nat };
        #TemporarilyUnavailable;
        #GenericError: { error_code: Nat; message: Text };
    };

    // ckBTC Ledger Interface (ICRC-1 + ICRC-2 Standards)
    type LedgerInterface = actor {
        // ICRC-1 methods
        icrc1_transfer : (TransferArgs) -> async TransferResult;
        icrc1_balance_of : (Account) -> async Tokens;
        icrc1_fee : () -> async Tokens;
        icrc1_decimals : () -> async Nat8;
        icrc1_name : () -> async Text;
        icrc1_symbol : () -> async Text;
        
        // ICRC-2 methods for approvals
        icrc2_approve : (ApproveArgs) -> async ApproveResult;
        icrc2_transfer_from : (TransferFromArgs) -> async TransferFromResult;
        icrc2_allowance : (Account, Account) -> async Tokens;
    };
    
    // Reference to ckBTC Ledger
    private transient let ckBTC_Ledger : LedgerInterface = actor(ckBTC_LEDGER_CANISTER_ID);



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
        maxAmount: Text;
        failureHandling: Text;
        notifications: Bool;
        creator: Principal;
        createdAt: Time.Time;
        status: Text;
        lastExecution: ?Time.Time;
        nextExecution: ?Time.Time;
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

    // ICRC-10 and ICRC-28 Standards Support for IdentityKit
    type SupportedStandard = {
        url: Text;
        name: Text;
    };

    type Icrc28TrustedOriginsResponse = {
        trusted_origins: [Text];
    };

    // Legacy Oracle type for migration compatibility
    type LegacyOracle = {
        id: Text;
        name: Text;
        url: Text;
        description: ?Text;
        category: ?Text;
        status: ?Text;
    };
    
    // Migration for removed oracle entries (kept for compatibility)
    private var oracleEntries: [(Text, LegacyOracle)] = [];
    
    private var streamEntries: [(Text, StreamConfig)] = [];
    private transient var streams = HashMap.HashMap<Text, StreamConfig>(0, Text.equal, Text.hash);
    
    private var idCounter: Nat = 0;
    private var timerEntries: [(Text, Nat)] = [];
    private transient var timers = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);
    
    // Frequency intervals in nanoseconds
    private func getFrequencyInterval(frequency: Text): Nat {
        switch (frequency) {
            case ("daily") { 24 * 60 * 60 * 1_000_000_000 }; // 24 hours
            case ("weekly") { 7 * 24 * 60 * 60 * 1_000_000_000 }; // 7 days
            case ("monthly") { 30 * 24 * 60 * 60 * 1_000_000_000 }; // 30 days
            case ("quarterly") { 90 * 24 * 60 * 60 * 1_000_000_000 }; // 90 days
            case (_) { 24 * 60 * 60 * 1_000_000_000 }; // default to daily
        }
    };
    
    private func calculateNextExecution(frequency: Text, startTime: Time.Time): Time.Time {
        let interval = getFrequencyInterval(frequency);
        startTime + interval
    };

    private func generateId(): Text {
        idCounter := idCounter + 1;
        Text.concat("stream-", Nat.toText(idCounter))
    };



    public shared(msg) func createStream(config: StreamConfig): async Result.Result<Text, Text> {
        let streamId = generateId();
        let now = Time.now();
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
            maxAmount = config.maxAmount;
            failureHandling = config.failureHandling;
            notifications = config.notifications;
            creator = msg.caller;
            createdAt = now;
            status = "pending";
            lastExecution = null;
            nextExecution = ?calculateNextExecution(config.frequency, now);
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
                    maxAmount = stream.maxAmount;
                    failureHandling = stream.failureHandling;
                    notifications = stream.notifications;
                    creator = stream.creator;
                    createdAt = stream.createdAt;
                    status = status;
                    lastExecution = stream.lastExecution;
                    nextExecution = stream.nextExecution;
                };
                streams.put(streamId, updatedStream);
                
                // Start or stop timer based on status
                if (status == "active") {
                    startStreamTimer<system>(streamId);
                } else {
                    stopStreamTimer(streamId);
                };
                // streams.put call is now handled above
                #ok(())
            };
            case null { #err("Stream not found") };
        }
    };
    
    // Timer management functions  
    private func startStreamTimer<system>(streamId: Text) {
        switch (streams.get(streamId)) {
            case (?stream) {
                if (stream.status == "active") {
                    let interval = getFrequencyInterval(stream.frequency);
                    let timerId = _Timer.recurringTimer<system>(#nanoseconds(interval), func () : async () {
                        await executeAutomaticPayment(streamId);
                    });
                    timers.put(streamId, timerId);
                };
            };
            case null { /* Stream not found */ };
        };
    };
    
    private func stopStreamTimer(streamId: Text) {
        switch (timers.get(streamId)) {
            case (?timerId) {
                _Timer.cancelTimer(timerId);
                timers.delete(streamId);
            };
            case null { /* No timer found */ };
        };
    };
    
    private func executeAutomaticPayment(streamId: Text): async () {
        switch (streams.get(streamId)) {
            case (?stream) {
                if (stream.status == "active") {
                    let now = Time.now();
                    
                    // Check if it's time to execute
                    switch (stream.nextExecution) {
                        case (?nextTime) {
                            if (now >= nextTime) {
                                // Execute payment
                                try {
                                    let _result = await internalExecutePayment(stream);
                                    
                                    // Update stream with execution time
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
                                        maxAmount = stream.maxAmount;
                                        failureHandling = stream.failureHandling;
                                        notifications = stream.notifications;
                                        creator = stream.creator;
                                        createdAt = stream.createdAt;
                                        status = stream.status;
                                        lastExecution = ?now;
                                        nextExecution = ?calculateNextExecution(stream.frequency, now);
                                    };
                                    streams.put(streamId, updatedStream);
                                } catch (_error) {
                                    // Handle payment failure based on failureHandling setting
                                    if (stream.failureHandling == "pause") {
                                        ignore updateStreamStatus(streamId, "paused");
                                    };
                                };
                            };
                        };
                        case null { /* No next execution time set */ };
                    };
                };
            };
            case null { /* Stream not found */ };
        };
    };

    // Legacy function - conditions feature removed
    public shared func validateConditions(streamId: Text): async Result.Result<Bool, Text> {
        switch (streams.get(streamId)) {
            case (?stream) {
                // Conditions feature removed - always return true for compatibility
                #ok(true)
            };
            case null { #err("Stream not found") };
        }
    };

    // Get user's actual ckBTC balance from the ledger
    public func getUserBalance(caller: Principal): async UserBalance {
        try {
            // Create account for the user
            let userAccount : Account = {
                owner = caller;
                subaccount = null;
            };
            
            // Get actual ckBTC balance from ledger
            let actualBalance = await ckBTC_Ledger.icrc1_balance_of(userAccount);
            let ledgerFee = await ckBTC_Ledger.icrc1_fee();
            let _decimals = await ckBTC_Ledger.icrc1_decimals();
            
            // Convert from smallest unit (satoshis) to BTC
            // ckBTC has 8 decimals, so divide by 100_000_000
            let balanceInBTC = Float.fromInt(actualBalance) / 100_000_000.0;
            let feeInBTC = Float.fromInt(ledgerFee) / 100_000_000.0;
            
            // Calculate reserved amount for active streams
            let userStreams = Buffer.Buffer<StreamConfig>(0);
            var totalReservedSatoshis: Nat = 0;
            
            for ((_, stream) in streams.entries()) {
                if (stream.creator == caller and stream.status == "active") {
                    userStreams.add(stream);
                    // Parse actual stream amount using our proper conversion function
                    let streamSatoshis = _textToBTCAmount(stream.amount);
                    totalReservedSatoshis += streamSatoshis;
                };
            };
            
            // Convert reserved satoshis to BTC for calculation
            let totalReserved = Float.fromInt(totalReservedSatoshis) / 100_000_000.0;
            
            // Calculate available balance (total - reserved - fees for active streams)
            let feesForActiveStreams = feeInBTC * Float.fromInt(userStreams.size());
            let available = balanceInBTC - totalReserved - feesForActiveStreams;
            let availableBalance = if (available > 0.0) available else 0.0;
            
            // Calculate monthly estimates based on active streams
            let monthlyTotal = totalReserved; // Assume monthly frequency for simplicity
            let monthlyProfits = monthlyTotal * 0.02; // 2% estimated gains
            
            {
                overall = Float.toText(balanceInBTC);
                available = Float.toText(availableBalance);
                monthlyProfits = Float.toText(monthlyProfits);
                monthly = Float.toText(monthlyTotal);
            }
        } catch (_error) {
            // Return zero balances when ledger call fails
            {
                overall = "0.00000000";
                available = "0.00000000";
                monthlyProfits = "0.00000000";
                monthly = "0.00000000";
            }
        }
    };

    public query func getStreamStats(caller: Principal): async StreamStats {
        let userStreams = Buffer.Buffer<StreamConfig>(0);
        let categoryCount = HashMap.HashMap<Text, Nat>(0, Text.equal, Text.hash);
        var totalVolumeFloat: Float = 0.0;
        
        for ((_, stream) in streams.entries()) {
            if (stream.creator == caller) {
                userStreams.add(stream);
                
                // Count categories
                switch (categoryCount.get(stream.category)) {
                    case (?count) { categoryCount.put(stream.category, count + 1) };
                    case null { categoryCount.put(stream.category, 1) };
                };
                
                // Calculate total volume from actual stream amounts
                // Parse stream amount and add to total (simplified parsing)
                let amountSize = Text.size(stream.amount);
                if (amountSize > 0) {
                    // Basic parsing for common amounts - in production would use proper decimal parsing
                    switch (stream.amount) {
                        case ("0.001") { totalVolumeFloat += 0.001 };
                        case ("0.01") { totalVolumeFloat += 0.01 };
                        case ("0.1") { totalVolumeFloat += 0.1 };
                        case ("1.0" or "1") { totalVolumeFloat += 1.0 };
                        case (_) { totalVolumeFloat += 0.001 }; // Default small amount
                    };
                };
            };
        };

        let activeCount = Buffer.toArray(userStreams) |> Array.filter(_, func(s: StreamConfig): Bool { s.status == "active" }) |> Array.size(_);
        
        {
            totalStreams = userStreams.size();
            activeStreams = activeCount;
            totalVolume = Float.toText(totalVolumeFloat);
            categories = Iter.toArray(categoryCount.entries());
        }
    };

    public query func getAllStreams(): async [StreamConfig] {
        Iter.toArray(streams.vals())
    };


    // Get ckBTC ledger information
    public func getCkBTCInfo(): async Result.Result<{name: Text; symbol: Text; decimals: Nat8; fee: Nat}, Text> {
        try {
            let name = await ckBTC_Ledger.icrc1_name();
            let symbol = await ckBTC_Ledger.icrc1_symbol();
            let _decimals = await ckBTC_Ledger.icrc1_decimals();
            let fee = await ckBTC_Ledger.icrc1_fee();
            
            #ok({
                name = name;
                symbol = symbol;
                decimals = _decimals;
                fee = fee;
            })
        } catch (_error) {
            #err("Failed to fetch ckBTC info")
        }
    };
    
    // Bitcoin integration functions for future implementation
    public func getBitcoinAddress(_caller: Principal): async Result.Result<Text, Text> {
        // This would integrate with ckBTC minter to get real Bitcoin address
        // For now, returning mock address
        #ok("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")
    };

    // Simple payment execution that uses canister balance (IC-POS style)
    private func internalExecutePayment(stream: StreamConfig): async Result.Result<Text, Text> {
        try {
            // Parse amount from stream (convert BTC to satoshis)
            let amountInSatoshis = _textToBTCAmount(stream.amount);
            let fee = await ckBTC_Ledger.icrc1_fee();
            
            // Create user account (sender)
            let userAccount : Account = {
                owner = stream.creator;
                subaccount = null;
            };
            
            // Check user's allowance for this canister
            let canisterPrincipal = Principal.fromActor(PaymentStream);
            let allowanceArgs = (userAccount, { owner = canisterPrincipal; subaccount = null });
            
            let allowance = await ckBTC_Ledger.icrc2_allowance(allowanceArgs);
            
            // Check if allowance is sufficient
            let totalRequired = amountInSatoshis + fee;
            if (allowance < totalRequired) {
                return #err("Insufficient allowance. Required: " # Nat.toText(totalRequired) # " satoshis (amount + fee). Current allowance: " # Nat.toText(allowance) # " satoshis. Please approve more funds for automatic payments.");
            };
            
            // Check user's balance
            let userBalance = await ckBTC_Ledger.icrc1_balance_of(userAccount);
            if (userBalance < totalRequired) {
                return #err("Insufficient user balance. Required: " # Nat.toText(totalRequired) # " satoshis. Current balance: " # Nat.toText(userBalance) # " satoshis.");
            };
            
            // Parse recipient address/principal
            let recipientAccount = switch (stream.recipientType) {
                case ("address") {
                    try {
                        let recipientPrincipal = Principal.fromText(stream.recipientAddress);
                        { owner = recipientPrincipal; subaccount = null };
                    } catch (_error) {
                        return #err("Invalid recipient principal");
                    };
                };
                case ("email") {
                    return #err("Email recipients not yet supported");
                };
                case (_) {
                    return #err("Invalid recipient type");
                };
            };
            
            // Execute transfer_from (user -> recipient via canister)
            let transferFromArgs : TransferFromArgs = {
                spender_subaccount = null;
                from = userAccount;
                to = recipientAccount;
                amount = amountInSatoshis;
                fee = ?fee;
                memo = ?Text.encodeUtf8("BitStream payment: " # stream.name);
                created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
            };
            
            let result = await ckBTC_Ledger.icrc2_transfer_from(transferFromArgs);
            
            switch (result) {
                case (#Ok(blockIndex)) {
                    #ok("payment-block-" # Nat.toText(blockIndex));
                };
                case (#Err(error)) {
                    let errorMsg = switch (error) {
                        case (#BadFee(fee)) { "Bad fee, expected: " # Nat.toText(fee.expected_fee) };
                        case (#InsufficientFunds(balance)) { "Insufficient funds in user account, balance: " # Nat.toText(balance.balance) };
                        case (#InsufficientAllowance(allowance)) { "Insufficient allowance, current: " # Nat.toText(allowance.allowance) };
                        case (#TooOld) { "Transfer too old" };
                        case (#CreatedInFuture(_)) { "Transfer created in future" };
                        case (#Duplicate(_)) { "Duplicate transfer" };
                        case (#TemporarilyUnavailable) { "Ledger temporarily unavailable" };
                        case (#GenericError(err)) { "Generic error: " # err.message };
                        case (_) { "Unknown transfer error" };
                    };
                    #err("Transfer failed: " # errorMsg);
                };
            };
        } catch (_error) {
            #err("Payment execution failed");
        };
    };

    // Helper function to approve the canister to spend user's ckBTC
    public shared(msg) func approveCanister(amount: Nat): async Result.Result<Nat, Text> {
        try {
            let canisterPrincipal = Principal.fromActor(PaymentStream);
            let approveArgs : ApproveArgs = {
                from_subaccount = null;
                spender = { owner = canisterPrincipal; subaccount = null };
                amount = amount;
                expected_allowance = null;
                expires_at = null;
                fee = null;
                memo = ?Text.encodeUtf8("BitStream payment approval");
                created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
            };
            
            let result = await ckBTC_Ledger.icrc2_approve(approveArgs);
            
            switch (result) {
                case (#Ok(blockIndex)) {
                    #ok(blockIndex);
                };
                case (#Err(error)) {
                    let errorMsg = switch (error) {
                        case (#BadFee(fee)) { "Bad fee, expected: " # Nat.toText(fee.expected_fee) };
                        case (#InsufficientFunds(balance)) { "Insufficient funds, balance: " # Nat.toText(balance.balance) };
                        case (#AllowanceChanged(allowance)) { "Allowance changed, current: " # Nat.toText(allowance.current_allowance) };
                        case (#Expired(expired)) { "Approval expired at: " # Nat64.toText(expired.ledger_time) };
                        case (#TooOld) { "Approval too old" };
                        case (#CreatedInFuture(_)) { "Approval created in future" };
                        case (#Duplicate(_)) { "Duplicate approval" };
                        case (#TemporarilyUnavailable) { "Ledger temporarily unavailable" };
                        case (#GenericError(err)) { "Generic error: " # err.message };
                        case (_) { "Unknown approval error" };
                    };
                    #err("Approval failed: " # errorMsg);
                };
            };
        } catch (_error) {
            #err("Approval execution failed");
        };
    };

    // Get current allowance for the canister
    public shared(msg) func getAllowance(): async Nat {
        try {
            let userAccount : Account = {
                owner = msg.caller;
                subaccount = null;
            };
            let canisterPrincipal = Principal.fromActor(PaymentStream);
            let allowanceArgs = (userAccount, { owner = canisterPrincipal; subaccount = null });
            
            let allowance = await ckBTC_Ledger.icrc2_allowance(allowanceArgs);
            allowance
        } catch (_error) {
            0
        };
    };

    // Get canister's ckBTC address for deposits
    public query func getCanisterAddress(): async Text {
        let canisterPrincipal = Principal.fromActor(PaymentStream);
        Principal.toText(canisterPrincipal)
    };
    
    // Get canister's current ckBTC balance
    public func getCanisterBalance(): async Nat {
        try {
            let canisterAccount : Account = {
                owner = Principal.fromActor(PaymentStream);
                subaccount = null;
            };
            await ckBTC_Ledger.icrc1_balance_of(canisterAccount)
        } catch (_error) {
            0
        }
    };

    // Execute a payment stream transfer using ckBTC
    public shared(msg) func executePayment(streamId: Text): async Result.Result<Text, Text> {
        switch (streams.get(streamId)) {
            case (?stream) {
                if (stream.creator != msg.caller) {
                    return #err("Unauthorized");
                };
                
                if (stream.status != "active") {
                    return #err("Stream not active");
                };
                
                // Use the internal execution function
                await internalExecutePayment(stream);
            };
            case null { #err("Stream not found") };
        }
    };
    
    // Helper function to convert BTC text to satoshis (smallest unit)
    private func _textToBTCAmount(amountText: Text): Nat {
        // Convert BTC string to satoshis (multiply by 100,000,000)
        let size = Text.size(amountText);
        if (size == 0) {
            return 0;
        };
        
        // Parse decimal amount and convert to satoshis
        // This handles amounts like "0.00000645" properly
        let chars = Text.toArray(amountText);
        var beforeDecimal: Nat = 0;
        var afterDecimal: Nat = 0;
        var decimalPlaces: Nat = 0;
        var foundDecimal = false;
        
        for (char in chars.vals()) {
            switch (char) {
                case ('.') {
                    foundDecimal := true;
                };
                case ('0') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10;
                    };
                };
                case ('1') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10 + 1;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10 + 1;
                    };
                };
                case ('2') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10 + 2;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10 + 2;
                    };
                };
                case ('3') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10 + 3;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10 + 3;
                    };
                };
                case ('4') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10 + 4;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10 + 4;
                    };
                };
                case ('5') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10 + 5;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10 + 5;
                    };
                };
                case ('6') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10 + 6;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10 + 6;
                    };
                };
                case ('7') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10 + 7;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10 + 7;
                    };
                };
                case ('8') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10 + 8;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10 + 8;
                    };
                };
                case ('9') {
                    if (foundDecimal) {
                        afterDecimal := afterDecimal * 10 + 9;
                        decimalPlaces += 1;
                    } else {
                        beforeDecimal := beforeDecimal * 10 + 9;
                    };
                };
                case (_) { /* Ignore other characters */ };
            };
        };
        
        // Convert to satoshis: BTC * 100,000,000
        let beforeDecimalSatoshis = beforeDecimal * 100_000_000;
        
        // Handle decimal places (pad or truncate to 8 decimal places)
        var afterDecimalSatoshis = afterDecimal;
        if (decimalPlaces < 8) {
            // Pad with zeros using manual multiplication
            let zerosToAdd = 8 - decimalPlaces;
            for (i in Iter.range(0, zerosToAdd - 1)) {
                afterDecimalSatoshis *= 10;
            };
        } else if (decimalPlaces > 8) {
            // Truncate extra decimal places using manual division
            let placesToRemove = decimalPlaces - 8;
            for (i in Iter.range(0, placesToRemove - 1)) {
                afterDecimalSatoshis /= 10;
            };
        };
        
        beforeDecimalSatoshis + afterDecimalSatoshis
    };

    // ICRC-10 Standards Support - Required for IdentityKit
    public query func icrc10_supported_standards(): async [SupportedStandard] {
        [
            {
                url = "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-10/ICRC-10.md";
                name = "ICRC-10";
            },
            {
                url = "https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_28_trusted_origins.md";
                name = "ICRC-28";
            }
        ]
    };

    // ICRC-28 Trusted Origins - Required for IdentityKit wallet authentication
    public func icrc28_trusted_origins(): async Icrc28TrustedOriginsResponse {
        let trusted_origins = [
            // IC App URLs (replace with your actual frontend canister ID when deployed)
            "https://rdmx6-jaaaa-aaaah-qdrya-cai.icp0.io",
            "https://rdmx6-jaaaa-aaaah-qdrya-cai.raw.icp0.io", 
            "https://rdmx6-jaaaa-aaaah-qdrya-cai.ic0.app",
            "https://rdmx6-jaaaa-aaaah-qdrya-cai.raw.ic0.app",
            "https://rdmx6-jaaaa-aaaah-qdrya-cai.icp0.icp-api.io",
            "https://rdmx6-jaaaa-aaaah-qdrya-cai.icp-api.io",
            // Local development
            "http://localhost:3000",
            "http://localhost:8080",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8080",
            // Any custom domains you might use
            "https://bitstream.app",
            "https://www.bitstream.app"
        ];
        
        {
            trusted_origins = trusted_origins;
        }
    };

    system func preupgrade() {
        streamEntries := Iter.toArray(streams.entries());
        timerEntries := Iter.toArray(timers.entries());
    };

    system func postupgrade() {
        streams := HashMap.fromIter<Text, StreamConfig>(streamEntries.vals(), 0, Text.equal, Text.hash);
        timers := HashMap.fromIter<Text, Nat>(timerEntries.vals(), 0, Text.equal, Text.hash);
        streamEntries := [];
        timerEntries := [];
        
        // Restart timers for active streams
        for ((streamId, stream) in streams.entries()) {
            if (stream.status == "active") {
                startStreamTimer<system>(streamId);
            };
        };
        
        // Clear oracle entries after migration (data will be discarded)
        oracleEntries := [];
    };
};