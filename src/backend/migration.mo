import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

module {
  type UserId = Nat;
  type ProductId = Nat;
  type PaymentId = Nat;
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

  type PaymentRecord = {
    paymentId : PaymentId;
    userId : UserId;
    productId : ProductId;
    amount : Float;
    upiTransactionRef : Text;
    status : Text;
    timestamp : Int;
    adminNote : Text;
  };

  type OldActor = {
    payments : Map.Map<PaymentId, PaymentRecord>;
    users : Map.Map<UserId, User>;
    usersByMobile : Map.Map<Text, UserId>;
    usersByReferralCode : Map.Map<Text, UserId>;
    principalToUserId : Map.Map<Principal, UserId>;
    products : Map.Map<ProductId, Product>;
    transactions : Map.Map<TxId, Transaction>;
    withdrawalRequests : Map.Map<WithdrawalId, WithdrawalRequest>;
    otpRecords : Map.Map<Text, OTPRecord>;
    nextUserId : Nat;
    nextProductId : Nat;
    nextTxId : Nat;
    nextWithdrawalId : Nat;
    nextPaymentId : Nat;
  };

  type NewActor = {};

  public func run(_old : OldActor) : NewActor {
    {};
  };
};
