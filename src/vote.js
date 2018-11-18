class Vote {
  constructor(username, value) {
    this._username = username;
    this._value    = value;
  }

  getUsername() {
    return this._username;
  }

  getValue() {
    return this._value;
  }

  serialize() {
    return {
      username: this._username,
      value: this._value,
    };
  }
}

module.exports = Vote;
