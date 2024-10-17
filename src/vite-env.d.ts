/// <reference types="vite/client" />
interface ImportMetaEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    // Add other environment variables here as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}