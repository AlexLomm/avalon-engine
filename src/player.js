const {roleIds} = require('../configs/roles.config');
const Vote      = require('./vote');

class Player {
  constructor(username) {
    this._username = username;
    this._role     = null;
    this._vote     = null;
  }

  getUsername() {
    return this._username;
  }

  setRole(role) {
    this._role = role;
  }

  getRole() {
    return this._role;
  }

  vote(value) {
    this._vote = new Vote(this._username, value);

    return this._vote;
  }

  resetVote() {
    this._vote = null;
  }

  getVote() {
    return this._vote;
  }

  isAssassin() {
    return !!(this._role && this._role.getId() === roleIds.ASSASSIN);
  }

  canSee(anotherPlayer) {
    return this._role.canSee(anotherPlayer.getRole());
  }

  serialize() {
    return {
      username: this._username,
      role: this._role ? this._role.serialize() : null,
      vote: this._vote ? this._vote.serialize() : null,
    };
  }
}

module.exports = Player;
