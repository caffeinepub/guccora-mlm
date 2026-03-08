# Guccora MLM

## Current State
- Three product plans (Starter ₹599, Growth ₹999, Premium ₹1999) are displayed on the products page
- Products page shows plan cards with a purchase button, but no payment flow
- `purchaseProduct` backend call exists but doesn't activate the user account or record a payment
- Admin panel has Stats, Users, Withdrawals, Transactions, Binary Tree, Products, and Access tabs
- No dedicated payment history in admin panel

## Requested Changes (Diff)

### Add
- UPI payment modal on the products page: show a QR code or UPI ID, an input for UTR/transaction reference number, and a "Confirm Payment" button
- `PaymentRecord` type in backend: stores paymentId, userId, productId, amount, upiTransactionRef, status (pending/confirmed), timestamp, upiId
- `submitPaymentRequest` backend function: creates a PaymentRecord with status "pending", to be reviewed by admin
- `adminConfirmPayment` backend function: confirms a payment, activates the user account, and triggers direct income to sponsor
- `adminGetPaymentHistory` backend function: returns all payment records (paginated)
- `adminGetPendingPayments` backend function: returns pending payment records
- "Payments" tab in admin panel showing all payment records with confirm/reject actions
- Admin stats card for total payments and pending payments count
- Payment history section on admin dashboard

### Modify
- `purchaseProduct`: instead of directly processing, now creates a payment request and shows UPI payment dialog
- Products page: after clicking Purchase button, open a UPI payment dialog with company UPI ID, amount, and a field to enter UTR reference number
- Admin Stats tab: add a "Payments" stat card
- `adminGetDashboardStats`: include totalPayments and pendingPaymentsCount in response

### Remove
- Nothing removed

## Implementation Plan
1. Update backend (main.mo):
   - Add `PaymentRecord` type and `payments` map
   - Add `nextPaymentId` counter
   - Add `submitPaymentRequest(userId, productId, upiTransactionRef)` - creates pending payment, returns PaymentId
   - Add `adminConfirmPayment(paymentId)` - confirms payment, activates user, distributes direct income to sponsor, records transaction
   - Add `adminRejectPayment(paymentId, note)` - rejects payment, updates status
   - Add `adminGetPaymentHistory(limit, offset)` - returns all payments sorted by timestamp desc
   - Add `adminGetPendingPayments()` - returns pending payments
   - Update `adminGetDashboardStats` to include totalPayments and pendingPaymentsCount
2. Update frontend ProductsPage:
   - Add UPI payment dialog component
   - On "Purchase" click: open dialog with UPI ID (guccora@upi), amount, QR code placeholder, UTR input
   - On confirm: call `submitPaymentRequest`, show success toast with "Payment submitted, awaiting admin confirmation"
3. Update frontend AdminPage:
   - Add "Payments" tab with pending/all filter
   - Show payment records with user name, amount, UPI ref, status, timestamp
   - Confirm and Reject buttons per pending payment
   - Add payments stat card to Stats tab
