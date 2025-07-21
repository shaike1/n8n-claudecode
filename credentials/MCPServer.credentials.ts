import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MCPServer implements ICredentialType {
	name = 'mcpServer';
	displayName = 'MCP Server';
	documentationUrl = 'https://modelcontextprotocol.io/introduction';
	properties: INodeProperties[] = [
		{
			displayName: 'Connection Type',
			name: 'connectionType',
			type: 'options',
			options: [
				{
					name: 'HTTP/HTTPS',
					value: 'http',
					description: 'Connect to MCP server via HTTP/HTTPS',
				},
				{
					name: 'WebSocket',
					value: 'websocket',
					description: 'Connect to MCP server via WebSocket',
				},
				{
					name: 'Local Process',
					value: 'stdio',
					description: 'Launch local MCP server process',
				},
			],
			default: 'http',
			description: 'Method to connect to the MCP server',
		},
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			displayOptions: {
				show: {
					connectionType: ['http', 'websocket'],
				},
			},
			default: '',
			description: 'URL of the MCP server',
			placeholder: 'https://api.example.com/mcp',
			required: true,
		},
		{
			displayName: 'Command',
			name: 'command',
			type: 'string',
			displayOptions: {
				show: {
					connectionType: ['stdio'],
				},
			},
			default: '',
			description: 'Command to launch the MCP server',
			placeholder: 'node server.js',
			required: true,
		},
		{
			displayName: 'Arguments',
			name: 'args',
			type: 'string',
			displayOptions: {
				show: {
					connectionType: ['stdio'],
				},
			},
			default: '',
			description: 'Command line arguments (space-separated)',
			placeholder: '--port 3000 --config config.json',
		},
		{
			displayName: 'Working Directory',
			name: 'cwd',
			type: 'string',
			displayOptions: {
				show: {
					connectionType: ['stdio'],
				},
			},
			default: '',
			description: 'Working directory for the MCP server process',
			placeholder: '/path/to/mcp/server',
		},
		{
			displayName: 'Authentication',
			name: 'authType',
			type: 'options',
			displayOptions: {
				show: {
					connectionType: ['http', 'websocket'],
				},
			},
			options: [
				{
					name: 'None',
					value: 'none',
					description: 'No authentication required',
				},
				{
					name: 'Bearer Token',
					value: 'bearer',
					description: 'Bearer token authentication',
				},
				{
					name: 'API Key',
					value: 'apikey',
					description: 'API key in header',
				},
				{
					name: 'Basic Auth',
					value: 'basic',
					description: 'Basic username/password authentication',
				},
			],
			default: 'none',
		},
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: { password: true },
			displayOptions: {
				show: {
					authType: ['bearer'],
				},
			},
			default: '',
			description: 'Bearer token for authentication',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			displayOptions: {
				show: {
					authType: ['apikey'],
				},
			},
			default: '',
			description: 'API key for authentication',
		},
		{
			displayName: 'API Key Header',
			name: 'apiKeyHeader',
			type: 'string',
			displayOptions: {
				show: {
					authType: ['apikey'],
				},
			},
			default: 'X-API-Key',
			description: 'Header name for the API key',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			displayOptions: {
				show: {
					authType: ['basic'],
				},
			},
			default: '',
			description: 'Username for basic authentication',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			displayOptions: {
				show: {
					authType: ['basic'],
				},
			},
			default: '',
			description: 'Password for basic authentication',
		},
		{
			displayName: 'Connection Timeout (ms)',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'Connection timeout in milliseconds',
		},
		{
			displayName: 'Environment Variables',
			name: 'env',
			type: 'collection',
			displayOptions: {
				show: {
					connectionType: ['stdio'],
				},
			},
			placeholder: 'Add Variable',
			default: {},
			description: 'Environment variables for the MCP server process',
			options: [
				{
					displayName: 'Variable Name',
					name: 'name',
					type: 'string',
					default: '',
				},
				{
					displayName: 'Variable Value',
					name: 'value',
					type: 'string',
					default: '',
				},
			],
		},
	];

	async authenticate(credentials: any, requestOptions: any): Promise<any> {
		if (credentials.connectionType === 'http' || credentials.connectionType === 'websocket') {
			switch (credentials.authType) {
				case 'bearer':
					requestOptions.headers = {
						...requestOptions.headers,
						'Authorization': `Bearer ${credentials.token}`,
					};
					break;
				case 'apikey':
					requestOptions.headers = {
						...requestOptions.headers,
						[credentials.apiKeyHeader]: credentials.apiKey,
					};
					break;
				case 'basic':
					const basicAuth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
					requestOptions.headers = {
						...requestOptions.headers,
						'Authorization': `Basic ${basicAuth}`,
					};
					break;
			}
		}

		return requestOptions;
	}
}