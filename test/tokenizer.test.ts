import test from 'ava';
import {Character, Tokenizer, TokenType} from '../build/src/index.js';

test('Character.isPunctuator - should identify { } [ ] : , as punctuators', t => {
    t.true(Character.isPunctuator(123)); // {
    t.true(Character.isPunctuator(125)); // }
    t.true(Character.isPunctuator(91)); // [
    t.true(Character.isPunctuator(93)); // ]
    t.true(Character.isPunctuator(58)); // :
    t.true(Character.isPunctuator(44)); // ,
});

test('Character.isPunctuator - should return false for non-punctuator characters', t => {
    t.false(Character.isPunctuator(65)); // A
    t.false(Character.isPunctuator(48)); // 0
    t.false(Character.isPunctuator(32)); // space
});

test('Character.isIdentifier - should identify A-Z and a-z as identifiers', t => {
    t.true(Character.isIdentifier(65)); // A
    t.true(Character.isIdentifier(90)); // Z
    t.true(Character.isIdentifier(97)); // a
    t.true(Character.isIdentifier(122)); // z
});

test('Character.isIdentifier - should return false for non-identifier characters', t => {
    t.false(Character.isIdentifier(48)); // 0
    t.false(Character.isIdentifier(32)); // space
});

test('Character.isStringStart - should identify " as string start', t => {
    t.true(Character.isStringStart(34)); // "
});

test('Character.isStringStart - should return false for other characters', t => {
    t.false(Character.isStringStart(39)); // '
    t.false(Character.isStringStart(65)); // A
});

test('Character.isInteger - should identify 0-9 as integers', t => {
    t.true(Character.isInteger(48)); // 0
    t.true(Character.isInteger(57)); // 9
});

test('Character.isInteger - should return false for non-integer characters', t => {
    t.false(Character.isInteger(65)); // A
    t.false(Character.isInteger(32)); // space
});

test('Character.isIntegerStart - should identify - and 0-9 as integer start', t => {
    t.true(Character.isIntegerStart(45)); // -
    t.true(Character.isIntegerStart(48)); // 0
    t.true(Character.isIntegerStart(57)); // 9
});

test('Character.isIntegerStart - should return false for other characters', t => {
    t.false(Character.isIntegerStart(65)); // A
});

test('Tokenizer - should tokenize empty object', t => {
    const tokens = new Tokenizer('{}').tokenize();
    t.is(tokens.length, 2);
    t.deepEqual(tokens[0], {type: TokenType.Punctuator, value: '{'});
    t.deepEqual(tokens[1], {type: TokenType.Punctuator, value: '}'});
});

test('Tokenizer - should tokenize empty array', t => {
    const tokens = new Tokenizer('[]').tokenize();
    t.is(tokens.length, 2);
    t.deepEqual(tokens[0], {type: TokenType.Punctuator, value: '['});
    t.deepEqual(tokens[1], {type: TokenType.Punctuator, value: ']'});
});

test('Tokenizer - should tokenize boolean keywords', t => {
    const tokens = new Tokenizer('true false').tokenize();
    t.is(tokens.length, 2);
    t.deepEqual(tokens[0], {type: TokenType.Keyword, value: 'true'});
    t.deepEqual(tokens[1], {type: TokenType.Keyword, value: 'false'});
});

test('Tokenizer - should tokenize null keyword', t => {
    const tokens = new Tokenizer('null').tokenize();
    t.is(tokens.length, 1);
    t.deepEqual(tokens[0], {type: TokenType.Keyword, value: 'null'});
});

test('Tokenizer - should tokenize strings with escaped quotes', t => {
    const tokens = new Tokenizer('"hello \\"world\\""').tokenize();
    t.is(tokens.length, 1);
    t.deepEqual(tokens[0], {type: TokenType.String, value: 'hello \\"world\\"'});
});

test('Tokenizer - should tokenize positive integers', t => {
    const tokens = new Tokenizer('123').tokenize();
    t.is(tokens.length, 1);
    t.deepEqual(tokens[0], {type: TokenType.Integer, value: 123});
});

test('Tokenizer - should tokenize negative integers', t => {
    const tokens = new Tokenizer('-456').tokenize();
    t.is(tokens.length, 1);
    t.deepEqual(tokens[0], {type: TokenType.Integer, value: -456});
});

test('Tokenizer - should tokenize float numbers', t => {
    const tokens = new Tokenizer('3.14').tokenize();
    t.is(tokens.length, 1);
    t.is(tokens[0].type, TokenType.Float);
});

test('Tokenizer - should tokenize big integers', t => {
    const tokens = new Tokenizer('12345678901234567890').tokenize();
    t.is(tokens.length, 1);
    t.deepEqual(tokens[0], {type: TokenType.BigInt, value: 12345678901234567890n});
});

test('Tokenizer - should tokenize complex JSON', t => {
    const tokens = new Tokenizer('{"key":"value","num":42}').tokenize();
    t.true(tokens.length > 0);
    t.deepEqual(tokens[0], {type: TokenType.Punctuator, value: '{'});
});

test('Tokenizer - should skip whitespace and newlines', t => {
    const tokens = new Tokenizer('  {\n  }  ').tokenize();
    t.is(tokens.length, 2);
    t.deepEqual(tokens[0], {type: TokenType.Punctuator, value: '{'});
    t.deepEqual(tokens[1], {type: TokenType.Punctuator, value: '}'});
});

test('Tokenizer - should throw error on invalid keyword', t => {
    t.throws(() => new Tokenizer('invalid').tokenize());
});
