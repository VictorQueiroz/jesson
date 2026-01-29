# JESSON

A JSON parser and stringifier written in TypeScript with support for BigInt.

## Features

- 🚀 Pure TypeScript implementation
- 📦 ES Module support
- 🔢 BigInt support for large integers
- 🎯 Type-safe with full TypeScript definitions
- ✅ Comprehensive test coverage (56 tests)
- 📊 Benchmarked against native JSON

## Installation

```bash
npm install jesson
```

## Usage

```typescript
import { JSON as JESSON } from 'jesson';

// Parse JSON with BigInt support
const data = JESSON.parse('{"id": 12345678901234567890}');
// { id: 12345678901234567890n }

// Stringify objects with BigInt
const obj = { value: 9007199254740991n };
const json = JESSON.stringify(obj);
// '{"value":9007199254740991}'
```

## API

### `JESSON.parse(jsonString: string): any`

Parses a JSON string and returns the corresponding JavaScript value. Automatically detects and converts large integers to BigInt.

### `JESSON.stringify(value: any): string`

Converts a JavaScript value to a JSON string. Supports BigInt values.

## Advanced Usage

### Direct AST Manipulation

JESSON exposes the underlying tokenizer, parser, and stringifier for advanced use cases:

```typescript
import { Tokenizer, Parser, Stringifier } from 'jesson';

// Tokenize
const tokens = new Tokenizer('{"key": "value"}').tokenize();

// Parse to AST
const ast = new Parser(tokens).parse();

// Stringify AST
const json = new Stringifier(ast).stringify();
```

## Performance

JESSON is written in TypeScript for educational purposes. For production use cases requiring maximum performance, use the native `JSON` object. See benchmark results:

```bash
npm run benchmark
```

Sample results show native JSON is typically 2-100x faster depending on the operation and data size, which is expected as it's a C++ implementation.

### Performance Profiling

To identify performance bottlenecks and visualize where time is spent:

```bash
# Generate flame graph visualization
npm run benchmark:profile

# Generate performance recommendations
npm run benchmark:doctor
```

These commands use **[Clinic.js](https://clinicjs.org/)**, a professional Node.js performance profiling tool that generates interactive HTML reports showing:
- **Flame graphs**: Visual representation of where CPU time is spent
- **Performance bottlenecks**: Identifies slow functions and call stacks
- **Optimization opportunities**: Recommendations for improving performance

Reports are saved to the `.clinic/` directory and can be opened in any web browser.


## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run benchmarks
npm run benchmark

# Build
npm run build
```

## Testing

JESSON has comprehensive test coverage with 56 tests covering:

- Tokenizer edge cases
- Parser functionality
- Stringifier output
- BigInt handling
- Error scenarios
- String escaping
- Nested structures

## License

MIT

## Author

Victor Queiroz
