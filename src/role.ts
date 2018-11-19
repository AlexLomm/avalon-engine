// TODO: cache roles
import { Loyalty, rolesConfig, RoleId } from './configs/roles.config';

export class Role {
  _id: RoleId;
  _name: string;
  _description: string;
  _loyalty: Loyalty;
  _visibleRoleIds: RoleId[];

  constructor(id: RoleId) {
    this._id             = rolesConfig[id].id;
    this._name           = rolesConfig[id].name;
    this._description    = rolesConfig[id].description;
    this._loyalty        = rolesConfig[id].loyalty;
    this._visibleRoleIds = rolesConfig[id].visibleRoleIds;
  }

  getId() {
    return this._id;
  };

  getName() {
    return this._name;
  };

  getDescription() {
    return this._description;
  };

  getLoyalty() {
    return this._loyalty;
  };

  getVisibleRoleIds() {
    return this._visibleRoleIds;
  };

  // TODO: cache in a table-like data structure
  canSee(anotherRole: Role) {
    const index = this._visibleRoleIds
      .findIndex((roleId) => roleId === anotherRole.getId());

    return index > -1;
  }

  serialize() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      loyalty: this._loyalty,
    };
  }
}
