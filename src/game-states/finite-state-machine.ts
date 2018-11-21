import { Game } from '../game';
import { TeamPropositionState } from './team-proposition-state';
import { TeamVotingState } from './team-voting-state';
import { QuestVotingState } from './quest-voting-state';
import { FrozenState } from './frozen-state';
import { TypeState } from 'typestate';
import { AssassinationState } from './assassination-state';

export enum GameState {
  Preparation           = 'Preparation',
  TeamProposition       = 'TeamProposition',
  TeamVoting            = 'TeamVoting',
  TeamVotingPreApproved = 'TeamVotingPreApproved',
  QuestVoting           = 'QuestVoting',
  Assassination         = 'Assassination',
  Finish                = 'Finish',
}

function simulateTeamApproval(game: Game) {
  game.getPlayersManager()
    .getAll()
    .forEach((player) => {
      game.voteForTeam(player.getUsername(), true);
    });
}

export function createFsm(game: Game) {
  const fsm = new TypeState.FiniteStateMachine<GameState>(GameState.Preparation);

  fsm.from(GameState.Preparation).to(GameState.TeamProposition);
  //
  fsm.from(GameState.TeamProposition).to(GameState.TeamVoting);
  fsm.from(GameState.TeamProposition).to(GameState.TeamVotingPreApproved);
  //
  fsm.from(GameState.TeamVoting).to(GameState.TeamProposition);
  fsm.from(GameState.TeamVoting).to(GameState.QuestVoting);
  //
  fsm.from(GameState.TeamVotingPreApproved).to(GameState.QuestVoting);
  //
  fsm.from(GameState.QuestVoting).to(GameState.TeamProposition);
  fsm.from(GameState.QuestVoting).to(GameState.Assassination);
  fsm.from(GameState.QuestVoting).to(GameState.Finish);
  //
  fsm.from(GameState.Assassination).to(GameState.Finish);

  fsm.on(GameState.TeamProposition, (from: GameState) => {
    switch (from) {
      case GameState.Preparation:
        game.setState(new TeamPropositionState());

        break;
      case GameState.TeamVoting:
        game.setState(new FrozenState());

        // TODO: add timeout
        //setTimeout(() => {
        game.getPlayersManager().reset();

        game.setState(new TeamPropositionState());
        //}, 5000);

        break;
      case GameState.QuestVoting:
        game.setState(new FrozenState());

        // TODO: add timeout
        //setTimeout(() => {
        game.getPlayersManager().reset();

        game.getQuestsManager().nextQuest();

        game.setState(new TeamPropositionState());
        //}, 5000);

        break;
    }
  });

  fsm.on(GameState.TeamVoting, (from: GameState) => {
    switch (from) {
      case GameState.TeamProposition:
        game.getPlayersManager().setIsSubmitted(true);

        game.setState(new TeamVotingState());

        break;
    }
  });

  fsm.on(GameState.TeamVotingPreApproved, (from: GameState) => {
    switch (from) {
      case GameState.TeamProposition:
        game.getPlayersManager().setIsSubmitted(true);

        game.setState(new TeamVotingState());

        simulateTeamApproval(game);

        break;
    }
  });

  fsm.on(GameState.QuestVoting, (from: GameState) => {
    switch (from) {
      case GameState.TeamVotingPreApproved:
      case GameState.TeamVoting:
        game.setState(new FrozenState());

        // TODO: add timeout
        //setTimeout(() => {
        game.getPlayersManager().resetVotes();

        game.setState(new QuestVotingState());
        //}, 5000);

        break;
    }
  });

  fsm.on(GameState.Assassination, (from: GameState) => {
    switch (from) {
      case GameState.QuestVoting:
        game.getPlayersManager().reset();

        game.setState(new AssassinationState());

        break;
    }
  });

  fsm.on(GameState.Finish, (from: GameState) => {
    switch (from) {
      case GameState.QuestVoting:
      case GameState.Assassination:
        game.setState(new FrozenState());

        break;
    }
  });

  return fsm;
}
