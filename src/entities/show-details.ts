
import { Rating } from './rating';
import { Thumbnail } from './thumbnail';
import { ShowDetailsData, ShowDetailsEpisodesData, ShowDetailsEpisodesListData, ShowDetailsSimilarShowsData } from '../payloads';

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

		const episodes = findEpisodes(raw);

		// 

		Object.freeze(this);
	}
}

const findEpisodes = (raw: ShowDetailsData) : ShowDetailsEpisodesListData => {
	return raw.list2d.pointer.find((item) : item is ShowDetailsEpisodesListData => {
		return (item as ShowDetailsEpisodesListData).path === 'longlist/episodes/';
	});
};
