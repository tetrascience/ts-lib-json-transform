const { describe, it, after } = require('mocha');
const { assert } = require('chai');

const { functions } = require('../../index');

const manyTypesOfValues =
  ['foo', '', 27, 3.14159, [], {}, null, undefined, Infinity, -Infinity];

describe('map functions', () => {
  // Ensure test coverage by tracking which were tested
  const functionsTested = {};

  after('has tests for every built-in function', () => {
    // Check all functions have been tested
    Object.keys(functions).forEach(
      key => assert(key in functionsTested, `No tests found for "${key}" function.`)
    );
  });

  describe('Number', () => {
    functionsTested.Number = true;
    assertConversion('Number', 'number', functions.Number);
  });

  describe('String', () => {
    functionsTested.String = true;
    assertConversion('String', 'string', functions.String);
  });

  describe('isoDate', () => {
    it('should convert date-strings', () => {
      functionsTested.isoDate = true;
      const values = ['1997-01-13', '2017-12-25T12:00:01.000+05:00'];
      values.forEach(
        value => assert(isValidDate(functions.isoDate(value)), String(value))
      );
    });

    assertConversion('isoDate', 'string', functions.isoDate);
    assertContinuation('isoDate', functions.isoDate);

    it('should provide recognizable output non-date-strings', () => {
      assert.match(functions.isoDate('12/25/2016T00:00:00'), /invalid/i); // no time zone
      assert.match(functions.isoDate('foo'), /invalid/i);
    });
  });

  describe('index', () => {
    it('should find the index for well-formed jsonpath queries', () => {
      functionsTested.index = true;
      const values = ['$.foo[3].bar', '$.foo[5].bar[27]', '$[396]'];
      const expected = [3, 27, 396];
      values.forEach(
        (value, i) => assert.strictEqual(functions.index('', '', value), expected[i])
      );
    });

    it('should throw for not-well-formed jsonpath queries', () => {
      // No definite array notation found:
      assert.throw(() => functions.index('', '', ''));
      assert.throws(() => functions.index('', '', 'foo'));
      assert.throws(() => functions.index('', '', '[*]')); // indefinite
      // other developer errors should throw, too:
      assert.throws(() => functions.index('', ''));
      assert.throws(() => functions.index('', '', {}));
      assert.throws(() => functions.index('', '', []));
      assert.throws(() => functions.index('', '', 5));
    });
  });

  describe('sum', () => {
    it('should sum an array of values', () => {
      functionsTested.sum = true;
      assert.strictEqual(functions.sum([3, 2, 1]), 6);
      assert.strictEqual(functions.sum(['3', '2', '1']), 6);
      assert(isNaN(functions.sum([{}, {}]))); // is NaN valid JSON?
    });

    assertContinuation('sum', functions.sum);

    it('should output null if given an empty or non-array', () => {
      assert.strictEqual(functions.sum(), null);
      assert.strictEqual(functions.sum('foo'), null);
      assert.strictEqual(functions.sum(5), null);
      assert.strictEqual(functions.sum({}), null);
      assert.strictEqual(functions.sum([]), null);
    });
  });

  describe('avg', () => {
    it('should average an array of values', () => {
      functionsTested.avg = true;
      assert.strictEqual(functions.avg([3, 5, 7, 8]), 5.75);
      assert.strictEqual(functions.avg(['3', '5', '7', '8']), 5.75);
      assert(isNaN(functions.avg([{}, {}])));
    });

    assertContinuation('avg', functions.avg);

    it('should not throw if given a mixed array', () => {
      assert.doesNotThrow(() => functions.avg(['4', '3', null])); // mixed
    });
  });

  describe('min', () => {
    it('should find minimum of an array of values', () => {
      functionsTested.min = true;
      assert.strictEqual(functions.min([4, 3, 99]), 3);
      assert.strictEqual(functions.min(['4', '3', '99']), '3');
      assert.strictEqual(functions.min(['horse', 'cat', 'dog']), 'cat');
    });

    assertContinuation('min', functions.min);

    it('should not throw if given a mixed array', () => {
      assert.doesNotThrow(() => functions.min(['4', '3', null])); // mixed
    });
  });

  describe('max', () => {
    it('should find maximum of an array of values', () => {
      functionsTested.max = true;
      assert.strictEqual(functions.max([4, 3, 99]), 99);
      assert.strictEqual(functions.max(['4', '3', '99']), '99');
      assert.strictEqual(functions.max(['horse', 'cat', 'dog']), 'horse');
    });

    assertContinuation('max', functions.max);

    it('should not throw if given a mixed array', () => {
      assert.doesNotThrow(() => functions.max(['4', '3', null])); // mixed
    });
  });

  describe('trim', () => {
    it('should trim leading and trailing whitespace', () => {
      functionsTested.trim = true;
      assert.strictEqual(functions.trim('\r\t foo \n'), 'foo');
      assert.strictEqual(functions.trim(' foo'), 'foo');
      assert.strictEqual(functions.trim('foo \n'), 'foo');
    });

    assertConversion('trim', 'string', functions.trim);
    assertContinuation('trim', functions.trim);
  });
});

// Shared suite of tests for functions that just do type conversion.
function assertConversion(name, type, func) {
  it(`should convert anything to a ${type}`, () => {
    manyTypesOfValues.forEach(
      value => assert.strictEqual(typeof func(value), type)
    );
  });
}

function assertContinuation(name, func) {
  it('should not throw for any type', () => {
    manyTypesOfValues.forEach(
      value => assert.doesNotThrow(() => func(value))
    );
  });
}

function isValidDate (d) {
  return !isNaN(new Date(d).getTime());
}
