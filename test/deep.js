var deep = require('../lib/deep');
var expect = require('chai').expect;

describe('deep', function () {
  describe('.access()', function () {
    it('accesses a base property', function () {
      expect(deep.access({a: 'a'}, 'a', '.')).to.equal('a');
    });

    it('accesses a nested property', function () {
      expect(deep.access({a: {b: 'b'}}, 'a.b', '.')).to.equal('b');
    });

    it('gets a nested object', function () {
      expect(deep.access({a: {b: 'b'}}, 'a', '.')).to.deep.equal({b: 'b'});
    });

    it('returns undefined for a bad key', function () {
      expect(deep.access({a: 'a'}, 'b', '.')).to.be.undefined;
    });

    it('returns null if depth exceded', function () {
      expect(deep.access({a: 'a'}, 'a.b', '.')).to.be.null;
    });
  });

  describe('.extend()', function () {
    it('merges two objects', function () {
      var a = {a: 'a'};
      deep.extend(a, {b: 'b'});
      expect(a).to.deep.equal({a: 'a', b: 'b'});
    });

    it('merges nested objects', function () {
      var a = {root: {a: 'a'}};
      deep.extend(a, {root: {b: 'b'}});
      expect(a).to.deep.equal({root: {a: 'a', b: 'b'}});
    });

    it('overwrites simple keys', function () {
      var a = {a: 'a'};
      deep.extend(a, {a: 'b'});
      expect(a).to.deep.equal({a: 'b'});
    });

    it('overwrites nested keys', function () {
      var a = {a: 'a'};
      deep.extend(a, {a: {b: 'b'}});
      expect(a).to.deep.equal({a: {b: 'b'}});
    });
  });

  describe('.unflatten()', function () {
    it('unflattens an object', function () {
      expect(deep.unflatten({'a.b': 'b', 'a.c': 'c'}, '.'))
        .to.deep.equal({a: {b: 'b', c: 'c'}});
    });

    it('unflattens a nested chain', function () {
      expect(deep.unflatten({'a.b': {'c.d': 'd'}}, '.'))
        .to.deep.equal({a: {b: {c: {d: 'd'}}}});
    });
  });
});
