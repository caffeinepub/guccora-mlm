# Guccora MLM

## Current State
Full MLM platform with:
- User registration and login (mobile-only, no OTP)
- Binary MLM tree (Left/Right)
- Direct income (₹100/₹150/₹300 based on plan)
- Binary pair income (₹200/₹300/₹600)
- Level income (10 levels)
- Wallet with transaction history
- Withdrawal requests
- Product store (3 plans: Starter ₹599, Growth ₹999, Premium ₹1999)
- UPI payment system with admin approval
- Admin panel at /admin with dashboard, users, products, payments, withdrawals, binary tree management

**Current bug:** The `AccessControl.assignRole` function requires caller to already be admin before assigning any role. During login, callers aren't yet in the access control state, so `loginUserByMobile` always throws "Unauthorized: Only admins can assign user roles" when trying to set the user's role.

## Requested Changes (Diff)

### Add
- `forceAssignRole` internal helper in access-control that bypasses the admin check -- for use during login and registration flows only
- Mobile `6305462887` as the **primary/main admin** -- auto-created on first login with full admin role and all permissions
- `adminSetUserAsAdmin` endpoint so admin can promote any user to admin by userId

### Modify
- All `loginUserByMobile`, `loginUser`, and `registerUser` calls that use `AccessControl.assignRole(state, caller, caller, role)` must be changed to use `forceAssignRole(state, caller, role)` to eliminate the "Unauthorized: Only admins can assign user roles" error
- `6305462887` should be the PRIMARY admin (listed first, with name "Main Admin")
- `9999999999` remains as a secondary admin

### Remove
- Nothing removed

## Implementation Plan
1. Add `forceAssignRole(state, user, role)` to access-control module -- bypasses admin check, for internal use only
2. Replace all `AccessControl.assignRole(state, caller, caller, role)` in login/registration with `AccessControl.forceAssignRole(state, caller, role)`
3. Ensure `6305462887` is auto-seeded as primary admin with name "Main Admin" and referral code "ADMIN6305462887"
4. Ensure `9999999999` remains as secondary admin
5. Add `adminSetUserAsAdmin(userId)` endpoint for runtime admin promotion
6. Keep all existing admin endpoints: adminGetAllUsers, adminGetAllTransactions, adminGetAllWithdrawals, adminGetPendingWithdrawals, adminApproveWithdrawal, adminRejectWithdrawal, adminCreditIncome, adminGetDashboardStats, adminCreateProduct, adminToggleProduct, adminAddUser, adminSetBinaryPosition, adminConfirmPayment, adminRejectPayment, adminGetPaymentHistory, adminGetPendingPayments
