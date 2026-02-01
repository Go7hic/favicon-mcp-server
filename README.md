# Favicon.so MCP Server

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for [Favicon.so](https://favicon.so) - fetch favicons for any website and generate custom favicons.

## Features

This MCP server provides the following tools:

| Tool | Description |
|------|-------------|
| `get_favicon` | Get the favicon for any domain. Returns favicon URL, format, and embed URLs for use in HTML. |
| `get_favicon_generator_url` | Get the URL to the Favicon.so generator for creating custom favicons from text or SVG icons. |
| `search_favicons` | Get the URL to search and browse favicons on Favicon.so. |

## Installation

### From npm (recommended)

```bash
npm install -g favicon-mcp-server
# or
pnpm add -g favicon-mcp-server
```

### From source

```bash
git clone https://github.com/Go7hic/favicon-mcp-server.git
cd favicon-mcp-server
pnpm install
pnpm run build
```

## Usage

### With Claude Desktop

Using global install:

```json
{
  "mcpServers": {
    "favicon-so": {
      "command": "favicon-mcp"
    }
  }
}
```

Or with npx (no global install):

```json
{
  "mcpServers": {
    "favicon-so": {
      "command": "npx",
      "args": ["-y", "favicon-mcp-server"]
    }
  }
}
```

From source (replace path):

```json
{
  "mcpServers": {
    "favicon-so": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/favicon-mcp-server/build/index.js"]
    }
  }
}
```

### With Cursor

Add to Cursor MCP config; if listed on [MCP Registry](https://registry.modelcontextprotocol.io), you can add by name. Otherwise use `npx -y favicon-mcp-server` as command.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FAVICON_API_BASE` | `https://favicon.so` | Base URL for the Favicon.so API |

## Tool Examples

### get_favicon

Input:
```json
{
  "domain": "github.com"
}
```

Output:
```json
{
  "domain": "github.com",
  "faviconUrl": "https://github.githubassets.com/favicons/favicon.svg",
  "format": "image/svg+xml",
  "isDefault": false,
  "embedUrl": "https://favicon.so/api/favicon?url=github.com",
  "shortUrl": "https://favicon.so/en/github.com"
}
```

Use in HTML:
```html
<img src="https://favicon.so/api/favicon?url=github.com" alt="GitHub favicon" />
<link rel="icon" href="https://favicon.so/api/favicon?url=github.com" />
```

### get_favicon_generator_url

Input:
```json
{
  "locale": "en"
}
```

Output:
```json
{
  "url": "https://favicon.so/en/generator",
  "description": "Favicon Generator - Create custom favicons from text or SVG icons...",
  "features": [...]
}
```

## Development

```bash
# Watch mode
pnpm run watch

# Build
pnpm run build

# Test locally
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node build/index.js
```
## License

MIT
