# Laravel CORS and Sanctum Configuration for React SPA

## Overview

This guide covers the complete setup of Laravel Sanctum with CORS configuration for a React SPA communicating across different origins.

**Scenario:**

- React Frontend: `http://localhost:3000` (Vite dev server)
- Laravel Backend: `http://localhost:8000` (php artisan serve)

## 1. Sanctum Setup for SPA Authentication

### Cookie-Based vs Token-Based Authentication

**For SPAs on different domains/ports: Use Cookie-Based (Sanctum SPA Authentication)**

**Why Cookie-Based for SPAs?**

- More secure - cookies are httpOnly, can't be accessed by JavaScript
- Automatic CSRF protection built-in
- Better session management
- Tokens are for mobile apps/third-party APIs

**Token-Based is for:**

- Mobile applications
- Third-party API consumers
- When you can't use cookies

### Session Configuration

Laravel Sanctum uses Laravel's session system for SPA authentication. The flow:

1. Frontend calls `/sanctum/csrf-cookie` to get CSRF token
2. Frontend sends login request with credentials
3. Laravel sets session cookie
4. Subsequent requests use the session cookie automatically

## 2. Configuration Files

### Step 1: Install Sanctum (if not already installed)

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### Step 2: Configure `config/sanctum.php`

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Requests from the following domains / hosts will receive stateful API
    | authentication cookies. Typically, these should include your local
    | and production domains which access your API via a frontend SPA.
    |
    */

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort()
    ))),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    |
    | This array contains the authentication guards that will be checked when
    | Sanctum is trying to authenticate a request. If none of these guards
    | are able to authenticate the request, Sanctum will use the bearer
    | token that's present on an incoming request for authentication.
    |
    */

    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | This value controls the number of minutes until an issued token will be
    | considered expired. If this value is null, personal access tokens do
    | not expire. This won't tweak the lifetime of first-party sessions.
    |
    */

    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    |
    | When authenticating your first-party SPA with Sanctum you may need to
    | customize some of the middleware Sanctum uses while processing the
    | request. You may change the middleware listed below as required.
    |
    */

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],

];
```

### Step 3: Configure `config/cors.php`

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
```

**Important:** `supports_credentials` MUST be `true` for cookie-based authentication.

### Step 4: Configure `.env`

```env
# Session Configuration
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000

# CORS
# Not needed in .env if configured in cors.php

# App Configuration
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

**For Production with same domain:**

```env
SESSION_DOMAIN=.yourdomain.com
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
```

### Step 5: Configure `config/session.php`

```php
<?php

return [
    // ... other settings

    'driver' => env('SESSION_DRIVER', 'file'),

    'lifetime' => env('SESSION_LIFETIME', 120),

    'expire_on_close' => false,

    'encrypt' => false,

    'files' => storage_path('framework/sessions'),

    'connection' => env('SESSION_CONNECTION'),

    'table' => 'sessions',

    'store' => env('SESSION_STORE'),

    'lottery' => [2, 100],

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug(env('APP_NAME', 'laravel'), '_').'_session'
    ),

    'path' => '/',

    'domain' => env('SESSION_DOMAIN'),

    'secure' => env('SESSION_SECURE_COOKIE', false),

    'http_only' => true,

    'same_site' => 'lax', // CRITICAL: Must be 'lax' or 'none' for cross-origin

];
```

**Important:** `same_site` must be `'lax'` or `'none'` for cross-origin requests. Use `'none'` only if `secure` is `true` (HTTPS).

## 3. Middleware Configuration

### Step 1: Update `app/Http/Kernel.php`

Ensure the API middleware group includes Sanctum:

```php
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    // ... other properties

    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    // ... rest of the file
}
```

**Critical:** `EnsureFrontendRequestsAreStateful` must be the FIRST middleware in the API group.

### Step 2: Update `app/Http/Middleware/VerifyCsrfToken.php`

Ensure CSRF verification is not excluded for API routes:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Do NOT add 'api/*' here for SPA authentication
        // Sanctum handles CSRF for stateful domains
    ];
}
```

## 4. Routes Configuration

