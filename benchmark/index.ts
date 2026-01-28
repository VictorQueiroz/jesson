import {Bench} from 'tinybench';
import {JSON as JESSON} from '../src/index.js';

const bench = new Bench();

const smallObject = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    active: true
};

const mediumObject = {
    users: Array.from({length: 100}, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        active: i % 2 === 0,
        metadata: {
            created: Date.now(),
            updated: Date.now()
        }
    }))
};

const largeObject = {
    data: Array.from({length: 1000}, (_, i) => ({
        id: i,
        value: Math.random(),
        nested: {
            a: i,
            b: i * 2,
            c: i * 3
        }
    }))
};

const smallJSON = JSON.stringify(smallObject);
const mediumJSON = JSON.stringify(mediumObject);
const largeJSON = JSON.stringify(largeObject);

console.log('🚀 JESSON Benchmark Suite\n');
console.log('Comparing JESSON vs native JSON performance\n');

// Parse benchmarks
bench.add('Native JSON.parse (small)', () => {
    JSON.parse(smallJSON);
});

bench.add('JESSON.parse (small)', () => {
    JESSON.parse(smallJSON);
});

bench.add('Native JSON.parse (medium)', () => {
    JSON.parse(mediumJSON);
});

bench.add('JESSON.parse (medium)', () => {
    JESSON.parse(mediumJSON);
});

bench.add('Native JSON.parse (large)', () => {
    JSON.parse(largeJSON);
});

bench.add('JESSON.parse (large)', () => {
    JESSON.parse(largeJSON);
});

// Stringify benchmarks
bench.add('Native JSON.stringify (small)', () => {
    JSON.stringify(smallObject);
});

bench.add('JESSON.stringify (small)', () => {
    JESSON.stringify(smallObject);
});

bench.add('Native JSON.stringify (medium)', () => {
    JSON.stringify(mediumObject);
});

bench.add('JESSON.stringify (medium)', () => {
    JESSON.stringify(mediumObject);
});

bench.add('Native JSON.stringify (large)', () => {
    JSON.stringify(largeObject);
});

bench.add('JESSON.stringify (large)', () => {
    JESSON.stringify(largeObject);
});

await bench.warmup();
await bench.run();

console.log('\n📊 Results:\n');
console.table(
    bench.tasks.map(task => ({
        'Task': task.name,
        'ops/sec': task.result?.hz.toFixed(0) || 'N/A',
        'Average (ms)': task.result?.mean ? (task.result.mean * 1000).toFixed(4) : 'N/A',
        'Min (ms)': task.result?.min ? (task.result.min * 1000).toFixed(4) : 'N/A',
        'Max (ms)': task.result?.max ? (task.result.max * 1000).toFixed(4) : 'N/A'
    }))
);

console.log('\n📈 Summary:');
console.log(`Total tests: ${bench.tasks.length}`);
console.log(`\nNote: Native JSON is a C++ implementation and will typically be faster.`);
console.log(`JESSON is written in TypeScript for learning/demonstration purposes.`);
