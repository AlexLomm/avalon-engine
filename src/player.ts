import { Role } from './role';
import { Vote } from './vote';
import { RoleId } from './configs/roles.config';

export class Player {
  private username: string;
  private role: Role;
  private vote: Vote;

  constructor(username: string, initialRole = new Role(RoleId.Unknown)) {
    this.username = username;
    this.role     = initialRole;
  }

  getUsername() {
    return this.username;
  }

  setRole(role: Role) {
    this.role = role;
  }

  getRole() {
    return this.role;
  }

  generateVote(value: boolean) {
    this.vote = new Vote(this.username, value);

    return this.vote;
  }

  resetVote() {
    this.vote = null;
  }

  getVote() {
    return this.vote;
  }

  isAssassin() {
    return this.role && this.role.getId() === RoleId.Assassin;
  }

  canSee(anotherPlayer: Player) {
    return this.role.canSee(anotherPlayer.getRole());
  }

  // TODO: refactor
  serialize(roleRevealed: boolean, voteRevealed: boolean) {
    const serializedRole = !(this.role && roleRevealed)
      ? new Role(RoleId.Unknown).serialize()
      : this.role.serialize();

    let serializedVote = null;
    if (this.vote && !voteRevealed) {
      serializedVote = new Vote(this.username, null).serialize();
    } else if (this.vote && voteRevealed) {
      serializedVote = this.vote.serialize();
    }

    return {
      username: this.username,
      role: serializedRole,
      vote: serializedVote,
    };
  }
}
