import {expect} from 'chai';
import {Parser, Tokenizer, NodeType} from '../src/index.js';

describe('Parser', () => {
    it('should parse empty object', () => {
        const tokens = new Tokenizer('{}').tokenize();
        const node = new Parser(tokens).parse();
        expect(node).to.deep.equal({
            type: NodeType.Object,
            body: []
        });
    });

    it('should parse empty array in object', () => {
        const tokens = new Tokenizer('{"arr":[]}').tokenize();
        const node = new Parser(tokens).parse();
        expect(node.body[0].value).to.deep.equal({
            type: NodeType.Array,
            body: []
        });
    });

    it('should parse array with multiple elements', () => {
        const tokens = new Tokenizer('{"arr":[1,2,3]}').tokenize();
        const node = new Parser(tokens).parse();
        const arr = node.body[0].value;
        expect(arr.type).to.equal(NodeType.Array);
        if (arr.type === NodeType.Array) {
            expect(arr.body).to.have.lengthOf(3);
        }
    });

    it('should parse boolean values', () => {
        const tokens = new Tokenizer('{"flag":true,"flag2":false}').tokenize();
        const node = new Parser(tokens).parse();
        expect(node.body[0].value).to.deep.equal({
            type: NodeType.Boolean,
            value: true
        });
        expect(node.body[1].value).to.deep.equal({
            type: NodeType.Boolean,
            value: false
        });
    });

    it('should parse null value', () => {
        const tokens = new Tokenizer('{"value":null}').tokenize();
        const node = new Parser(tokens).parse();
        expect(node.body[0].value).to.deep.equal({
            type: NodeType.Null
        });
    });

    it('should parse nested objects', () => {
        const tokens = new Tokenizer('{"outer":{"inner":"value"}}').tokenize();
        const node = new Parser(tokens).parse();
        const outer = node.body[0].value;
        expect(outer.type).to.equal(NodeType.Object);
        if (outer.type === NodeType.Object) {
            expect(outer.body[0].key.value).to.equal('inner');
        }
    });

    it('should parse array of objects', () => {
        const tokens = new Tokenizer('{"items":[{"id":1},{"id":2}]}').tokenize();
        const node = new Parser(tokens).parse();
        const items = node.body[0].value;
        expect(items.type).to.equal(NodeType.Array);
        if (items.type === NodeType.Array) {
            expect(items.body).to.have.lengthOf(2);
            expect(items.body[0].type).to.equal(NodeType.Object);
        }
    });

    it('should parse strings with special characters', () => {
        const tokens = new Tokenizer('{"text":"hello\\nworld"}').tokenize();
        const node = new Parser(tokens).parse();
        const text = node.body[0].value;
        expect(text.type).to.equal(NodeType.String);
    });

    it('should throw on unexpected EOF', () => {
        const tokens = new Tokenizer('{"key"').tokenize();
        expect(() => new Parser(tokens).parse()).to.throw();
    });

    it('should throw on missing colon', () => {
        const tokens = new Tokenizer('{"key" "value"}').tokenize();
        expect(() => new Parser(tokens).parse()).to.throw();
    });

    it('should parse object without trailing comma', () => {
        const tokens = new Tokenizer('{"a":1,"b":2}').tokenize();
        const node = new Parser(tokens).parse();
        expect(node.body).to.have.lengthOf(2);
    });

    it('should parse array without trailing comma', () => {
        const tokens = new Tokenizer('{"arr":[1,2]}').tokenize();
        const node = new Parser(tokens).parse();
        const arr = node.body[0].value;
        if (arr.type === NodeType.Array) {
            expect(arr.body).to.have.lengthOf(2);
        }
    });
});