### `routes/api.php`

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LogoutController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [LogoutController::class, 'logout']);

    // Your other protected routes
    Route::apiResource('contracts', ContractController::class);
});
```

## 5. Authentication Controllers

### Login Controller

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => Auth::user(),
        ]);
    }
}
```

### Logout Controller

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
```

## 6. Frontend Configuration (React + Axios)

### Step 1: Install Axios

```bash
npm install axios
```

### Step 2: Create Axios Instance (`src/api/axios.js`)

```javascript
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // CRITICAL: Must be true for cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add additional headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (redirect to login, etc.)
      console.error("Unauthorized - redirecting to login");
    }
    if (error.response?.status === 419) {
      // CSRF token mismatch - refresh CSRF token
      console.error("CSRF token mismatch");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Step 3: Authentication Service (`src/services/authService.js`)

```javascript
import axios from "../api/axios";

const authService = {
  // Get CSRF cookie before login/register
  async getCsrfCookie() {
    await axios.get("/sanctum/csrf-cookie");
  },

  // Login
  async login(email, password) {
    await this.getCsrfCookie();
    const response = await axios.post("/api/login", { email, password });
    return response.data;
  },

  // Register
  async register(userData) {
    await this.getCsrfCookie();
    const response = await axios.post("/api/register", userData);
    return response.data;
  },

  // Logout
  async logout() {
    const response = await axios.post("/api/logout");
    return response.data;
  },

  // Get authenticated user
  async getUser() {
    const response = await axios.get("/api/user");
    return response.data;
  },
};

export default authService;
```

### Step 4: Login Component Example

```jsx
import React, { useState } from "react";
import authService from "../services/authService";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      console.log("Login successful:", data);
      // Handle successful login (redirect, update state, etc.)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;
```

### Step 5: Auth Context (Optional but Recommended)

```jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

## 7. Common Pitfalls and Solutions

### Pitfall 1: Preflight Request Failures (OPTIONS)

**Symptom:** Browser shows CORS error on preflight requests

**Causes:**

- `cors.php` not properly configured
- `supports_credentials` is `false`
- Frontend origin not in `allowed_origins`

**Solution:**

```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3000'],
'supports_credentials' => true,
```

### Pitfall 2: Cookies Not Being Sent

**Symptom:** Session cookie not appearing in subsequent requests

**Causes:**

- `withCredentials: true` not set in Axios
- `SESSION_DOMAIN` mismatch
- `same_site` set to `'strict'`

**Solutions:**

1. **Axios configuration:**

```javascript
const axiosInstance = axios.create({
  withCredentials: true, // MUST BE TRUE
});
```

2. **Check .env:**

```env
SESSION_DOMAIN=localhost  # Not .localhost or specific port
```

3. **Check session.php:**

```php
'same_site' => 'lax', // NOT 'strict'
```

### Pitfall 3: CSRF Token Mismatch (419 Error)

**Symptom:** Getting 419 error on POST/PUT/DELETE requests

**Causes:**

- Not calling `/sanctum/csrf-cookie` before state-changing requests
- CSRF cookie expired
- Session domain mismatch

**Solutions:**

1. **Always get CSRF cookie first:**

```javascript
// Before login/register/any state-changing operation
await axios.get("/sanctum/csrf-cookie");
await axios.post("/api/login", credentials);
```

2. **Check middleware order:**

```php
// app/Http/Kernel.php - api middleware group
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, // FIRST
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

3. **Verify stateful domains:**

```env
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### Pitfall 4: Session Not Persisting

**Symptom:** User logged in but session lost on page refresh

**Causes:**

- Session driver misconfigured
- Session files not writable
- Cookie not being stored

**Solutions:**

1. **Check session driver:**

```env
SESSION_DRIVER=file  # or database
```

2. **Ensure storage/framework/sessions is writable:**

```bash
chmod -R 775 storage/framework/sessions
```

3. **Check browser cookies:**

- Open DevTools > Application > Cookies
- Verify `laravel_session` cookie exists with correct domain

### Pitfall 5: CORS Error: "Origin is not allowed"

**Symptom:** Browser blocks request with CORS policy error

**Causes:**

- Frontend URL not in `allowed_origins`
- Typo in URL (http vs https, trailing slash)
- Using wildcards incorrectly

**Solutions:**

1. **Exact match in cors.php:**

```php
'allowed_origins' => [
    'http://localhost:3000',  // Exact match, no trailing slash
    'http://127.0.0.1:3000',  // Both localhost and 127.0.0.1
],
```

2. **Don't use wildcards with credentials:**

```php
// DON'T DO THIS with supports_credentials: true
'allowed_origins' => ['*'],  // Won't work

// DO THIS:
'allowed_origins' => ['http://localhost:3000'],
```

### Pitfall 6: Mixed Content (HTTP/HTTPS)

**Symptom:** HTTPS frontend can't connect to HTTP backend

**Solution:** Both must use same protocol, or backend must use HTTPS

**For Production:**

```env
SESSION_SECURE_COOKIE=true
APP_URL=https://api.yourdomain.com
```

```php
// config/session.php
'same_site' => 'none', // Required for cross-site HTTPS
'secure' => true,      // Required for same_site: none
```

## 8. Testing the Configuration

### Manual Testing Checklist

1. **Test CSRF Cookie Endpoint:**

```bash
curl -X GET http://localhost:8000/sanctum/csrf-cookie \
  -H "Origin: http://localhost:3000" \
  -H "Referer: http://localhost:3000" \
  -v
```

Expected: 204 No Content with `Set-Cookie` headers

2. **Test Login:**

```javascript
// In browser console
await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
  withCredentials: true,
});
await axios.post(
  "http://localhost:8000/api/login",
  {
    email: "test@example.com",
    password: "password",
  },
  { withCredentials: true }
);
```

3. **Test Authenticated Request:**

```javascript
await axios.get("http://localhost:8000/api/user", { withCredentials: true });
```

4. **Check Cookies:**

- Open DevTools > Application > Cookies
- Verify `laravel_session` and `XSRF-TOKEN` cookies exist

### Automated Test Script

```javascript
// test-sanctum.js
import axios from "./src/api/axios";

