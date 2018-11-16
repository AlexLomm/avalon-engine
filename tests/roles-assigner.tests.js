const Player        = require('../src/player');
const LevelPreset   = require('../src/level-preset');
const RolesAssigner = require('../src/roles-assigner');

const generateRolesAssigner = (playerCount) => {
  const players     = generatePlayers(playerCount);
  const levelPreset = new LevelPreset(players.length);

  return new RolesAssigner(players, levelPreset);
};

const generatePlayers = (count) => {
  const players = [];

  _.times(count, (i) => players.push(new Player(`user-${i}`)));

  return players;
};

test('should have a correct number of good and evil players', () => {
  for (let j = 5; j < 10; j++) {
    const assigner = generateRolesAssigner(5);

    let goodCount = 0;
    let evilCount = 0;
    assigner.assignRoles().forEach(p => {
      const loyalty = p.getRole().getLoyalty();

      loyalty === 'GOOD' ? goodCount++ : evilCount++;
    });

    expect(new LevelPreset(j).getGoodCount()).toEqual(goodCount);
    expect(new LevelPreset(j).getEvilCount()).toEqual(evilCount);
  }
});

test('should assign every player a role', () => {
  const assigner = generateRolesAssigner(5);

  const roles = assigner.assignRoles()
    .filter(p => p.getRole());

  expect(roles.length).toEqual(8);
});

test('should always assign default roles to players', () => {
  const assigner = generateRolesAssigner(5);

  const players = assigner.assignRoles({
    MERLIN: false,
    ASSASSIN: false,
  });

  expect(players.find(p => p.getRole().getId() === 'MERLIN')).toBeTruthy();
  expect(players.find(p => p.getRole().getId() === 'ASSASSIN')).toBeTruthy();
});

test('should assign every player a unique role', () => {
  const assigner = generateRolesAssigner(5);

  const roleIds = assigner.assignRoles().map(p => p.getRole().getId());

  expect(_.uniqBy(roleIds, v => v).length).toEqual(roleIds.length);
});
