// https://vite.dev/config/
export default defineConfig({
logLevel: 'error', // Suppress warnings, only show errors
plugins: [
base44({
    // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
    // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
    legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
    hmrNotifier: true,
    navigationNotifier: true,
    visualEditAgent: true
}),
react(),
],
  server: {
    port: 3000,
    proxy: {
      // Forward API calls to the ASP.NET backend
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});