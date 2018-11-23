import * as _ from 'lodash';
import { PlayersManager } from '../../src/players-manager';
import { Player } from '../../src/player';
import { LevelPreset } from '../../src/level-preset';

export function addPlayersAndAssignRoles(number: number, manager: PlayersManager) {
  addPlayersToManager(number, manager);
  assignRolesToManager(manager);
}

export function addPlayersToManager(number: number, manager: PlayersManager) {
  _.times(number, (i: number) => manager.add(new Player(`user-${i}`)));
}

export function assignRolesToManager(manager: PlayersManager) {
  manager.assignRoles(new LevelPreset(manager.getAll().length));
}
