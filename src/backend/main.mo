import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserId = Nat;
  type ProductId = Nat;
  type Mobile = Text;
  type TxId = Nat;
  type WithdrawalId = Nat;
  type OTP = Text;

  type UserRole = {
    #admin;
    #user;
  };

  type User = {
    userId : UserId;
    name : Text;
    mobile : Mobile;
    referralCode : Text;
    sponsorId : ?UserId;
    leftChildId : ?UserId;
    rightChildId : ?UserId;
    isActive : Bool;
    joinDate : Int;
    walletBalance : Float;
    role : UserRole;
    principal : ?Principal;
  };

  type Product = {
    productId : ProductId;
    name : Text;
    description : Text;
    price : Float;
    isActive : Bool;
  };

  type Transaction = {
    txId : TxId;
    userId : UserId;
    txType : Text;
    amount : Float;
    fromUserId : ?UserId;
    level : ?Nat;
    timestamp : Int;
    status : Text;
    note : Text;
  };

  type WithdrawalRequest = {
    reqId : WithdrawalId;
    userId : UserId;
    amount : Float;
    bankName : Text;
    accountNumber : Text;
    ifscCode : Text;
    upiId : Text;
    status : Text;
    requestDate : Int;
    processedDate : ?Int;
    adminNote : Text;
  };

  type OTPRecord = {
    mobile : Mobile;
    otp : OTP;
    expiresAt : Int;
    isUsed : Bool;
  };

  public type UserProfile = {
    userId : UserId;
    name : Text;
    mobile : Mobile;
    referralCode : Text;
    isActive : Bool;
    walletBalance : Float;
  };

  module User {
    public func compareByReferralCode(user1 : User, user2 : User) : Order.Order {
      Text.compare(user1.referralCode, user2.referralCode);
    };

    public func compareByMobile(user1 : User, user2 : User) : Order.Order {
      Text.compare(user1.mobile, user2.mobile);
    };

    public func compareByName(user1 : User, user2 : User) : Order.Order {
      Text.compare(user1.name, user2.name);
    };
  };

  let users = Map.empty<UserId, User>();
  let usersByMobile = Map.empty<Mobile, UserId>();
  let usersByReferralCode = Map.empty<Text, UserId>();
  let principalToUserId = Map.empty<Principal, UserId>();
  let products = Map.empty<ProductId, Product>();
  let transactions = Map.empty<TxId, Transaction>();
  let withdrawalRequests = Map.empty<WithdrawalId, WithdrawalRequest>();
  let otpRecords = Map.empty<Text, OTPRecord>();

  var nextUserId = 1;
  var nextProductId = 1;
  var nextTxId = 1;
  var nextWithdrawalId = 1;

  // Helper function to convert User to UserProfile
  func userToProfile(user : User) : UserProfile {
    {
      userId = user.userId;
      name = user.name;
      mobile = user.mobile;
      referralCode = user.referralCode;
      isActive = user.isActive;
      walletBalance = user.walletBalance;
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    switch (principalToUserId.get(caller)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) { ?userToProfile(user) };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (principalToUserId.get(caller)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            let updatedUser = {
              user with
              name = profile.name;
            };
            users.add(userId, updatedUser);
          };
          case (null) { Runtime.trap("User not found") };
        };
      };
      case (null) { Runtime.trap("User not linked to principal") };
    };
  };

  public query ({ caller }) func getUserProfile(userPrincipal : Principal) : async ?UserProfile {
    if (caller != userPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (principalToUserId.get(userPrincipal)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) { ?userToProfile(user) };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  // OTP System - Public (accessible to guests for registration)
  public shared ({ caller }) func generateOTP(mobile : Text) : async OTP {
    let otp = "123456";
    let currentTime = Time.now();
    let expiry = currentTime + 600000000000;
    let otpRecord : OTPRecord = {
      mobile;
      otp;
      expiresAt = expiry;
      isUsed = false;
    };
    otpRecords.add(mobile, otpRecord);
    otp;
  };

  public shared ({ caller }) func verifyOTP(mobile : Text, otp : OTP) : async Bool {
    let currentTime = Time.now();
    switch (otpRecords.get(mobile)) {
      case (?record) {
        if (record.otp == otp and not record.isUsed and currentTime < record.expiresAt) {
          let updatedRecord = { record with isUsed = true };
          otpRecords.add(mobile, updatedRecord);
          true;
        } else {
          false;
        };
      };
      case (null) { false };
    };
  };

  // Registration - Public (accessible to guests)
  public shared ({ caller }) func registerUser(name : Text, mobile : Text, referralCode : Text, sponsorReferralCode : Text, otp : OTP) : async User {
    let isOtpValid = await verifyOTP(mobile, otp);
    if (not isOtpValid) {
      Runtime.trap("Invalid OTP");
    };

    switch (usersByMobile.get(mobile)) {
      case (?_) { Runtime.trap("Mobile already registered") };
      case (null) {};
    };

    if (usersByReferralCode.containsKey(referralCode)) {
      Runtime.trap("Referral code already taken");
    };

    let newUser : User = {
      userId = nextUserId;
      name;
      mobile;
      referralCode;
      sponsorId = null;
      leftChildId = null;
      rightChildId = null;
      isActive = false;
      joinDate = Time.now();
      walletBalance = 0.0;
      role = #user;
      principal = ?caller;
    };

    users.add(nextUserId, newUser);
    usersByMobile.add(mobile, nextUserId);
    usersByReferralCode.add(referralCode, nextUserId);
    principalToUserId.add(caller, nextUserId);

    nextUserId += 1;
    newUser;
  };

  // Login - Public (accessible to guests)
  public shared ({ caller }) func loginUser(mobile : Text, otp : OTP) : async User {
    let isOtpValid = await verifyOTP(mobile, otp);
    if (not isOtpValid) {
      Runtime.trap("Invalid OTP");
    };

    switch (usersByMobile.get(mobile)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            // Link principal to user if not already linked
            switch (user.principal) {
              case (null) {
                let updatedUser = { user with principal = ?caller };
                users.add(userId, updatedUser);
                principalToUserId.add(caller, userId);
                updatedUser;
              };
              case (?existingPrincipal) {
                if (existingPrincipal != caller) {
                  // Update to new principal
                  let updatedUser = { user with principal = ?caller };
                  users.add(userId, updatedUser);
                  principalToUserId.add(caller, userId);
                  updatedUser;
                } else {
                  user;
                };
              };
            };
          };
          case (null) { Runtime.trap("User not found") };
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // User Query Functions - Restricted
  public query ({ caller }) func getUserById(userId : UserId) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view user data");
    };

    // Check if caller is viewing their own data or is admin
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own data");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: User not found");
        };
      };
    };

    switch (users.get(userId)) {
      case (?user) { user };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getUserByMobile(mobile : Mobile) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view user data");
    };

    switch (usersByMobile.get(mobile)) {
      case (?userId) {
        // Check if caller is viewing their own data or is admin
        switch (principalToUserId.get(caller)) {
          case (?callerUserId) {
            if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own data");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: User not found");
            };
          };
        };

        switch (users.get(userId)) {
          case (?user) { user };
          case (null) { Runtime.trap("User not found") };
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getUserByReferralCode(code : Text) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view user data");
    };

    switch (usersByReferralCode.get(code)) {
      case (?userId) {
        // Check if caller is viewing their own data or is admin
        switch (principalToUserId.get(caller)) {
          case (?callerUserId) {
            if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own data");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: User not found");
            };
          };
        };

        switch (users.get(userId)) {
          case (?user) { user };
          case (null) { Runtime.trap("User not found") };
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // Product Management
  public shared ({ caller }) func adminCreateProduct(name : Text, description : Text, price : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let newProduct : Product = {
      productId = nextProductId;
      name;
      description;
      price;
      isActive = true;
    };

    products.add(nextProductId, newProduct);
    nextProductId += 1;
  };

  public shared ({ caller }) func adminToggleProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle products");
    };

    switch (products.get(productId)) {
      case (?product) {
        let updatedProduct = { product with isActive = not product.isActive };
        products.add(productId, updatedProduct);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query ({ caller }) func getProducts() : async [Product] {
    // Public access - anyone can view products
    products.values().toArray();
  };

  public shared ({ caller }) func purchaseProduct(userId : UserId, productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase products");
    };

    // Verify caller owns this userId
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized: Can only purchase for yourself");
        };
      };
      case (null) { Runtime.trap("Unauthorized: User not found") };
    };

    switch (users.get(userId), products.get(productId)) {
      case (?user, ?product) {
        if (not product.isActive) {
          Runtime.trap("Product is not available");
        };
        // Additional purchase logic would go here
      };
      case (null, _) { Runtime.trap("User not found") };
      case (_, null) { Runtime.trap("Product not found") };
    };
  };

  // Wallet & Withdrawal Management
  public query ({ caller }) func getWallet(userId : UserId) : async { balance : Float; transactions : [Transaction] } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wallet");
    };

    // Verify caller owns this userId or is admin
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own wallet");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: User not found");
        };
      };
    };

    switch (users.get(userId)) {
      case (?user) {
        let userTransactions = transactions.values().toArray().filter(
          func(tx : Transaction) : Bool { tx.userId == userId }
        );
        { balance = user.walletBalance; transactions = userTransactions };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func requestWithdrawal(userId : UserId, amount : Float, bankName : Text, accountNumber : Text, ifscCode : Text, upiId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request withdrawals");
    };

    // Verify caller owns this userId
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId) {
          Runtime.trap("Unauthorized: Can only request withdrawal for yourself");
        };
      };
      case (null) { Runtime.trap("Unauthorized: User not found") };
    };

    switch (users.get(userId)) {
      case (?user) {
        if (user.walletBalance < amount) {
          Runtime.trap("Insufficient balance");
        };

        let newRequest : WithdrawalRequest = {
          reqId = nextWithdrawalId;
          userId;
          amount;
          bankName;
          accountNumber;
          ifscCode;
          upiId;
          status = "pending";
          requestDate = Time.now();
          processedDate = null;
          adminNote = "";
        };

        withdrawalRequests.add(nextWithdrawalId, newRequest);
        nextWithdrawalId += 1;

        // Deduct from wallet balance
        let updatedUser = { user with walletBalance = user.walletBalance - amount };
        users.add(userId, updatedUser);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getWithdrawalRequests(userId : UserId) : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view withdrawal requests");
    };

    // Verify caller owns this userId or is admin
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own withdrawal requests");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: User not found");
        };
      };
    };

    withdrawalRequests.values().toArray().filter<WithdrawalRequest>(
      func(req : WithdrawalRequest) : Bool { req.userId == userId }
    );
  };

  // Admin Functions
  public query ({ caller }) func adminGetPendingWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending withdrawals");
    };

    withdrawalRequests.values().toArray().filter<WithdrawalRequest>(
      func(req : WithdrawalRequest) : Bool { req.status == "pending" }
    );
  };

  public shared ({ caller }) func adminApproveWithdrawal(reqId : WithdrawalId, adminNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };

    switch (withdrawalRequests.get(reqId)) {
      case (?request) {
        let updatedRequest = { request with status = "approved"; adminNote; processedDate = ?Time.now() };
        withdrawalRequests.add(reqId, updatedRequest);
      };
      case (null) { Runtime.trap("Request not found") };
    };
  };

  public shared ({ caller }) func adminRejectWithdrawal(reqId : WithdrawalId, adminNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject withdrawals");
    };

    switch (withdrawalRequests.get(reqId)) {
      case (?request) {
        // Refund to wallet
        switch (users.get(request.userId)) {
          case (?user) {
            let updatedUser = { user with walletBalance = user.walletBalance + request.amount };
            users.add(request.userId, updatedUser);
          };
          case (null) {};
        };

        let updatedRequest = { request with status = "rejected"; adminNote; processedDate = ?Time.now() };
        withdrawalRequests.add(reqId, updatedRequest);
      };
      case (null) { Runtime.trap("Request not found") };
    };
  };

  public shared ({ caller }) func adminCreditIncome(userId : UserId, amount : Float, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can credit income");
    };

    switch (users.get(userId)) {
      case (?user) {
        if (amount <= 0.0) {
          Runtime.trap("Amount must be greater than zero");
        };

        let updatedUser = { user with walletBalance = user.walletBalance + amount };
        users.add(userId, updatedUser);

        let newTx : Transaction = {
          txId = nextTxId;
          userId;
          txType = "admin_credit";
          amount;
          fromUserId = null;
          level = null;
          timestamp = Time.now();
          status = "completed";
          note;
        };
        transactions.add(nextTxId, newTx);
        nextTxId += 1;
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func adminGetAllUsers(limit : Nat, offset : Nat) : async [User] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    let allUsers = users.values().toArray();
    let start = if (offset < allUsers.size()) { offset } else { allUsers.size() };
    let end = if (start + limit < allUsers.size()) { start + limit } else { allUsers.size() };

    Array.tabulate<User>(
      end - start,
      func(i : Nat) : User { allUsers[start + i] }
    );
  };

  public query ({ caller }) func adminGetAllTransactions(limit : Nat, offset : Nat) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };

    let allTxs = transactions.values().toArray();
    let start = if (offset < allTxs.size()) { offset } else { allTxs.size() };
    let end = if (start + limit < allTxs.size()) { start + limit } else { allTxs.size() };

    Array.tabulate<Transaction>(
      end - start,
      func(i : Nat) : Transaction { allTxs[start + i] }
    );
  };

  public query ({ caller }) func adminGetDashboardStats() : async {
    totalUsers : Nat;
    activeUsers : Nat;
    totalIncomeDistributed : Float;
    pendingWithdrawalsCount : Nat;
    pendingWithdrawalsAmount : Float;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    let allUsers = users.values().toArray();
    let activeUsers = allUsers.filter(func(u : User) : Bool { u.isActive });

    let pendingWithdrawals = withdrawalRequests.values().toArray().filter(
      func(req : WithdrawalRequest) : Bool { req.status == "pending" }
    );

    var totalIncome : Float = 0.0;
    for (tx in transactions.values()) {
      if (tx.status == "completed" and tx.txType != "withdrawal") {
        totalIncome += tx.amount;
      };
    };

    var pendingAmount : Float = 0.0;
    for (req in pendingWithdrawals.vals()) {
      pendingAmount += req.amount;
    };

    {
      totalUsers = allUsers.size();
      activeUsers = activeUsers.size();
      totalIncomeDistributed = totalIncome;
      pendingWithdrawalsCount = pendingWithdrawals.size();
      pendingWithdrawalsAmount = pendingAmount;
    };
  };

  public query ({ caller }) func getTransactions(userId : UserId, limit : Nat, offset : Nat) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    // Verify caller owns this userId or is admin
    switch (principalToUserId.get(caller)) {
      case (?callerUserId) {
        if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own transactions");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: User not found");
        };
      };
    };

    let userTxs = transactions.values().toArray().filter(
      func(tx : Transaction) : Bool { tx.userId == userId }
    );

    let start = if (offset < userTxs.size()) { offset } else { userTxs.size() };
    let end = if (start + limit < userTxs.size()) { start + limit } else { userTxs.size() };

    Array.tabulate<Transaction>(
      end - start,
      func(i : Nat) : Transaction { userTxs[start + i] }
    );
  };

  public shared ({ caller }) func adminAddUser(name : Text, mobile : Text, referralCode : Text, sponsorReferralCode : Text) : async UserId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add users");
    };

    switch (usersByMobile.get(mobile)) {
      case (?_) { Runtime.trap("Mobile already registered") };
      case (null) {};
    };

    if (usersByReferralCode.containsKey(referralCode)) {
      Runtime.trap("Referral code already taken");
    };

    let newUser : User = {
      userId = nextUserId;
      name;
      mobile;
      referralCode;
      sponsorId = null;
      leftChildId = null;
      rightChildId = null;
      isActive = true;
      joinDate = Time.now();
      walletBalance = 0.0;
      role = #user;
      principal = null;
    };

    users.add(nextUserId, newUser);
    usersByMobile.add(mobile, nextUserId);
    usersByReferralCode.add(referralCode, nextUserId);

    // If sponsorReferralCode is valid, map sponsorId
    if (sponsorReferralCode != "") {
      switch (usersByReferralCode.get(sponsorReferralCode)) {
        case (?sponsorId) {
          let existing = users.get(nextUserId);
          switch (existing) {
            case (?current) {
              let updated = { current with sponsorId = ?sponsorId };
              users.add(nextUserId, updated);
            };
            case (null) {};
          };
        };
        case (null) {};
      };
    };

    nextUserId += 1;
    nextUserId - 1;
  };

  public shared ({ caller }) func adminSetBinaryPosition(parentUserId : UserId, childUserId : UserId, position : { #left; #right }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set binary positions");
    };

    switch (users.get(parentUserId), users.get(childUserId)) {
      case (?parentUser, ?childUser) {
        // Set the binary position on parent
        let updatedParent = switch (position) {
          case (#left) { { parentUser with leftChildId = ?childUserId } };
          case (#right) { { parentUser with rightChildId = ?childUserId } };
        };
        users.add(parentUserId, updatedParent);

        // Set sponsorId on child if not set
        if (childUser.sponsorId == null) {
          let updatedChild = { childUser with sponsorId = ?parentUserId };
          users.add(childUserId, updatedChild);
        };
      };
      case (null, _) { Runtime.trap("Parent user not found") };
      case (_, null) { Runtime.trap("Child user not found") };
    };
  };

  public query ({ caller }) func adminGetAllWithdrawals(limit : Nat, offset : Nat) : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all withdrawals");
    };

    let allWithdrawals = withdrawalRequests.values().toArray();
    let size = allWithdrawals.size();

    let start = if (offset < size) { offset } else { size };
    let end = if (start + limit < size) { start + limit } else { size };

    Array.tabulate<WithdrawalRequest>(
      end - start,
      func(i) { allWithdrawals[start + i] }
    );
  };
};
