const loyalties = {
  GOOD: 'GOOD',
  EVIL: 'EVIL',
};

const roleIds = {
  MERLIN: 'MERLIN',
  PERCIVAL: 'PERCIVAL',
  SERVANT_1: 'SERVANT_1',
  SERVANT_2: 'SERVANT_2',
  SERVANT_3: 'SERVANT_3',
  SERVANT_4: 'SERVANT_4',
  SERVANT_5: 'SERVANT_5',
  MORDRED: 'MORDRED',
  MORGANA: 'MORGANA',
  ASSASSIN: 'ASSASSIN',
  OBERON: 'OBERON',
  MINION_1: 'MINION_1',
  MINION_2: 'MINION_2',
  MINION_3: 'MINION_3',
};

const rolesConfig = {
  [roleIds.MERLIN]: {
    id: roleIds.MERLIN,
    name: 'Merlin',
    description: 'Sees all evil except Mordred',
    loyalty: loyalties.GOOD,
    visibleRoleIds: [
      roleIds.MORGANA,
      roleIds.ASSASSIN,
      roleIds.OBERON,
      roleIds.MINION_1,
      roleIds.MINION_2,
      roleIds.MINION_3,
    ]
  },
  [roleIds.PERCIVAL]: {
    id: roleIds.PERCIVAL,
    name: 'Percival',
    description: 'Sees Merlin and Morgana, does not know which is which',
    loyalty: loyalties.GOOD,
    visibleRoleIds: [
      roleIds.MERLIN,
      roleIds.MORGANA,
    ]
  },
  [roleIds.SERVANT_1]: {
    id: roleIds.SERVANT_1,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD,
    visibleRoleIds: []
  },
  [roleIds.SERVANT_2]: {
    id: roleIds.SERVANT_2,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD,
    visibleRoleIds: []
  },
  [roleIds.SERVANT_3]: {
    id: roleIds.SERVANT_3,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD,
    visibleRoleIds: []
  },
  [roleIds.SERVANT_4]: {
    id: roleIds.SERVANT_4,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD,
    visibleRoleIds: []
  },
  [roleIds.SERVANT_5]: {
    id: roleIds.SERVANT_5,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD,
    visibleRoleIds: []
  },
  [roleIds.MORDRED]: {
    id: roleIds.MORDRED,
    name: 'Mordred',
    description: 'Invisible to Merlin. Sees other evil guys',
    loyalty: loyalties.EVIL,
    visibleRoleIds: [
      roleIds.MORGANA,
      roleIds.ASSASSIN,
      roleIds.MINION_1,
      roleIds.MINION_2,
      roleIds.MINION_3,
    ]
  },
  [roleIds.MORGANA]: {
    id: roleIds.MORGANA,
    name: 'Morgana',
    description: 'Appears as Merlin to Percival. Sees other evil guys',
    loyalty: loyalties.EVIL,
    visibleRoleIds: [
      roleIds.MORDRED,
      roleIds.ASSASSIN,
      roleIds.MINION_1,
      roleIds.MINION_2,
      roleIds.MINION_3,
    ]
  },
  [roleIds.ASSASSIN]: {
    id: roleIds.ASSASSIN,
    name: 'Assassin',
    description: 'Gets to guess who Merlin is, if the team Good wins. Sees other evil guys',
    loyalty: loyalties.EVIL,
    visibleRoleIds: [
      roleIds.MORGANA,
      roleIds.MORDRED,
      roleIds.MINION_1,
      roleIds.MINION_2,
      roleIds.MINION_3,
    ]
  },
  [roleIds.OBERON]: {
    id: roleIds.OBERON,
    name: 'Oberon',
    description: 'Invisible to the evil guys. Is clueless about others',
    loyalty: loyalties.EVIL,
    visibleRoleIds: []
  },
  [roleIds.MINION_1]: {
    id: roleIds.MINION_1,
    name: 'Minion of Mordred',
    description: 'Sees other evil guys',
    loyalty: loyalties.EVIL,
    visibleRoleIds: [
      roleIds.MORGANA,
      roleIds.ASSASSIN,
      roleIds.MORDRED,
      roleIds.MINION_2,
      roleIds.MINION_3,
    ]
  },
  [roleIds.MINION_2]: {
    id: roleIds.MINION_2,
    name: 'Minion of Mordred',
    description: 'Sees other evil guys',
    loyalty: loyalties.EVIL,
    visibleRoleIds: [
      roleIds.MORGANA,
      roleIds.ASSASSIN,
      roleIds.MINION_1,
      roleIds.MORDRED,
      roleIds.MINION_3,
    ]
  },
  [roleIds.MINION_3]: {
    id: roleIds.MINION_3,
    name: 'Minion of Mordred',
    description: 'Sees other evil guys',
    loyalty: loyalties.EVIL,
    visibleRoleIds: [
      roleIds.MORGANA,
      roleIds.ASSASSIN,
      roleIds.MINION_1,
      roleIds.MINION_2,
      roleIds.MORDRED,
    ]
  },
};

module.exports = {
  loyalties,
  roleIds,
  rolesConfig
};
