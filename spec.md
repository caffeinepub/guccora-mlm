# Guccora MLM

## Current State
The admin panel at /admin has 8 tabs: Stats, Users, W/D (Withdrawals), Txns (Transactions), Tree (Binary), Products, Access, and Pays (Payments). All core functionality exists including add/edit/delete products, withdrawal approval, and payment confirmation. The "Pays" tab shows pending/all UPI payment records submitted by users.

## Requested Changes (Diff)

### Add
- A dedicated "Purchases" tab in the admin panel showing product purchase history (calls `adminGetPaymentHistory`) with clear columns: user name, product name, amount, date, status
- "View Product Purchases" section under Products tab that shows per-product purchase count and revenue summary

### Modify
- Rename the "Pays" tab to "Payments" with full label visible (not just icon) to clarify it covers payment approval
- Improve the Payments tab header to clearly say "Payment Approval" with pending count badge more prominent
- Make the Products tab show a "Purchases" summary section below the product list (total purchases per product from payment history)
- Ensure withdrawal tab is clearly labeled "Withdrawals" and approve/reject buttons are prominent

### Remove
- Nothing removed

## Implementation Plan
1. In AdminPage.tsx tab list: rename "Pays" label to "Payments" (already partially there but hidden on small screens — make the label always visible)
2. Add a "Purchases" tab between Products and Access tabs that shows all confirmed payment records as a purchase history table with user, product, amount, date columns
3. Add a product purchases summary inside the Products tab — a collapsible section showing confirmed purchase count per product, pulled from allPayments filtered to `status === "confirmed"`
4. Improve tab labels to show text on all screen sizes (remove `hidden sm:inline` restrictions for key tabs)
5. Update withdrawal tab to show "Withdrawals" as full text and approve button to say "Approve" with green styling
