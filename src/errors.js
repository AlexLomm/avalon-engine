class BaseError extends Error {
  constructor(message, code) {
    super(message);

    this.message = message;
    this.code    = code;
  }
}

class AlreadyStartedGameError extends BaseError {
  constructor() {
    super(
      'The game has already started.',
      'ERR_GAME_STARTED'
    );
  }
}

class AlreadyExistsPlayerError extends BaseError {
  constructor() {
    super(
      'Such a player is already in the game.',
      'ERR_PLAYER_EXISTS'
    );
  }
}

class AlreadyVotedForTeamError extends BaseError {
  constructor() {
    super(
      'You have already voted for the team.',
      'ERR_TEAM_VOTED'
    );
  }
}

class AlreadyVotedForQuestError extends BaseError {
  constructor() {
    super(
      'You have already voted for the quest.',
      'ERR_QUEST_VOTED'
    );
  }
}

class PlayerMissingError extends BaseError {
  constructor() {
    super(
      'The specified player does not exist.',
      'ERR_PLAYER_MISSING'
    );
  }
}

class PlayersMaximumReachedError extends BaseError {
  constructor() {
    super(
      'The maximum amount of players has been reached.',
      'ERR_MAX_REACHED'
    );
  }
}

class PlayersAmountIncorrectError extends BaseError {
  constructor() {
    super(
      'The number of players is incorrect.',
      'ERR_WRONG_PLAYERS_AMT'
    );
  }
}

class RequiredCorrectTeammatesAmountError extends BaseError {
  constructor() {
    super(
      'Incorrect number of teammates is proposed.',
      'ERR_WRONG_TMT_AMT'
    );
  }
}

class RequiredVictimError extends BaseError {
  constructor() {
    super(
      'A victim is not chosen for the assassination.',
      'ERR_VICTIM_REQD'
    );
  }
}

class NoTimeForTeammatePropositionError extends BaseError {
  constructor() {
    super(
      'This is not a teammate proposition time.',
      'ERR_NO_TMT_PROP'
    );
  }
}

class NoTimeForTeamVotingError extends BaseError {
  constructor() {
    super(
      'This is not a team voting time.',
      'ERR_NO_TEAM_VOTING'
    );
  }
}

class NoTimeForQuestVotingError extends BaseError {
  constructor() {
    super(
      'This is not a quest voting time.',
      'ERR_NO_QUEST_VOTING'
    );
  }
}

class NoTimeForAssassinationError extends BaseError {
  constructor() {
    super(
      'This is not an assassination time.',
      'ERR_NO_ASSN'
    );
  }
}

class NoTimeVictimPropositionError extends BaseError {
  constructor() {
    super(
      'This is not a victim proposition time.',
      'ERR_NO_VICTIM_PROP'
    );
  }
}

class DeniedTeammatePropositionError extends BaseError {
  constructor() {
    super(
      'You have no right to propose a teammate.',
      'ERR_DND_TMT_PROP'
    );
  }
}

class DeniedTeamSubmissionError extends BaseError {
  constructor() {
    super(
      'You have no right to submit a team.',
      'ERR_DND_TEAM_SUB'
    );
  }
}

class DeniedTeamVotingError extends BaseError {
  constructor() {
    super(
      'You have no right to vote for team.',
      'ERR_DND_TEAM_VOTING'
    );
  }
}

class DeniedQuestVotingError extends BaseError {
  constructor() {
    super(
      'You have no right to vote for quest.',
      'ERR_DND_QUEST_VOTING'
    );
  }
}

class DeniedVictimPropositionError extends BaseError {
  constructor() {
    super(
      'You are not allowed to propose a victim for assassination.',
      'ERR_DND_VICTIM_PROP'
    );
  }
}

class DeniedSelfSacrificeError extends BaseError {
  constructor() {
    super(
      'You are not allowed to propose yourself as a victim.',
      'ERR_DND_SELF_SAC'
    );
  }
}

class DeniedAssassinationError extends BaseError {
  constructor() {
    super(
      'You are not allowed to perform an assassination.',
      'ERR_DND_ASSN'
    );
  }
}

module.exports = {
  AlreadyStartedGameError,
  AlreadyExistsPlayerError,
  AlreadyVotedForTeamError,
  AlreadyVotedForQuestError,
  PlayerMissingError,
  PlayersMaximumReachedError,
  PlayersAmountIncorrectError,
  RequiredCorrectTeammatesAmountError,
  RequiredVictimError,
  NoTimeForTeammatePropositionError,
  NoTimeForTeamVotingError,
  NoTimeForQuestVotingError,
  NoTimeForAssassinationError,
  NoTimeVictimPropositionError,
  DeniedTeammatePropositionError,
  DeniedTeamSubmissionError,
  DeniedTeamVotingError,
  DeniedQuestVotingError,
  DeniedVictimPropositionError,
  DeniedSelfSacrificeError,
  DeniedAssassinationError,
};
