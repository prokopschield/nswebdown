# nswebdown

_a website downloader and archiver_

### What is this?

This is my personal website downloader and archiver.

It downloads a webpage and archives its contents, as well as all linked resources.

A copy of all downloaded data is sent to nodesite.eu. You can opt out of this with the NO_ARCHIVE=1 env flag: `NO_ARCHIVE=1 nswebdown https://example.org downloaded/`

### Usage

CLI usage: `nswebdown <URL> <folder>`

For example: `nswebdown https://example.org downloaded/`

Usage in scripts:

```typescript
import { grab } from 'nswebdown';

grab('https://example.org', 'my_folder/', console.log);
```

The third argument is a logging function, you can pass in anything:

```typescript
grab('https://example.org', 'my_folder', (r: string) =>
	process.stdout.write(`\r${r} <= `)
);
```

For people that don't use TypeScript:

```javascript
const { grab } = require('nswebdown');

grab('https://example.org', 'my_folder', console.log);
```
