import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Int "mo:core/Int";

module {
  type OldUserId = Nat;
  type OldProductId = Nat;
  type OldPaymentId = Nat;
  type OldTxId = Nat;
  type OldWithdrawalId = Nat;
  type OldMobile = Text;

  public type OldUserType = { #admin; #user };

  type OldUser = {
    userId : OldUserId;
    name : Text;
    mobile : OldMobile;
    referralCode : Text;
    sponsorId : ?OldUserId;
    leftChildId : ?OldUserId;
    rightChildId : ?OldUserId;
    isActive : Bool;
    joinDate : Int;
    walletBalance : Float;
    role : OldUserType;
    principal : ?Principal;
  };

  type OldProduct = {
    productId : OldProductId;
    name : Text;
    description : Text;
    price : Float;
    isActive : Bool;
  };

  type OldTransaction = {
    txId : OldTxId;
    userId : OldUserId;
    txType : Text;
    amount : Float;
    fromUserId : ?OldUserId;
    level : ?Nat;
    timestamp : Int;
    status : Text;
    note : Text;
  };

  type OldWithdrawalRequest = {
    reqId : OldWithdrawalId;
    userId : OldUserId;
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

  type OldOTPRecord = {
    mobile : OldMobile;
    otp : Text;
    expiresAt : Int;
    isUsed : Bool;
  };

  type OldPaymentRecord = {
    paymentId : OldPaymentId;
    userId : OldUserId;
    productId : OldProductId;
    amount : Float;
    upiTransactionRef : Text;
    status : Text;
    timestamp : Int;
    adminNote : Text;
  };

  type OldActor = {
    payments : Map.Map<OldPaymentId, OldPaymentRecord>;
    users : Map.Map<OldUserId, OldUser>;
    usersByMobile : Map.Map<Text, OldUserId>;
    usersByReferralCode : Map.Map<Text, OldUserId>;
    principalToUserId : Map.Map<Principal, OldUserId>;
    products : Map.Map<OldProductId, OldProduct>;
    transactions : Map.Map<OldTxId, OldTransaction>;
    withdrawalRequests : Map.Map<OldWithdrawalId, OldWithdrawalRequest>;
    otpRecords : Map.Map<OldMobile, OldOTPRecord>;
    nextUserId : OldUserId;
    nextProductId : OldProductId;
    nextTxId : OldTxId;
    nextWithdrawalId : OldWithdrawalId;
    nextPaymentId : OldPaymentId;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
