const errors = require('../src/errors');

test('should not have similar codes or values', () => {
  const keys = Object.keys(errors);

  keys.forEach((k1, i) => {
    const err1 = new errors[k1];

    keys.slice(i + 1, keys.length).forEach((k2) => {
      const err2 = new errors[k2];

      expect(err1.code).not.toStrictEqual(err2.code);
      expect(err1.message).not.toStrictEqual(err2.message);
    });
  });
});
