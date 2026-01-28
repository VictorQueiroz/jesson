import fs from 'fs';
import test from 'ava';
import {
    Parser,
    Stringifier,
    Tokenizer,
    NodeType,
    JSON as JESSON
} from '../build/src/index.js';
import type { INodeObject } from '../build/src/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('should parse JSON string with big integers', t => {
    const node = new Parser(new Tokenizer('{"a": 11252353308968154646}').tokenize()).parse();
    const expectedNode: INodeObject = {
        type: NodeType.Object,
        body: [
            {
                type: NodeType.ObjectProperty,
                key: {
                    type: NodeType.String,
                    value: 'a'
                },
                value: {
                    type: NodeType.BigInt,
                    value: 11252353308968154646n
                }
            }
        ]
    };
    t.deepEqual(node, expectedNode);
});

test('should parse float numbers', t => {
    const node = new Parser(new Tokenizer('{"a": 1.7976931348623157}').tokenize()).parse();
    const expectedNode: INodeObject = {
        type: NodeType.Object,
        body: [
            {
                type: NodeType.ObjectProperty,
                key: {
                    type: NodeType.String,
                    value: 'a'
                },
                value: {
                    type: NodeType.Float,
                    value: 1.7976931348623157
                }
            }
        ]
    };
    t.deepEqual(node, expectedNode);
});

test('should stringify nodes', t => {
    let node = new Parser(new Tokenizer('{"a": 4294967296}').tokenize()).parse();
    t.is(new Stringifier(node).stringify(), '{"a":4294967296}');

    node = new Parser(new Tokenizer('{"a": 1.7976931348623157}').tokenize()).parse();

    node = new Parser(new Tokenizer('{"a": 5366794105309385834}').tokenize()).parse();
    t.is(new Stringifier(node).stringify(), '{"a":5366794105309385834}');
});

test('should parse null type', t => {
    let node = new Parser(new Tokenizer('{"a": null}').tokenize()).parse();
    t.is(new Stringifier(node).stringify(), '{"a":null}');
});

test('should stringify number', t => {
    t.is(JESSON.stringify({
        id: 1000000,
        name: 'Title'
    }), '{"id":1000000,"name":"Title"}');
});

test('should not stringify cyclic objects', t => {
    const value = {};
    t.is(JESSON.stringify({
        value: {
            value1: value,
            value2: value
        }
    }), '{"value":{"value1":{},"value2":{}}}');

    const value2: any = {};
    value2.value = value2;
    const error = t.throws(() => JESSON.stringify(value2));
    t.is(error?.message, 'detected cyclic object');

    const value3: any = {};
    const list = [value3];
    value3.value = list;
    const error2 = t.throws(() => JESSON.stringify(list));
    t.is(error2?.message, 'detected cyclic object');
});

test('should parse normal-length integers', t => {
    const node = new Parser(new Tokenizer('{"a": 4294967296}').tokenize()).parse();
    const expectedNode: INodeObject = {
        type: NodeType.Object,
        body: [
            {
                type: NodeType.ObjectProperty,
                key: {
                    type: NodeType.String,
                    value: 'a'
                },
                value: {
                    type: NodeType.Integer,
                    value: 4294967296
                }
            }
        ]
    };
    t.deepEqual(node, expectedNode);
});

test('should handle negative integers', t => {
    const obj1: INodeObject = {
        type: NodeType.Object,
        body: [
            {
                type: NodeType.ObjectProperty,
                key: {
                    type: NodeType.String,
                    value: 'a'
                },
                value: {
                    type: NodeType.Integer,
                    value: -20000
                }
            },
            {
                type: NodeType.ObjectProperty,
                key: {
                    type: NodeType.String,
                    value: 'b'
                },
                value: {
                    type: NodeType.BigInt,
                    value: -7439353655660881559n
                }
            }
        ]
    };
    t.deepEqual(new Parser(new Tokenizer('{"a":-20000,"b":-7439353655660881559}').tokenize()).parse(), obj1);
    t.deepEqual(JESSON.parse('{"a":-20000,"b":-7439353655660881559}'), {
        a: -20000,
        b: -7439353655660881559n
    });
});

test('should escape strings with "" content', t => {
    t.is(JESSON.stringify({
        value: 'Hey. This content has a "quotation" part'
    }), '{"value":"Hey. This content has a \\"quotation\\" part"}');
    t.deepEqual(JESSON.parse('{"value":"Hey. This content has a \\"quotation\\" part"}'), {
        value: 'Hey. This content has a "quotation" part'
    });
});

test('should parse deep objects', async t => {
    const content = await fs.promises.readFile(__dirname + '/json1.json', 'utf8');
    const stringified = await fs.promises.readFile(__dirname + '/json1.stringified', 'utf8');
    const node = new Parser(new Tokenizer(content).tokenize()).parse();
    t.is(new Stringifier(node).stringify(), stringified);
    t.is(new Stringifier(node).stringify(), stringified);
    t.deepEqual(JESSON.stringify(JSON.parse(content)), JSON.stringify(JSON.parse(content), null, ''))
    t.deepEqual(JESSON.parse(content), JSON.parse(content))
});
