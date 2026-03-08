import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Mobile = string;
export type OTP = string;
export interface User {
    principal?: Principal;
    referralCode: string;
    joinDate: bigint;
    userId: UserId;
    name: string;
    role: UserRole;
    sponsorId?: UserId;
    rightChildId?: UserId;
    leftChildId?: UserId;
    isActive: boolean;
    mobile: Mobile;
    walletBalance: number;
}
export type TxId = bigint;
export interface PaymentRecord {
    status: string;
    userId: UserId;
    productId: ProductId;
    adminNote: string;
    paymentId: PaymentId;
    timestamp: bigint;
    upiTransactionRef: string;
    amount: number;
}
export type WithdrawalId = bigint;
export interface Transaction {
    status: string;
    userId: UserId;
    note: string;
    txId: TxId;
    level?: bigint;
    fromUserId?: UserId;
    timestamp: bigint;
    txType: string;
    amount: number;
}
export type UserId = bigint;
export type PaymentId = bigint;
export type ProductId = bigint;
export interface WithdrawalRequest {
    status: string;
    ifscCode: string;
    userId: UserId;
    bankName: string;
    adminNote: string;
    upiId: string;
    accountNumber: string;
    processedDate?: bigint;
    amount: number;
    requestDate: bigint;
    reqId: WithdrawalId;
}
export interface Product {
    name: string;
    description: string;
    productId: ProductId;
    isActive: boolean;
    price: number;
}
export interface UserProfile {
    referralCode: string;
    userId: UserId;
    name: string;
    isActive: boolean;
    mobile: Mobile;
    walletBalance: number;
}
export enum UserRole {
    admin = "admin",
    user = "user"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_left_right {
    left = "left",
    right = "right"
}
export interface backendInterface {
    adminAddUser(name: string, mobile: string, referralCode: string, sponsorReferralCode: string): Promise<UserId>;
    adminApproveWithdrawal(reqId: WithdrawalId, adminNote: string): Promise<void>;
    adminConfirmPayment(paymentId: PaymentId): Promise<void>;
    adminCreateProduct(name: string, description: string, price: number): Promise<void>;
    adminCreditIncome(userId: UserId, amount: number, note: string): Promise<void>;
    adminGetAllTransactions(limit: bigint, offset: bigint): Promise<Array<Transaction>>;
    adminGetAllUsers(limit: bigint, offset: bigint): Promise<Array<User>>;
    adminGetAllWithdrawals(limit: bigint, offset: bigint): Promise<Array<WithdrawalRequest>>;
    adminGetDashboardStats(): Promise<{
        activeUsers: bigint;
        totalIncomeDistributed: number;
        totalPayments: bigint;
        pendingWithdrawalsCount: bigint;
        pendingWithdrawalsAmount: number;
        totalUsers: bigint;
        pendingPaymentsCount: bigint;
    }>;
    adminGetPaymentHistory(limit: bigint, offset: bigint): Promise<Array<PaymentRecord>>;
    adminGetPendingPayments(): Promise<Array<PaymentRecord>>;
    adminGetPendingWithdrawals(): Promise<Array<WithdrawalRequest>>;
    adminRejectPayment(paymentId: PaymentId, note: string): Promise<void>;
    adminRejectWithdrawal(reqId: WithdrawalId, adminNote: string): Promise<void>;
    adminSetBinaryPosition(parentUserId: UserId, childUserId: UserId, position: Variant_left_right): Promise<void>;
    adminToggleProduct(productId: ProductId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    generateOTP(mobile: string): Promise<OTP>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getProducts(): Promise<Array<Product>>;
    getTransactions(userId: UserId, limit: bigint, offset: bigint): Promise<Array<Transaction>>;
    getUserById(userId: UserId): Promise<User>;
    getUserByMobile(mobile: Mobile): Promise<User>;
    getUserByReferralCode(code: string): Promise<User>;
    getUserPayments(userId: UserId): Promise<Array<PaymentRecord>>;
    getUserProfile(userPrincipal: Principal): Promise<UserProfile | null>;
    getWallet(userId: UserId): Promise<{
        balance: number;
        transactions: Array<Transaction>;
    }>;
    getWithdrawalRequests(userId: UserId): Promise<Array<WithdrawalRequest>>;
    isCallerAdmin(): Promise<boolean>;
    loginUser(mobile: string, otp: OTP): Promise<User>;
    purchaseProduct(userId: UserId, productId: ProductId): Promise<void>;
    registerUser(name: string, mobile: string, referralCode: string, sponsorReferralCode: string, otp: OTP): Promise<User>;
    requestWithdrawal(userId: UserId, amount: number, bankName: string, accountNumber: string, ifscCode: string, upiId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitPaymentRequest(userId: UserId, productId: ProductId, upiTransactionRef: string): Promise<PaymentId>;
    verifyOTP(mobile: string, otp: OTP): Promise<boolean>;
}
