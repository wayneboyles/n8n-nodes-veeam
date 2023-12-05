import type { INodeProperties } from "n8n-workflow";

export const licensingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['licensing']
			}
		},
		options: [
			{
				name: 'Get All Usage',
				value: 'getAllUsage',
				description: 'Get licensing usage for all companies',
				action: 'Get licensing'
			},
			{
				name: 'Get Usage for a Company',
				value: 'getUsageForCompany',
				description: 'Get licensing usage for a specific company',
				action: 'Get license for a company'
			}
		],
		default: 'getAllUsage',
		required: true
	}
];

export const licensingFields: INodeProperties[] = [
	{
		displayName: 'Company Name or ID',
		name: 'company',
		type: 'options',
		description: 'Choose a company from the list. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getVeeamSpcCompanies'
		},
		displayOptions: {
			show: {
				resource: ['licensing'],
				operation: ['getUsageForCompany']
			}
		}
	}
];
