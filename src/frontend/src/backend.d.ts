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
    adminAddUser(name: string, mobile: string, referralCode: string, sponsorReferralCode: string): Promise<bigint>;
    adminApproveWithdrawal(reqId: bigint, adminNote: string): Promise<void>;
    adminConfirmPayment(paymentId: bigint): Promise<void>;
    adminCreateProduct(name: string, description: string, price: number): Promise<void>;
    adminCreditIncome(userId: bigint, amount: number, note: string): Promise<void>;
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
    adminRejectPayment(paymentId: bigint, note: string): Promise<void>;
    adminRejectWithdrawal(reqId: bigint, adminNote: string): Promise<void>;
    adminSetBinaryPosition(parentUserId: bigint, childUserId: bigint, position: Variant_left_right): Promise<void>;
    adminToggleProduct(productId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    generateOTP(mobile: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getProducts(): Promise<Array<Product>>;
    getTransactions(userId: bigint, limit: bigint, offset: bigint): Promise<Array<Transaction>>;
    getUserById(userId: bigint): Promise<User>;
    getUserByMobile(mobile: string): Promise<User>;
    getUserByReferralCode(code: string): Promise<User>;
    getUserPayments(userId: bigint): Promise<Array<PaymentRecord>>;
    getUserProfile(userPrincipal: Principal): Promise<UserProfile | null>;
    getWallet(userId: bigint): Promise<{
        balance: number;
        transactions: Array<Transaction>;
    }>;
    getWithdrawalRequests(userId: bigint): Promise<Array<WithdrawalRequest>>;
    isCallerAdmin(): Promise<boolean>;
    loginUser(mobile: string, otp: string): Promise<User>;
    loginUserByMobile(mobile: string): Promise<User>;
    purchaseProduct(userId: bigint, productId: bigint): Promise<void>;
    registerUser(name: string, mobile: string, referralCode: string, sponsorReferralCode: string, otp: string): Promise<User>;
    requestWithdrawal(userId: bigint, amount: number, bankName: string, accountNumber: string, ifscCode: string, upiId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitPaymentRequest(userId: bigint, productId: bigint, upiTransactionRef: string): Promise<bigint>;
    verifyOTP(mobile: string, otp: string): Promise<boolean>;
}
