#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Configuration - can be overridden via environment variables
const FAVICON_API_BASE = process.env.FAVICON_API_BASE || "https://favicon.so";

// Create server instance
const server = new McpServer({
  name: "favicon-so",
  version: "1.0.0",
});

// ============================================================================
// Tool: get_favicon
// Fetches favicon information for a given domain
// ============================================================================
server.registerTool(
  "get_favicon",
  {
    description:
      "Get the favicon for any website domain. Returns the favicon URL, format, and an embed URL that can be used directly in HTML img tags or link rel='icon'.",
    inputSchema: {
      domain: z
        .string()
        .describe(
          "The domain to fetch the favicon for (e.g. 'google.com', 'github.com')"
        ),
    },
  },
  async ({ domain }) => {
    // Normalize domain - remove protocol if present
    let normalizedDomain = domain.trim().replace(/^https?:\/\//, "");
    normalizedDomain = normalizedDomain.split("/")[0].split("?")[0];

    // Validate domain format
    const domainRegex =
      /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(normalizedDomain)) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "Invalid domain format",
                domain: normalizedDomain,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    try {
      // Call the Favicon.so API with raw=true to get JSON response
      const apiUrl = `${FAVICON_API_BASE}/api/favicon?url=${encodeURIComponent(
        normalizedDomain
      )}&raw=true`;

      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "favicon-mcp-server/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as {
        url?: string;
        format?: string;
        isDefault?: boolean;
      };

      // Build the result
      const result = {
        domain: normalizedDomain,
        faviconUrl: data.url || null,
        format: data.format || "unknown",
        isDefault: data.isDefault || false,
        // Direct embed URL - can be used in <img src="..."> or <link rel="icon" href="...">
        embedUrl: `${FAVICON_API_BASE}/api/favicon?url=${encodeURIComponent(
          normalizedDomain
        )}`,
        // Alternative: shorter URL via domain route
        shortUrl: `${FAVICON_API_BASE}/en/${encodeURIComponent(
          normalizedDomain
        )}`,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "Failed to fetch favicon",
                message: errorMessage,
                domain: normalizedDomain,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
);

// ============================================================================
// Tool: get_favicon_generator_url
// Returns the URL to the Favicon.so generator page
// ============================================================================
server.registerTool(
  "get_favicon_generator_url",
  {
    description:
      "Get the URL to the Favicon.so favicon generator. Use this when the user wants to create a custom favicon from text or SVG icons. The generator allows choosing characters, shapes, fonts, and colors to create favicon packages.",
    inputSchema: {
      locale: z
        .string()
        .optional()
        .describe(
          "Optional locale code for the generator page (e.g. 'en', 'zh', 'ja'). Defaults to 'en'."
        ),
    },
  },
  async ({ locale }) => {
    const lang = locale || "en";
    const generatorUrl = `${FAVICON_API_BASE}/${lang}/generator`;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              url: generatorUrl,
              description:
                "Favicon Generator - Create custom favicons from text or SVG icons. Choose 1-2 characters, shape, font, and colors. Download all sizes (favicon.ico, apple-touch-icon, android-chrome, etc.) and HTML link tags.",
              features: [
                "Text to favicon (letters, emoji)",
                "SVG icon to favicon",
                "Multiple shapes (square, circle, rounded)",
                "Custom fonts (Google Fonts)",
                "Custom colors (text and background)",
                "Transparent background support",
                "All standard favicon sizes generated",
                "ZIP download with all assets",
                "HTML link tags for easy integration",
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================================
// Tool: search_favicons
// Search/browse favicons by domain
// ============================================================================
server.registerTool(
  "search_favicons",
  {
    description:
      "Get the URL to search and browse favicons on Favicon.so. Useful when the user wants to explore favicons from popular websites.",
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe("Optional search query (domain name)"),
      locale: z
        .string()
        .optional()
        .describe("Optional locale code (e.g. 'en', 'zh'). Defaults to 'en'."),
    },
  },
  async ({ query, locale }) => {
    const lang = locale || "en";
    let searchUrl = `${FAVICON_API_BASE}/${lang}/search`;
    if (query) {
      searchUrl += `?q=${encodeURIComponent(query)}`;
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              url: searchUrl,
              description:
                "Favicon Search - Search and browse favicons by domain. Preview favicons at different sizes and download them.",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================================
// Main: Start the server
// ============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Favicon.so MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
