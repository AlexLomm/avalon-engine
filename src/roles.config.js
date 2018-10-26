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
    loyalty: loyalties.GOOD
  },
  [roleIds.PERCIVAL]: {
    id: roleIds.PERCIVAL,
    name: 'Percival',
    description: 'Sees Merlin and Morgana, does not know which is which',
    loyalty: loyalties.GOOD
  },
  [roleIds.SERVANT_1]: {
    id: roleIds.SERVANT_1,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD
  },
  [roleIds.SERVANT_2]: {
    id: roleIds.SERVANT_2,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD
  },
  [roleIds.SERVANT_3]: {
    id: roleIds.SERVANT_3,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD
  },
  [roleIds.SERVANT_4]: {
    id: roleIds.SERVANT_4,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD
  },
  [roleIds.SERVANT_5]: {
    id: roleIds.SERVANT_5,
    name: 'Loyal Servant of Arthur',
    description: 'Is clueless',
    loyalty: loyalties.GOOD
  },
  [roleIds.MORDRED]: {
    id: roleIds.MORDRED,
    name: 'Mordred',
    description: 'Invisible to Merlin. Sees other evil guys',
    loyalty: loyalties.EVIL
  },
  [roleIds.MORGANA]: {
    id: roleIds.MORGANA,
    name: 'Morgana',
    description: 'Appears as Merlin to Percival. Sees other evil guys',
    loyalty: loyalties.EVIL
  },
  [roleIds.ASSASSIN]: {
    id: roleIds.ASSASSIN,
    name: 'Assassin',
    description: 'Gets to guess who Merlin is, if the team Good wins. Sees other evil guys',
    loyalty: loyalties.EVIL
  },
  [roleIds.OBERON]: {
    id: roleIds.OBERON,
    name: 'Oberon',
    description: 'Invisible to the evil guys. Is clueless about others',
    loyalty: loyalties.EVIL
  },
  [roleIds.MINION_1]: {
    id: roleIds.MINION_1,
    name: 'Minion of Mordred',
    description: 'Sees other evil guys',
    loyalty: loyalties.EVIL
  },
  [roleIds.MINION_2]: {
    id: roleIds.MINION_2,
    name: 'Minion of Mordred',
    description: 'Sees other evil guys',
    loyalty: loyalties.EVIL
  },
  [roleIds.MINION_3]: {
    id: roleIds.MINION_3,
    name: 'Minion of Mordred',
    description: 'Sees other evil guys',
    loyalty: loyalties.EVIL
  },
};

module.exports = {
  loyalties,
  roleIds,
  rolesConfig
};
