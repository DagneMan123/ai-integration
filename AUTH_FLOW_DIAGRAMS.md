# Authentication Flow Diagrams

## 1. Login Flow (Complete)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INITIATES LOGIN                        │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  App.tsx Route Guard                                                │
│  ├─ Check: _hasHydrated && user                                    │
│  ├─ Result: false (not hydrated or no user)                        │
│  └─ Action: Render <Login /> component                             │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Login.tsx Component Mounts                                         │
│  ├─ useEffect runs on mount                                        │
│  ├─ Action: localStorage.clear()                                   │
│  └─ Result: Clean slate ready for login                            │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  User Enters Credentials                                            │
│  ├─ Email: test@example.com                                        │
│  ├─ Password: ••••••••                                              │
│  └─ Clicks: Sign In button                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  POST /api/auth/login                                               │
│  ├─ Request: { email, password }                                   │
│  ├─ Backend: Validates credentials                                 │
│  ├─ Backend: Generates JWT token                                   │
│  └─ Response: { user, token, refreshToken }                        │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  setAuth() Called                                                   │
│  ├─ Action 1: localStorage.setItem('token', token)                 │
│  ├─ Action 2: localStorage.setItem('refreshToken', refreshToken)   │
│  ├─ Action 3: set({ user, token, refreshToken })                  │
│  └─ Result: Token available for API requests                       │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Component Redirects                                                │
│  ├─ navigate(`/${user.role}/dashboard`)                            │
│  └─ Example: /candidate/dashboard                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PrivateRoute Component                                             │
│  ├─ Check: token exists                                            │
│  ├─ Check: user exists                                             │
│  ├─ Check: role matches                                            │
│  └─ Action: Render protected content                               │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard Renders                                                  │
│  ├─ User data displayed                                            │
│  ├─ Navigation available                                           │
│  └─ Session active                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  API Requests Include Token                                         │
│  ├─ Request Interceptor runs                                       │
│  ├─ Fetch: token = localStorage.getItem('token')                   │
│  ├─ Inject: Authorization: Bearer <token>                          │
│  └─ Send: Request with token                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Token Expiration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  User Makes API Request                                             │
│  ├─ Token in localStorage is expired                               │
│  ├─ Request Interceptor fetches token                              │
│  └─ Sends request with expired token                               │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Backend Receives Request                                           │
│  ├─ Auth Middleware verifies token                                 │
│  ├─ Token is expired                                               │
│  └─ Returns: 401 Unauthorized                                      │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Response Interceptor Catches 401                                   │
│  ├─ Check: error.response?.status === 401                          │
│  ├─ Action 1: localStorage.removeItem('token')                     │
│  ├─ Action 2: localStorage.removeItem('refreshToken')              │
│  ├─ Action 3: useAuthStore.getState().logout()                     │
│  └─ CRITICAL: Do NOT redirect                                      │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Return Rejected Promise                                            │
│  ├─ Promise.reject(error)                                          │
│  └─ Component handles error                                        │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PrivateRoute Re-renders                                            │
│  ├─ Check: token exists                                            │
│  ├─ Result: token is null (cleared)                                │
│  ├─ Action: Render <Login /> directly                              │
│  └─ NO navigation, NO page refresh                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  User Sees Login Page                                               │
│  ├─ No redirect loop                                               │
│  ├─ No page refresh                                                │
│  ├─ Clean slate ready for new login                                │
│  └─ Session properly terminated                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. Logout Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  User Clicks Logout Button                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  logout() Function Called                                           │
│  ├─ Action 1: localStorage.removeItem('token')                     │
│  ├─ Action 2: localStorage.removeItem('refreshToken')              │
│  ├─ Action 3: localStorage.removeItem('auth-storage')              │
│  ├─ Action 4: Clear all auth-related keys                          │
│  └─ Action 5: set({ user: null, token: null, ... })               │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Zustand State Updated                                              │
│  ├─ user: null                                                     │
│  ├─ token: null                                                    │
│  ├─ refreshToken: null                                             │
│  └─ isLoading: false                                               │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PrivateRoute Re-renders                                            │
│  ├─ Check: token exists                                            │
│  ├─ Result: token is null                                          │
│  ├─ Action: Render <Login /> directly                              │
│  └─ NO navigation, NO page refresh                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  User Back on Login Page                                            │
│  ├─ localStorage cleared                                           │
│  ├─ State cleared                                                  │
│  ├─ Session terminated                                             │
│  └─ Ready for new login                                            │
└─────────────────────────────────────────────────────────────────────┘
```

## 4. Page Refresh Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  User Logged In on Dashboard                                        │
│  ├─ Token in localStorage                                          │
│  ├─ User in Zustand state                                          │
│  └─ Session active                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  User Presses F5 (Refresh)                                          │
│  ├─ Page reloads                                                   │
│  ├─ React app re-initializes                                       │
│  └─ Zustand store re-initializes                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Zustand Hydration Starts                                           │
│  ├─ _hasHydrated: false                                            │
│  ├─ Reads from localStorage                                        │
│  ├─ Restores: user, token, refreshToken                            │
│  └─ Sets: _hasHydrated: true                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  App.tsx Route Guard Checks                                         │
│  ├─ Check: _hasHydrated === true                                   │
│  ├─ Check: user exists                                             │
│  ├─ Result: Both true                                              │
│  └─ Action: Render dashboard (not login)                           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PrivateRoute Component                                             │
│  ├─ Check: token exists                                            │
│  ├─ Check: user exists                                             │
│  ├─ Check: role matches                                            │
│  └─ Action: Render protected content                               │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard Renders                                                  │
│  ├─ Session maintained                                             │
│  ├─ User data displayed                                            │
│  ├─ No login page shown                                            │
│  └─ No redirect loops                                              │
└─────────────────────────────────────────────────────────────────────┘
```

