
import { parse } from 'fast-xml-parser';
import { parse as parseUrl } from 'url';
import { IncomingHttpHeaders } from 'http';
import { request, RequestOptions } from 'https';
import urlencode from 'form-urlencoded';

export { RequestOptions } from 'https';

const DEBUG = 0;
const MAX_REDIRECTS = 5;

export interface RequestMethod<T> {
	(options: RequestOptions, payload?: any) : Promise<HttpResponse<T>>;
}

interface PrepareMethod {
	(options: RequestOptions, payload?: any) : string;
}

interface ParseMethod<T> {
	(data: string) : T;
}

export interface HttpResponse<T> {
	status: number;
	headers: IncomingHttpHeaders;
	payload: T;
}

const httpRequest = <T>(options: RequestOptions, payload: any, prepare: PrepareMethod, parse: ParseMethod<T>, redirects: number = 0) : Promise<HttpResponse<T>> => {
	return new Promise((resolve, reject) => {
		if (! options.headers) {
			options.headers = { };
		}

		const reqBody = prepare(options, payload);

		const req = request(options, (res) => {
			let data = '';

			res.setEncoding('utf8');

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				log('\n------------------------------');
				log(`HTTP/1.1 ${res.statusCode} ${res.statusMessage}`);
				logHeaders(res.headers as any);
				log('------------------------------\n');

				if (res.statusCode === 301) {
					if (redirects > MAX_REDIRECTS) {
						return reject('Exceeded maximum number of redirects');
					}

					if (res.headers.location) {
						const newLocation = parseUrl(res.headers.location);

						options.hostname = newLocation.hostname;
						options.path = newLocation.path;
					}

					if (res.headers['set-cookie']) {
						const cookies = Array.isArray(res.headers['set-cookie'])
							? res.headers['set-cookie']
							: [ res.headers['set-cookie'] ];

						let cookieValues = [ ];

						cookies.forEach((cookie) => {
							cookieValues.push(cookie.split(';')[0]);
						});

						if (options.headers.cookie) {
							options.headers.cookie += `; ${cookieValues.join('; ')}`;
						}

						else {
							options.headers.cookie = cookieValues.join('; ');
						}
					}

					httpRequest(options, payload, prepare, parse, redirects + 1).then(resolve, reject);

					return;
				}

				const resPayload = data ? parse(data) : null;

				resolve({
					status: res.statusCode,
					headers: res.headers,
					payload: resPayload
				});
			});
		});

		req.on('error', (error) => reject(error));

		log('\n------------------------------');
		log(`${options.method} ${options.path} HTTP/1.1`);
		log(`Host: ${options.hostname}`);
		logHeaders(options.headers as any);
		log('------------------------------\n');

		if (reqBody) {
			req.write(reqBody);
		}

		req.end();
	});
};

export const httpXmlRequest = <T>(options: RequestOptions, payload?: any) : Promise<HttpResponse<T>> => {
	return httpRequest<T>(options, payload, xmlPrepare, xmlParse);
};

const xmlPrepare = (options: RequestOptions, payload?: any) : string => {
	options.headers.accept = '*/*';

	if (payload) {
		const encoded = urlencode(payload);

		options.headers['content-type'] = 'application/x-www-form-urlencoded';
		options.headers['content-length'] = Buffer.byteLength(encoded, 'utf8');

		return encoded;
	}
};

const xmlParse = <T>(xml: string) : T => {
	return parse(xml, {
		attributeNamePrefix: '',
		attrNodeName: 'attr',
		textNodeName: '#text',
		ignoreAttributes: false,
		parseAttributeValue: true
	});
};

export const httpJsonRequest = <T>(options: RequestOptions, payload?: any) : Promise<HttpResponse<T>> => {
	return httpRequest<T>(options, payload, jsonPrepare, jsonParse);
};

const jsonPrepare = (options: RequestOptions, payload?: any) : string => {
	options.headers.accept = 'application/json';

	if (payload) {
		const encoded = JSON.stringify(payload);

		options.headers['content-type'] = 'application/json';
		options.headers['content-length'] = Buffer.byteLength(encoded, 'utf8');

		return encoded;
	}
};

const jsonParse = <T>(data: string) : T => {
	return JSON.parse(data) as T;
};

const log = (message: string) => {
	if (DEBUG) {
		console.debug(message);
	}
};

const logHeaders = (headers: Headers) => {
	Object.keys(headers).forEach((header) => {
		log(`${header}: ${headers[header]}`);
	});
}

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
