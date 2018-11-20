import { Game } from '../game';
import { TeamPropositionState } from './team-proposition-state';
import { TeamVotingState } from './team-voting-state';
import { QuestVotingState } from './quest-voting-state';
import { FrozenState } from './frozen-state';
import { TypeState } from 'typestate';
import { AssassinationState } from './assassination-state';

function simulateTeamApproval(game: Game) {
  game.playersManager
    .getAll()
    .forEach((player) => {
      game.voteForTeam(player.getUsername(), true);
    });
}

// TODO: maybe move to playersManager?
function reset(game: Game) {
  game.playersManager.resetVotes();
  game.playersManager.resetPropositions();
  game.playersManager.setIsSubmitted(false);
}

export enum GameState {
  Preparation           = 'Preparation',
  TeamProposition       = 'TeamProposition',
  TeamVoting            = 'TeamVoting',
  TeamVotingPreApproved = 'TeamVotingPreApproved',
  QuestVoting           = 'QuestVoting',
  Assassination         = 'Assassination',
  Finish                = 'Finish',
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
        game.state = new TeamPropositionState();

        break;
      case GameState.TeamVoting:
        game.state = new FrozenState();

        //setTimeout(() => {
        reset(game);

        game.state = new TeamPropositionState();
        //}, 5000);

        break;
      case GameState.QuestVoting:
        game.state = new FrozenState();

        //setTimeout(() => {
        reset(game);

        game.questsManager.nextQuest();

        game.state = new TeamPropositionState();
        //}, 5000);

        break;
    }
  });

  fsm.on(GameState.TeamVoting, (from: GameState) => {
    switch (from) {
      case GameState.TeamProposition:
        game.playersManager.setIsSubmitted(true);

        game.state = new TeamVotingState();

        break;
    }
  });

  fsm.on(GameState.TeamVotingPreApproved, (from: GameState) => {
    switch (from) {
      case GameState.TeamProposition:
        game.playersManager.setIsSubmitted(true);

        game.state = new TeamVotingState();

        simulateTeamApproval(game);

        break;
    }
  });

  fsm.on(GameState.QuestVoting, (from: GameState) => {
    switch (from) {
      case GameState.TeamVotingPreApproved:
      case GameState.TeamVoting:
        game.state = new FrozenState();

        //setTimeout(() => {
        game.playersManager.resetVotes();

        game.state = new QuestVotingState();
        //}, 5000);

        break;
    }
  });

  fsm.on(GameState.Assassination, (from: GameState) => {
    switch (from) {
      case GameState.QuestVoting:
        reset(game);

        game.state = new AssassinationState();

        break;
    }
  });

  fsm.on(GameState.Finish, (from: GameState) => {
    switch (from) {
      case GameState.QuestVoting:
        game.state = new FrozenState();

        break;
      case GameState.Assassination:
        game.state = new FrozenState();

        break;
    }
  });

  return fsm;
}