## 5. Request-Time Token Injection

```
┌─────────────────────────────────────────────────────────────────────┐
│  Component Makes API Request                                        │
│  ├─ Example: GET /api/user/profile                                 │
│  └─ Calls: apiService.get('/user/profile')                         │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Request Interceptor Runs                                           │
│  ├─ CRITICAL: Fetch token at request time                          │
│  ├─ const token = localStorage.getItem('token')                    │
│  ├─ Reason: Always get latest token                                │
│  └─ NOT: useAuthStore.getState().token (stale!)                    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Token Validation                                                   │
│  ├─ Check: token exists                                            │
│  ├─ Check: token is not empty                                      │
│  └─ Result: Token is valid                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Inject Token into Header                                           │
│  ├─ config.headers.Authorization = `Bearer ${token}`               │
│  └─ Example: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...         │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Send Request to Backend                                            │
│  ├─ Headers include Authorization                                  │
│  ├─ Backend receives request                                       │
│  └─ Auth middleware verifies token                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Backend Response                                                   │
│  ├─ If valid: 200 OK with data                                     │
│  ├─ If expired: 401 Unauthorized                                   │
│  └─ If invalid: 401 Unauthorized                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## 6. Hydration Check (Race Condition Prevention)

```
┌─────────────────────────────────────────────────────────────────────┐
│  App.tsx Mounts                                                     │
│  ├─ Zustand store initializes                                      │
│  ├─ _hasHydrated: false (initial state)                            │
│  └─ Hydration starts (async)                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Route Guard Checks                                                 │
│  ├─ Check: _hasHydrated && user                                    │
│  ├─ Result: false && null = false                                  │
│  ├─ Action: Render <Login /> component                             │
│  └─ CRITICAL: Do NOT redirect yet                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Hydration Completes (~100ms)                                       │
│  ├─ localStorage read complete                                     │
│  ├─ user and token restored                                        │
│  ├─ _hasHydrated: true                                             │
│  └─ onRehydrateStorage callback fires                              │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Route Guard Re-evaluates                                           │
│  ├─ Check: _hasHydrated && user                                    │
│  ├─ Result: true && { user object } = true                         │
│  ├─ Action: Redirect to dashboard                                  │
│  └─ SAFE: Hydration complete, no race condition                    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard Renders                                                  │
│  ├─ Session maintained                                             │
│  ├─ No redirect loops                                              │
│  └─ User data available                                            │
└─────────────────────────────────────────────────────────────────────┘
```

## 7. Error Handling Flow (401 Unauthorized)

```
┌─────────────────────────────────────────────────────────────────────┐
│  API Request Fails with 401                                         │
│  ├─ Response Status: 401 Unauthorized                              │
│  ├─ Reason: Token expired or invalid                               │
│  └─ Response Interceptor catches error                             │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Check Error Status                                                 │
│  ├─ if (error.response?.status === 401)                            │
│  ├─ Result: true                                                   │
│  └─ Proceed with cleanup                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Clear Token from localStorage                                      │
│  ├─ localStorage.removeItem('token')                               │
│  ├─ localStorage.removeItem('refreshToken')                        │
│  └─ Token no longer available for requests                         │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Call logout() Function                                             │
│  ├─ Clear all auth-related localStorage keys                       │
│  ├─ Clear Zustand state                                            │
│  └─ Set: user: null, token: null                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Return Rejected Promise                                            │
│  ├─ Promise.reject(error)                                          │
│  ├─ CRITICAL: Do NOT redirect                                      │
│  └─ CRITICAL: Do NOT refresh page                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Component Handles Error                                            │
│  ├─ Catch block receives error                                     │
│  ├─ Show error toast/message                                       │
│  └─ Continue rendering                                             │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PrivateRoute Re-renders                                            │
│  ├─ Check: token exists                                            │
│  ├─ Result: token is null (cleared)                                │
│  ├─ Action: Render <Login /> directly                              │
│  └─ NO navigation, NO page refresh, NO loops                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 8. State Management Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE (authStore.ts)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  State:                                                             │
│  ├─ user: User | null                                              │
│  ├─ token: string | null                                           │
│  ├─ refreshToken: string | null                                    │
│  ├─ _hasHydrated: boolean                                          │
│  └─ isLoading: boolean                                             │
│                                                                     │
│  Actions:                                                           │
│  ├─ setAuth(user, token, refreshToken)                             │
│  │  └─ Saves to localStorage + updates state                       │
│  ├─ logout()                                                        │
│  │  └─ Clears localStorage + clears state                          │
│  ├─ updateUser(userData)                                           │
│  │  └─ Updates user object                                         │
│  ├─ setIsLoading(boolean)                                          │
│  │  └─ Sets loading state                                          │
│  └─ setHasHydrated(boolean)                                        │
│     └─ Sets hydration status                                       │
│                                                                     │
│  Selectors:                                                         │
│  ├─ isAuthenticated()                                              │
│  │  └─ Returns: !!token && !!user                                  │
│  ├─ isAdmin()                                                       │
│  │  └─ Returns: user.role === 'ADMIN'                              │
│  ├─ isEmployer()                                                    │
│  │  └─ Returns: user.role === 'EMPLOYER'                           │
│  └─ isCandidate()                                                   │
│     └─ Returns: user.role === 'CANDIDATE'                          │
│                                                                     │
│  Persistence:                                                       │
│  ├─ Storage: localStorage                                          │
│  ├─ Key: 'auth-storage'                                            │
│  └─ Hydration: Automatic on app load                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    LOCALSTORAGE (Browser)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Keys:                                                              │
│  ├─ 'token': JWT token string                                      │
│  ├─ 'refreshToken': Refresh token string                           │
│  └─ 'auth-storage': Zustand persisted state (JSON)                 │
│                                                                     │
│  Lifecycle:                                                         │
│  ├─ Set on login (setAuth)                                         │
│  ├─ Read on app load (hydration)                                   │
│  ├─ Read on every API request (token injection)                    │
│  └─ Cleared on logout or 401 error                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

**Last Updated**: April 19, 2026
**Status**: PRODUCTION READY
