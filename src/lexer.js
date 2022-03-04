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
