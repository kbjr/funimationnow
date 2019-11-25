
import { ThumbnailData } from '../payloads';
import { Platform, ThumbnailStyle } from '../enums';

export interface ThumbnailAlternate {
	location: string;
	platforms?: Platform[];
	styleIds?: ThumbnailStyle[];
}

export class Thumbnail {
	public readonly location: string;
	public readonly alternates: ThumbnailAlternate[];

	constructor(raw: ThumbnailData) {
		this.location = raw['#text'];
		this.alternates = raw.alternate.map(processAlternate);

		Object.freeze(this);
	}
}

const processAlternate = (alternate: ThumbnailData['alternate'][0]) => {
	const result: ThumbnailAlternate = {
		location: alternate['#text']
	};

	if (alternate.attr.platforms) {
		result.platforms = alternate.attr.platforms.split(',') as Platform[];
	}

	if (alternate.attr.styleIds) {
		result.styleIds = alternate.attr.styleIds.split(',') as ThumbnailStyle[];
	}

	return result;
};
