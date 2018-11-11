const _      = require('lodash');
const Quest  = require('../src/quest');
const Vote   = require('../src/vote');
const errors = require('../configs/errors.config');

test('should throw error if incorrect number of arguments is supplied', () => {
  expect(() => new Quest()).toThrow(errors.INCORRECT_ARGUMENTS);
  expect(() => new Quest({votesNeeded: 1})).toThrow(errors.INCORRECT_ARGUMENTS);
  expect(() => new Quest({votesNeeded: null, failsNeeded: 1})).toThrow(errors.INCORRECT_ARGUMENTS);
  expect(() => new Quest({votesNeeded: 2, failsNeeded: 1})).toThrow(errors.INCORRECT_ARGUMENTS);
  expect(() => new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 4})).not.toThrow(errors.INCORRECT_ARGUMENTS);
});

test('should return number of players needed', () => {
  const quest = new Quest({votesNeeded: 3, failsNeeded: 1, totalPlayers: 2});

  expect(quest.getVotesNeeded()).toEqual(3);
});

test('should return number of fails needed', () => {
  const quest = new Quest({votesNeeded: 1, failsNeeded: 3, totalPlayers: 2});

  expect(quest.getFailsNeeded()).toEqual(3);
});

describe('status', () => {
  test('should return status: pending', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 2, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    expect(quest.getStatus()).toEqual(-1);

    quest.addVote(new Vote('user-2', true));
    expect(quest.getStatus()).toEqual(-1);

    quest.addVote(new Vote('user-1', false));
    expect(quest.getStatus()).toEqual(-1);
  });

  test('should return status: success', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.getStatus()).toStrictEqual(1);
  });

  test('should return status: fail', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    expect(quest.getStatus()).toStrictEqual(0);
  });

  test('should return status: pending when the team has been rejected', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.getStatus()).toStrictEqual(-1);
  });

  test('should return if is complete', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    expect(quest.isComplete()).toBeFalsy();

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.isComplete()).toBeFalsy();

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    expect(quest.isComplete()).toBeTruthy();
  });
});

describe('team voting', () => {
  test('should require every player to vote for team', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 3});

    expect(quest.teamVotingAllowed()).toBeTruthy();

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.teamVotingAllowed()).toBeTruthy();

    quest.addVote(new Vote('user-3', true));

    expect(quest.teamVotingAllowed()).toBeFalsy();
  });

  test('should not allow a player to vote twice in the same team voting round', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));

    expect(() => quest.addVote(new Vote('user-1', false)))
      .toThrow(errors.VOTED_ALREADY);
  });

  test('should allow a player to vote again in the next team voting round', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', false));
    quest.addVote(new Vote('user-2', false));

    expect(() => quest.addVote(new Vote('user-1', false)))
      .not.toThrow(errors.VOTED_ALREADY);
  });

  test('should increment the tracker if team voting has failed', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    expect(quest.getTracker()).toEqual(1);

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    expect(quest.getTracker()).toEqual(2);

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.getTracker()).toEqual(2);
  });

  test('should return whether team voting round is over if the round failed', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    expect(quest.teamVotingRoundFinished()).toBeFalsy();

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    expect(quest.teamVotingRoundFinished()).toBeTruthy();

    quest.addVote(new Vote('user-1', true));

    expect(quest.teamVotingRoundFinished()).toBeFalsy();
  });

  test('should return whether team voting round is over if the round succeeded', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.teamVotingRoundFinished()).toBeTruthy();

    quest.addVote(new Vote('user-1', true));

    expect(quest.teamVotingRoundFinished()).toBeTruthy();
  });

  test('should return if it\'s the last round of team voting', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    expect(quest.isLastRoundOfTeamVoting()).toBeFalsy();

    _.times(4, () => {
      quest.addVote(new Vote('user-1', false));
      quest.addVote(new Vote('user-2', false));
    });

    expect(quest.isLastRoundOfTeamVoting()).toBeTruthy();
  });
});

describe('quest voting', () => {
  test('should not allow a user to vote twice in a quest vote', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    quest.addVote(new Vote('user-1', true));
    expect(() => quest.addVote(new Vote('user-1', false)))
      .toThrow(errors.VOTED_ALREADY);
  });

  test('should return whether everybody has voted for the quest or not', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 3});

    expect(quest.questVotingFinished()).toBeFalsy();

    // team voting
    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));
    quest.addVote(new Vote('user-3', true));

    // quest voting
    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.questVotingFinished()).toBeTruthy();
  });
});
