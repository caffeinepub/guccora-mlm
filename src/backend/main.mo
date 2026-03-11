import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserId = Nat;
  type ProductId = Nat;
  type PaymentId = Nat;
  type Mobile = Text;
  type TxId = Nat;
  type WithdrawalId = Nat;
  type OTP = Text;

  public type UserType = { #admin; #user };

  public type User = {
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
    role : UserType;
    principal : ?Principal;
  };

  public type Product = {
    productId : ProductId;
    name : Text;
    description : Text;
    price : Float;
    isActive : Bool;
  };

  public type Transaction = {
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

  public type WithdrawalRequest = {
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

  public type OTPRecord = {
    mobile : Text;
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

  public type PaymentRecord = {
    paymentId : PaymentId;
    userId : UserId;
    productId : ProductId;
    amount : Float;
    upiTransactionRef : Text;
    status : Text;
    timestamp : Int;
    adminNote : Text;
  };

  let payments = Map.empty<PaymentId, PaymentRecord>();
  let users = Map.empty<UserId, User>();
  let usersByMobile = Map.empty<Text, UserId>();
  let usersByReferralCode = Map.empty<Text, UserId>();
  let principalToUserId = Map.empty<Principal, UserId>();
  let products = Map.empty<ProductId, Product>();
  let transactions = Map.empty<TxId, Transaction>();
  let withdrawalRequests = Map.empty<WithdrawalId, WithdrawalRequest>();
  let otpRecords = Map.empty<Mobile, OTPRecord>();

  var nextUserId : UserId = 1;
  var nextProductId : ProductId = 1;
  var nextTxId : TxId = 1;
  var nextWithdrawalId : WithdrawalId = 1;
  var nextPaymentId : PaymentId = 1;

  func getUserIdByCaller(caller : Principal) : ?UserId {
    principalToUserId.get(caller);
  };

  func isRegisteredUser(caller : Principal) : Bool {
    switch (principalToUserId.get(caller)) {
      case (?_) { true };
      case null { false };
    };
  };

  func isOwnerOrAdmin(caller : Principal, userId : UserId) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (getUserIdByCaller(caller)) {
      case (?callerId) { callerId == userId };
      case null { false };
    };
  };

  func isOwner(caller : Principal, userId : UserId) : Bool {
    switch (getUserIdByCaller(caller)) {
      case (?callerId) { callerId == userId };
      case null { false };
    };
  };

  // OTP generation - no authentication required (public service)
  public func generateOTP(mobile : Text) : async Text {
    let otp = "123456";
    let expiresAt = Time.now() + 600_000_000_000;
    let record : OTPRecord = {
      mobile = mobile;
      otp = otp;
      expiresAt = expiresAt;
      isUsed = false;
    };
    otpRecords.add(mobile, record);
    otp;
  };

  // OTP verification - internal use only, not directly callable
  func verifyOTPInternal(mobile : Text, otp : Text) : Bool {
    switch (otpRecords.get(mobile)) {
      case (?record) {
        if (record.isUsed or Time.now() > record.expiresAt or record.otp != otp) {
          return false;
        };
        let updatedRecord : OTPRecord = {
          mobile = record.mobile;
          otp = record.otp;
          expiresAt = record.expiresAt;
          isUsed = true;
        };
        otpRecords.add(mobile, updatedRecord);
        true;
      };
      case null { false };
    };
  };

  public shared ({ caller }) func registerUser(
    name : Text,
    mobile : Text,
    referralCode : Text,
    sponsorReferralCode : Text,
    otp : Text,
  ) : async User {
    // Verify OTP before registration
    if (not verifyOTPInternal(mobile, otp)) {
      Runtime.trap("Invalid or expired OTP");
    };

    switch (usersByMobile.get(mobile)) {
      case (?_) { Runtime.trap("Mobile already registered") };
      case null {};
    };

    switch (usersByReferralCode.get(referralCode)) {
      case (?_) { Runtime.trap("Referral code already taken") };
      case null {};
    };

    let sponsorId : ?UserId = switch (usersByReferralCode.get(sponsorReferralCode)) {
      case (?sid) { ?sid };
      case null { null };
    };

    let userId = nextUserId;
    nextUserId += 1;

    let user : User = {
      userId = userId;
      name = name;
      mobile = mobile;
      referralCode = referralCode;
      sponsorId = sponsorId;
      leftChildId = null;
      rightChildId = null;
      isActive = false;
      joinDate = Time.now();
      walletBalance = 0.0;
      role = #user;
      principal = ?caller;
    };

    users.add(userId, user);
    usersByMobile.add(mobile, userId);
    usersByReferralCode.add(referralCode, userId);
    principalToUserId.add(caller, userId);

    // Assign user role in access control system
    AccessControl.assignRole(accessControlState, caller, caller, #user);

    user;
  };

  public shared ({ caller }) func loginUserByMobile(mobile : Text) : async User {
    // Special handling for admin mobiles
    if (mobile == "9999999999") {
      switch (usersByMobile.get(mobile)) {
        case null {
          let userId = nextUserId;
          nextUserId += 1;
          let user : User = {
            userId = userId;
            name = "Super Admin";
            mobile = mobile;
            referralCode = "ADMIN99999";
            sponsorId = null;
            leftChildId = null;
            rightChildId = null;
            isActive = true;
            joinDate = Time.now();
            walletBalance = 0.0;
            role = #admin;
            principal = ?caller;
          };
          users.add(userId, user);
          usersByMobile.add(mobile, userId);
          usersByReferralCode.add("ADMIN99999", userId);
          principalToUserId.add(caller, userId);
          AccessControl.assignRole(accessControlState, caller, caller, #admin);
          return user;
        };
        case (?uid) {
          let user = switch (users.get(uid)) {
            case (?u) { u };
            case null { Runtime.trap("User not found") };
          };
          let updatedUser : User = {
            userId = user.userId;
            name = user.name;
            mobile = user.mobile;
            referralCode = user.referralCode;
            sponsorId = user.sponsorId;
            leftChildId = user.leftChildId;
            rightChildId = user.rightChildId;
            isActive = user.isActive;
            joinDate = user.joinDate;
            walletBalance = user.walletBalance;
            role = user.role;
            principal = ?caller;
          };
          users.add(uid, updatedUser);
          principalToUserId.add(caller, uid);
          AccessControl.assignRole(accessControlState, caller, caller, #admin);
          return updatedUser;
        };
      };
    };

    if (mobile == "6305462887") {
      switch (usersByMobile.get(mobile)) {
        case null {
          let userId = nextUserId;
          nextUserId += 1;
          let user : User = {
            userId = userId;
            name = "Main Admin";
            mobile = mobile;
            referralCode = "ADMIN62887";
            sponsorId = null;
            leftChildId = null;
            rightChildId = null;
            isActive = true;
            joinDate = Time.now();
            walletBalance = 0.0;
            role = #admin;
            principal = ?caller;
          };
          users.add(userId, user);
          usersByMobile.add(mobile, userId);
          usersByReferralCode.add("ADMIN62887", userId);
          principalToUserId.add(caller, userId);
          AccessControl.assignRole(accessControlState, caller, caller, #admin);
          return user;
        };
        case (?uid) {
          let user = switch (users.get(uid)) {
            case (?u) { u };
            case null { Runtime.trap("User not found") };
          };
          let updatedUser : User = {
            userId = user.userId;
            name = user.name;
            mobile = user.mobile;
            referralCode = user.referralCode;
            sponsorId = user.sponsorId;
            leftChildId = user.leftChildId;
            rightChildId = user.rightChildId;
            isActive = user.isActive;
            joinDate = user.joinDate;
            walletBalance = user.walletBalance;
            role = user.role;
            principal = ?caller;
          };
          users.add(uid, updatedUser);
          principalToUserId.add(caller, uid);
          AccessControl.assignRole(accessControlState, caller, caller, #admin);
          return updatedUser;
        };
      };
    };

    let userId = switch (usersByMobile.get(mobile)) {
      case (?uid) { uid };
      case null { Runtime.trap("Mobile number not registered") };
    };

    let user = switch (users.get(userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };

    let updatedUser : User = {
      userId = user.userId;
      name = user.name;
      mobile = user.mobile;
      referralCode = user.referralCode;
      sponsorId = user.sponsorId;
      leftChildId = user.leftChildId;
      rightChildId = user.rightChildId;
      isActive = user.isActive;
      joinDate = user.joinDate;
      walletBalance = user.walletBalance;
      role = user.role;
      principal = ?caller;
    };

    users.add(userId, updatedUser);
    principalToUserId.add(caller, userId);

    if (user.role == #admin) {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    } else {
      AccessControl.assignRole(accessControlState, caller, caller, #user);
    };

    updatedUser;
  };

  // Public product listing - no authentication required
  public func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    switch (getUserIdByCaller(caller)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            ?{
              userId = user.userId;
              name = user.name;
              mobile = user.mobile;
              referralCode = user.referralCode;
              isActive = user.isActive;
              walletBalance = user.walletBalance;
            };
          };
          case null { null };
        };
      };
      case null { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (getUserIdByCaller(caller)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            let updatedUser : User = {
              userId = user.userId;
              name = profile.name;
              mobile = user.mobile;
              referralCode = user.referralCode;
              sponsorId = user.sponsorId;
              leftChildId = user.leftChildId;
              rightChildId = user.rightChildId;
              isActive = user.isActive;
              joinDate = user.joinDate;
              walletBalance = user.walletBalance;
              role = user.role;
              principal = user.principal;
            };
            users.add(userId, updatedUser);
          };
          case null { Runtime.trap("User not found") };
        };
      };
      case null { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getUserProfile(userPrincipal : Principal) : async ?UserProfile {
    if (caller != userPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (principalToUserId.get(userPrincipal)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            ?{
              userId = user.userId;
              name = user.name;
              mobile = user.mobile;
              referralCode = user.referralCode;
              isActive = user.isActive;
              walletBalance = user.walletBalance;
            };
          };
          case null { null };
        };
      };
      case null { null };
    };
  };

  public query ({ caller }) func getUserById(userId : UserId) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user data");
    };
    if (not isOwnerOrAdmin(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own data");
    };
    switch (users.get(userId)) {
      case (?user) { user };
      case null { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getUserByMobile(mobile : Text) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user data");
    };

    let userId = switch (usersByMobile.get(mobile)) {
      case (?uid) { uid };
      case null { Runtime.trap("User not found") };
    };

    if (not isOwnerOrAdmin(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own data");
    };

    switch (users.get(userId)) {
      case (?user) { user };
      case null { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getUserByReferralCode(code : Text) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user data");
    };

    let userId = switch (usersByReferralCode.get(code)) {
      case (?uid) { uid };
      case null { Runtime.trap("User not found") };
    };

    if (not isOwnerOrAdmin(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own data");
    };

    switch (users.get(userId)) {
      case (?user) { user };
      case null { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getWallet(userId : Nat) : async { balance : Float; transactions : [Transaction] } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wallet data");
    };

    if (not isOwnerOrAdmin(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own wallet");
    };

    let user = switch (users.get(userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };

    let userTxs = transactions.values().toArray().filter(
      func(tx : Transaction) : Bool { tx.userId == userId },
    );

    { balance = user.walletBalance; transactions = userTxs };
  };

  public shared ({ caller }) func requestWithdrawal(
    userId : UserId,
    amount : Float,
    bankName : Text,
    accountNumber : Text,
    ifscCode : Text,
    upiId : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request withdrawals");
    };

    if (not isOwner(caller, userId)) {
      Runtime.trap("Unauthorized: Can only request withdrawal for your own account");
    };

    let user = switch (users.get(userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };

    if (user.walletBalance < amount) {
      Runtime.trap("Insufficient balance");
    };

    let reqId = nextWithdrawalId;
    nextWithdrawalId += 1;

    let request : WithdrawalRequest = {
      reqId = reqId;
      userId = userId;
      amount = amount;
      bankName = bankName;
      accountNumber = accountNumber;
      ifscCode = ifscCode;
      upiId = upiId;
      status = "pending";
      requestDate = Time.now();
      processedDate = null;
      adminNote = "";
    };

    withdrawalRequests.add(reqId, request);

    let updatedUser : User = {
      userId = user.userId;
      name = user.name;
      mobile = user.mobile;
      referralCode = user.referralCode;
      sponsorId = user.sponsorId;
      leftChildId = user.leftChildId;
      rightChildId = user.rightChildId;
      isActive = user.isActive;
      joinDate = user.joinDate;
      walletBalance = user.walletBalance - amount;
      role = user.role;
      principal = user.principal;
    };
    users.add(userId, updatedUser);
  };

  public query ({ caller }) func getWithdrawalRequests(userId : UserId) : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view withdrawal requests");
    };

    if (not isOwnerOrAdmin(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own withdrawal requests");
    };

    withdrawalRequests.values().toArray().filter(
      func(req : WithdrawalRequest) : Bool { req.userId == userId },
    );
  };

  public query ({ caller }) func getTransactions(userId : UserId, limit : Nat, offset : Nat) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    if (not isOwnerOrAdmin(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };

    let userTxs = transactions.values().toArray().filter(
      func(tx : Transaction) : Bool { tx.userId == userId },
    );

    let start = offset;
    let end = Nat.min(offset + limit, userTxs.size());
    if (start >= userTxs.size()) {
      return [];
    };
    Array.tabulate<Transaction>(end - start, func(i : Nat) : Transaction { userTxs[start + i] });
  };

  public shared ({ caller }) func purchaseProduct(userId : UserId, productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase products");
    };

    if (not isOwner(caller, userId)) {
      Runtime.trap("Unauthorized: Can only purchase for your own account");
    };

    let product = switch (products.get(productId)) {
      case (?p) { p };
      case null { Runtime.trap("Product not found") };
    };

    if (not product.isActive) {
      Runtime.trap("Product is not active");
    };
  };

  public shared ({ caller }) func submitPaymentRequest(userId : UserId, productId : ProductId, upiTransactionRef : Text) : async PaymentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit payment requests");
    };

    if (not isOwner(caller, userId)) {
      Runtime.trap("Unauthorized: Can only submit payment for your own account");
    };

    let product = switch (products.get(productId)) {
      case (?p) { p };
      case null { Runtime.trap("Product not found") };
    };

    let paymentId = nextPaymentId;
    nextPaymentId += 1;

    let payment : PaymentRecord = {
      paymentId = paymentId;
      userId = userId;
      productId = productId;
      amount = product.price;
      upiTransactionRef = upiTransactionRef;
      status = "pending";
      timestamp = Time.now();
      adminNote = "";
    };

    payments.add(paymentId, payment);
    paymentId;
  };

  public query ({ caller }) func getUserPayments(userId : UserId) : async [PaymentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };

    if (not isOwnerOrAdmin(caller, userId)) {
      Runtime.trap("Unauthorized: Can only view your own payments");
    };

    payments.values().toArray().filter(
      func(p : PaymentRecord) : Bool { p.userId == userId },
    );
  };

  public query ({ caller }) func adminGetAllUsers(limit : Nat, offset : Nat) : async [User] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    let allUsers = users.values().toArray();
    let start = offset;
    let end = Nat.min(offset + limit, allUsers.size());
    if (start >= allUsers.size()) {
      return [];
    };
    Array.tabulate<User>(end - start, func(i : Nat) : User { allUsers[start + i] });
  };

  public query ({ caller }) func adminGetAllTransactions(limit : Nat, offset : Nat) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };

    let allTxs = transactions.values().toArray();
    let start = offset;
    let end = Nat.min(offset + limit, allTxs.size());
    if (start >= allTxs.size()) {
      return [];
    };
    Array.tabulate<Transaction>(end - start, func(i : Nat) : Transaction { allTxs[start + i] });
  };

  public query ({ caller }) func adminGetAllWithdrawals(limit : Nat, offset : Nat) : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all withdrawals");
    };

    let allReqs = withdrawalRequests.values().toArray();
    let start = offset;
    let end = Nat.min(offset + limit, allReqs.size());
    if (start >= allReqs.size()) {
      return [];
    };
    Array.tabulate<WithdrawalRequest>(end - start, func(i : Nat) : WithdrawalRequest { allReqs[start + i] });
  };

  public query ({ caller }) func adminGetPendingWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending withdrawals");
    };

    withdrawalRequests.values().toArray().filter<WithdrawalRequest>(
      func(req : WithdrawalRequest) : Bool { req.status == "pending" },
    );
  };

  public shared ({ caller }) func adminApproveWithdrawal(reqId : WithdrawalId, adminNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };

    let request = switch (withdrawalRequests.get(reqId)) {
      case (?r) { r };
      case null { Runtime.trap("Withdrawal request not found") };
    };

    let updatedRequest : WithdrawalRequest = {
      reqId = request.reqId;
      userId = request.userId;
      amount = request.amount;
      bankName = request.bankName;
      accountNumber = request.accountNumber;
      ifscCode = request.ifscCode;
      upiId = request.upiId;
      status = "approved";
      requestDate = request.requestDate;
      processedDate = ?Time.now();
      adminNote = adminNote;
    };
    withdrawalRequests.add(reqId, updatedRequest);
  };

  public shared ({ caller }) func adminRejectWithdrawal(reqId : WithdrawalId, adminNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject withdrawals");
    };

    let request = switch (withdrawalRequests.get(reqId)) {
      case (?r) { r };
      case null { Runtime.trap("Withdrawal request not found") };
    };

    let user = switch (users.get(request.userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };

    let updatedUser : User = {
      userId = user.userId;
      name = user.name;
      mobile = user.mobile;
      referralCode = user.referralCode;
      sponsorId = user.sponsorId;
      leftChildId = user.leftChildId;
      rightChildId = user.rightChildId;
      isActive = user.isActive;
      joinDate = user.joinDate;
      walletBalance = user.walletBalance + request.amount;
      role = user.role;
      principal = user.principal;
    };
    users.add(request.userId, updatedUser);

    let updatedRequest : WithdrawalRequest = {
      reqId = request.reqId;
      userId = request.userId;
      amount = request.amount;
      bankName = request.bankName;
      accountNumber = request.accountNumber;
      ifscCode = request.ifscCode;
      upiId = request.upiId;
      status = "rejected";
      requestDate = request.requestDate;
      processedDate = ?Time.now();
      adminNote = adminNote;
    };
    withdrawalRequests.add(reqId, updatedRequest);
  };

  public shared ({ caller }) func adminCreditIncome(userId : UserId, amount : Float, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can credit income");
    };

    let user = switch (users.get(userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };

    let updatedUser : User = {
      userId = user.userId;
      name = user.name;
      mobile = user.mobile;
      referralCode = user.referralCode;
      sponsorId = user.sponsorId;
      leftChildId = user.leftChildId;
      rightChildId = user.rightChildId;
      isActive = user.isActive;
      joinDate = user.joinDate;
      walletBalance = user.walletBalance + amount;
      role = user.role;
      principal = user.principal;
    };
    users.add(userId, updatedUser);

    let txId = nextTxId;
    nextTxId += 1;

    let tx : Transaction = {
      txId = txId;
      userId = userId;
      txType = "admin_credit";
      amount = amount;
      fromUserId = null;
      level = null;
      timestamp = Time.now();
      status = "completed";
      note = note;
    };
    transactions.add(txId, tx);
  };

  public query ({ caller }) func adminGetDashboardStats() : async {
    totalUsers : Nat;
    activeUsers : Nat;
    totalIncomeDistributed : Float;
    pendingWithdrawalsCount : Nat;
    pendingWithdrawalsAmount : Float;
    totalPayments : Nat;
    pendingPaymentsCount : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    let allUsers = users.values().toArray();
    let totalUsers = allUsers.size();
    let activeUsers = allUsers.filter(func(u : User) : Bool { u.isActive }).size();

    var totalIncomeDistributed : Float = 0.0;
    for (tx in transactions.values()) {
      if (tx.txType == "direct_income" or tx.txType == "admin_credit") {
        totalIncomeDistributed += tx.amount;
      };
    };

    let pendingWithdrawals = withdrawalRequests.values().toArray().filter(
      func(req : WithdrawalRequest) : Bool { req.status == "pending" },
    );
    let pendingWithdrawalsCount = pendingWithdrawals.size();
    var pendingWithdrawalsAmount : Float = 0.0;
    for (req in pendingWithdrawals.values()) {
      pendingWithdrawalsAmount += req.amount;
    };

    let allPayments = payments.values().toArray();
    let totalPayments = allPayments.size();
    let pendingPaymentsCount = allPayments.filter(
      func(p : PaymentRecord) : Bool { p.status == "pending" },
    ).size();

    {
      totalUsers = totalUsers;
      activeUsers = activeUsers;
      totalIncomeDistributed = totalIncomeDistributed;
      pendingWithdrawalsCount = pendingWithdrawalsCount;
      pendingWithdrawalsAmount = pendingWithdrawalsAmount;
      totalPayments = totalPayments;
      pendingPaymentsCount = pendingPaymentsCount;
    };
  };

  public shared ({ caller }) func adminCreateProduct(name : Text, description : Text, price : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let productId = nextProductId;
    nextProductId += 1;

    let product : Product = {
      productId = productId;
      name = name;
      description = description;
      price = price;
      isActive = true;
    };
    products.add(productId, product);
  };

  public shared ({ caller }) func adminToggleProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle products");
    };

    let product = switch (products.get(productId)) {
      case (?p) { p };
      case null { Runtime.trap("Product not found") };
    };

    let updatedProduct : Product = {
      productId = product.productId;
      name = product.name;
      description = product.description;
      price = product.price;
      isActive = not product.isActive;
    };
    products.add(productId, updatedProduct);
  };

  public shared ({ caller }) func adminAddUser(
    name : Text,
    mobile : Text,
    referralCode : Text,
    sponsorReferralCode : Text,
  ) : async UserId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add users");
    };

    switch (usersByMobile.get(mobile)) {
      case (?_) { Runtime.trap("Mobile already registered") };
      case null {};
    };

    switch (usersByReferralCode.get(referralCode)) {
      case (?_) { Runtime.trap("Referral code already taken") };
      case null {};
    };

    let sponsorId : ?UserId = switch (usersByReferralCode.get(sponsorReferralCode)) {
      case (?sid) { ?sid };
      case null { null };
    };

    let userId = nextUserId;
    nextUserId += 1;

    let user : User = {
      userId = userId;
      name = name;
      mobile = mobile;
      referralCode = referralCode;
      sponsorId = sponsorId;
      leftChildId = null;
      rightChildId = null;
      isActive = true;
      joinDate = Time.now();
      walletBalance = 0.0;
      role = #user;
      principal = null;
    };

    users.add(userId, user);
    usersByMobile.add(mobile, userId);
    usersByReferralCode.add(referralCode, userId);

    userId;
  };

  public shared ({ caller }) func adminSetBinaryPosition(
    parentUserId : UserId,
    childUserId : UserId,
    position : { #left; #right },
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set binary positions");
    };

    let parent = switch (users.get(parentUserId)) {
      case (?u) { u };
      case null { Runtime.trap("Parent user not found") };
    };

    let child = switch (users.get(childUserId)) {
      case (?u) { u };
      case null { Runtime.trap("Child user not found") };
    };

    let updatedParent = switch (position) {
      case (#left) {
        { parent with leftChildId = ?childUserId };
      };
      case (#right) {
        { parent with rightChildId = ?childUserId };
      };
    };
    users.add(parentUserId, updatedParent);

    let updatedChild = {
      child with sponsorId = switch (child.sponsorId) {
        case null { ?parentUserId };
        case (?sid) { ?sid };
      };
    };
    users.add(childUserId, updatedChild);
  };

  public shared ({ caller }) func adminConfirmPayment(paymentId : PaymentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can confirm payments");
    };

    let payment = switch (payments.get(paymentId)) {
      case (?p) { p };
      case null { Runtime.trap("Payment not found") };
    };

    let updatedPayment : PaymentRecord = {
      paymentId = payment.paymentId;
      userId = payment.userId;
      productId = payment.productId;
      amount = payment.amount;
      upiTransactionRef = payment.upiTransactionRef;
      status = "confirmed";
      timestamp = payment.timestamp;
      adminNote = payment.adminNote;
    };
    payments.add(paymentId, updatedPayment);

    let user = switch (users.get(payment.userId)) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };

    let updatedUser = { user with isActive = true };
    users.add(payment.userId, updatedUser);

    let txId = nextTxId;
    nextTxId += 1;
    let tx : Transaction = {
      txId = txId;
      userId = payment.userId;
      txType = "product_purchase";
      amount = payment.amount;
      fromUserId = null;
      level = null;
      timestamp = Time.now();
      status = "completed";
      note = "Product purchase confirmed";
    };
    transactions.add(txId, tx);

    switch (user.sponsorId) {
      case (?sponsorId) {
        let directIncome : Float = if (payment.amount == 599.0) {
          100.0;
        } else if (payment.amount == 999.0) {
          150.0;
        } else if (payment.amount == 1999.0) {
          300.0;
        } else {
          0.0;
        };

        if (directIncome > 0.0) {
          let sponsor = switch (users.get(sponsorId)) {
            case (?s) { s };
            case null { Runtime.trap("Sponsor not found") };
          };

          let updatedSponsor = {
            sponsor with walletBalance = sponsor.walletBalance + directIncome;
          };
          users.add(sponsorId, updatedSponsor);

          let incomeTxId = nextTxId;
          nextTxId += 1;
          let incomeTx : Transaction = {
            txId = incomeTxId;
            userId = sponsorId;
            txType = "direct_income";
            amount = directIncome;
            fromUserId = ?payment.userId;
            level = ?1;
            timestamp = Time.now();
            status = "completed";
            note = "Direct income from referral";
          };
          transactions.add(incomeTxId, incomeTx);
        };
      };
      case null {};
    };
  };

  public shared ({ caller }) func adminRejectPayment(paymentId : PaymentId, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject payments");
    };

    let payment = switch (payments.get(paymentId)) {
      case (?p) { p };
      case null { Runtime.trap("Payment not found") };
    };

    let updatedPayment : PaymentRecord = {
      paymentId = payment.paymentId;
      userId = payment.userId;
      productId = payment.productId;
      amount = payment.amount;
      upiTransactionRef = payment.upiTransactionRef;
      status = "rejected";
      timestamp = payment.timestamp;
      adminNote = note;
    };
    payments.add(paymentId, updatedPayment);
  };

  public query ({ caller }) func adminGetPaymentHistory(limit : Nat, offset : Nat) : async [PaymentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view payment history");
    };

    let allPayments = payments.values().toArray();
    let start = offset;
    let end = Nat.min(offset + limit, allPayments.size());
    if (start >= allPayments.size()) {
      return [];
    };
    Array.tabulate<PaymentRecord>(end - start, func(i : Nat) : PaymentRecord { allPayments[start + i] });
  };

  public query ({ caller }) func adminGetPendingPayments() : async [PaymentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending payments");
    };

    payments.values().toArray().filter(
      func(p : PaymentRecord) : Bool { p.status == "pending" },
    );
  };
};
