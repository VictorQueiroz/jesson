export enum NodeType {
    Object,
    ObjectProperty,
    Integer,
    Float,
    BigInt,
    String,
    Array,
    Boolean,
    Null
}

export interface INodeBigInt {
    type: NodeType.BigInt;
    value: bigint;
}

export interface INodeObjectProperty {
    type: NodeType.ObjectProperty;
    key: INodeString;
    value: Node;
}

export interface INodeObject {
    type: NodeType.Object;
    body: INodeObjectProperty[];
}

export interface INodeArray {
    type: NodeType.Array;
    body: Node[];
}

export interface INodeString {
    type: NodeType.String;
    value: string;
}

export interface INodeFloat {
    type: NodeType.Float;
    value: number;
}

export interface INodeInteger {
    type: NodeType.Integer;
    value: number;
}

export interface INodeBoolean {
    type: NodeType.Boolean;
    value: boolean;
}

export interface INodeNull {
    type: NodeType.Null;
}

export type Node = (
    INodeBoolean | INodeObject |
    INodeArray | INodeString |
    INodeBigInt | INodeFloat |
    INodeInteger | INodeNull
);

export class Character {
    public static isPunctuator(ch: number) {
        // { } [ ] : ,
        return (
            ch === 123 || ch === 125 ||
            ch === 91 || ch === 93 ||
            ch === 58 || ch === 44
        );
    }
    public static isIdentifier(ch: number) {
        return (
            (ch >= 65 && ch <= 90) || // A-Z
            (ch >= 97 && ch <= 165) // a-z
        );
    }
    public static isStringStart(ch: number) {
        return ch === 34;
    }
    public static isInteger(ch: number) {
        return (
            (ch >= 48 && ch <= 57)
        );
    }
    public static isIntegerStart(ch: number) {
        return (
            ch === 45 || // -
            this.isInteger(ch)
        );
    }
}

export enum TokenType {
    Punctuator,
    String,
    BigInt,
    Integer,
    Float,
    Keyword
}

export interface ITokenKeyword {
    type: TokenType.Keyword;
    value: string;
}

export interface ITokenBigInt {
    type: TokenType.BigInt;
    value: bigint;
}

export interface ITokenFloat {
    type: TokenType.Float;
    value: number;
}

export interface ITokenInteger {
    type: TokenType.Integer;
    value: number;
}

export type Token = (
    ITokenKeyword | ITokenBigInt |
    ITokenFloat | ITokenInteger |
    ITokenPunctuator | ITokenString
);

export interface ITokenPunctuator {
    type: TokenType.Punctuator;
    value: string;
}

export interface ITokenString {
    type: TokenType.String;
    value: string;
}

export class Tokenizer {
    private offset = 0;
    public constructor(private readonly text: string) {}
    public tokenize(): Token[] {
        const tokens = new Array<Token>();
        while(!this.eof()) {
            const ch = this.text.charCodeAt(this.offset);
            if(Character.isPunctuator(ch)) {
                tokens.push(this.punctuator());
            } else if(ch === 32 || ch === 10) {
                this.offset++;
            } else if(Character.isIntegerStart(ch)) {
                tokens.push(this.integer());
            } else if(Character.isStringStart(ch)) {
                tokens.push(this.string());
            } else {
                tokens.push(this.keyword());
            }
        }
        return tokens;
    }
    private keyword(): Token {
        const current = this.text.substring(this.offset);
        const keywords = [
            'true',
            'false',
            'null'
        ];
        for(const k of keywords) {
            if(!current.startsWith(k)) continue;
            this.offset += k.length;
            return {
                type: TokenType.Keyword,
                value: current.substring(0, k.length)
            };
        }
        throw new Error(`Unexpected token at ${this.offset}: ${this.text[this.offset]}`);
    }
    private integer(): ITokenBigInt | ITokenInteger | ITokenFloat {
        let negative = 1;
        if(this.consume('-')) {
            negative = -1;
        }
        const startOffset = this.offset;
        while(!this.eof() && Character.isInteger(this.text.charCodeAt(this.offset))) {
            this.offset++;
        }
        if((this.offset - startOffset) > 10) {
            return {
                type: TokenType.BigInt,
                value: BigInt(negative) * BigInt(this.text.substring(startOffset, this.offset))
            };
        }
        if(this.consume('.')) {
            let mantissaStartOffset = this.offset;
            while(!this.eof() && Character.isInteger(this.text.charCodeAt(this.offset))) {
                this.offset++;
            }
            return {
                type: TokenType.Float,
                value: negative * parseFloat(this.text.substring(startOffset, this.offset) + '.' + this.text.substring(mantissaStartOffset, this.offset))
            };
        }
        return {
            type: TokenType.Integer,
            value: negative * parseInt(this.text.substring(startOffset, this.offset), 10)
        };
    }
    private consume(value: string) {
        if(!this.peek(value)) return;
        this.offset += value.length;
        return true;
    }
    private expect(value: string) {
        if(value.length !== 1) throw new Error('value argument must always have one character');
        if(value !== this.text[this.offset]) throw new Error(`Expected ${value} but got ${this.text[this.offset]} instead`);
        this.offset++;
    }
    private peek(value: string) {
        if(value.length !== 1) throw new Error('value argument must always have one character');
        return value === this.text[this.offset];
    }
    private string(): ITokenString {
        this.expect('"');
        const startOffset = this.offset;
        while(!this.eof() && !this.peek('"')) {
            this.consume('\\');
            this.offset++;
        }
        const endOffset = this.offset;
        this.expect('"');
        return {
            type: TokenType.String,
            value: this.text.substring(startOffset, endOffset)
        };
    }
    private punctuator(): ITokenPunctuator {
        const startOffset = this.offset;
        // all punctuators are 1 byte long
        this.offset++;
        return {
            type: TokenType.Punctuator,
            value: this.text.substring(startOffset, this.offset)
        };
    }
    private eof() {
        return this.offset === this.text.length;
    }
}

