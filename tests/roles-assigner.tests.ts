import * as _ from 'lodash';
import { RolesAssigner } from '../src/roles-assigner';
import { Player } from '../src/player';
import { Loyalty, RoleId } from '../src/configs/roles.config';
import { LevelPreset } from '../src/level-preset';

const generateRolesAssigner = (playerCount: number): RolesAssigner => {
  const players     = generatePlayers(playerCount);
  const levelPreset = new LevelPreset(players.length);

  return new RolesAssigner(players, levelPreset);
};

const generatePlayers = (count: number): Player[] => {
  const players: Player[] = [];

  _.times(count, (i: number) => players.push(new Player(`user-${i}`)));

  return players;
};

test('should have a correct number of good and evil players', () => {
  for (let j = 5; j < 10; j++) {
    const assigner = generateRolesAssigner(5);

    let goodCount = 0;
    let evilCount = 0;
    assigner.assignRoles().forEach(p => {
      const loyalty: Loyalty = p.getRole().getLoyalty();

      loyalty === Loyalty.Good ? goodCount++ : evilCount++;
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

  expect(players.find((p: Player) => p.getRole().getId() === RoleId.Merlin)).toBeTruthy();
  expect(players.find((p: Player) => p.getRole().getId() === RoleId.Assassin)).toBeTruthy();
});

test('should assign every player a unique role', () => {
  const assigner = generateRolesAssigner(5);

  const roleIds = assigner.assignRoles().map(p => p.getRole().getId());

  expect(_.uniqBy(roleIds, (v: RoleId): RoleId => v).length).toEqual(roleIds.length);
});
