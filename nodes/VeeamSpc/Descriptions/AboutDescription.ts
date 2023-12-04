import type { INodeProperties } from "n8n-workflow";

export const aboutOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get about',
				description: 'Get details about the SPC installation'
			}
		],
		default: 'get',
		required: true,
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['about']
			}
		}
	}
];

export const aboutFields: INodeProperties[] = [
	{
		displayName: 'Simplify Output',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data',
		displayOptions: {
			show: {
				resource: ['about'],
				operation: ['get'],
			},
		},
	},
];
