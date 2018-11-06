const Vote = function (username, vote) {
  this._username = username;
  this._vote     = vote;
};

Vote.prototype.getUsername = function () {
  return this._username;
};

Vote.prototype.getValue = function () {
  return this._vote;
};

module.exports = Vote;
