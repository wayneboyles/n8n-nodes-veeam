import type {
	IHookFunctions,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IDataObject,
	ICredentialDataDecryptedObject,
	JsonObject
} from "n8n-workflow";

import { NodeApiError } from 'n8n-workflow';

import type { OptionsWithUri } from "request-promise-native";

export const veeamSpcResources = [
	{
		name: 'About',
		value: 'about'
	},
	{
		name: 'Licensing',
		value: 'licensing'
	}
];

export async function veeamSpcApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: string,
	resource: string,
	body: IDataObject | IDataObject[] = {},
	qs: IDataObject = {},
	option: IDataObject = {}
): Promise<any> {

	const credentials = await this.getCredentials('veeamSpcApi') as ICredentialDataDecryptedObject;
	const baseUrlRaw = credentials.baseUrl as string;
	const baseUrl = `${baseUrlRaw.endsWith('/') ? baseUrlRaw.slice(0, -1) : baseUrlRaw}/api/v3`;
	const ignoreSslErrors = credentials.ignoreSslErrors as boolean;

	try {
		let options: OptionsWithUri = {
			method: method,
			qs: qs,
			body: body,
			uri: `${baseUrl}${resource}`,
			json: true,
			rejectUnauthorized: !ignoreSslErrors
		};

		options = Object.assign({}, options, option);

		if (Object.keys(body).length === 0) {
			delete options.body;
		}

		if (Object.keys(qs).length === 0) {
			delete options.qs;
		}

		const result = await this.helpers.requestWithAuthentication.call(this, 'veeamSpcApi', options);
		return result['data'];
	}
	catch (error) {
		const message = (error as JsonObject).message as string;
		if (method === 'DELETE' || method === 'GET' || (method === 'UPDATE' && message)) {
			let newErrorMessage;

			if (message.includes('400')) {
				newErrorMessage = JSON.parse(message.split(' - ')[1]);
				(error as JsonObject).message = `For field ID, ${newErrorMessage.id || newErrorMessage['[0].id']}`;
			}

			if (message.includes('403')) {
				(error as JsonObject).message = `You don\'t have permissions to ${method.toLowerCase()} ${resource.split('/')[1].toLowerCase()}.`;
			}
		}
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function veeamSpcApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	propertyName: string,
	method: string,
	resource: string,
	body: IDataObject | IDataObject[] = {},
	qs: IDataObject = {},
	option: IDataObject = {}
): Promise<any> {

	const returnData: IDataObject[] = [];

	let responseData: IDataObject;

	do {
		responseData = (await veeamSpcApiRequest.call(
			this,
			method,
			resource,
			body,
			qs,
			option
		)) as IDataObject;

		returnData.push.apply(returnData, responseData[propertyName] as IDataObject[]);
		//@ts-ignore
	} while (returnData.length < responseData.length);

	return returnData;
}

export function simplifyVeeamSpcOutput(response: IDataObject[], fieldsList: string[]): IDataObject[] {
	const output = [];

	for (const item of response) {
		const simplifiedItem: IDataObject = {};
		Object.keys(item).forEach((key: string) => {
			if (fieldsList.includes(key)) {
				simplifiedItem[key] = item[key];
			}
		});

		output.push(simplifiedItem);
	}

	return output;
}
