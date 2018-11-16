const {roleIds} = require('../configs/roles.config');

class Player {
  constructor(username) {
    this._username = username;
    this._role     = null;
    this._vote     = null;

    // TODO: extract the fields below
    this._isAssassinated = false;
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

  setVote(vote) {
    this._vote = vote;
  }

  getVote() {
    return this._vote;
  }

  isAssassin() {
    return !!(this._role && this._role.getId() === roleIds.ASSASSIN);
  }

  markAsAssassinated() {
    this._isAssassinated = true;
  }

  getIsAssassinated() {
    return this._isAssassinated;
  }

  canSee(anotherPlayer) {
    return this._role.canSee(anotherPlayer.getRole());
  }

  serialize() {
    return {
      username: this._username,
      role: this._role ? this._role.serialize() : null,
      vote: this._vote ? this._vote.serialize() : null,
      isAssassinated: this._isAssassinated,
    };
  }
}

module.exports = Player;
