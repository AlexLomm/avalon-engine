const {roleIds} = require('../configs/roles.config');
const Role      = require('./role');
const Vote      = require('./vote');

// TODO: add an id
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

  // TODO: refactor
  serialize(roleRevealed, voteRevealed) {
    const serializedRole = !(this._role && roleRevealed)
      ? new Role(roleIds.UNKNOWN).serialize()
      : this._role.serialize();

    let serializedVote = null;
    if (this._vote && !voteRevealed) {
      serializedVote = new Vote(this._username, null).serialize();
    } else if (this._vote && voteRevealed) {
      serializedVote = this._vote.serialize();
    }

    return {
      username: this._username,
      role: serializedRole,
      vote: serializedVote,
    };
  }
}

module.exports = Player;
