# XSS (Cross-Site Scripting) Explanation

## What is XSS?

**XSS (Cross-Site Scripting)** is a security vulnerability where attackers inject malicious JavaScript code into web pages that other users view.

## How It Works

1. **Attacker submits malicious code** as user input (like in a comment, form, or submission)
2. **Website doesn't sanitize** the input properly
3. **Malicious code gets stored** in the database or displayed on the page
4. **When another user views the page**, the malicious script runs in their browser
5. **The script can steal** cookies, session tokens, personal data, or perform actions as the user

## Real-World Example

### Attack Scenario:
```
1. Attacker writes a comment: 
   <script>alert('Your cookies: ' + document.cookie)</script>

2. Website stores it without sanitization

3. When you view the page, the script runs and shows your cookies
```

### What Could Happen:
- **Steal session tokens** → Attacker can log in as you
- **Steal personal data** → Credit cards, addresses, etc.
- **Redirect to malicious sites** → Phishing attacks
- **Perform actions as you** → Post content, change settings

## Common XSS Attack Patterns

### 1. Script Tags
```html
<script>alert('XSS')</script>
```
**What it does**: Runs JavaScript code directly

### 2. Event Handlers
```html
<img src=x onerror=alert('XSS')>
```
**What it does**: Runs code when image fails to load

### 3. JavaScript Protocol
```html
<a href="javascript:alert('XSS')">Click me</a>
```
**What it does**: Runs JavaScript when link is clicked

### 4. SVG with onload
```html
<svg onload=alert('XSS')>
```
**What it does**: Runs code when SVG loads

### 5. Injected Script in Attributes
```html
"><script>alert('XSS')</script>
```
**What it does**: Breaks out of HTML attributes and injects script

## How Our Test Prevents XSS

### Our Sanitization Function:
```typescript
const sanitizeXSS = (input: string): string => {
    return input
        .replace(/</g, '&lt;')      // < becomes &lt; (HTML entity)
        .replace(/>/g, '&gt;')       // > becomes &gt; (HTML entity)
        .replace(/"/g, '&quot;')     // " becomes &quot; (HTML entity)
        .replace(/'/g, '&#x27;')     // ' becomes &#x27; (HTML entity)
        .replace(/\//g, '&#x2F;')    // / becomes &#x2F; (HTML entity)
}
```

### What This Does:
- **Converts dangerous characters** to HTML entities
- **Prevents scripts from executing** by escaping them
- **Makes code display as text** instead of running

### Example:
```typescript
// Input (dangerous):
<script>alert('XSS')</script>

// After sanitization (safe):
&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;

// When displayed in browser:
<script>alert('XSS')</script>  // Shows as text, doesn't run!
```

## What Our Test Validates

Our test checks that:
1. ✅ **Sanitization function exists** and works
2. ✅ **All 5 common XSS patterns** are properly sanitized
3. ✅ **Dangerous patterns are removed**:
   - No `<script>` tags remain
   - No `onerror=` event handlers remain
   - No `javascript:` protocol handlers remain

## Why This Matters

Without XSS protection:
- ❌ Attackers could steal user data
- ❌ Attackers could hijack user sessions
- ❌ Attackers could deface your website
- ❌ Users would lose trust in your platform

With XSS protection:
- ✅ User input is safe to display
- ✅ Malicious code is neutralized
- ✅ User data is protected
- ✅ Platform is secure

## In Simple Terms

**XSS = Bad guys trying to inject malicious code into your website**

**Our test = Making sure we catch and neutralize those attacks before they can hurt anyone**

---

**Think of it like**: A security guard checking everyone's bags before they enter a building. We're checking user input before it gets displayed to other users!

