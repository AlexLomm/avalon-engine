import { PlayerSerialized } from './player-serialized';

export type PlayersManagerSerialized = {
  collection: PlayerSerialized[];
  proposedPlayerUsernames: string[];
  leaderUsername: string;
  isSubmitted: boolean;
  victimUsername: string;
}