export class Parser {
    private readonly tokens: Token[];
    public constructor(tokens: Token[]) {
        this.tokens = Array.from(tokens);
    }
    public parse(): INodeObject {
        return this.object();
    }
    private node(): Node {
        if(this.peek('{')) {
            return this.object();
        } else if(this.peek('[')) {
            return this.array();
        } else if(this.token().type === TokenType.Integer || this.token().type === TokenType.Float || this.token().type === TokenType.BigInt) {
            return this.integer();
        } else if(this.token().type === TokenType.String) {
            return this.string();
        }
        return this.keyword();
    }
    private keyword(): INodeBoolean | INodeNull {
        const token = this.expect();
        if(token.type === TokenType.Keyword) {
            switch(token.value) {
                case 'true':
                case 'false':
                    return {
                        type: NodeType.Boolean,
                        value: token.value === 'true' ? true : false
                    };
                case 'null':
                    return {
                        type: NodeType.Null
                    };
                default:
                    throw new Error(`Invalid keyword: ${token.value}`)
            };
        }
        console.log(token);
        throw new Error(`Invalid token: ${JSON.stringify(this.token())}`);
    }
    private integer(): INodeBigInt | INodeFloat | INodeInteger {
        const token = this.expect();
        switch(token.type) {
            case TokenType.BigInt:
                return {
                    type: NodeType.BigInt,
                    value: token.value
                };
            case TokenType.Float:
                return {
                    type: NodeType.Float,
                    value: token.value
                };
            case TokenType.Integer:
                return {
                    type: NodeType.Integer,
                    value: token.value
                };
        }
        throw new Error(`Expected integer but got ${JSON.stringify(this.token())} instead`);
    }
    private array(): INodeArray {
        const body = new Array<Node>();
        this.expect('[');
        while(!this.eof() && !this.peek(']')) {
            body.push(this.node());
            if(!this.consume(',')) break;
        }
        this.expect(']');
        return {
            type: NodeType.Array,
            body
        };
    }
    private string(): INodeString {
        const token = this.expect();
        if(token.type !== TokenType.String) {
            throw new Error(`Expected string token but got ${token.type} type instead`);
        }
        return {
            type: NodeType.String,
            value: token.value
        };
    }
    private object(): INodeObject {
        const body = new Array<INodeObjectProperty>();
        this.expect('{');
        while(!this.eof() && !this.peek('}')) {
            const key = this.string();
            this.expect(':');
            const value = this.node();
            body.push({
                type: NodeType.ObjectProperty,
                key,
                value
            });
            if(!this.consume(',')) break;
        }
        this.expect('}');
        return {
            type: NodeType.Object,
            body
        };
    }
    private token() {
        if(!this.tokens.length) throw new Error('Unexpected end of string');
        return this.tokens[0];
    }
    private peek(...items: string[]) {
        if(this.eof()) return false;
        for(const value of items) {
            if(value.length !== 1) throw new Error('value argument must always have length of 1');
            if(value === this.token().value) return true;
        }
        return false;
    }
    private consume(value: string) {
        if(!this.peek(value)) return false;
        return this.expect(value);
    }
    private expect(value?: string) {
        const token = this.tokens.shift();
        if(!token) throw new Error('Unexpected EOF');
        if(typeof value !== 'undefined' && value !== token.value) throw new Error(`Expected "${value}" but got "${token.value}" instead`);
        return token;
    }
    private eof() {
        return this.tokens.length === 0;
    }
}

