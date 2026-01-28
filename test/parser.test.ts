import test from 'ava';
import {Parser, Tokenizer, NodeType} from '../build/src/index.js';

test('should parse empty object', t => {
    const tokens = new Tokenizer('{}').tokenize();
    const node = new Parser(tokens).parse();
    t.deepEqual(node, {
        type: NodeType.Object,
        body: []
    });
});

test('should parse empty array in object', t => {
    const tokens = new Tokenizer('{"arr":[]}').tokenize();
    const node = new Parser(tokens).parse();
    t.deepEqual(node.body[0].value, {
        type: NodeType.Array,
        body: []
    });
});

test('should parse array with multiple elements', t => {
    const tokens = new Tokenizer('{"arr":[1,2,3]}').tokenize();
    const node = new Parser(tokens).parse();
    const arr = node.body[0].value;
    t.is(arr.type, NodeType.Array);
    if (arr.type === NodeType.Array) {
        t.is(arr.body.length, 3);
    }
});

test('should parse boolean values', t => {
    const tokens = new Tokenizer('{"flag":true,"flag2":false}').tokenize();
    const node = new Parser(tokens).parse();
    t.deepEqual(node.body[0].value, {
        type: NodeType.Boolean,
        value: true
    });
    t.deepEqual(node.body[1].value, {
        type: NodeType.Boolean,
        value: false
    });
});

test('should parse null value', t => {
    const tokens = new Tokenizer('{"value":null}').tokenize();
    const node = new Parser(tokens).parse();
    t.deepEqual(node.body[0].value, {
        type: NodeType.Null
    });
});

test('should parse nested objects', t => {
    const tokens = new Tokenizer('{"outer":{"inner":"value"}}').tokenize();
    const node = new Parser(tokens).parse();
    const outer = node.body[0].value;
    t.is(outer.type, NodeType.Object);
    if (outer.type === NodeType.Object) {
        t.is(outer.body[0].key.value, 'inner');
    }
});

test('should parse array of objects', t => {
    const tokens = new Tokenizer('{"items":[{"id":1},{"id":2}]}').tokenize();
    const node = new Parser(tokens).parse();
    const items = node.body[0].value;
    t.is(items.type, NodeType.Array);
    if (items.type === NodeType.Array) {
        t.is(items.body.length, 2);
        t.is(items.body[0].type, NodeType.Object);
    }
});

test('should parse strings with special characters', t => {
    const tokens = new Tokenizer('{"text":"hello\\nworld"}').tokenize();
    const node = new Parser(tokens).parse();
    const text = node.body[0].value;
    t.is(text.type, NodeType.String);
});

test('should throw on unexpected EOF', t => {
    const tokens = new Tokenizer('{"key"').tokenize();
    t.throws(() => new Parser(tokens).parse());
});

test('should throw on missing colon', t => {
    const tokens = new Tokenizer('{"key" "value"}').tokenize();
    t.throws(() => new Parser(tokens).parse());
});

test('should parse object without trailing comma', t => {
    const tokens = new Tokenizer('{"a":1,"b":2}').tokenize();
    const node = new Parser(tokens).parse();
    t.is(node.body.length, 2);
});

test('should parse array without trailing comma', t => {
    const tokens = new Tokenizer('{"arr":[1,2]}').tokenize();
    const node = new Parser(tokens).parse();
    const arr = node.body[0].value;
    if (arr.type === NodeType.Array) {
        t.is(arr.body.length, 2);
    }
});
