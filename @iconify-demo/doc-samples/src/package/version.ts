import { bumpVersion } from '@iconify/tools';

console.log(bumpVersion('1.0.0')); // 1.0.1
console.log(bumpVersion('2.1.3')); // 2.1.4
console.log(bumpVersion('2.0.0-beta.1')); // 2.0.0-beta.2
