
import { Audio, DeviceCategory, DeviceType, SubTitle, Territory, UserRole, UserType } from './enums';

/** A pointer to another location on the API */
export interface ApiPointerData {
	title?: string;
	target?: string;
	path?: string;
	params?: string;
	themes?: string;
}

/** A pointer to a web address intended to be viewed in a web browser */
export interface BrowserPointerData {
	title: string;
	debug: string;
	webBrowserUrl: string;
}

/** Represents a shows rating in a given region (ie "TV-MA") */
export interface RatingData {
	'#text': string | number;
	attr: {
		region: string;
	}
}

/** Response from the login API call */
export interface LoginResponseData {
	authentication: {
		token: string;
		anonymous: 'true' | 'false';
		parameters: {
			territory: Territory;
			header: {
				userName: string;
				userType: UserType;
				userId: number;
				userRole: UserRole;
				dinstid: string;
				Authorization: string;
			};
		};
	};
}

export interface ThumbnailData {
	'#text': string;
	alternate: {
		'#text': string;
		attr: {
			styleIds?: string;
			platforms?: string;
		};
	}[];
}

export interface SearchResultData {
	analytics: {
		category: string;
		label: string;
	};
	title: string;
	themes: 'search';
	thumbnail: ThumbnailData;
	id: number;
	starRating: {
		name: 'userRating';
		data: ApiPointerData;
		rating: number;
	};
	ratings: {
		tv: RatingData[];
	};
	content: {
		metadata: {
			recentlyAdded: string;
			format: string;
			releaseYear: number;
		};
	};
	pointer: ApiPointerData & {
		attr: {
			platforms: string;
		};
		alternate: ApiPointerData & {
			attr: {
				platforms: string;
			};
		};
	};
}

/** Response from the search API call */
export interface SearchResponseData {
	items: {
		item: SearchResultData[];
	};
}

/** Response from the get show details API call */
export interface ShowDetailsData {
	list2d: {
		analytics: {
			pageName: string;
			screenName: string;
			externalAlphaId: string;
			action: string;
			category: string;
			label: string;
			cd20: number;
		};
		title: 'Detail';
		logo: ThumbnailData;
		themes: 'detail';
		hero: {
			item: {
				title: string;
				subtitle: string;
			};
		};
		pointer: {
			// 
		}[];
	};
}
