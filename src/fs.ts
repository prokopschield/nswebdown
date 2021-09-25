import fs from 'fs';
import path from 'path';
import io from 'serial-async-io';
import archive from './archive';

// get a timestamp YYYY-mm-dd_hh-MM-ss
const d = new Date();
const zp = (n: number) => (n > 9 ? n : `0${n}`);
const p = `${zp(d.getFullYear())}-${zp(d.getMonth() + 1)}-${zp(
	d.getDate()
)}_${zp(d.getHours())}-${zp(d.getMinutes())}-${zp(d.getSeconds())}`;

export function resolve(
	rel: string,
	base: string,
	is_html: boolean,
	prefix: string = 'latest'
) {
	const p = path.resolve(
		base,
		prefix,
		path.relative('/', path.resolve('/', rel))
	);
	if (is_html && !p.endsWith('.html')) {
		return `${p}.html`;
	} else return p;
}

export function exists(rel: string, base: string, is_html: boolean) {
	return fs.existsSync(resolve(rel, base, is_html));
}

export function read(rel: string, base: string, is_html: boolean) {
	return io.read(resolve(rel, base, is_html));
}

export async function write(
	rel: string,
	base: string,
	is_html: boolean,
	data: Buffer | string
) {
	const al = resolve(rel, base, is_html, p);
	const adir = path.resolve(al, '..');
	if (!fs.existsSync(adir)) {
		fs.mkdirSync(adir, { recursive: true });
	}
	await io.write(al, data);
	const fp = resolve(rel, base, is_html);
	const dir = path.resolve(fp, '..');
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	if (fs.existsSync(fp)) {
		const r = await io.read(fp);
		archive(r);
		fs.unlinkSync(fp);
	}
	fs.symlinkSync(path.relative(dir, al), fp);
}

export async function stat(
	rel: string,
	base: string,
	is_html: boolean = false
) {
	return await fs.promises.stat(resolve(rel, base, is_html));
}

export default { resolve, exists, read, write, stat };
