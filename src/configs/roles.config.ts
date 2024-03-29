import { RoleId } from '../enums/role-id';
import { Loyalty } from '../enums/loyalty';
import { RolesConfig } from '../types/roles-config';

export const rolesConfig: RolesConfig = {
  [RoleId.Unknown]: {
    id: RoleId.Unknown,
    name: 'Unknown',
    description: "The player's identity isn't known",
    loyalty: Loyalty.Unknown,
    visibleRoleIds: [],
  },
  //
  [RoleId.Merlin]: {
    id: RoleId.Merlin,
    name: 'Merlin',
    description: 'Sees all evil except Mordred',
    loyalty: Loyalty.Good,
    visibleRoleIds: [
      RoleId.Morgana,
      RoleId.Assassin,
      RoleId.Oberon,
      RoleId.Minion_1,
      RoleId.Minion_2,
      RoleId.Minion_3,
    ],
  },
  [RoleId.Percival]: {
    id: RoleId.Percival,
    name: 'Percival',
    description: 'Sees Merlin and Morgana, does not know which is which',
    loyalty: Loyalty.Good,
    visibleRoleIds: [RoleId.Merlin, RoleId.Morgana],
  },
  [RoleId.Servant_1]: {
    id: RoleId.Servant_1,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: Loyalty.Good,
    visibleRoleIds: [],
  },
  [RoleId.Servant_2]: {
    id: RoleId.Servant_2,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: Loyalty.Good,
    visibleRoleIds: [],
  },
  [RoleId.Servant_3]: {
    id: RoleId.Servant_3,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: Loyalty.Good,
    visibleRoleIds: [],
  },
  [RoleId.Servant_4]: {
    id: RoleId.Servant_4,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: Loyalty.Good,
    visibleRoleIds: [],
  },
  [RoleId.Servant_5]: {
    id: RoleId.Servant_5,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: Loyalty.Good,
    visibleRoleIds: [],
  },
  [RoleId.Mordred]: {
    id: RoleId.Mordred,
    name: 'Mordred',
    description: 'Invisible to Merlin. Sees other evil guys',
    loyalty: Loyalty.Evil,
    visibleRoleIds: [
      RoleId.Morgana,
      RoleId.Assassin,
      RoleId.Minion_1,
      RoleId.Minion_2,
      RoleId.Minion_3,
    ],
  },
  [RoleId.Morgana]: {
    id: RoleId.Morgana,
    name: 'Morgana',
    description: 'Appears as Merlin to Percival. Sees other evil guys',
    loyalty: Loyalty.Evil,
    visibleRoleIds: [
      RoleId.Mordred,
      RoleId.Assassin,
      RoleId.Minion_1,
      RoleId.Minion_2,
      RoleId.Minion_3,
    ],
  },
  [RoleId.Assassin]: {
    id: RoleId.Assassin,
    name: 'Assassin',
    description:
      'Gets to guess who Merlin is, if the team Good wins. Sees other evil guys',
    loyalty: Loyalty.Evil,
    visibleRoleIds: [
      RoleId.Morgana,
      RoleId.Mordred,
      RoleId.Minion_1,
      RoleId.Minion_2,
      RoleId.Minion_3,
    ],
  },
  [RoleId.Oberon]: {
    id: RoleId.Oberon,
    name: 'Oberon',
    description: 'Invisible to the evil guys. Is clueless about others',
    loyalty: Loyalty.Evil,
    visibleRoleIds: [],
  },
  [RoleId.Minion_1]: {
    id: RoleId.Minion_1,
    name: 'Minion of Mordred',
    description: 'Sees other evil guys',
    loyalty: Loyalty.Evil,
    visibleRoleIds: [
      RoleId.Morgana,
      RoleId.Assassin,
      RoleId.Mordred,
      RoleId.Minion_2,
      RoleId.Minion_3,
    ],
  },
  [RoleId.Minion_2]: {
    id: RoleId.Minion_2,
    name: 'Minion of Mordred',
    description: 'Sees other evil guys',
    loyalty: Loyalty.Evil,
    visibleRoleIds: [
      RoleId.Morgana,
      RoleId.Assassin,
      RoleId.Minion_1,
      RoleId.Mordred,
      RoleId.Minion_3,
    ],
  },
  [RoleId.Minion_3]: {
    id: RoleId.Minion_3,
    name: 'Minion of Mordred',
    description: 'Sees other evil guys',
    loyalty: Loyalty.Evil,
    visibleRoleIds: [
      RoleId.Morgana,
      RoleId.Assassin,
      RoleId.Minion_1,
      RoleId.Minion_2,
      RoleId.Mordred,
    ],
  },
};
