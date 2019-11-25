
import { UserRole, UserType } from './enums';

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

export interface StarRatingData {
	name: 'userRating';
	data: ApiPointerData;
	rating: number;
}

/** Response from the login API call */
export interface LoginResponseData {
	authentication: {
		token: string;
		anonymous: 'true' | 'false';
		parameters: {
			territory: string;
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
	'#text'?: string;
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
	starRating: StarRatingData;
	ratings: {
		tv: RatingData | RatingData[];
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

export interface ButtonData {
	title: string;
	value: string;
}

export interface WatchNextData {
	attr: {
		platforms: string;
	};
	pointer: {
		path: string;
		params: string;
	};
}

export interface ShowDetailsEpisodesData {
	item: {
		analytics: {
			category: string;
			pageName: string;
			screenName: string;
			click: {
				action: string;
				label: string;
			};
			display: {
				action: string;
				label: string;
			};
		};
		title: string;
		subtitle: string;
		thumbnail: ThumbnailData;
		id: number;
		themes: 'detailEpisode';
		legend: {
			button: {
				attr: {
					platforms: string;
				};
				button: string;
				title: string;
				pointer: {
					target: string;
					path: string;
					params: string;
				};
				analytics: {
					category: 'Products';
					click: {
						action: 'Click';
						label: string;
					};
				};
			};
			/**
			 * Contains all of the various additional filters available for this episode. Contains things like
			 * available audio languages.
			 */
			filter: {
				attr: {
					platforms: string;
				};
				name: string;
				param: string;
				currentValue: string;
				choices: {
					button: ButtonData | ButtonData[];
				};
			};
			/** Contains all of the actual video player data */
			pointer: {
				target: 'player';
				path: 'player/';
				/** Contains the params needed to access the player data. This is our real goal for streaming */
				params: string;
				themes: 'fullsizePlayer';
				alternate: {
					// Various data here for options are various platforms that don't really matter atm...
				};
				ratings: {
					tv: RatingData[];
				};
				starRating: StarRatingData;
				content: {
					/** The episode description */
					description: string;
					metadata: {
						format: string;
						languages: string;
						/** Duration of the episode in milliseconds */
						duration: number;
						episodeNumber: number;
						contentType: string;
					};
				};
				history: {
					name: 'history';
					data: ApiPointerData;
				};
			};
		};
		pointer: {
			target: 'player';
			path: 'player/';
			params: string;
			themes: 'fullsizePlayer';
			alternate: {
				// Don't care at the moment....
			};
		};
		ratings: {
			tv: RatingData | RatingData[];
		};
		starRating: StarRatingData;
		content: {
			description: string;
			metadata: {
				format: string;
				languages: string;
				duration: number;
				episodeNumber: number;
				contentType: string;
			};
		};
	}[];
}

export interface ShowDetailsEpisodesListData {
	target: 'longlist';
	path: 'longlist/episodes/';
	params: string;
	themes: 'vertical';
	longList: {
		background: ThumbnailData;
		themes: 'vertical';
		palette: {
			/*
			 * Contains all of the various additional filters available for the show. Contains things like
			 * seasons and versions of the show.
			 */
			filter: {
				name: string;
				path?: 'longlist/episodes/';
				param: string;
				currentValue: string;
				choices: {
					button: ButtonData | ButtonData[];
				};
			}[];
		};
		items: [ WatchNextData, ShowDetailsEpisodesData ];
	};
}

export interface ShowDetailsSimilarShowsData {
	// 
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
				thumbnail: ThumbnailData;
				themes: 'hero';
				starRating: StarRatingData;
				ratings: {
					tv: RatingData | RatingData[];
				};
				content: {
					description: string;
					metadata: {
						format: string;
						releaseYear: number;
					};
				};
			};
		};
		pointer: [ ShowDetailsEpisodesListData, ShowDetailsSimilarShowsData ];
	};
}

/** Response from the get episodes API call */
export interface EpisodeListData {
	// TODO
}

/** Response from the get player API call */
export interface PlayerData {
	player: {
		customPanel: {
			// Don't really care about this, it just contains UI for some specific apps
		};
		item: {
			/** Contains all of the basic metadata about the video */
			video: {
				id: number;
				title: string;
				subtitle: string;
				thumbnail: string;
				starRating: StarRatingData;
				content: {
					metadata: {
						season: string;
						episode: string;
						showName: string;
						duration: number;
						showId: number;
						seasonId: number;
						episodeId: number;
						audio: string;
						contentGenre: string;
						closedCaptionLanguage: string;
						closedCaptionLabel: string;
					};
				};
			};
			ratings: {
				tv: RatingData | RatingData[];
			};
			/** Contains the actual streaming info, including the link to the .m3u8 file */
			hls: {
				/** The actual .m3u8 file URL */
				url: string;
				closedCaptionUrl: {
					/** The URL to the .vtt closed caption file */
					'#text': string;
				};
				isEvent: boolean;
				analytics: {
					label: string;
					// There's also a bunch of other data here, but I'm not sure how to interpret it
				};
			};
			related: {
				// Don't really care
			};
			history: {
				// Don't really care
			};
		};
	};
}
