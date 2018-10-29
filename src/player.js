const Player = function (username) {
  this._username = username;
  this._role     = null;
  this._isChosen = false;
  this._isLeader = false;
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

Player.prototype.getIsChosen = function () {
  return this._isChosen;
};

Player.prototype.toggleIsChosen = function () {
  this._isChosen = !this._isChosen;
};

Player.prototype.canSee = function (anotherPlayer) {
  return this._role.canSee(anotherPlayer.getRole());
};

Player.prototype.getIsLeader = function () {
  return this._isLeader;
};

Player.prototype.markAsLeader = function () {
  this._isLeader = true;
};

Player.prototype.unmarkAsLeader = function () {
  this._isLeader = false;
};

module.exports = Player;
