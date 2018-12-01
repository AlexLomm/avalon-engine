import * as _ from 'lodash';
import * as fromErrors from '../../src/errors';
import { Quest, QuestStatus, QuestSerialized } from '../../src/quest';
import { Vote } from '../../src/vote';

test('should return number of players needed', () => {
  const quest = new Quest({votesNeededCount: 3, failsNeededCount: 1, totalPlayers: 2});

  expect(quest.getVotesNeededCount()).toEqual(3);
});

test('should return number of fails needed', () => {
  const quest = new Quest({votesNeededCount: 1, failsNeededCount: 3, totalPlayers: 2});

  expect(quest.getFailsNeededCount()).toEqual(3);
});

describe('status', () => {
  test('should return status: pending', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 2, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    expect(quest.getStatus()).toEqual(QuestStatus.Unresolved);

    quest.addVote(new Vote('user-2', true));
    expect(quest.getStatus()).toEqual(QuestStatus.Unresolved);

    quest.addVote(new Vote('user-1', false));
    expect(quest.getStatus()).toEqual(QuestStatus.Unresolved);
  });

  test('should return status: success', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.getStatus()).toStrictEqual(QuestStatus.Won);
  });

  test('should return status: fail', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    expect(quest.getStatus()).toStrictEqual(QuestStatus.Lost);
  });

  test('should return status: pending when the team has been rejected', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.getStatus()).toStrictEqual(QuestStatus.Unresolved);
  });

  test('should return if is complete', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 2});

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
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 3});

    expect(quest.teamVotingAllowed()).toBeTruthy();

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.teamVotingAllowed()).toBeTruthy();

    quest.addVote(new Vote('user-3', true));

    expect(quest.teamVotingAllowed()).toBeFalsy();
  });

  test('should increment the tracker if team voting has failed', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 2});

    expect(quest.getTeamVotingRoundIndex()).toEqual(0);

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    expect(quest.getTeamVotingRoundIndex()).toEqual(1);

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.getTeamVotingRoundIndex()).toEqual(1);
  });

  test('should return whether team voting round is over if the round failed', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 2});

    expect(quest.teamVotingRoundFinished()).toBeFalsy();

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', false));

    expect(quest.teamVotingRoundFinished()).toBeTruthy();

    quest.addVote(new Vote('user-1', true));

    expect(quest.teamVotingRoundFinished()).toBeFalsy();
  });

  test('should return whether team voting round is over if the round succeeded', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 2});

    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));

    expect(quest.teamVotingRoundFinished()).toBeTruthy();

    quest.addVote(new Vote('user-1', true));

    expect(quest.teamVotingRoundFinished()).toBeTruthy();
  });

  test('should return if it\'s the last round of team voting', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 2});

    expect(quest.isLastRoundOfTeamVoting()).toBeFalsy();

    _.times(4, () => {
      quest.addVote(new Vote('user-1', false));
      quest.addVote(new Vote('user-2', false));
    });

    expect(quest.isLastRoundOfTeamVoting()).toBeTruthy();
  });
});

describe('quest voting', () => {
  test('should return whether everybody has voted for the quest or not', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 3});

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
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 3});

    const expected: QuestSerialized = {
      status: QuestStatus.Unresolved,
      votesNeededCount: 2,
      failsNeededCount: 1,
      teamVotes: [],
      questVotes: [],
    };

    const actual = quest.serialize(false, false);

    expect(expected).toEqual(actual);
  });

  test('should contain serialized votes of the current team voting round', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 3});

    const vote = new Vote('user-1', true);
    quest.addVote(new Vote('user-1', true));

    expect(quest.serialize(false, false).teamVotes[0]).toEqual(vote.serialize());
  });

  test('should contain the anonymous team votes', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 3});

    quest.addVote(new Vote('user-1', true));

    expect(quest.serialize(false, true).teamVotes[0])
      .toEqual(new Vote('user-1', null).serialize());
  });

  test('should reveal the vote value without revealing the voter', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 3});

    // team votes
    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));
    quest.addVote(new Vote('user-3', true));

    // quest votes
    quest.addVote(new Vote('user-3', true));

    expect(quest.serialize(false, false).questVotes[0])
      .toEqual(new Vote(null, true).serialize());
  });

  test('should indicate that someone has voted without revealing the vote value', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 3});

    // team votes
    quest.addVote(new Vote('user-1', true));
    quest.addVote(new Vote('user-2', true));
    quest.addVote(new Vote('user-3', true));

    // quest votes
    quest.addVote(new Vote('user-3', true));

    expect(quest.serialize(false, true).questVotes[0])
      .toEqual(new Vote('user-3', null).serialize());
  });

  test('should sort the revealed quest votes by value', () => {
    const quest = new Quest({votesNeededCount: 5, failsNeededCount: 1, totalPlayers: 8});

    _.times(8, (i: number) => quest.addVote(new Vote(`user-${i}`, true)));

    quest.addVote(new Vote('user-1', false));
    quest.addVote(new Vote('user-2', true));
    quest.addVote(new Vote('user-3', false));
    quest.addVote(new Vote('user-4', true));
    quest.addVote(new Vote('user-5', true));

    const votes = (quest.serialize(false, false).questVotes as Array<any>)
      .map((obj: any) => obj.value);

    expect(votes).toEqual([true, true, true, false, false]);
  });

  test('should omit the voting results', () => {
    const quest = new Quest({votesNeededCount: 2, failsNeededCount: 1, totalPlayers: 5});

    // team votes
    _.times(5, (i: number) => quest.addVote(new Vote(`user-${i}`, true)));

    // quest votes
    _.times(2, (i: number) => quest.addVote(new Vote(`user-${i}`, true)));

    const serialized = quest.serialize(false, true);
    expect(serialized.teamVotes.length).toStrictEqual(0);
    expect(serialized.questVotes.length).toStrictEqual(2);
  });
});