export class Stringifier {
    private output = '';
    public constructor(private readonly node: Node) {}
    public stringify() {
        this.stringifyNode(this.node);
        return this.output;
    }
    private write(value: string) {
        this.output += value;
    }
    private stringifyNode(node?: Node) {
        if(!node) return;
        switch(node.type) {
            case NodeType.Array:
                this.write('[');
                for(const child of node.body) {
                    this.stringifyNode(child);
                    if(child !== node.body[node.body.length - 1]) this.write(',');
                }
                this.write(']');
                break;
            case NodeType.Object:
                this.write('{');
                for(const child of node.body) {
                    this.stringifyNode(child.key);
                    this.write(`:`);
                    this.stringifyNode(child.value);
                    if(child !== node.body[node.body.length - 1]) this.write(',');
                }
                this.write('}');
                break;
            case NodeType.String: {
                let text = '';
                let ii = node.value.length;
                for(let i = 0; i < ii; i++) {
                    const l = node.value[i];
                    if(l === '"' && (i === 0 || node.value[i - 1] !== '\\')) {
                        text += '\\';
                    }
                    text += l;
                }
                this.write(`"${text}"`);
                break;
            }
            case NodeType.BigInt:
            case NodeType.Integer:
            case NodeType.Float:
                this.write(node.value.toString());
                break;
            case NodeType.Null:
                this.write('null');
                break;
            case NodeType.Boolean:
                this.write(node.value ? 'true' : 'false');
        }
    }
}

export class JSON {
    public static parse(value: string) {
        const node = new Parser(new Tokenizer(value).tokenize()).parse();
        return this.parseNode(node);
    }
    public static stringify(value: any): string {
        return new Stringifier(this.bake(value, [])).stringify();
    }
    private static parseNode(node: Node) {
        switch(node.type) {
            case NodeType.Object: {
                const object: any = {};
                for(const item of node.body) {
                    object[item.key.value] = this.parseNode(item.value);
                }
                return object;
            }
            case NodeType.Array: {
                const body = new Array(node.body.length);
                const ii = body.length;
                for(let i = 0; i < ii; i++) {
                    body[i] = this.parseNode(node.body[i]);
                }
                return body;
            }
            case NodeType.Null:
                return null;
            case NodeType.String: {
                let text = '';
                const ii = node.value.length;
                for(let i = 0; i < ii; i++) {
                    if(node.value[i] === '\\') continue;
                    text += node.value[i];
                }
                return text;
            }
            case NodeType.Float:
            case NodeType.BigInt:
            case NodeType.Integer:
            case NodeType.Boolean:
                return node.value;
        }
    }
    private static bake(value: any, refs: any[]): Node {
        if(value === null) {
            return {
                type: NodeType.Null
            };
        } else if(typeof value === 'boolean') {
            return {
                type: NodeType.Boolean,
                value
            };
        } else if(typeof value === 'bigint') {
            return {
                type: NodeType.BigInt,
                value
            };
        } else if(typeof value === 'number') {
            return {
                type: (value < 0 ? ((value * -1) % -1) : value % 1) ? NodeType.Float : NodeType.Integer,
                value
            };
        } else if(typeof value === 'string') {
            return {
                type: NodeType.String,
                value
            };
        }
        if(refs.indexOf(value) !== -1) throw new Error('detected cyclic object');
        refs.push(value);
        let result: INodeObject | INodeArray;
        if(Array.isArray(value)) {
            result = {
                type: NodeType.Array,
                body: []
            };
            for(const item of value) {
                result.body.push(this.bake(item, [...refs]));
            }
        } else {
            const body = new Array<INodeObjectProperty>();
            for(const key of Object.keys(value)) {
                body.push({
                    type: NodeType.ObjectProperty,
                    value: this.bake(value[key], [...refs]),
                    key: {
                        type: NodeType.String,
                        value: key
                    }
                });
            }
            result = {
                type: NodeType.Object,
                body
            };
        }
        return result;
    }
}
