import { Role } from './role';
import { Vote } from './vote';
import { PlayerSerialized } from './types/player-serialized';
import { RoleId } from './enums/role-id';

export class Player {
  private id: string;
  private role: Role;
  // TODO: remove
  private vote: Vote;

  constructor(id: string, initialRole = Role.null()) {
    this.id = id;
    this.role = initialRole;
  }

  getId() {
    return this.id;
  }

  setRole(role: Role) {
    this.role = role;
  }

  getRole() {
    return this.role;
  }

  generateVote(value: boolean) {
    // TODO: remove
    this.vote = new Vote(this.id, value);

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
      id: this.id,
      role: serializedRole,
    };
  }
}
