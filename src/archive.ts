import nsblob from 'nsblob';
import Queue from 'ps-std/lib/classes/Queue';

const queue = new Queue();

export function archive(data: Buffer) {
	if (process.env.NO_ARCHIVE) {
		return false;
	}
	queue.promise
		.then(async () => {
			await nsblob.store(data);
		})
		.finally(() => queue.next());
}

export default archive;
