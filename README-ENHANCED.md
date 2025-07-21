# Claude Code Enhanced - n8n Community Node

[![npm version](https://badge.fury.io/js/@shaike1%2Fn8n-nodes-claudecode-enhanced.svg)](https://badge.fury.io/js/@shaike1%2Fn8n-nodes-claudecode-enhanced)

An enhanced version of the Claude Code n8n community node that provides:

- ✅ **Native Authentication** - Built-in credential management without CLI dependency
- ✅ **Direct API Access** - Bypass Claude Code CLI when needed
- ✅ **Enhanced Model Support** - Access to latest Claude 3.5 Sonnet, Haiku, and Opus
- ✅ **Advanced Configuration** - Fine-grained control over parameters
- ✅ **Enterprise Features** - Better error handling, debugging, and monitoring
- ✅ **Future MCP Support** - Planned native MCP protocol integration

## Key Enhancements Over Original

| Feature | Original @holtweb | Enhanced @shaike1 |
|---------|-------------------|-------------------|
| Authentication | CLI-only | Built-in credentials + CLI |
| API Access | CLI wrapper only | Direct API + CLI |
| Model Support | Legacy names | Latest model identifiers |
| Error Handling | Basic | Comprehensive with recovery |
| Configuration | Static | Dynamic with validation |
| MCP Support | CLI-based | Native protocol (planned) |

## Installation

### Docker (Recommended)

```bash
docker run -it --rm \
  -p 5678:5678 \
  -e N8N_COMMUNITY_NODE_PACKAGES="@shaike1/n8n-nodes-claudecode-enhanced" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### npm

```bash
npm install @shaike1/n8n-nodes-claudecode-enhanced
```

## Configuration

### 1. Set up Credentials

1. Go to **Settings** > **Credentials** in n8n
2. Click **Add credential** 
3. Select **Claude Code API**
4. Choose your authentication method:

#### Option A: API Key Authentication (Recommended)
- **Authentication Method**: Use Credentials
- **API Key**: Your Anthropic API key (`sk-ant-...`)
- **Organization ID**: (Optional) Your organization ID
- **Base URL**: (Optional) Custom API endpoint

#### Option B: CLI Authentication
- **Authentication Method**: Use CLI
- Ensure Claude Code CLI is installed and authenticated on your server

### 2. Create a Workflow

1. Add the **Claude Code Enhanced** node to your workflow
2. Configure the node parameters:
   - **Authentication Method**: Select your preferred method
   - **Operation**: Choose Query, Continue, or Direct API Call
   - **Prompt**: Your instruction for Claude
   - **Model**: Select from latest Claude models
   - **Output Format**: Structured, Messages, or Text

## Usage Examples

### Basic Code Generation

```json
{
  "operation": "query",
  "prompt": "Create a Python function that validates email addresses using regex",
  "model": "claude-3-5-sonnet-20241022",
  "outputFormat": "structured"
}
```

### Direct API Call with Custom Parameters

```json
{
  "operation": "direct",
  "authenticationMethod": "credentials", 
  "prompt": "Explain how async/await works in JavaScript",
  "model": "claude-3-5-sonnet-20241022",
  "maxTokens": 2000,
  "temperature": 0.3,
  "outputFormat": "text"
}
```

### Continue Previous Conversation

```json
{
  "operation": "continue",
  "prompt": "Now add error handling to that function",
  "model": "claude-3-5-sonnet-20241022"
}
```

## Features

### Authentication Methods

#### 1. Credential-Based Authentication
- Secure storage in n8n credential system
- Support for API keys and organization IDs
- Custom endpoint configuration
- No external CLI dependency

#### 2. CLI Authentication  
- Uses existing Claude Code CLI authentication
- Inherits all CLI features and MCP servers
- Requires CLI installation and setup

### Operation Modes

#### 1. Query
Start a new conversation with Claude Code, with full tool access and project awareness.

#### 2. Continue  
Continue a previous conversation, maintaining context and state.

#### 3. Direct API Call
Make direct calls to the Anthropic API, bypassing Claude Code CLI entirely. Useful for simple text generation without tool access.

### Model Support

- **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`) - Latest, most capable
- **Claude 3.5 Haiku** (`claude-3-5-haiku-20241022`) - Fast and efficient  
- **Claude 3 Opus** (`claude-3-opus-20240229`) - Best for complex reasoning
- **Legacy CLI Models** (`sonnet`, `opus`) - Use CLI's model selection

### Output Formats

#### Structured (Recommended)
```json
{
  "messages": [...],
  "summary": {
    "userMessageCount": 1,
    "assistantMessageCount": 1,
    "toolUseCount": 2,
    "hasResult": true
  },
  "result": "Generated code or response",
  "metrics": {
    "duration_ms": 15420,
    "num_turns": 3,
    "total_cost_usd": 0.045
  },
  "success": true,
  "enhanced": true
}
```

#### Messages
Returns raw message array with full conversation history.

#### Text  
Returns only the final result text - simplest format.

## Advanced Configuration

### Tool Selection
Choose which Claude Code tools are available:
- **Bash** - Execute shell commands
- **Edit/MultiEdit** - File editing capabilities  
- **Read/Write** - File I/O operations
- **Glob/Grep** - File searching
- **Web Fetch/Search** - Internet access
- **Todo Write** - Task management
- And more...

### Additional Options
- **System Prompt** - Custom instructions for Claude
- **Debug Mode** - Detailed logging for troubleshooting
- **Project Path** - Set working directory for file operations
- **Timeout** - Maximum execution time
- **Temperature** - Control response creativity (Direct API only)
- **Max Tokens** - Limit response length (Direct API only)

## Troubleshooting

### Common Issues

#### "Invalid API key" Error
- Verify your Anthropic API key is correct
- Ensure you have sufficient credits
- Check if you're using the right base URL

#### "Claude Code CLI not found"  
- When using CLI authentication, ensure Claude Code CLI is installed
- Run `claude --version` to verify installation
- Run `claude auth status` to check authentication

#### Timeout Errors
- Increase timeout in Additional Options
- For complex tasks, consider breaking into smaller steps
- Use Continue operation for multi-step workflows

### Debug Mode
Enable debug logging to see detailed execution information:

```json
{
  "additionalOptions": {
    "debug": true
  }
}
```

## Development

### Building from Source

```bash
git clone https://github.com/shaike1/n8n-claudecode.git
cd n8n-claudecode
npm install
npm run build
```

### Testing Locally

```bash
npm link
n8n start
```

The enhanced node will appear in n8n under the "Claude Code Enhanced" category.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable  
5. Submit a pull request

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## Changelog

### v1.0.0 (2025-01-21)
- 🎉 Initial release of enhanced node
- ✅ Native authentication support
- ✅ Direct API access capability
- ✅ Latest Claude model support
- ✅ Enhanced error handling and debugging
- ✅ Backward compatibility with original node

## Roadmap

### v1.1.0 (Planned)
- 🔄 Native MCP protocol support
- 🔄 Advanced MCP server management
- 🔄 Streaming response support
- 🔄 Workflow templates

### v1.2.0 (Planned)  
- 🔄 OAuth2 authentication
- 🔄 Team/organization management
- 🔄 Usage analytics and monitoring
- 🔄 Custom tool development

## Support

- **Issues**: [GitHub Issues](https://github.com/shaike1/n8n-claudecode/issues)
- **Documentation**: [Enhanced Documentation](https://github.com/shaike1/n8n-claudecode/wiki)
- **Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- Based on the original work by [Adam Holt](https://github.com/holt-web-ai/n8n-nodes-claudecode)
- Built with the [n8n](https://n8n.io) workflow automation platform
- Powered by [Anthropic's Claude](https://www.anthropic.com/claude) AI models