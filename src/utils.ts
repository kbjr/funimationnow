
interface MapCallback<T, R> {
	(item: T) : R;
}

export const map = <T, R>(list: T | T[], callback: MapCallback<T, R>) : R[] => {
	if (Array.isArray(list)) {
		return list.map((item) => callback(item));
	}

	return [ callback(list) ];
};
