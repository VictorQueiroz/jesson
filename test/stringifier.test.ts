import { describe, it } from 'mocha';
import { expect } from 'chai';
import {Stringifier, NodeType} from '../build/src/index.js';
import type {INodeObject, INodeArray} from '../build/src/index.js';

describe('stringifier', () => {
it('should stringify empty object', () => {
    const node: INodeObject = {
        type: NodeType.Object,
        body: []
    };
    expect(new Stringifier(node).stringify()).to.equal('{}');
});

it('should stringify empty array', () => {
    const node: INodeArray = {
        type: NodeType.Array,
        body: []
    };
    expect(new Stringifier(node).stringify()).to.equal('[]');
});

it('should stringify simple object', () => {
    const node: INodeObject = {
        type: NodeType.Object,
        body: [{
            type: NodeType.ObjectProperty,
            key: {type: NodeType.String, value: 'name'},
            value: {type: NodeType.String, value: 'test'}
        }]
    };
    expect(new Stringifier(node).stringify()).to.equal('{"name":"test"}');
});

it('should stringify array of numbers', () => {
    const node: INodeArray = {
        type: NodeType.Array,
        body: [
            {type: NodeType.Integer, value: 1},
            {type: NodeType.Integer, value: 2},
            {type: NodeType.Integer, value: 3}
        ]
    };
    expect(new Stringifier(node).stringify()).to.equal('[1,2,3]');
});

it('should stringify boolean true', () => {
    const node = {type: NodeType.Boolean, value: true};
    expect(new Stringifier(node).stringify()).to.equal('true');
});

it('should stringify boolean false', () => {
    const node = {type: NodeType.Boolean, value: false};
    expect(new Stringifier(node).stringify()).to.equal('false');
});

it('should stringify null', () => {
    const node = {type: NodeType.Null};
    expect(new Stringifier(node).stringify()).to.equal('null');
});

it('should stringify float', () => {
    const node = {type: NodeType.Float, value: 3.14};
    expect(new Stringifier(node).stringify()).to.equal('3.14');
});

it('should stringify bigint', () => {
    const node = {type: NodeType.BigInt, value: 9007199254740991n};
    expect(new Stringifier(node).stringify()).to.equal('9007199254740991');
});

it('should escape quotes in strings', () => {
    const node: INodeObject = {
        type: NodeType.Object,
        body: [{
            type: NodeType.ObjectProperty,
            key: {type: NodeType.String, value: 'text'},
            value: {type: NodeType.String, value: 'say "hello"'}
        }]
    };
    expect(new Stringifier(node).stringify().includes('\\"')).to.be.true;
});

it('should stringify nested objects', () => {
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
    expect(new Stringifier(node).stringify()).to.equal('{"outer":{"inner":"value"}}');
});

it('should stringify nested arrays', () => {
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
    expect(new Stringifier(node).stringify()).to.equal('[[1,2]]');
});
});
