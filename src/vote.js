class Vote {
  constructor(username, vote) {
    this._username = username;
    this._vote     = vote;
  }

  getUsername() {
    return this._username;
  }

  getValue() {
    return this._vote;
  }

  serialize(isRevealed) {
    return {
      username: this._username,
      vote: isRevealed ? this._vote : null,
    };
  }
}

module.exports = Vote;
