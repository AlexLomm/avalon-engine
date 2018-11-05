const Player = function (username) {
  this._username   = username;
  this._role       = null;
  this._isLeader   = false;
  this._isProposed = false;
  this._vote       = null;
};

Player.prototype.markAsLeader = function () {
  this._isLeader = true;
};

Player.prototype.unmarkAsLeader = function () {
  this._isLeader = false;
};

Player.prototype.getIsLeader = function () {
  return this._isLeader;
};

Player.prototype.getUsername = function () {
  return this._username;
};

Player.prototype.setRole = function (role) {
  this._role = role;
};

Player.prototype.getRole = function () {
  return this._role;
};

Player.prototype.getVote = function () {
  return this._vote;
};

Player.prototype.getIsProposed = function () {
  return this._isProposed;
};

Player.prototype.toggleIsProposed = function () {
  this._isProposed = !this._isProposed;
};

Player.prototype.canSee = function (anotherPlayer) {
  return this._role.canSee(anotherPlayer.getRole());
};

Player.prototype.setVote = function (vote) {
  this._vote = vote;
};

Player.prototype.reset = function () {
  this._vote       = null;
  this._isProposed = false;
};

module.exports = Player;
