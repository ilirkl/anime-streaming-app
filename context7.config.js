/**
 * Context7 configuration for anime streaming app
 * This file configures how Context7 MCP should process and provide context to AI models
 */

module.exports = {
  // Project information
  project: {
    name: "anime-streaming-app",
    description: "A Next.js application for streaming anime content",
    repository: "https://github.com/yourusername/anime-streaming-app",
  },
  
  // File patterns to include/exclude
  files: {
    include: [
      "src/**/*.{ts,tsx,js,jsx}",
      "public/**/*.{json,md}",
    ],
    exclude: [
      "node_modules/**",
      ".next/**",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
    ],
  },
  
  // Context providers
  providers: [
    {
      name: "file-system",
      options: {
        maxDepth: 5,
        maxFiles: 100,
      },
    },
    {
      name: "dependencies",
      options: {
        includeDevDependencies: false,
      },
    },
  ],
  
  // Custom context rules
  rules: [
    {
      name: "anime-components",
      pattern: "src/components/anime/**/*.tsx",
      description: "Components related to anime display and interaction",
      priority: "high",
    },
    {
      name: "layout-components",
      pattern: "src/components/layout/**/*.tsx",
      description: "Layout components for the application",
      priority: "medium",
    },
    {
      name: "api-services",
      pattern: "src/lib/**/*.ts",
      description: "API services and utilities",
      priority: "high",
    },
  ],
  
  // Context pruning settings
  pruning: {
    enabled: true,
    maxTokens: 8000,
    strategy: "priority-based",
  },
  
  // Caching settings
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour in seconds
  },
};
