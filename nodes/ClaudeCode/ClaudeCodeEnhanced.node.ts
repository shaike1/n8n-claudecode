import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { query, type SDKMessage } from '@anthropic-ai/claude-code';
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeCodeEnhanced implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Claude Code Enhanced',
		name: 'claudeCodeEnhanced',
		icon: 'file:claudecode.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["prompt"]}}',
		description:
			'Enhanced Claude Code node with native authentication, advanced MCP support, and enterprise features',
		defaults: {
			name: 'Claude Code Enhanced',
		},
		inputs: [{ type: NodeConnectionType.Main }],
		outputs: [{ type: NodeConnectionType.Main }],
		credentials: [
			{
				name: 'claudeCodeApi',
				required: false,
				displayOptions: {
					show: {
						authenticationMethod: ['credentials'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication Method',
				name: 'authenticationMethod',
				type: 'options',
				options: [
					{
						name: 'Use Credentials',
						value: 'credentials',
						description: 'Use n8n credentials for authentication',
					},
					{
						name: 'Use CLI',
						value: 'cli',
						description: 'Use existing Claude Code CLI authentication',
					},
				],
				default: 'credentials',
				description: 'How to authenticate with Claude Code',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Query',
						value: 'query',
						description: 'Start a new conversation with Claude Code',
						action: 'Start a new conversation with claude code',
					},
					{
						name: 'Continue',
						value: 'continue',
						description: 'Continue a previous conversation (requires prior query)',
						action: 'Continue a previous conversation requires prior query',
					},
					{
						name: 'Direct API Call',
						value: 'direct',
						description: 'Make a direct API call (bypasses Claude Code CLI)',
						action: 'Make a direct API call bypasses claude code cli',
					},
				],
				default: 'query',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'The prompt or instruction to send to Claude Code',
				required: true,
				placeholder: 'e.g., "Create a Python function to parse CSV files"',
				hint: 'Use expressions like {{$json.prompt}} to use data from previous nodes',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'Claude 3 Opus',
						value: 'claude-3-opus-20240229',
						description: 'Most capable for complex reasoning',
					},
					{
						name: 'Claude 3.5 Haiku',
						value: 'claude-3-5-haiku-20241022',
						description: 'Fast and efficient for simpler tasks',
					},
					{
						name: 'Claude 3.5 Sonnet',
						value: 'claude-3-5-sonnet-20241022',
						description: 'Latest and most capable model',
					},
					{
						name: 'Legacy Opus (CLI)',
						value: 'opus',
						description: 'Use CLI default model selection',
					},
					{
						name: 'Legacy Sonnet (CLI)',
						value: 'sonnet',
						description: 'Use CLI default model selection',
					},
				],
				default: 'claude-3-5-sonnet-20241022',
				description: 'Claude model to use',
			},
			{
				displayName: 'Max Tokens',
				name: 'maxTokens',
				type: 'number',
				default: 4096,
				description: 'Maximum number of tokens in the response',
				displayOptions: {
					show: {
						operation: ['direct'],
					},
				},
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				default: 0,
				description: 'Controls randomness in the response (0 = deterministic, 1 = creative)',
				displayOptions: {
					show: {
						operation: ['direct'],
					},
				},
			},
			{
				displayName: 'Max Turns',
				name: 'maxTurns',
				type: 'number',
				default: 10,
				description: 'Maximum number of conversation turns (back-and-forth exchanges) allowed',
				displayOptions: {
					hide: {
						operation: ['direct'],
					},
				},
			},
			{
				displayName: 'Timeout',
				name: 'timeout',
				type: 'number',
				default: 300,
				description: 'Maximum time to wait for completion (in seconds) before aborting',
			},
			{
				displayName: 'Project Path',
				name: 'projectPath',
				type: 'string',
				default: '',
				description:
					'The directory path where Claude Code should run (e.g., /path/to/project). If empty, uses the current working directory.',
				placeholder: '/home/user/projects/my-app',
				hint: 'This sets the working directory for Claude Code, allowing it to access files and run commands in the specified project location',
				displayOptions: {
					hide: {
						operation: ['direct'],
					},
				},
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Structured',
						value: 'structured',
						description: 'Returns a structured object with messages, summary, result, and metrics',
					},
					{
						name: 'Messages',
						value: 'messages',
						description: 'Returns the raw array of all messages exchanged',
					},
					{
						name: 'Text',
						value: 'text',
						description: 'Returns only the final result text',
					},
				],
				default: 'structured',
				description: 'Choose how to format the output data',
			},
			{
				displayName: 'Allowed Tools',
				name: 'allowedTools',
				type: 'multiOptions',
				options: [
					// Built-in Claude Code tools
					{ name: 'Bash', value: 'Bash', description: 'Execute bash commands' },
					{ name: 'Edit', value: 'Edit', description: 'Edit files' },
					{ name: 'Exit Plan Mode', value: 'exit_plan_mode', description: 'Exit planning mode' },
					{ name: 'Glob', value: 'Glob', description: 'Find files by pattern' },
					{ name: 'Grep', value: 'Grep', description: 'Search file contents' },
					{ name: 'LS', value: 'LS', description: 'List directory contents' },
					{ name: 'MultiEdit', value: 'MultiEdit', description: 'Make multiple edits' },
					{ name: 'Notebook Edit', value: 'NotebookEdit', description: 'Edit Jupyter notebooks' },
					{ name: 'Notebook Read', value: 'NotebookRead', description: 'Read Jupyter notebooks' },
					{ name: 'Read', value: 'Read', description: 'Read file contents' },
					{ name: 'Task', value: 'Task', description: 'Launch agents for complex searches' },
					{ name: 'Todo Write', value: 'TodoWrite', description: 'Manage todo lists' },
					{ name: 'Web Fetch', value: 'WebFetch', description: 'Fetch web content' },
					{ name: 'Web Search', value: 'WebSearch', description: 'Search the web' },
					{ name: 'Write', value: 'Write', description: 'Write files' },
				],
				default: ['WebFetch', 'TodoWrite', 'WebSearch', 'exit_plan_mode', 'Task'],
				description: 'Select which built-in tools Claude Code is allowed to use during execution',
				displayOptions: {
					hide: {
						operation: ['direct'],
					},
				},
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'System Prompt',
						name: 'systemPrompt',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Additional context or instructions for Claude',
						placeholder:
							'You are helping with a Python project. Focus on clean, readable code with proper error handling.',
					},
					{
						displayName: 'Require Permissions',
						name: 'requirePermissions',
						type: 'boolean',
						default: false,
						description: 'Whether to require permission for tool use',
						displayOptions: {
							hide: {
								operation: ['direct'],
							},
						},
					},
					{
						displayName: 'Debug Mode',
						name: 'debug',
						type: 'boolean',
						default: false,
						description: 'Whether to enable debug logging',
					},
					{
						displayName: 'Enable Streaming',
						name: 'streaming',
						type: 'boolean',
						default: false,
						description: 'Whether to enable streaming responses (for direct API calls)',
						displayOptions: {
							show: {
								operation: ['direct'],
							},
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			let timeout = 300; // Default timeout
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const authMethod = this.getNodeParameter('authenticationMethod', itemIndex) as string;
				const prompt = this.getNodeParameter('prompt', itemIndex) as string;
				const model = this.getNodeParameter('model', itemIndex) as string;
				const outputFormat = this.getNodeParameter('outputFormat', itemIndex) as string;
				timeout = this.getNodeParameter('timeout', itemIndex) as number;

				const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex) as {
					systemPrompt?: string;
					requirePermissions?: boolean;
					debug?: boolean;
					streaming?: boolean;
				};

				// Validate required parameters
				if (!prompt || prompt.trim() === '') {
					throw new NodeOperationError(this.getNode(), 'Prompt is required and cannot be empty', {
						itemIndex,
					});
				}

				if (additionalOptions.debug) {
					console.log(`[ClaudeCodeEnhanced] Starting execution for item ${itemIndex}`);
					console.log(`[ClaudeCodeEnhanced] Operation: ${operation}`);
					console.log(`[ClaudeCodeEnhanced] Auth Method: ${authMethod}`);
					console.log(`[ClaudeCodeEnhanced] Model: ${model}`);
				}

				let result: any;

				// Direct API call implementation
				if (operation === 'direct') {
					const credentials = await this.getCredentials('claudeCodeApi', itemIndex);
					const maxTokens = this.getNodeParameter('maxTokens', itemIndex) as number;
					const temperature = this.getNodeParameter('temperature', itemIndex) as number;

					// Initialize Anthropic client
					const client = new Anthropic({
						apiKey: credentials.apiKey as string,
						baseURL: credentials.baseUrl as string || 'https://api.anthropic.com',
					});

					const messages: any[] = [
						{
							role: 'user',
							content: prompt,
						},
					];

					const requestOptions: any = {
						model,
						max_tokens: maxTokens,
						messages,
						temperature,
					};

					if (additionalOptions.systemPrompt) {
						requestOptions.system = additionalOptions.systemPrompt;
					}

					const startTime = Date.now();

					if (additionalOptions.debug) {
						console.log(`[ClaudeCodeEnhanced] Making direct API call with model: ${model}`);
					}

					try {
						const response = await client.messages.create(requestOptions);
						const duration = Date.now() - startTime;

						if (additionalOptions.debug) {
							console.log(`[ClaudeCodeEnhanced] Direct API call completed in ${duration}ms`);
						}

						// Format response based on output format
						if (outputFormat === 'text') {
							result = {
								result: response.content[0].type === 'text' ? response.content[0].text : '',
								success: true,
								duration_ms: duration,
								usage: response.usage,
							};
						} else if (outputFormat === 'messages') {
							result = {
								messages: [{ role: 'user', content: prompt }, { role: 'assistant', content: response.content }],
								messageCount: 2,
								usage: response.usage,
							};
						} else {
							result = {
								response,
								summary: {
									model: response.model,
									usage: response.usage,
									duration_ms: duration,
								},
								result: response.content[0].type === 'text' ? response.content[0].text : '',
								success: true,
								direct_api: true,
							};
						}
					} catch (error) {
						throw new NodeOperationError(this.getNode(), `Direct API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {
							itemIndex,
						});
					}
				} 
				// Claude Code CLI implementation (enhanced or standard)
				else {
					const maxTurns = this.getNodeParameter('maxTurns', itemIndex) as number;
					const projectPath = this.getNodeParameter('projectPath', itemIndex) as string;
					const allowedTools = this.getNodeParameter('allowedTools', itemIndex, []) as string[];

					// Create abort controller for timeout
					const abortController = new AbortController();
					const timeoutMs = timeout * 1000;
					const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

					if (additionalOptions.debug) {
						console.log(`[ClaudeCodeEnhanced] Using ${authMethod} authentication with model: ${model}`);
					}

					// Build query options
					interface QueryOptions {
						prompt: string;
						abortController: AbortController;
						cwd?: string;
						options: {
							maxTurns: number;
							permissionMode: 'default' | 'bypassPermissions';
							model: string;
							systemPrompt?: string;
							allowedTools?: string[];
							continue?: boolean;
						};
					}

					const queryOptions: QueryOptions = {
						prompt,
						abortController,
						options: {
							maxTurns,
							permissionMode: additionalOptions.requirePermissions ? 'default' : 'bypassPermissions',
							model: model.startsWith('claude-') ? 'sonnet' : model, // Map new model names to CLI names
						},
					};

					if (additionalOptions.systemPrompt) {
						queryOptions.options.systemPrompt = additionalOptions.systemPrompt;
					}

					if (projectPath && projectPath.trim() !== '') {
						queryOptions.cwd = projectPath.trim();
					}

					if (allowedTools.length > 0) {
						queryOptions.options.allowedTools = allowedTools;
					}

					if (operation === 'continue') {
						queryOptions.options.continue = true;
					}

					// Execute query using the Claude Code SDK
					const messages: SDKMessage[] = [];
					const startTime = Date.now();

					try {
						for await (const message of query(queryOptions)) {
							messages.push(message);

							if (additionalOptions.debug && message.type === 'assistant' && message.message?.content) {
								const content = message.message.content[0];
								if (content.type === 'text') {
									console.log(`[ClaudeCodeEnhanced] Assistant: ${content.text.substring(0, 100)}...`);
								} else if (content.type === 'tool_use') {
									console.log(`[ClaudeCodeEnhanced] Tool use: ${content.name}`);
								}
							}
						}

						clearTimeout(timeoutId);

						const duration = Date.now() - startTime;
						if (additionalOptions.debug) {
							console.log(`[ClaudeCodeEnhanced] CLI execution completed in ${duration}ms with ${messages.length} messages`);
						}

						// Format output (same as original implementation)
						if (outputFormat === 'text') {
							const resultMessage = messages.find((m) => m.type === 'result') as any;
							result = {
								result: resultMessage?.result || resultMessage?.error || '',
								success: resultMessage?.subtype === 'success',
								duration_ms: resultMessage?.duration_ms,
								total_cost_usd: resultMessage?.total_cost_usd,
							};
						} else if (outputFormat === 'messages') {
							result = {
								messages,
								messageCount: messages.length,
							};
						} else {
							const userMessages = messages.filter((m) => m.type === 'user');
							const assistantMessages = messages.filter((m) => m.type === 'assistant');
							const toolUses = messages.filter(
								(m) => m.type === 'assistant' && (m as any).message?.content?.[0]?.type === 'tool_use',
							);
							const systemInit = messages.find(
								(m) => m.type === 'system' && (m as any).subtype === 'init',
							) as any;
							const resultMessage = messages.find((m) => m.type === 'result') as any;

							result = {
								messages,
								summary: {
									userMessageCount: userMessages.length,
									assistantMessageCount: assistantMessages.length,
									toolUseCount: toolUses.length,
									hasResult: !!resultMessage,
									toolsAvailable: systemInit?.tools || [],
								},
								result: resultMessage?.result || resultMessage?.error || null,
								metrics: resultMessage
									? {
											duration_ms: resultMessage.duration_ms,
											num_turns: resultMessage.num_turns,
											total_cost_usd: resultMessage.total_cost_usd,
											usage: resultMessage.usage,
										}
									: null,
								success: resultMessage?.subtype === 'success',
								enhanced: true,
								auth_method: authMethod,
							};
						}
					} catch (queryError) {
						clearTimeout(timeoutId);
						throw queryError;
					}
				}

				// Add result to return data
				returnData.push({
					json: result,
					pairedItem: itemIndex,
				});

			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
				const isTimeout = error instanceof Error && error.name === 'AbortError';

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: errorMessage,
							errorType: isTimeout ? 'timeout' : 'execution_error',
							errorDetails: error instanceof Error ? error.stack : undefined,
							itemIndex,
						},
						pairedItem: itemIndex,
					});
					continue;
				}

				// Provide more specific error messages
				const userFriendlyMessage = isTimeout
					? `Operation timed out after ${timeout} seconds. Consider increasing the timeout in Additional Options.`
					: `Claude Code Enhanced execution failed: ${errorMessage}`;

				throw new NodeOperationError(this.getNode(), userFriendlyMessage, {
					itemIndex,
					description: errorMessage,
				});
			}
		}

		return [returnData];
	}
}