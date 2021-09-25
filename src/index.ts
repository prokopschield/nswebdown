import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { posix as path } from 'path';
import { format } from 'prettier';
import Queue from 'ps-std/lib/classes/Queue';
import archive from './archive';
import fs from './fs';
import uri2path from './uri2path';

const clock = new Queue();
setInterval(() => clock.next(), 1250);
const DOMPurify = createDOMPurify(new JSDOM('').window as any as Window);

const grabbed = new Set<string>();

export async function grab(
	uri: string | URL,
	outdir: string = 'public',
	logger: (msg: string) => void,
	origin?: URL
) {
	try {
		await clock.promise;
		const url = new URL(uri);
		logger(`Began fetching ${url}`);
		const fpath = uri2path(url);

		let req_head: any = {};
		if (fs.exists(fpath, outdir, false)) {
			const stat = await fs.stat(fpath, outdir);
			req_head['If-Modified-Since'] = stat.mtime.toUTCString();
		}
		const res = await fetch(url.href, { headers: req_head });
		if (res.status === 304) {
			logger(`Not Modified => ${url}`);
			clock.next_async();
			return true;
		}
		const body = await res.buffer();
		const headers = res.headers;
		const ctype = (
			headers.get('content-type') || 'application/octet-stream'
		).toLocaleLowerCase();
		archive(body);
		if (ctype.includes('text/html')) {
			const html = DOMPurify.sanitize(body.toString());
			const DOM = new JSDOM(html);
			const { window } = DOM;
			const { document } = window;
			const elements = document.querySelectorAll('*');
			let awaited_resources = Array<Promise<boolean>>();
			for (const element of elements) {
				if ('src' in element) {
					const relement = element as HTMLImageElement;
					const rurl = new URL(relement.src, url);
					const rfpath = uri2path(rurl);
					if (!fs.exists(rfpath, outdir, false) && !grabbed.has(rfpath)) {
						logger(`Queueing up resource ${rurl}`);
						grabbed.add(rfpath);
						awaited_resources.push(grab(rurl, outdir, logger));
					}
					relement.src = path.relative(path.resolve(fpath, '..'), rfpath);
				}
			}
			await Promise.all(awaited_resources);
			logger(`Fetched all resources needed for ${url}`);
			for (const element of elements) {
				if ('href' in element) {
					const relement = element as HTMLLinkElement;
					const rurl = new URL(relement.href, url);
					const rfpath = uri2path(rurl, true);
					if (origin && origin.host !== rurl.host) {
						relement.href = rurl.href;
					} else {
						if (!grabbed.has(rfpath)) {
							logger(`Queueing up page ${rurl}`);
							grabbed.add(rfpath);
							grab(rurl, outdir, logger, url);
						}
						relement.href = path.relative(path.resolve(fpath, '..'), rfpath);
					}
				}
			}
			const modified_html = window.document.documentElement.innerHTML;
			const prettied = format(modified_html, {
				parser: 'vue',
				useTabs: true,
				tabWidth: 4,
				singleQuote: true,
			});
			await fs.write(fpath, outdir, true, prettied);
		} else {
			await fs.write(fpath, outdir, false, body);
		}
		logger(`Finished fetching ${url}`);
		return true;
	} catch (error) {
		console.log({ error });
		return false;
	}
}
