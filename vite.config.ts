import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // This line loads variables from your .env files into Node's process.env,
    // making them available for use within this configuration file.
    process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};

    // The API key to be used by the application.
    // We prioritize VITE_GEMINI_API_KEY, which is the standard for client-side
    // variables with Vite and what platforms like Netlify expect.
    // We also check for GEMINI_API_KEY for local development convenience.
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // This securely injects the API key into the client-side code during the build process.
        // The rest of the app can continue to use `process.env.API_KEY` as before.
        'process.env.API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});