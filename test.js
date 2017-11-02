const fs = require('fs');
const svgo = require('svgo');

let svg = fs.readFileSync('tests/files/bpmn-trash.svg', 'utf8');

// let test = new svgo({
// 	plugins: [{
// 	    removeTitle: true
//     }]
// });
// test.optimize(svg, result => console.log('test', result));


let test = new svgo({
	plugins: [{
	    removeTitle: true
    }]
});
test.optimize(svg).then(result => console.log('test', result)).catch(err => console.log('error', err));
