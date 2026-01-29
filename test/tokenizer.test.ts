import { describe, it } from 'mocha';
import { expect } from 'chai';
import {Character, Tokenizer, TokenType} from '../build/src/index.js';

describe('tokenizer', () => {
it('Character.isPunctuator - should identify { } [ ] : , as punctuators', () => {
    expect(Character.isPunctuator(123)).to.be.true; // {
    expect(Character.isPunctuator(125)).to.be.true; // }
    expect(Character.isPunctuator(91)).to.be.true; // [
    expect(Character.isPunctuator(93)).to.be.true; // ]
    expect(Character.isPunctuator(58)).to.be.true; // :
    expect(Character.isPunctuator(44)).to.be.true; // ,
});

it('Character.isPunctuator - should return false for non-punctuator characters', () => {
    expect(Character.isPunctuator(65)).to.be.false; // A
    expect(Character.isPunctuator(48)).to.be.false; // 0
    expect(Character.isPunctuator(32)).to.be.false; // space
});

it('Character.isIdentifier - should identify A-Z and a-z as identifiers', () => {
    expect(Character.isIdentifier(65)).to.be.true; // A
    expect(Character.isIdentifier(90)).to.be.true; // Z
    expect(Character.isIdentifier(97)).to.be.true; // a
    expect(Character.isIdentifier(122)).to.be.true; // z
});

it('Character.isIdentifier - should return false for non-identifier characters', () => {
    expect(Character.isIdentifier(48)).to.be.false; // 0
    expect(Character.isIdentifier(32)).to.be.false; // space
});

it('Character.isStringStart - should identify " as string start', () => {
    expect(Character.isStringStart(34)).to.be.true; // "
});

it('Character.isStringStart - should return false for other characters', () => {
    expect(Character.isStringStart(39)).to.be.false; // '
    expect(Character.isStringStart(65)).to.be.false; // A
});

it('Character.isInteger - should identify 0-9 as integers', () => {
    expect(Character.isInteger(48)).to.be.true; // 0
    expect(Character.isInteger(57)).to.be.true; // 9
});

it('Character.isInteger - should return false for non-integer characters', () => {
    expect(Character.isInteger(65)).to.be.false; // A
    expect(Character.isInteger(32)).to.be.false; // space
});

it('Character.isIntegerStart - should identify - and 0-9 as integer start', () => {
    expect(Character.isIntegerStart(45)).to.be.true; // -
    expect(Character.isIntegerStart(48)).to.be.true; // 0
    expect(Character.isIntegerStart(57)).to.be.true; // 9
});

it('Character.isIntegerStart - should return false for other characters', () => {
    expect(Character.isIntegerStart(65)).to.be.false; // A
});

it('Tokenizer - should tokenize empty object', () => {
    const tokens = new Tokenizer('{}').tokenize();
    expect(tokens.length).to.equal(2);
    expect(tokens[0]).to.deep.equal({type: TokenType.Punctuator, value: '{'});
    expect(tokens[1]).to.deep.equal({type: TokenType.Punctuator, value: '}'});
});

it('Tokenizer - should tokenize empty array', () => {
    const tokens = new Tokenizer('[]').tokenize();
    expect(tokens.length).to.equal(2);
    expect(tokens[0]).to.deep.equal({type: TokenType.Punctuator, value: '['});
    expect(tokens[1]).to.deep.equal({type: TokenType.Punctuator, value: ']'});
});

it('Tokenizer - should tokenize boolean keywords', () => {
    const tokens = new Tokenizer('true false').tokenize();
    expect(tokens.length).to.equal(2);
    expect(tokens[0]).to.deep.equal({type: TokenType.Keyword, value: 'true'});
    expect(tokens[1]).to.deep.equal({type: TokenType.Keyword, value: 'false'});
});

it('Tokenizer - should tokenize null keyword', () => {
    const tokens = new Tokenizer('null').tokenize();
    expect(tokens.length).to.equal(1);
    expect(tokens[0]).to.deep.equal({type: TokenType.Keyword, value: 'null'});
});

it('Tokenizer - should tokenize strings with escaped quotes', () => {
    const tokens = new Tokenizer('"hello \\"world\\""').tokenize();
    expect(tokens.length).to.equal(1);
    expect(tokens[0]).to.deep.equal({type: TokenType.String, value: 'hello \\"world\\"'});
});

it('Tokenizer - should tokenize positive integers', () => {
    const tokens = new Tokenizer('123').tokenize();
    expect(tokens.length).to.equal(1);
    expect(tokens[0]).to.deep.equal({type: TokenType.Integer, value: 123});
});

it('Tokenizer - should tokenize negative integers', () => {
    const tokens = new Tokenizer('-456').tokenize();
    expect(tokens.length).to.equal(1);
    expect(tokens[0]).to.deep.equal({type: TokenType.Integer, value: -456});
});

it('Tokenizer - should tokenize float numbers', () => {
    const tokens = new Tokenizer('3.14').tokenize();
    expect(tokens.length).to.equal(1);
    expect(tokens[0].type).to.equal(TokenType.Float);
});

it('Tokenizer - should tokenize big integers', () => {
    const tokens = new Tokenizer('12345678901234567890').tokenize();
    expect(tokens.length).to.equal(1);
    expect(tokens[0]).to.deep.equal({type: TokenType.BigInt, value: 12345678901234567890n});
});

it('Tokenizer - should tokenize complex JSON', () => {
    const tokens = new Tokenizer('{"key":"value","num":42}').tokenize();
    expect(tokens.length > 0).to.be.true;
    expect(tokens[0]).to.deep.equal({type: TokenType.Punctuator, value: '{'});
});

it('Tokenizer - should skip whitespace and newlines', () => {
    const tokens = new Tokenizer('  {\n  }  ').tokenize();
    expect(tokens.length).to.equal(2);
    expect(tokens[0]).to.deep.equal({type: TokenType.Punctuator, value: '{'});
    expect(tokens[1]).to.deep.equal({type: TokenType.Punctuator, value: '}'});
});

it('Tokenizer - should throw error on invalid keyword', () => {
    expect(() => new Tokenizer('invalid').tokenize()).to.throw();
});
});
