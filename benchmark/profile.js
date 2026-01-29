// Profile script for clinic.js visualization
// This runs the benchmarks in a way that clinic can analyze

import {JSON as JESSON} from '../build/src/index.js';

// Generate test data
const iterations = 1000;

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

console.log('Running performance profiling...');
console.log(`Iterations: ${iterations}\n`);

// Parse benchmarks
console.log('Profiling JESSON.parse operations...');
const smallJSON = JSON.stringify(smallObject);
const mediumJSON = JSON.stringify(mediumObject);
const largeJSON = JSON.stringify(largeObject);

for (let i = 0; i < iterations; i++) {
    JESSON.parse(smallJSON);
}

for (let i = 0; i < iterations / 10; i++) {
    JESSON.parse(mediumJSON);
}

for (let i = 0; i < iterations / 100; i++) {
    JESSON.parse(largeJSON);
}

// Stringify benchmarks
console.log('Profiling JESSON.stringify operations...');

for (let i = 0; i < iterations; i++) {
    JESSON.stringify(smallObject);
}

for (let i = 0; i < iterations / 10; i++) {
    JESSON.stringify(mediumObject);
}

for (let i = 0; i < iterations / 100; i++) {
    JESSON.stringify(largeObject);
}

console.log('\nProfiling complete!');
console.log('Check the generated HTML report for performance bottlenecks.');
