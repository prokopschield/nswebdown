import nsblob from 'nsblob';
import Queue from 'ps-std/lib/classes/SerialQueue';

const queue = new Queue();

export function archive(data: Buffer) {
	if (process.env.NO_ARCHIVE) {
		return false;
	}
	queue.add(() => nsblob.store(data));
}

export default archive;
