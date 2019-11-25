
import { Rating } from './rating';
import { Thumbnail } from './thumbnail';
import { SearchResultData } from '../payloads';

export class SearchResult {
	public readonly id: number;
	public readonly title: string;
	public readonly thumbnail: Thumbnail;
	public readonly starRating: number;
	public readonly format: string;
	public readonly releaseYear: number;
	public readonly added: Date;
	public readonly ratings: Rating[];

	public readonly analytics: Readonly<{
		category: string;
		label: string;
	}>;

	constructor(raw: SearchResultData) {
		this.id = raw.id;
		this.title = raw.title;
		this.thumbnail = new Thumbnail(raw.thumbnail);
		this.starRating = raw.starRating.rating;
		this.format = raw.content.metadata.format;
		this.releaseYear = raw.content.metadata.releaseYear;
		this.added = parseRecentlyAdded(raw.content.metadata.recentlyAdded);

		this.ratings = raw.ratings.tv.map((rating) => {
			return new Rating(rating);
		});

		this.analytics = Object.freeze({
			category: raw.analytics.category,
			label: raw.analytics.label
		});

		Object.freeze(this);
	}
}

const recentlyAddedPattern = /\{([0-9]+)\}/;

const parseRecentlyAdded = (text: string) => {
	const match = recentlyAddedPattern.exec(text);

	if (match) {
		return new Date(parseInt(match[1], 10));
	}
};
