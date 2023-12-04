import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class VeeamSpcApi implements ICredentialType {
	name = 'veeamSpcApi';
	displayName = 'Veeam SPC API';
	documentationUrl = 'https://github.com/wayneboyles/n8n-nodes-veeamspc/wiki';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://myspc.mydomain.local:1280',
			required: true,
			noDataExpression: true
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			noDataExpression: true
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true
			},
			default: '',
			required: true,
			noDataExpression: true
		},
		{
			displayName: 'Ignore SSL Errors',
			name: 'ignoreSslErrors',
			type: 'boolean',
			default: false
		},
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
			},
			default: '',
		}
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {

		const url = credentials.baseUrl as string;
		const ignoreSsl = credentials.ignoreSslErrors as boolean;

		const requestOptions: IHttpRequestOptions = {
			url: `${url.endsWith('/') ? url.slice(0, -1) : url}/api/v3/token`,
			method: 'POST',
			skipSslCertificateValidation: ignoreSsl,
			body: `grant_type=password&username=${credentials.username}&password=${credentials.password}`,
			headers: {
				'accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
		};

		const { access_token } = (await this.helpers.httpRequest(requestOptions)) as {
			access_token: string;
		};

		return { sessionToken: access_token };
	};

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '=Bearer {{$credentials.sessionToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.baseUrl}}',
			url: '/api/v3/about',
			method: 'GET',
			skipSslCertificateValidation: '={{$credentials?.ignoreSslErrors}}'
		},
	};

}
