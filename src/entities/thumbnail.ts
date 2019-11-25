
import { Platform } from '../enums';
import { ThumbnailData } from '../payloads';

export interface ThumbnailAlternate {
	location: string;
	platforms: Platform[];
}

export class Thumbnail {
	public readonly location: string;
	public readonly alternates: ThumbnailAlternate[];

	constructor(raw: ThumbnailData) {
		this.location = raw['#text'];
		this.alternates = raw.alternate.map((alternate) => {
			return {
				location: alternate['#text'],
				platforms: alternate.attr.platforms.split(',') as Platform[]
			};
		});

		Object.freeze(this);
	}
}
