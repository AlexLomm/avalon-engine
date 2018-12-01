import { RoleId } from '../enums/role-id';
import { RoleConfig } from './role-config';

export type RolesConfig = { [key in RoleId]: RoleConfig };
