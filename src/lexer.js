class LexerError extends Error {
  constructor(char, line, col) {
    super(`Invalid token ${char} at (${line}:${col})`);
  }
}

/**
 * A Token represents a single lexeme
 */
class Token {
  constructor(type, val, line, col, pos) {
    this.type = type;
    this.val = val;
    this.line = line;
    this.col = col;
    this.pos = pos;
  }

  toString() {
    return `Token(type=${this.type}, val=${this.val})`;
  }
}

const token = (type, val, line, col, pos) =>
  new Token(type, val, line, col, pos);

/**
 * A rule that defines a token type
 */
class Rule {
  constructor(name, regex) {
    this.name = name;
    this.regex = regex;
  }

  toString() {
    return `Rule(name=${this.name}, regex=${this.regex})`;
  }
}

export const rule = (name, regex) => new Rule(name, regex);

/**
 * Manages the state of the input stream as the lexer processes it
 */
class InputStream {
  constructor(buffer) {
    this.buffer = buffer;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.length = buffer.length;
  }

  advance(pos) {
    self.pos = pos;

    if (pos >= this.length) {
      return;
    }

    if (/\r?\n/g.exec(this.buffer[pos])) {
      this.line += 1;
      this.col = 0;
    } else {
      this.col += 1;
    }
  }

  eof() {
    return this.pos >= this.length;
  }

  toString() {
    return `[object InputStream length=${this.length}]`;
  }
}

/**
 * Extensible lexer with a fluent interface
 */
export class Lexer {
  constructor(rules) {
    this.rules = rules;
    this.groups = {};
  }

  /**
   * Concatenates the provided rules into a single regular expression
   */
  compile() {
    let reFrags = [];
    let i = 1;

    for (let { name, regex } in this.rules) {
      let groupName = `${name}${i++}`;
      reFrags.push(`(?<${groupName}>${regex})`);
      this.groups[groupName] = name;
    }

    this.regex = new RegExp(reFrags.join("|"), "ug");

    return this;
  }

  /**
   * Extend the lexer with additional rules that come either before or after the original rules
   *
   * Must call this.compile after extending the rules list
   * @param {Rule[]} prependRules
   * @param {Rule[]} appendRules
   * @returns {Lexer}
   */
  extend({ prependRules = null, appendRules = null }) {
    if (prependRules !== null) {
      this.rules = prependRules.concat(this.rules);
    }

    if (appendRules !== null) {
      this.rules = this.rules.concat(appendRules);
    }

    return this;
  }

  /**
   * Takes the lexer input as a string and converts it to an InputStream
   * @param {String} inputStr
   * @returns {Lexer}
   */
  input(inputStr) {
    this.inputStr = new InputStream(inputStr);

    return this;
  }

  /**
   * Matches a rule with the current position of the input stream and creates a Token
   * @returns {Token}
   */
  token() {
    let { buffer, pos, line, col } = this.inputStr;

    if (this.inputStr.eof()) {
      return null;
    }

    let m = this.regex.exec(buffer.slice(pos));

    if (m) {
      let groupName = Object.keys(m.groups)[0];
      let tokType = this.groups[groupName];
      let value = m[0];
      let tok = token(tokType, value, line, col, pos);

      this.inputStr.advance(pos + value.length);

      return tok;
    }

    // if it gets here, nothing matched
    throw new LexerError(buffer[pos], line, col);
  }

  /**
   * Returns a generator of the tokens found in the input buffer
   */
  *tokenize() {
    while (!this.inputStr.eof()) {
      let tok = this.token();

      if (tok !== null) {
        yield tok;
      }

      let { line, col, pos } = this.inputStr;

      yield token("ENDOFINPUT", "EndOfInput", line, col, pos);
    }
  }
}

export const lexer = (rules) => new Lexer(rules);
