
import { RatingData } from '../payloads';

/** Represents a shows rating in a given region (ie "TV-MA") */
export class Rating {
	/** The region the rating is for */
	public readonly region: string;
	
	/** The assigned rating */
	public readonly rating: string;

	constructor(raw: RatingData) {
		this.region = raw.attr.region;
		this.rating = String(raw['#text']);

		Object.freeze(this);
	}
}
