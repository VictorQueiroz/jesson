import test from 'ava';
import {Stringifier, NodeType} from '../build/src/index.js';
import type {INodeObject, INodeArray} from '../build/src/index.js';

test('should stringify empty object', t => {
    const node: INodeObject = {
        type: NodeType.Object,
        body: []
    };
    t.is(new Stringifier(node).stringify(), '{}');
});

test('should stringify empty array', t => {
    const node: INodeArray = {
        type: NodeType.Array,
        body: []
    };
    t.is(new Stringifier(node).stringify(), '[]');
});

test('should stringify simple object', t => {
    const node: INodeObject = {
        type: NodeType.Object,
        body: [{
            type: NodeType.ObjectProperty,
            key: {type: NodeType.String, value: 'name'},
            value: {type: NodeType.String, value: 'test'}
        }]
    };
    t.is(new Stringifier(node).stringify(), '{"name":"test"}');
});

test('should stringify array of numbers', t => {
    const node: INodeArray = {
        type: NodeType.Array,
        body: [
            {type: NodeType.Integer, value: 1},
            {type: NodeType.Integer, value: 2},
            {type: NodeType.Integer, value: 3}
        ]
    };
    t.is(new Stringifier(node).stringify(), '[1,2,3]');
});

test('should stringify boolean true', t => {
    const node = {type: NodeType.Boolean, value: true};
    t.is(new Stringifier(node).stringify(), 'true');
});

test('should stringify boolean false', t => {
    const node = {type: NodeType.Boolean, value: false};
    t.is(new Stringifier(node).stringify(), 'false');
});

test('should stringify null', t => {
    const node = {type: NodeType.Null};
    t.is(new Stringifier(node).stringify(), 'null');
});

test('should stringify float', t => {
    const node = {type: NodeType.Float, value: 3.14};
    t.is(new Stringifier(node).stringify(), '3.14');
});

test('should stringify bigint', t => {
    const node = {type: NodeType.BigInt, value: 9007199254740991n};
    t.is(new Stringifier(node).stringify(), '9007199254740991');
});

test('should escape quotes in strings', t => {
    const node: INodeObject = {
        type: NodeType.Object,
        body: [{
            type: NodeType.ObjectProperty,
            key: {type: NodeType.String, value: 'text'},
            value: {type: NodeType.String, value: 'say "hello"'}
        }]
    };
    t.true(new Stringifier(node).stringify().includes('\\"'));
});

test('should stringify nested objects', t => {
    const node: INodeObject = {
        type: NodeType.Object,
        body: [{
            type: NodeType.ObjectProperty,
            key: {type: NodeType.String, value: 'outer'},
            value: {
                type: NodeType.Object,
                body: [{
                    type: NodeType.ObjectProperty,
                    key: {type: NodeType.String, value: 'inner'},
                    value: {type: NodeType.String, value: 'value'}
                }]
            }
        }]
    };
    t.is(new Stringifier(node).stringify(), '{"outer":{"inner":"value"}}');
});

test('should stringify nested arrays', t => {
    const node: INodeArray = {
        type: NodeType.Array,
        body: [{
            type: NodeType.Array,
            body: [
                {type: NodeType.Integer, value: 1},
                {type: NodeType.Integer, value: 2}
            ]
        }]
    };
    t.is(new Stringifier(node).stringify(), '[[1,2]]');
});
