const Player = function (username) {
  this._username = username;
  this._role     = null;
  this._isChosen = false;
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

module.exports = Player;
