import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import sinon from 'sinon';
import { WorkspaceEventTypes } from '@advanced-rest-client/arc-events';
import '../prism-highlight.js';

/** @typedef {import('..').PrismHighlightElement} PrismHighlightElement */

describe('PrismHighlightElement', () => {
  /**
   * @return {Promise<PrismHighlightElement>} 
   */
  async function markdownFixture() {
    return fixture(html`<prism-highlight lang="markdown"></prism-highlight>`);
  }

  // async function jsonFixture() {
  //   return await fixture(`<prism-highlight lang="json"></prism-highlight>`);
  // }

  /**
   * @return {Promise<PrismHighlightElement>} 
   */
  async function xmlFixture() {
    return fixture(html`<prism-highlight lang="xml"></prism-highlight>`);
  }

  /**
   * @return {Promise<PrismHighlightElement>} 
   */
  async function fullFixture() {
    return fixture(html`<prism-highlight lang="json" code='{"test": true}'></prism-highlight>`);
  }

  /**
   * @return {Promise<PrismHighlightElement>} 
   */
   async function rawFixture() {
    return fixture(html`<prism-highlight raw lang="json" code='{"test": true}'></prism-highlight>`);
  }

  /**
   * @return {Promise<PrismHighlightElement>}
   */
   async function codeFixture() {
    return fixture(html`<prism-highlight code='007'></prism-highlight>`);
  }

  const CRLF = /\r\n/g;
  function normalizeString(str) {
    return str.replace(CRLF, '\n');
  }

  describe('Parsing', () => {
    // it('Parses Markdown', (done) => {
    //   const element = await markdownFixture();
    //   setTimeout(() => {
    //     let code = '# Test highlight\nHello world!\n';
    //     code += '[link](https://domain.com)';
    //     element.code = code;
    //     setTimeout(() => {
    //       const result = element.$.output.innerHTML.trim();
    //       let compare = '<span class="token title important"><span class="token punctuation">#</span>';
    //       compare += ' Test highlight</span>\nHello world!\n<span class="token url">';
    //       compare += '[link](<a class="token url-link" href="https://domain.com">https://domain.com</a>)</span>';
    //       assert.equal(result, compare);
    //       done();
    //     });
    //   }, 500);
    // });
    //
    // it('Parses JSON', (done) => {
    //   const element = fixture('Json');
    //   setTimeout(() => {
    //     const code = '{"test": "true"}';
    //     element.code = code;
    //     setTimeout(() => {
    //       const result = element.$.output.innerHTML.trim();
    //       let compare = '<span class="token punctuation">{</span><span class="token property">';
    //       compare += '"test"</span><span class="token operator">:</span> <span class="token string">';
    //       compare += '"true"</span><span class="token punctuation">}</span>';
    //       assert.equal(result, compare);
    //       done();
    //     });
    //   });
    // });

    it('Parses XML', async () => {
      const element = await xmlFixture();
      const code = '<Person>true</Person>';
      element.code = code;
      await aTimeout(0);
      const result = element._output.innerHTML.trim();
      let compare = '<span class="token tag"><span class="token tag">';
      compare += '<span class="token punctuation">&lt;</span>Person</span>';
      compare += '<span class="token punctuation">&gt;</span></span>true';
      compare += '<span class="token tag"><span class="token tag">';
      compare += '<span class="token punctuation">&lt;/</span>';
      compare += 'Person</span><span class="token punctuation">&gt;</span></span>';
      assert.equal(result, compare);
    });

    it('renders predefined json', async () => {
      const element = await fullFixture();
      await aTimeout(0);
      const result = element._output.innerHTML.trim();
      const c =
        '<span class="token punctuation">{</span><span class="token property">"test"</span>' +
        '<span class="token operator">:</span> <span class="token boolean">true</span>' +
        '<span class="token punctuation">}</span>';
      assert.equal(result, c);
    });

    it('renders code with no language', async () => {
      const element = await codeFixture();
      await aTimeout(0);
      const result = element._output.innerHTML.trim();
      const c = '<span class="token number">007</span>' ;
      assert.equal(result, c);
    });
  });

  describe('Anchors handling', () => {
    let markdown;
    let code = '# Test highlight\nHello world!\n';
    code += '[link](https://domain.com/)';

    before(async () => {
      markdown = await markdownFixture();
      markdown.code = code;
      await aTimeout(0);
    });

    it('Dispatches url-change-action custom event', (done) => {
      const anchor = markdown._output.querySelector('a');
      markdown.addEventListener('url-change-action', function clb(e) {
        markdown.removeEventListener('url-change-action', clb);
        assert.equal(normalizeString(e.detail.url), 'https://domain.com/');
        done();
      });
      anchor.click();
    });
  });

  describe('_dispatchChangeUrl()', () => {
    const url = 'test-url';
    let element = /** @type PrismHighlightElement  */ (null);
    beforeEach(async () => {
      element = await markdownFixture();
    });

    it('Dispatches url-change-action event', () => {
      const spy = sinon.spy();
      element.addEventListener('url-change-action', spy);
      element._dispatchChangeUrl(url);
      assert.isTrue(spy.called);
    });

    it('URL is set', () => {
      const spy = sinon.spy();
      element.addEventListener('url-change-action', spy);
      element._dispatchChangeUrl(url);
      assert.equal(spy.args[0][0].detail.url, url);
    });

    it('Event bubbles', () => {
      const spy = sinon.spy();
      element.addEventListener('url-change-action', spy);
      element._dispatchChangeUrl(url);
      assert.isTrue(spy.args[0][0].bubbles);
    });
  });

  describe('_dispatchNewRequest()', () => {
    const url = 'test-url';
    let element = /** @type PrismHighlightElement  */ (null);
    beforeEach(async () => {
      element = await markdownFixture();
    });

    it(`dispatches ${WorkspaceEventTypes.appendRequest} event`, () => {
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendRequest, spy);
      element._dispatchNewRequest(url);
      assert.isTrue(spy.called);
    });

    it('sets the request object', () => {
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendRequest, spy);
      element._dispatchNewRequest(url);
      assert.deepEqual(spy.args[0][0].detail.request, { method: 'GET', url });
    });
  });

  describe('_detectLang()', () => {
    let element = /** @type PrismHighlightElement  */ (null);
    beforeEach(async () => {
      element = await markdownFixture();
    });

    it('Returns JS grammar when no lang', () => {
      /* global Prism */
      const result = element._detectLang('{}');
      assert.isTrue(result === Prism.languages.javascript);
    });

    it('Returns Markup grammar when no lang', () => {
      const result = element._detectLang('<html>');
      assert.isTrue(result === Prism.languages.markup);
    });

    it('Returns grammar from "languages" property', () => {
      const obj = {};
      element.languages = {
        'test-lang': obj
      };
      const result = element._detectLang('<html>', 'test-lang');
      assert.isTrue(result === obj);
    });

    ['js', 'esm', 'mj'].forEach((item) => {
      it(`Returns JS grammar for ${  item}`, () => {
        const result = element._detectLang('{}', item);
        assert.isTrue(result === Prism.languages.javascript);
      });
    });

    ['c'].forEach((item) => {
      it(`Returns C grammar for ${  item}`, () => {
        const result = element._detectLang('{}', item);
        assert.isTrue(result === Prism.languages.clike);
      });
    });

    it('Returns default grammar', () => {
      const result = element._detectLang('<html>', 'test');
      assert.isTrue(result === Prism.languages.markup);
    });
  });

  describe('#raw', () => {
    let element = /** @type PrismHighlightElement  */ (null);
    beforeEach(async () => {
      element = await rawFixture();
    });

    it('renders the code without highlighting', () => {
      const pre = element.shadowRoot.querySelector('.raw-content');
      assert.ok(pre)
    });

    it('renders back the highlighted document', async () => {
      element.raw = false;
      await aTimeout(0);
      const pre = element.shadowRoot.querySelector('.parsed-content');
      assert.ok(pre)
    });
  });
});
