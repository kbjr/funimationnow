
import { map } from '../utils';
import { Rating } from './rating';
import { Thumbnail } from './thumbnail';
import { ShowDetailsData, ShowDetailsEpisodesData, ShowDetailsEpisodesListData, WatchNextData } from '../payloads';

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
		this.ratings = map(hero.ratings.tv, (rating) => new Rating(rating));
		this.description = hero.content.description;
		this.format = hero.content.metadata.format;
		this.releaseYear = hero.content.metadata.releaseYear;

		const episodeList = findEpisodes(raw);
		const [ episodes, watchNext ] = splitEpisodeData(episodeList);

		this.watchNextVideoId = getEpisodeVideoId(watchNext.pointer.params);
		this.episodes = episodes.map((episode) => new ShowDetailsEpisode(episode));

		Object.freeze(this);
	}
}

export class ShowDetailsEpisode {
	public readonly title: string;
	public readonly subtitle: string;
	public readonly videoId: number;
	public readonly starRating: number;
	public readonly ratings: Rating[];
	public readonly description: string;
	public readonly format: string;
	public readonly languages: string;
	public readonly duration: number;
	public readonly episodeNumber: number;

	constructor(raw: EpisodeDetails) {
		this.title = raw.title;
		this.subtitle = raw.subtitle;
		this.videoId = getEpisodeVideoId(raw.pointer.params);
		this.starRating = raw.starRating.rating;
		this.ratings = map(raw.ratings.tv, (rating) => new Rating(rating));
		this.description = raw.content.description;
		this.format = raw.content.metadata.format;
		this.languages = raw.content.metadata.languages;
		this.duration = raw.content.metadata.duration;
		this.episodeNumber = raw.content.metadata.episodeNumber;

		Object.freeze(this);
	}
}

const findEpisodes = (raw: ShowDetailsData) : ShowDetailsEpisodesListData => {
	return raw.list2d.pointer.find((item) : item is ShowDetailsEpisodesListData => {
		return (item as ShowDetailsEpisodesListData).path === 'longlist/episodes/';
	});
};

const splitEpisodeData = (raw: ShowDetailsEpisodesListData) : [ EpisodeDetails[], WatchNextData ] => {
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

const idPattern = /(^|;)id=([0-9]+)(&|$)/;

const getEpisodeVideoId = (params: string) : number => {
	const match = idPattern.exec(params);

	if (match) {
		return parseInt(match[2], 10);
	}
};
