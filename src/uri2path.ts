import { posix as path } from 'path';
import { filter, filterq } from './constants';

export function uri2path(url: URL, is_html: boolean = false) {
	const base = '/';
	const rel = path.relative(
		base,
		path.resolve(
			base,
			url.protocol.replace(filter, ''),
			url.host.replace(filter, '_'),
			path.relative('/', url.pathname.replace(filter, '_')) +
				(url.search ? '__' + url.search.replace(filterq, '_') : '')
		)
	);
	if (is_html && !rel.endsWith('.html')) {
		if (url.toString().endsWith('/')) {
			return `${rel}/index.html`;
		} else {
			return `${rel}.html`;
		}
	} else return rel;
}

export default uri2path;
