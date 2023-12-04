import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType, INodeTypeDescription
} from 'n8n-workflow';

import {
	aboutFields,
	aboutOperations
} from './Descriptions';

import {
	veeamSpcResources,
	veeamSpcApiRequest,
	simplifyVeeamSpcOutput
} from './GenericFunctions';

export class VeeamSpc implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Veeam SPC',
		name: 'veeamSpc',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:veeam.png',
		group: ['input'],
		version: 1,
		description: 'Consume the Veeam SPC REST API',
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		defaults: {
			name: 'Veeam SPC'
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'veeamSpcApi',
				required: true
			}
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: veeamSpcResources,
				default: 'about',
				required: true
			},
			...aboutOperations,
			...aboutFields,
		]
	};

	// methods = {
	// 	loadOptions: {

	// 	}
	// };

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let responseData;

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {

				//=============================================================
				// ABOUT
				//=============================================================

				if (resource === 'about') {
					const simplifiedOutput = ['installationId', 'installationDate', 'serverVersion'];

					if (operation === 'get') {
						const response = await veeamSpcApiRequest.call(this, 'GET', '/about');
						const simplify = this.getNodeParameter('simplify', i) as boolean;

						responseData = simplify
							? simplifyVeeamSpcOutput([response] as IDataObject[], simplifiedOutput)
							: response;
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{
						itemData: {
							item: i
						}
					}
				);

				returnData.push(...executionData);
			}
			catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({
							error: error.message
						}),
						{
							itemData: {
								item: i
							}
						}
					);

					returnData.push(...executionErrorData);
					continue;
				}

				throw error;
			}
		}

		return [returnData];
	}
}
