const Player = function (username) {
  this.username = username;
  this.role     = null;
};

Player.prototype.getUsername = function () {
  return this.username;
};

Player.prototype.setRole = function (role) {
  this.role = role;
};

Player.prototype.getRole = function () {
  return this.role;
};

module.exports = Player;
