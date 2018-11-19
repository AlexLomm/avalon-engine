import * as _ from 'lodash';
import * as fromErrors from '../src/errors';
import { Quest } from '../src/quest';
import { Vote } from '../src/vote';

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
      .toThrow(fromErrors.AlreadyVotedForTeamError);
  });

  test('should allow a player to vote again in the next team voting round', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', false));
    quest.addVote(new Vote('user-2', false));

    expect(() => quest.addVote(new Vote('user-1', false)))
      .not.toThrow(fromErrors.AlreadyVotedForQuestError);
  });

  test('should increment the tracker if team voting has failed', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 2});

    expect(quest.getTeamVotingRoundIndex()).toEqual(0);

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    expect(quest.getTeamVotingRoundIndex()).toEqual(1);

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.getTeamVotingRoundIndex()).toEqual(1);
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
      .toThrow(fromErrors.AlreadyVotedForQuestError);
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

describe('serialization', () => {
  test('should serialize an empty quest', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 3});

    // TODO: add type
    const expected: any = {
      votesNeeded: 2,
      failsNeeded: 1,
      teamVotes: [],
      questVotes: [],
    };

    const actual = quest.serialize();

    expect(expected).toEqual(actual);
  });

  test('should contain serialized votes of the current team voting round', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 3});

    const vote = new Vote('user-1', true);
    quest.addVote(new Vote('user-1', true));

    expect(quest.serialize().teamVotes[0]).toEqual(vote.serialize());
  });

  test('should contain the quest votes', () => {
    const quest = new Quest({votesNeeded: 2, failsNeeded: 1, totalPlayers: 3});

    // team votes
    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));
    quest.addVote(new Vote('user-3', true));

    // quest votes
    const vote = new Vote('user-3', true);
    quest.addVote(vote);

    expect(quest.serialize().questVotes[0]).toEqual(vote.serialize());
  });
});
