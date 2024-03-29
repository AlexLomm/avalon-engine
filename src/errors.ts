export abstract class BaseError extends Error {
  public message: string;
  public code: string;

  constructor(message: string, code: string) {
    super(message);

    this.message = message;
    this.code = code;
  }
}

export class AlreadyStartedGameError extends BaseError {
  constructor() {
    super('The game has already started.', 'ERR_GAME_STARTED');
  }
}

export class AlreadyExistsPlayerError extends BaseError {
  constructor() {
    super('Such a player is already in the game.', 'ERR_PLAYER_EXISTS');
  }
}

export class AlreadyVotedError extends BaseError {
  constructor() {
    super('You have already voted.', 'ERR_AlREADY_VOTED');
  }
}

export class PlayerMissingError extends BaseError {
  constructor() {
    super('The specified player does not exist.', 'ERR_PLAYER_MISSING');
  }
}

export class PlayersMaximumReachedError extends BaseError {
  constructor() {
    super('The maximum amount of players has been reached.', 'ERR_MAX_REACHED');
  }
}

export class PlayersAmountIncorrectError extends BaseError {
  constructor() {
    super('The number of players is incorrect.', 'ERR_WRONG_PLAYERS_AMT');
  }
}

export class RequiredCorrectTeammatesAmountError extends BaseError {
  constructor() {
    super('Incorrect number of teammates is proposed.', 'ERR_WRONG_TMT_AMT');
  }
}

export class RequiredVictimError extends BaseError {
  constructor() {
    super('A victim is not chosen for the assassination.', 'ERR_VICTIM_REQD');
  }
}

export class NoTimeForTeammatePropositionError extends BaseError {
  constructor() {
    super('This is not a teammate proposition time.', 'ERR_NO_TMT_PROP');
  }
}

export class NoTimeForTeamSubmissionError extends BaseError {
  constructor() {
    super('This is not a team submission time.', 'ERR_NO_TEAM_SUB');
  }
}

export class NoTimeForTeamVotingError extends BaseError {
  constructor() {
    super('This is not a team voting time.', 'ERR_NO_TEAM_VOTING');
  }
}

export class NoTimeForQuestVotingError extends BaseError {
  constructor() {
    super('This is not a quest voting time.', 'ERR_NO_QUEST_VOTING');
  }
}

export class NoTimeVictimPropositionError extends BaseError {
  constructor() {
    super('This is not a victim proposition time.', 'ERR_NO_VICTIM_PROP');
  }
}

export class NoTimeForAssassinationError extends BaseError {
  constructor() {
    super('This is not an assassination time.', 'ERR_NO_ASSN');
  }
}

export class DeniedTeammatePropositionError extends BaseError {
  constructor() {
    super('You have no right to propose a teammate.', 'ERR_DND_TMT_PROP');
  }
}

export class DeniedTeamSubmissionError extends BaseError {
  constructor() {
    super('You have no right to submit a team.', 'ERR_DND_TEAM_SUB');
  }
}

export class DeniedTeamVotingError extends BaseError {
  constructor() {
    super('You have no right to vote for team.', 'ERR_DND_TEAM_VOTING');
  }
}

export class DeniedQuestVotingError extends BaseError {
  constructor() {
    super('You have no right to vote for quest.', 'ERR_DND_QUEST_VOTING');
  }
}

export class DeniedVictimPropositionError extends BaseError {
  constructor() {
    super(
      'You are not allowed to propose a victim for assassination.',
      'ERR_DND_VICTIM_PROP',
    );
  }
}

export class DeniedSelfSacrificeError extends BaseError {
  constructor() {
    super(
      'You are not allowed to propose yourself as a victim.',
      'ERR_DND_SELF_SAC',
    );
  }
}

export class DeniedAssassinationError extends BaseError {
  constructor() {
    super('You are not allowed to perform an assassination.', 'ERR_DND_ASSN');
  }
}
