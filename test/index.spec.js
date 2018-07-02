/* global describe, it, before */

import chai from 'chai';
import css2pre from '../lib/css2pre.js';

chai.expect();

const expect = chai.expect;

let lib;

describe('css2less;', () => {
  before(() => {
    lib = new css2pre(' ');
  });

  describe('need css', () => {
    it('no error', () => {
      expect(typeof lib).to.be.equal('object');
    });

    it('to less', () => {
      let str = lib.to('less')
      expect(typeof str).to.be.equal('string');
    });

    it('to scss', () => {
      let str = lib.to('scss')
      expect(typeof str).to.be.equal('string');
    });
  });
});
