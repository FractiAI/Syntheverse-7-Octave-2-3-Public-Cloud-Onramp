# Mobile Black Screen Issue - iPhone Safari

**Date**: January 9, 2026  
**Issue**: Black screen when accessing landing page from iPhone Safari (works fine on MacBook)  
**Severity**: Critical (blocks mobile users)

---

## Root Causes Identified

### 1. **Complex Background Rendering**
```css
.nebula-background::before {
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  /* Creates 4x viewport size element - Safari mobile struggles */
}
```

**Problem**: iOS Safari has known issues with oversized absolute positioned elements. The 200% width/height causes rendering failures on mobile devices.

### 2. **Missing Viewport Meta Tag Safeguards**
Mobile Safari requires explicit viewport configuration for complex layouts.

### 3. **Animation Overhead on Mobile**
- 20 hydrogen particles animating simultaneously
- Multiple blur effects and gradients
- Complex CSS transforms

**Impact**: Mobile Safari may fail to render, showing black screen instead of degraded performance.

### 4. **Dark Mode Dependency**
```css
.dark {
  --background: 240 10% 3.9%;  /* Very dark blue, almost black */
}
```

If dark mode CSS doesn't load properly on mobile, background stays black.

---

## Immediate Fixes

### Fix 1: Add Mobile-Specific Background Simplification

### Fix 2: Add Solid Background Fallback

### Fix 3: Reduce Mobile Animations

### Fix 4: Add iOS Safari Specific Fixes

### Fix 5: Add Mobile Viewport Optimization

---

## Testing Checklist

- [ ] iPhone Safari (iOS 15+)
- [ ] iPhone Safari (iOS 14)
- [ ] iPad Safari
- [ ] Chrome on iPhone
- [ ] Firefox on iPhone
- [ ] MacBook Safari (regression test)
- [ ] MacBook Chrome (regression test)

