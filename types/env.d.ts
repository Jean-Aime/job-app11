declare module '@env' {
  export const EXPO_PUBLIC_NEON_DATABASE_URL: string;
  export const EXPO_PUBLIC_JWT_SECRET: string;
}

// Augment the process.env type to reflect the actual env vars used
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_NEON_DATABASE_URL: string;
      EXPO_PUBLIC_JWT_SECRET: string;
    }
  }
}