async function testSanctumAuth() {
  try {
    console.log("1. Getting CSRF cookie...");
    await axios.get("/sanctum/csrf-cookie");
    console.log("✓ CSRF cookie obtained");

    console.log("\n2. Attempting login...");
    const loginResponse = await axios.post("/api/login", {
      email: "test@example.com",
      password: "password",
    });
    console.log("✓ Login successful:", loginResponse.data);

    console.log("\n3. Fetching authenticated user...");
    const userResponse = await axios.get("/api/user");
    console.log("✓ User fetched:", userResponse.data);

    console.log("\n4. Logging out...");
    await axios.post("/api/logout");
    console.log("✓ Logout successful");

    console.log("\n✓ All tests passed!");
  } catch (error) {
    console.error("✗ Test failed:", error.response?.data || error.message);
  }
}

testSanctumAuth();
```

## 9. Troubleshooting Guide

### Enable Detailed Error Messages

```php
// .env for development
APP_DEBUG=true
APP_ENV=local
```

### Check Laravel Logs

```bash
tail -f storage/logs/laravel.log
```

### Browser DevTools Network Tab

Check each request:

1. **Preflight (OPTIONS):**

   - Status: 204
   - Headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`

2. **Actual Request:**
   - Request Headers: `Cookie` includes session
   - Request Headers: `X-XSRF-TOKEN` present
   - Response Headers: `Set-Cookie` (for first request)

### Common Error Codes

- **401 Unauthorized:** Not authenticated, session expired
- **419 Page Expired:** CSRF token missing/invalid
- **403 Forbidden:** Authenticated but not authorized
- **CORS Error:** Origin not allowed or credentials issue

### Debug CORS Issues

```php
// Add to config/cors.php temporarily
'paths' => ['*'], // Test all routes
```

```javascript
// Test without withCredentials
const response = await axios.get("http://localhost:8000/api/user", {
  withCredentials: false,
});
```

### Session Debugging

