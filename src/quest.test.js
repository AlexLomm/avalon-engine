const Quest  = require('./quest');
const errors = require('./errors');

test('should throw error if incorrect number of arguments is supplied', () => {
  expect(() => new Quest()).toThrow(errors.INCORRECT_ARGUMENTS);
  expect(() => new Quest(1)).toThrow(errors.INCORRECT_ARGUMENTS);
  expect(() => new Quest(null, 1)).toThrow(errors.INCORRECT_ARGUMENTS);
});

test('should return number of players needed', () => {
  const quest = new Quest(3, 1);

  expect(quest.getPlayersNeeded()).toEqual(3);
});

test('should return number of fails needed', () => {
  const quest = new Quest(1, 3);

  expect(quest.getFailsNeeded()).toEqual(3);
});

test('should return neutral status', () => {
  const quest = new Quest(1, 1);

  expect(quest.getStatus()).toEqual(-1);
});

test('should return fail status', () => {
  const quest = new Quest(1, 1);

  quest.fail();

  expect(quest.getStatus()).toStrictEqual(0);
});

test('should return success status', () => {
  const quest = new Quest(1, 1);

  quest.succeed();

  expect(quest.getStatus()).toStrictEqual(1);
});
