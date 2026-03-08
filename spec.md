# Guccora MLM

## Current State
The app has a full Motoko backend with users, products, payments, wallet, and binary MLM tree. The frontend uses mobile-only login (no OTP entry required). However, the backend `loginUser` function still requires OTP verification internally, which causes IC0508 errors when the canister restarts (in-memory OTP state is wiped). Admin `9999999999` exists only as a frontend hint but is not in the backend.

## Requested Changes (Diff)

### Add
- Auto-create admin user `9999999999` on backend startup (seeded on first login attempt)
- `loginUserByMobile` function that does NOT require OTP -- just looks up user by mobile and links principal

### Modify
- `loginUser` backend: make OTP verification optional/bypass -- accept any OTP or skip check entirely (since OTP is disabled in UI)
- Frontend `LoginPage`, `RegisterPage`, `AdminPage` login flows: call the simplified login that never errors on OTP
- Admin check: mobile `9999999999` should also be treated as admin in frontend fallback (alongside `6305462887`)

### Remove
- Hard OTP dependency in `loginUser` that causes IC0508/state-wipe failures

## Implementation Plan
1. Modify `loginUser` in `main.mo` to skip OTP verification (accept any OTP string, always succeeds if user exists) -- this makes login resilient to canister restarts
2. Add a `loginUserByMobile` public function that takes only mobile, no OTP, returns User -- simplest path
3. Auto-seed admin user `9999999999` with name "Admin" and role binding on first call to `loginUserByMobile` if not present
4. Update frontend `LoginPage`, `RegisterPage`, `AdminPage` to call `loginUserByMobile` instead of `loginUser`
5. Update `backend.d.ts` to add `loginUserByMobile` signature
6. Update admin mobile list in frontend to include both `9999999999` and `6305462887`
