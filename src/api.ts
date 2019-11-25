
import { Territory, Audio } from './enums';
import { stringify } from 'querystring';

import {
	httpXmlRequest,
	httpJsonRequest,
	HttpResponse,
	HttpError,
	RequestOptions,
	RequestMethod
} from './http';

import {
	LoginResponseData,
	SearchResponseData,
	ShowDetailsData
} from './payloads';

import {
	SearchResult,
	ShowDetails
} from './entities';

export interface FunimationApiOptions {
	hostname?: string;
	token?: string;
	territory: Territory;
}

export interface Headers {
	[header: string]: string;
}

export class FunimationApi {
	protected hostname: string = 'prod-api-funimationnow.dadcdigital.com';
	protected token: string;
	protected territory: Territory;

	constructor(options?: FunimationApiOptions) {
		if (options) {
			this.setOptions(options);
		}
	}

	protected async _request<T>(method: string, path: string, payload: any, requestMethod: RequestMethod<T>) : Promise<HttpResponse<T>> {
		const headers: Headers = {
			territory: this.territory
		};

		if (this.token) {
			headers.authorization = `Token ${this.token}`;
		}

		const options = {
			method: method,
			hostname: this.hostname,
			headers: headers,
			path: path
		};

		return requestMethod(options, payload);
	}

	protected async requestXml<T>(method: string, path: string, payload?: any) {
		return this._request<T>(method, path, payload, httpXmlRequest);
	}

	protected async requestJson<T>(method: string, path: string, payload?: any) {
		return this._request<T>(method, path, payload, httpJsonRequest);
	}

	/**
	 * Updates the options assigned to the API
	 *
	 * @param options Any new options to be assigned
	 */
	public setOptions(options: Partial<FunimationApiOptions>) {
		if (options.hostname) {
			this.hostname = options.hostname
		}

		// Allow explicit null to remove the token
		if (options.token || options.token === null) {
			this.token = options.token;
		}

		if (options.territory) {
			this.territory = options.territory;
		}
	}

	/**
	 * Make a login request, and update the token assigned to the API. If `storeToken` is
	 * provided and set to false, the token on the API will not be updated.
	 *
	 * @param username The username to login with
	 * @param password The password to login with
	 * @param storeToken Should the token be stored on the API? [default: true]
	 */
	public async login(username: string, password: string, storeToken: boolean = true) {
		const res = await this.requestXml<LoginResponseData>('POST', '/xml/auth/login/', { username, password });

		if (res.status !== 200) {
			throw new HttpError(res);
		}

		if (storeToken) {
			this.token = res.payload.authentication.token.slice(6);
		}

		return res;
	}

	/**
	 * Perform a search for shows based on a search query string and returns a list of results
	 *
	 * @param query The search string
	 */
	public async search(query: string) {
		const querystring = stringify({
			territory: this.territory,
			id: 'search',
			q: query
		});

		const res = await this.requestXml<SearchResponseData>('GET', `/xml/longlist/content/page/?${querystring}`);

		if (res.status !== 200) {
			throw new HttpError(res);
		}

		return res.payload.items.item.map((item) => new SearchResult(item));
	}

	/**
	 * Get the full details for a show by ID
	 *
	 * @param showId The ID of the show to load data for
	 */
	public async getShowDetails(showId: number) {
		const querystring = stringify({
			territory: this.territory,
			pk: showId
		});

		const res = await this.requestXml<ShowDetailsData>('GET', `/xml/detail/?${querystring}`);

		if (res.status !== 200) {
			throw new HttpError(res);
		}

		const result = new ShowDetails(res.payload);

		console.log(result);

		return result;
	}

	/**
	 * Get the episode list for a given show. Optionally, a query can be provided to control
	 * which episodes to retrieve (like which season), based on the filters defined in the
	 * response itself.
	 *
	 * @param showId The ID of the show to load episodes for
	 * @param query Any additional query filters
	 */
	public async getShowEpisodes(showId: number, query?: object) {
		const querystring = stringify(Object.assign(query || { }, {
			territory: this.territory,
			show: showId
		}));

		const res = await this.requestXml('GET', `/xml/longlist/episodes/?${querystring}`);

		if (res.status !== 200) {
			throw new HttpError(res);
		}

		console.log(res);
	}

	/**
	 * Get the video player details for a specific video
	 *
	 * @param showId The ID of the show
	 * @param id The ID of the specific video
	 */
	public async getPlayer(showId: number, videoId: number, audio: Audio) {
		const querystring = stringify({
			territory: this.territory,
			showId: showId,
			id: videoId,
			audio: audio,
			watched: 0
		});

		const res = await this.requestXml('GET', `/xml/player/?${querystring}`);

		if (res.status !== 200) {
			throw new HttpError(res);
		}

		console.log(res);
	}
}
