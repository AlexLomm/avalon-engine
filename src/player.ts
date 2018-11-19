import { Role } from './role';
import { Vote } from './vote';
import { RoleId } from './configs/roles.config';

export class Player {
  private _username: string;
  private _role: Role;
  private _vote: Vote;

  constructor(username: string) {
    this._username = username;
  }

  getUsername() {
    return this._username;
  }

  setRole(role: Role) {
    this._role = role;
  }

  getRole() {
    return this._role;
  }

  vote(value: boolean) {
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
    return this._role && this._role.getId() === RoleId.Assassin;
  }

  canSee(anotherPlayer: Player) {
    return this._role.canSee(anotherPlayer.getRole());
  }

  // TODO: refactor
  serialize(roleRevealed: boolean, voteRevealed: boolean) {
    const serializedRole = !(this._role && roleRevealed)
      ? new Role(RoleId.Unknown).serialize()
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
