import { Role, RoleSerialized } from './role';
import { Vote } from './vote';
import { RoleId } from './configs/roles.config';

export interface PlayerSerialized {
  username: string;
  role: RoleSerialized;
}

export class Player {
  private username: string;
  private role: Role;
  // TODO: remove
  private vote: Vote;

  constructor(username: string, initialRole = Role.null()) {
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
    // TODO: remove
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

  isMerlin() {
    return this.role && this.role.getId() === RoleId.Merlin;
  }

  canSee(anotherPlayer: Player) {
    return this.role.canSee(anotherPlayer.getRole());
  }

  // TODO: cache
  serialize(roleRevealed: boolean): PlayerSerialized {
    const serializedRole = !roleRevealed
      ? Role.null().serialize()
      : this.role.serialize();

    return {
      username: this.username,
      role: serializedRole,
    };
  }
}
