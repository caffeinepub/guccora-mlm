# Guccora MLM

## Current State
Full MLM app with user registration, dashboard, binary tree, wallet, withdrawals, product store. Admin panel at `/admin` with 6 tabs: Stats, Users, Withdrawals, Transactions, Binary Tree, Products. Admin login uses mobile + any PIN. Login page redirects admin users to `/admin`.

## Requested Changes (Diff)

### Add
- Product edit functionality (edit name, description, price inline or via dialog)
- Product delete functionality (delete button with confirm dialog)
- More dashboard stats: total products, total withdrawal requests count, total transactions count
- Admin login should work with just mobile number (9999999999), no PIN required — auto-login flow matching the app's simplified registration/login
- After admin login on `/admin`, show admin dashboard immediately

### Modify
- Admin login form: remove PIN field, just require mobile number, show "Login as Admin" button that directly logs in (generate OTP + login behind the scenes, same as simplified registration flow)
- Products tab: add edit button (opens edit dialog) and delete button (with confirm alert dialog) per product
- Stats tab: show 2 additional stat cards — Total Products count, Total Transactions count
- Product cards: show edit and delete controls alongside the active toggle

### Remove
- PIN field from admin login form
- Demo hint showing PIN (update to show mobile 9999999999 only)

## Implementation Plan
1. Update `AdminLogin` component: remove PIN state/field, simplify to mobile-only login (generateOTP + loginUser in one click)
2. Update demo hint in admin login to remove PIN reference
3. Add `editProductDialog` state to `AdminDashboard` for editing products
4. Add `adminUpdateProduct` or use `adminToggleProduct` + inline edit — check backend.d.ts for update API; if not present, implement UI-only edit that calls `adminCreateProduct` for new and uses toggle for active state
5. Add `adminDeleteProduct` mutation — check if backend supports it; wire delete button with AlertDialog confirm
6. Add 2 more stat cards in Stats tab using products.length and allTransactions.length 
7. Apply deterministic `data-ocid` markers to all new interactive elements
