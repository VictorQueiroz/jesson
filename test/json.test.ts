import fs from 'fs';
import {expect} from 'chai';
import {
    Parser,
    Stringifier,
    Tokenizer,
    INodeObject,
    NodeType,
    JSON as JESSON
} from '../src/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('JESSON JSON Parser', () => {
    it('should parse JSON string with big integers', () => {
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
        expect(node).to.deep.equal(expectedNode);
    });

    it('should parse float numbers', () => {
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
        expect(node).to.deep.equal(expectedNode);
    });

    it('should stringify nodes', () => {
        let node = new Parser(new Tokenizer('{"a": 4294967296}').tokenize()).parse();
        expect(new Stringifier(node).stringify()).to.be.equal('{"a":4294967296}');

        node = new Parser(new Tokenizer('{"a": 1.7976931348623157}').tokenize()).parse();

        node = new Parser(new Tokenizer('{"a": 5366794105309385834}').tokenize()).parse();
        expect(new Stringifier(node).stringify()).to.be.equal('{"a":5366794105309385834}');
    });

    it('should parse null type', () => {
        let node = new Parser(new Tokenizer('{"a": null}').tokenize()).parse();
        expect(new Stringifier(node).stringify()).to.be.equal('{"a":null}');
    });

    it('should stringify number', () => {
        expect(JESSON.stringify({
            id: 1000000,
            name: 'Title'
        })).to.be.equal('{"id":1000000,"name":"Title"}');
    });

    it('should not stringify cyclic objects', () => {
        const value = {};
        expect(JESSON.stringify({
            value: {
                value1: value,
                value2: value
            }
        })).to.be.equal('{"value":{"value1":{},"value2":{}}}');

        const value2: any = {};
        value2.value = value2;
        expect(() => JESSON.stringify(value2)).to.throws('detected cyclic object');

        const value3: any = {};
        const list = [value3];
        value3.value = list;
        expect(() => JESSON.stringify(list)).to.throws('detected cyclic object');
    });

    it('should parse normal-length integers', () => {
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
        expect(node).to.deep.equal(expectedNode);
    });

    it('should handle negative integers', () => {
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
        expect(new Parser(new Tokenizer('{"a":-20000,"b":-7439353655660881559}').tokenize()).parse()).to.be.deep.equal(obj1);
        expect(JESSON.parse('{"a":-20000,"b":-7439353655660881559}')).to.be.deep.equal({
            a: -20000,
            b: -7439353655660881559n
        });
    });

    it('should escape strings with "" content', () => {
        expect(JESSON.stringify({
            value: 'Hey. This content has a "quotation" part'
        })).to.be.equal('{"value":"Hey. This content has a \\"quotation\\" part"}');
        expect(JESSON.parse('{"value":"Hey. This content has a \\"quotation\\" part"}')).to.be.deep.equal({
            value: 'Hey. This content has a "quotation" part'
        });
    });

    it('should parse deep objects', async () => {
        const content = await fs.promises.readFile(__dirname + '/json1.json', 'utf8');
        const stringified = await fs.promises.readFile(__dirname + '/json1.stringified', 'utf8');
        const node = new Parser(new Tokenizer(content).tokenize()).parse();
        expect(new Stringifier(node).stringify()).to.be.equal(stringified);
        expect(new Stringifier(node).stringify()).to.be.equal(stringified);
        expect(JESSON.stringify(JSON.parse(content))).to.be.deep.equal(JSON.stringify(JSON.parse(content), null, ''))
        expect(JESSON.parse(content)).to.be.deep.equal(JSON.parse(content))
    });
});
