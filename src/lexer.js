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

class Rule {
  constructor(name, regex) {
    this.name = name;
    this.regex = regex;
  }

  toString() {
    return `Rule(name=${this.name}, regex=${this.regex})`;
  }
}

const rule = (name, regex) => new Rule(name, regex);