```php
// In your controller
use Illuminate\Support\Facades\Session;

public function debug(Request $request)
{
    return [
        'session_id' => Session::getId(),
        'user' => Auth::user(),
        'authenticated' => Auth::check(),
        'csrf_token' => csrf_token(),
    ];
}
```

## 10. Production Considerations

### Use Same Domain

Best practice: Deploy frontend and backend on same domain:

- Frontend: `https://yourdomain.com`
- Backend: `https://yourdomain.com/api` or `https://api.yourdomain.com`

### Production .env

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

SESSION_DRIVER=database  # More reliable than file
SESSION_DOMAIN=.yourdomain.com  # Note the leading dot
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
```

### Production cors.php

```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],

'supports_credentials' => true,
```

### Use Redis for Sessions (Recommended)

```env
SESSION_DRIVER=redis
REDIS_CLIENT=phpredis
```

```bash
composer require predis/predis
```

### SSL Certificate

Ensure valid SSL certificate for HTTPS (Let's Encrypt, CloudFlare, etc.)

## 11. Complete Setup Checklist

### Backend Setup

- [ ] Install Sanctum: `composer require laravel/sanctum`
- [ ] Publish config: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
- [ ] Run migrations: `php artisan migrate`
- [ ] Configure `config/sanctum.php` with stateful domains
- [ ] Configure `config/cors.php` with frontend origin
- [ ] Update `.env` with SESSION_DOMAIN and SANCTUM_STATEFUL_DOMAINS
- [ ] Set `same_site` to `'lax'` in `config/session.php`
- [ ] Add `EnsureFrontendRequestsAreStateful` middleware to API group (first position)
- [ ] Create authentication routes in `routes/api.php`
- [ ] Create login/logout controllers
- [ ] Test backend is running: `php artisan serve`

### Frontend Setup

- [ ] Install Axios: `npm install axios`
- [ ] Create Axios instance with `withCredentials: true`
- [ ] Create authentication service with CSRF cookie call
- [ ] Implement login/logout functionality
- [ ] Add error handling for 401/419 responses
- [ ] Test CSRF cookie endpoint
- [ ] Test login flow
- [ ] Verify cookies in DevTools
- [ ] Test authenticated requests

### Verification

- [ ] CSRF cookie obtained successfully
- [ ] Login works and sets session cookie
- [ ] Session cookie sent with subsequent requests
- [ ] Protected routes require authentication
- [ ] Logout clears session
- [ ] No CORS errors in browser console
- [ ] No CSRF token mismatch errors

## 12. Quick Reference

### Key Concepts

1. **Stateful Domains:** Origins that will use cookie-based auth
2. **CSRF Cookie:** Must be obtained before state-changing requests
3. **withCredentials:** Must be true in Axios for cookies
4. **supports_credentials:** Must be true in CORS config
5. **same_site:** Must be 'lax' or 'none' for cross-origin

### Critical Files

- `config/sanctum.php` - Stateful domains
- `config/cors.php` - CORS settings
- `config/session.php` - Session configuration
- `.env` - Environment variables
- `app/Http/Kernel.php` - Middleware order

### Authentication Flow

```
1. GET /sanctum/csrf-cookie (set XSRF-TOKEN cookie)
2. POST /api/login (with credentials)
3. GET /api/user (authenticated, cookie sent automatically)
4. POST /api/logout (clear session)
```

### Must-Have Settings

```php
// cors.php
'supports_credentials' => true,
'allowed_origins' => ['http://localhost:3000'],

// session.php
'same_site' => 'lax',
'domain' => env('SESSION_DOMAIN', null),

// .env
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

```javascript
// Axios
const axios = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});
```

## Summary

Laravel Sanctum with CORS for React SPAs requires careful configuration of:

1. Sanctum stateful domains
2. CORS allowed origins with credentials support
3. Session configuration with appropriate same_site policy
4. Proper middleware order
5. Frontend Axios instance with withCredentials

The key is ensuring cookies can be set and sent across origins, which requires both backend (CORS, session) and frontend (withCredentials) configuration to work together.

Always call `/sanctum/csrf-cookie` before authentication operations, and ensure the `EnsureFrontendRequestsAreStateful` middleware is first in the API middleware group.
