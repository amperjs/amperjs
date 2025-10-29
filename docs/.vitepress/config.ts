import { defineConfig } from "vitepress";
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from "vitepress-plugin-group-icons";
import llmstxt from "vitepress-plugin-llms";

const icons = {
  gear: "\u2699\uFE0F",
};

export default defineConfig({
  lang: "en-US",
  title: "⚡ AmperJS",

  vite: {
    plugins: [llmstxt(), groupIconVitePlugin()],
  },

  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },

  themeConfig: {
    search: {
      provider: "local",
    },
    nav: [
      {
        text: "📚 Guide",
        link: "/start",
        activeMatch: "^/(?!generators/|plugins/).+",
      },
      {
        text: "🎨 Generators",
        activeMatch: "^/generators/",
        items: [
          {
            text: "🔹 SolidJS",
            link: "/generators/solid/",
          },
          {
            text: "🔹 React",
            link: "/generators/react/",
          },
          {
            text: "🔹 OpenAPI",
            link: "/generators/openapi/",
          },
          {
            items: [
              {
                text: "Writing Generators",
                link: "/generators/writing-generators/",
              },
            ],
          },
        ],
      },
      {
        text: "🔌 Plugins",
        link: "/plugins/",
        activeMatch: "^/plugins/",
      },
    ],

    sidebar: {
      "/generators/": [
        {
          text: "SolidJS Generator",
          collapsed: false,
          items: [
            {
              text: "🛠 Install / Setup",
              docFooterText: "🛠 SolidJS - Install / Setup",
              link: "/generators/solid/",
            },
            {
              text: "🏗 Application",
              link: "/generators/solid/application",
            },
            {
              text: "🛣 Automated Routing",
              link: "/generators/solid/routing",
            },
            {
              text: "📥 Data / Preload",
              link: "/generators/solid/preload",
            },
            {
              text: "🔄 useResource Helper",
              link: "/generators/solid/useResource",
            },
            {
              text: "🧭 Link Navigation",
              link: "/generators/solid/link",
            },
            {
              text: "🔧 Utilities",
              link: "/generators/solid/utilities",
            },
            {
              text: `${icons.gear} Customization`,
              link: "/generators/solid/customization",
            },
            {
              text: "🎨 Custom Templates",
              link: "/generators/solid/custom-templates",
            },
            {
              text: "💡 Best Practices",
              docFooterText: "💡 SolidJS - Best Practices",
              link: "/generators/solid/best-practices",
            },
          ],
        },
        {
          text: "React Generator",
          collapsed: false,
          items: [
            {
              text: "🛠 Install / Setup",
              docFooterText: "🛠 React - Install / Setup",
              link: "/generators/react/",
            },
            {
              text: "🏗 Application",
              link: "/generators/react/application",
            },
            {
              text: "🛣 Automated Routing",
              link: "/generators/react/routing",
            },
            {
              text: "📥 Data Loader",
              link: "/generators/react/loader",
            },
            {
              text: "🧭 Link Navigation",
              link: "/generators/react/link",
            },
            {
              text: `${icons.gear} Customization`,
              link: "/generators/react/customization",
            },
            {
              text: "🎨 Custom Templates",
              link: "/generators/react/custom-templates",
            },
            {
              text: "💡 Best Practices",
              docFooterText: "💡 React - Best Practices",
              link: "/generators/react/best-practices",
            },
          ],
        },
        {
          text: "OpenAPI Generator",
          collapsed: false,
          items: [
            {
              text: "🛠 Install / Setup",
              docFooterText: "🛠 OpenAPI - Install / Setup",
              link: "/generators/openapi/",
            },
            {
              text: `${icons.gear} Configuration`,
              link: "/generators/openapi/configuration",
            },
            {
              text: "🏗 Generated Spec",
              link: "/generators/openapi/generated-spec",
            },
            {
              text: "💡 Best Practices",
              docFooterText: "💡 OpenAPI Best Practices",
              link: "/generators/openapi/best-practices",
            },
          ],
        },
        {
          text: "Writing Generators",
          collapsed: false,
          items: [
            {
              text: "🏗 Architecture",
              docFooterText: "🏗 Generators Architecture",
              link: "/generators/writing-generators/",
            },
            {
              text: `${icons.gear} User Options`,
              link: "/generators/writing-generators/user-options",
            },
            {
              text: "🏭 Factory",
              link: "/generators/writing-generators/factory",
            },
            {
              text: "👀 Watch Handler",
              link: "/generators/writing-generators/watch-handler",
            },
            {
              text: "🔄 Incremental Updates",
              link: "/generators/writing-generators/incremental-updates",
            },
            {
              text: "🗂 Route Entries",
              link: "/generators/writing-generators/route-entries",
            },
            {
              text: "📝 Formatters",
              link: "/generators/writing-generators/formatters",
            },
            {
              text: "🧭 Path Resolver",
              link: "/generators/writing-generators/path-resolver",
            },
            {
              text: "📦 Example",
              link: "/generators/writing-generators/example",
            },
            {
              text: "💡 Best Practices",
              link: "/generators/writing-generators/best-practices",
            },
          ],
        },
      ],
      "/plugins": [
        {
          text: "Plugins",
          collapsed: false,
          items: [
            {
              text: "🔰 Intro",
              link: "/plugins/",
            },
            {
              text: "🔧 Configuration",
              link: "/plugins/configuration",
            },
            {
              text: "🏗 Dev Plugin",
              link: "/plugins/dev-plugin",
            },
            {
              text: "📝 Define Plugin",
              link: "/plugins/define-plugin",
            },
            {
              text: "🔀 Alias Plugin",
              link: "/plugins/alias-plugin",
            },
            {
              text: "💡 Best Practices",
              link: "/plugins/best-practices",
            },
          ],
        },
      ],
      "/": [
        {
          text: "Introduction",
          collapsed: false,
          items: [
            {
              text: "💡 About AmperJS",
              link: "/about",
            },
            {
              text: "✨ Features",
              link: "/features",
            },
            {
              text: "🚀 Getting Started",
              link: "/start",
            },
          ],
        },
        {
          text: "Routing",
          collapsed: false,
          items: [
            {
              text: "🔰 Intro",
              docFooterText: "🛣 Routing",
              link: "/routing/",
            },
            {
              text: "🏆 Rationale",
              link: "/routing/rationale",
            },
            {
              text: "🚥 Parameters",
              link: "/routing/params",
            },
            {
              text: "🤖 Generated Content",
              link: "/routing/generated-content",
            },
            {
              text: "💡 Best Practices",
              docFooterText: "💡 Routing Best Practices",
              link: "/routing/best-practices",
            },
          ],
        },
        {
          text: "API Server",
          collapsed: false,
          items: [
            {
              text: "🔰 Intro",
              docFooterText: "🧩 API Intro",
              link: "/api-server/",
            },
            {
              text: "🧩 Endpoints",
              link: "/api-server/endpoints",
            },
            {
              text: "📋 Request Context",
              link: "/api-server/context",
            },
            {
              text: `${icons.gear} Core Configuration`,
              link: "/api-server/core-configuration",
            },
            {
              text: "🛡 Type Safety",
              collapsed: false,
              items: [
                {
                  text: "🔹 Parameters",
                  link: "/api-server/type-safety/params",
                },
                {
                  text: "🔹 Payload / Response",
                  link: "/api-server/type-safety/payload-response",
                },
                {
                  text: "🔹 State / Context",
                  link: "/api-server/type-safety/state-context",
                },
              ],
            },
            {
              text: "🔄 use Middleware",
              collapsed: false,
              items: [
                {
                  text: "🔹 Rationale",
                  docFooterText: "🔹 use Middleware",
                  link: "/api-server/use-middleware/",
                },
                {
                  text: "🔹 Method-Specific",
                  docFooterText: "🔹 Method-Specific Middleware",
                  link: "/api-server/use-middleware/method-specific",
                },
                {
                  text: "🔹 Slot Composition",
                  docFooterText: "🔹 Middleware Composition",
                  link: "/api-server/use-middleware/slot-composition",
                },
              ],
            },
            {
              text: "💻 Development Workflow",
              link: "/api-server/development-workflow",
            },
            {
              text: "🌐 Building for Production",
              link: "/api-server/building-for-production",
            },
            {
              text: "💡 Best Practices",
              docFooterText: "💡 API Best Practices",
              link: "/api-server/best-practices",
            },
          ],
        },
        {
          text: "Validation",
          collapsed: false,
          items: [
            {
              text: "🔰 Intro",
              docFooterText: "🛡 Runtime Validation",
              link: "/validation/",
            },
            {
              text: "🎯 TRefine for Refinement",
              link: "/validation/refine",
            },
            {
              text: "🚥 Validating Params",
              link: "/validation/params",
            },
            {
              text: "📦 Validating Payloads",
              link: "/validation/payload",
            },
            {
              text: "📤 Validating Responses",
              link: "/validation/response",
            },
            {
              text: "⏭ Skip Validation",
              link: "/validation/skip-validation",
            },
            {
              text: "❌ Error Handler",
              link: "/validation/error-handler",
            },
            {
              text: "🏷 Naming Conventions",
              link: "/validation/naming-conventions",
            },
            {
              text: "📊 About Performance",
              link: "/validation/performance",
            },
            {
              text: "💡 Best Practices",
              docFooterText: "💡 Validation Best Practices",
              link: "/validation/best-practices",
            },
          ],
        },
        {
          text: "Fetch Client",
          collapsed: false,
          items: [
            {
              text: "🔰 Intro",
              docFooterText: "🔗 Fetch Client",
              link: "/fetch/",
            },
            {
              text: "🚀 Quick Start",
              link: "/fetch/start",
            },
            {
              text: "🔌 Integration",
              link: "/fetch/integration",
            },
            {
              text: "🛡 Validation",
              link: "/fetch/validation",
            },
            {
              text: "🚨 Error Handling",
              link: "/fetch/error-handling",
            },
            {
              text: "🛠 Utilities",
              link: "/fetch/utilities",
            },
            {
              text: "💡 Best Practices",
              docFooterText: "💡 Fetch Best Practices",
              link: "/fetch/best-practices",
            },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/amperjs/amperjs" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025-PRESENT Slee Woo",
    },
  },
});
