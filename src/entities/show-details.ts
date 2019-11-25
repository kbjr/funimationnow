
import { Rating } from './rating';
import { Thumbnail } from './thumbnail';
import { ShowDetailsData, ShowDetailsEpisodesData, ShowDetailsEpisodesListData, ShowDetailsSimilarShowsData, WatchNextData } from '../payloads';

type EpisodeDetails = ShowDetailsEpisodesData['item'][0];

export class ShowDetails {
	public readonly logo: Thumbnail;
	public readonly title: string;
	public readonly subtitle: string;
	public readonly heroThumbnail: Thumbnail;
	public readonly starRating: number;
	public readonly ratings: Rating[];
	public readonly description: string;
	public readonly format: string;
	public readonly releaseYear: number;

	public readonly watchNextVideoId: number;
	public readonly episodes: ShowDetailsEpisode[];

	constructor(raw: ShowDetailsData) {
		this.logo = new Thumbnail(raw.list2d.logo);

		const hero = raw.list2d.hero.item;

		this.title = hero.title;
		this.subtitle = hero.subtitle;
		this.heroThumbnail = new Thumbnail(hero.thumbnail);
		this.starRating = hero.starRating.rating;
		this.ratings = hero.ratings.map((rating) => new Rating(rating));
		this.description = hero.content.description;
		this.format = hero.content.metadata.format;
		this.releaseYear = hero.content.metadata.releaseYear;

		const episodeList = findEpisodes(raw);
		const episodes = fineEpisodeArray(episodeList);

		// 

		Object.freeze(this);
	}
}

export class ShowDetailsEpisode {
	constructor(raw: EpisodeDetails) {
		// 
	}
}

const findEpisodes = (raw: ShowDetailsData) : ShowDetailsEpisodesListData => {
	return raw.list2d.pointer.find((item) : item is ShowDetailsEpisodesListData => {
		return (item as ShowDetailsEpisodesListData).path === 'longlist/episodes/';
	});
};

const fineEpisodeArray = (raw: ShowDetailsEpisodesListData) : [ EpisodeDetails[], WatchNextData ] => {
	const result: [ EpisodeDetails[], WatchNextData ] = [ null, null ];

	for (let i = 0; i < raw.longList.items.length; i++) {
		const item = raw.longList.items[i];

		if ((item as ShowDetailsEpisodesData).item != null) {
			result[0] = (item as ShowDetailsEpisodesData).item;
		}

		else if ((item as WatchNextData).pointer) {
			result[1] = item as WatchNextData;
		}
	}

	raw.longList.items.find((item) : item is ShowDetailsEpisodesData => {
		return (item as ShowDetailsEpisodesData).item != null;
	}).item;

	return result;
};
