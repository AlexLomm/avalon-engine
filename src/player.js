class Player {
  constructor(username) {
    this._username       = username;
    this._role           = null;
    this._vote           = null;
    this._isProposed     = false;
    this._isLeader       = false;
    this._isAssassin     = false;
    this._isVictim       = false;
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

  setIsProposed(isProposed) {
    this._isProposed = isProposed;
  }

  getIsVictim() {
    return this._isVictim;
  }

  setIsVictim(isVictim) {
    this._isVictim = isVictim;
  }

  toggleIsVictim() {
    this._isVictim = !this._isVictim;
  }

  getIsAssassin() {
    return this._isAssassin;
  }

  markAsAssassin() {
    this._isAssassin = true;
  }

  toggleTeamProposition() {
    this._isProposed = !this._isProposed;
  }

  getIsProposed() {
    return this._isProposed;
  }

  setIsLeader(isLeader) {
    this._isLeader = isLeader;
  }

  getIsLeader() {
    return this._isLeader;
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
      isProposed: this._isProposed,
      isLeader: this._isLeader,
      isAssassin: this._isAssassin,
      isVictim: this._isVictim,
      isAssassinated: this._isAssassinated,
    };
  }
}

module.exports = Player;
