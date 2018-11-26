// TODO: cache roles
import { Loyalty, rolesConfig, RoleId } from './configs/roles.config';

export class Role {
  id: RoleId;
  name: string;
  description: string;
  loyalty: Loyalty;
  visibleRoleIds: RoleId[];

  constructor(id: RoleId) {
    this.id             = rolesConfig[id].id;
    this.name           = rolesConfig[id].name;
    this.description    = rolesConfig[id].description;
    this.loyalty        = rolesConfig[id].loyalty;
    this.visibleRoleIds = rolesConfig[id].visibleRoleIds;
  }

  getId() {
    return this.id;
  };

  getName() {
    return this.name;
  };

  getDescription() {
    return this.description;
  };

  getLoyalty() {
    return this.loyalty;
  };

  getVisibleRoleIds() {
    return this.visibleRoleIds;
  };

  // TODO: cache in a table-like data structure
  canSee(anotherRole: Role) {
    if (anotherRole.getId() === this.id) return true;

    const index = this.visibleRoleIds
      .findIndex((roleId) => roleId === anotherRole.getId());

    return index > -1;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      loyalty: this.loyalty,
    };
  }
}
