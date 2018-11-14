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

  serialize() {
    return {
      username: this._username,
      vote: this._vote,
    };
  }
}

module.exports = Vote;
