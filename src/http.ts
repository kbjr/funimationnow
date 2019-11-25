
import { parse } from 'fast-xml-parser';
import { IncomingHttpHeaders } from 'http';
import { request, RequestOptions } from 'https';
import urlencode from 'form-urlencoded';

export { RequestOptions } from 'https';

export interface RequestMethod<T> {
	(options: RequestOptions, payload?: any) : Promise<HttpResponse<T>>;
}

export interface HttpResponse<T> {
	status: number;
	headers: IncomingHttpHeaders;
	payload: T;
}

export const httpXmlRequest = <T>(options: RequestOptions, payload?: any) : Promise<HttpResponse<T>> => {
	return new Promise((resolve, reject) => {
		if (! options.headers) {
			options.headers = { };
		}

		options.headers.accept = '*/*';

		let reqBody: string;

		if (payload) {
			reqBody = urlencode(payload);

			options.headers['content-type'] = 'application/x-www-form-urlencoded';
			options.headers['content-length'] = Buffer.byteLength(reqBody, 'utf8');
		}

		const req = request(options, (res) => {
			let data = '';

			res.setEncoding('utf8');

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				const payload = data ? parseXml<T>(data) : null;

				resolve({
					status: res.statusCode,
					headers: res.headers,
					payload: payload
				});
			});
		});

		req.on('error', (error) => reject(error));

		if (reqBody) {
			req.write(reqBody);
		}

		req.end();
	});
};

export const httpJsonRequest = <T>(options: RequestOptions, payload?: any) : Promise<HttpResponse<T>> => {
	return new Promise((resolve, reject) => {
		if (! options.headers) {
			options.headers = { };
		}

		options.headers.accept = 'application/json';

		let reqBody: string;

		if (payload) {
			reqBody = JSON.stringify(payload);

			options.headers['content-type'] = 'application/json';
			options.headers['content-length'] = Buffer.byteLength(reqBody, 'utf8');
		}

		const req = request(options, (res) => {
			let data = '';

			res.setEncoding('utf8');

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				const payload = data ? JSON.parse(data) : null;

				resolve({
					status: res.statusCode,
					headers: res.headers,
					payload: payload
				});
			});
		});

		req.on('error', (error) => reject(error));

		if (reqBody) {
			req.write(reqBody);
		}

		req.end();
	});
};

export class HttpError extends Error {
	public readonly status: number;
	public readonly payload: any;
	public readonly headers: {
		[header: string]: string;
	};

	constructor(res: HttpResponse<any>) {
		super('Outbound HTTP request resulted in an unexpected response');
		Object.assign(this, res);
	}
}

const parseXml = <T>(xml: string) : T => {
	return parse(xml, {
		attributeNamePrefix: '',
		attrNodeName: 'attr',
		textNodeName: '#text',
		ignoreAttributes: false,
		parseAttributeValue: true
	});
};
