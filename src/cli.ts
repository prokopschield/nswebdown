#!/usr/bin/env node

import { grab } from '.';
grab(
	process.argv[2] || 'https://example.org',
	process.argv[3] || process.argv[2] || 'downloaded',
	console.log
);
