// Global type declarations to prevent TypeScript build errors
// This file helps TypeScript resolve types for packages that provide their own types

// Suppress implicit type library inclusion for minimatch
// minimatch provides its own types, so we don't need @types/minimatch
declare module 'minimatch' {
  // Re-export from the actual minimatch package
  export * from 'minimatch';
}

