import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class ClaudeCodeApi implements ICredentialType {
	name = 'claudeCodeApi';
	displayName = 'Claude Code API';
	documentationUrl = 'https://docs.anthropic.com/en/docs/claude-code';
	properties: INodeProperties[] = [
		{
			displayName: 'Authentication Method',
			name: 'authMethod',
			type: 'options',
			options: [
				{
					name: 'API Key',
					value: 'apiKey',
					description: 'Use Anthropic API key for authentication',
				},
				{
					name: 'CLI Authentication',
					value: 'cli',
					description: 'Use existing Claude Code CLI authentication',
				},
			],
			default: 'apiKey',
			description: 'Select the authentication method to use',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			displayOptions: {
				show: {
					authMethod: ['apiKey'],
				},
			},
			default: '',
			description: 'Your Anthropic API key',
			placeholder: 'sk-ant-...',
		},
		{
			displayName: 'Organization ID',
			name: 'organizationId',
			type: 'string',
			displayOptions: {
				show: {
					authMethod: ['apiKey'],
				},
			},
			default: '',
			description: 'Optional organization ID for team usage',
			placeholder: 'org-...',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			displayOptions: {
				show: {
					authMethod: ['apiKey'],
				},
			},
			default: 'https://api.anthropic.com',
			description: 'Base URL for the Anthropic API (for custom endpoints)',
		},
		{
			displayName: 'CLI Authentication Info',
			name: 'cliInfo',
			type: 'notice',
			default: '',
			displayOptions: {
				show: {
					authMethod: ['cli'],
				},
			},
			typeOptions: {
				theme: 'info',
			},
			description: 'When using CLI authentication, make sure Claude Code CLI is installed and authenticated on your n8n server with "claude auth login"',
		},
	];

	async authenticate(credentials: any, requestOptions: any): Promise<any> {
		if (credentials.authMethod === 'apiKey') {
			requestOptions.headers = {
				...requestOptions.headers,
				'Authorization': `Bearer ${credentials.apiKey}`,
				'Content-Type': 'application/json',
				'anthropic-version': '2023-06-01',
			};

			if (credentials.organizationId) {
				requestOptions.headers['anthropic-organization'] = credentials.organizationId;
			}
		}

		return requestOptions;
	}

	test = {
		request: {
			baseURL: '={{$credentials.baseUrl || "https://api.anthropic.com"}}',
			url: '/v1/messages',
			method: 'POST',
			headers: {
				'Authorization': '=Bearer {{$credentials.apiKey}}',
				'Content-Type': 'application/json',
				'anthropic-version': '2023-06-01',
			},
			body: {
				model: 'claude-3-sonnet-20240229',
				max_tokens: 10,
				messages: [{ role: 'user', content: 'Hello' }],
			},
		},
	};
}