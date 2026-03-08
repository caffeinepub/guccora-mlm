# Guccora MLM

## Current State
The backend has a `loginUserByMobile` function that calls `AccessControl.assignRole(...)` during login. The `assignRole` function in `access-control.mo` checks `isAdmin(state, caller)` before assigning any role. Since the caller is not yet registered in the access control state at login time, the check fails and throws "Unauthorized: Only admins can assign user roles".

Mobile `6305462887` is intended as main admin but the error prevents login from completing.

## Requested Changes (Diff)

### Add
- `forceAssignRole` function in `access-control.mo` that bypasses the admin check -- for internal use only during login/registration flows
- `hasPermissionOrGuest` helper to allow unauthenticated reads where appropriate

### Modify
- `access-control.mo`: Add `forceAssignRole(state, user, role)` that directly sets the role without checking caller admin status
- `main.mo` `loginUserByMobile`: Replace all `AccessControl.assignRole(state, caller, caller, ...)` calls with `AccessControl.forceAssignRole(state, caller, ...)` -- login only authenticates, does not require prior admin status
- `main.mo` `loginUser`: Replace `AccessControl.assignRole` call with `AccessControl.forceAssignRole` 
- `main.mo` `registerUser`: Replace `AccessControl.assignRole` call with `AccessControl.forceAssignRole`
- `main.mo` `loginUserByMobile` for `6305462887`: Update name to "Main Admin" to reflect primary admin status

### Remove
- Nothing removed

## Implementation Plan
1. Add `forceAssignRole` to `access-control.mo` that skips the admin check
2. Update all calls in `main.mo` (`loginUser`, `loginUserByMobile`, `registerUser`) to use `forceAssignRole`
3. Update 6305462887 admin name to "Main Admin"
4. Validate and deploy
