import { RoleId } from '../enums/role-id';
import { Loyalty } from '../enums/loyalty';

export type RoleConfig = {
  id: RoleId;
  name: string;
  description: string;
  loyalty: Loyalty;
  visibleRoleIds: RoleId[];
}
