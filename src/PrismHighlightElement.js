/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2018 The Advanced REST Client authors
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import 'prismjs/prism.js';
import 'prismjs/components/prism-json.min.js';
import 'prismjs/components/prism-markdown.min.js';
import 'prismjs/components/prism-yaml.min.js';
import 'prismjs/plugins/autolinker/prism-autolinker.js';
import { WorkspaceEvents } from '@advanced-rest-client/arc-events';
import elementStyles from './PrismStyles.js';

/* global Prism */
/**
 * Syntax highlighting via Prism
 *
 * ### Example
 *
 * ```html
 * <prism-highlight id="c1" lang="markdown"></prism-highlight>
 * <script>
 *  document.querySelector('#c1').code = '# Test highlight';
 * &lt;/script>
 * ```
 *
 * The `lang` attribute is required and the component will not start parsing data without it.
 *
 * Changing the `lang` and `code` properties together, do it in less than 10 ms.
 * The element is set to commit changes after this time period. Otherwise it may display
 * old and new code due to the asynchronous nature of the code highlighter.
 *
 * ## Changes in version 4
 *
 * The component supports only few syntax highlighting by default. It won't
 * load other languages at runtime.The component consumer has to download definition
 * before highlighting the code.
 *
 * The component no longer uses Web Workers.
 */
export class PrismHighlightElement extends LitElement {
   get styles() {
    return [
      elementStyles,
      css`
      :host {
        display: block;
      }

      pre {
        user-select: text;
        margin: 8px;
      }

      .worker-error {
        color: var(--error-color);
      }

      .token a {
        color: inherit;
      }

      .raw-content {
        overflow: hidden;
      }

      .raw {
        overflow: hidden;
        white-space: break-spaces;
      }
    `];
  }

  render() {
    const { raw } = this;
    return html`
      <style>${this.styles}</style>
      ${raw ? this._rawTemplate() : this._highlightedTemplate()}
    `;
  }

  _highlightedTemplate() {
    return html`
    <pre class="parsed-content">
      <code id="output" class="language-" @click="${this._handleLinks}"></code>
    </pre>
    `;
  }

  _rawTemplate() {
    return html`
    <pre class="raw-content">
      <code id="output" class="raw">${this.code}</code>
    </pre>
    `;
  }

  static get properties() {
    return {
      /**
       * A data to be highlighted and rendered.
       */
      code: { type: String },
      /**
       * Prism supported language.
       */
      lang: { type: String },
      /**
       * Adds languages outside of the core Prism languages.
       *
       * Prism includes a few languages in the core library:
       *   - JavaScript
       *   - Markup
       *   - CSS
       *   - C-Like
       * Use this property to extend the core set with other Prism
       * components and custom languages.
       *
       * Example:
       *   ```
       *   <!-- with languages = {'custom': myCustomPrismLang}; -->
       *   <!-- or languages = Prism.languages; -->
       *   <prism-highlighter languages="[[languages]]"></prism-highlighter>
       *   ```
       *
       * @attribute languages
       */
      languages: { type: Object },
      /** 
       * When set it ignores syntax highlighting and only renders the code.
       */
      raw: { type: Boolean },
    };
  }

  get code() {
    return this._code;
  }

  set code(value) {
    const old = this._code;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._code = value;
    this._highlight();
  }

  get lang() {
    return this._lang;
  }

  set lang(value) {
    const old = this._lang;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._lang = value;
    this._highlight();
  }

  get raw() {
    return this._raw;
  }

  set raw(value) {
    const old = this._raw;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._raw = value;
    this._rawChanged();
  }

  get _output() {
    return this.shadowRoot.querySelector('code');
  }

  constructor() {
    super();
    this.languages = {};
  }

  firstUpdated() {
    /* istanbul ignore if */
    if (this.__results && !this.raw) {
      this._output.innerHTML += this.__results;
      this.__results = undefined;
    }
  }

  // Resets the state of the display to initial state.
  reset() {
    const node = this._output;
    if (node) {
      node.innerHTML = '';
    }
  }

  async _rawChanged() {
    await this.requestUpdate();
    if (!this.raw) {
      this._highlight();
    }
  }
  
  /**
   * Highlights the code.
   */
  _highlight() {
    const { code, lang, raw } = this;
    if ((!code && lang) || raw) {
      return;
    }
    this.reset();
    if (this._highlightDebounce) {
      return;
    }
    this._highlightDebounce = true;
    setTimeout(() => {
      this._highlightDebounce = false;
      this._tokenize(this.code, this.lang);
    });
  }

  _tokenize(code, lang) {
    const grammar = this._detectLang(code, lang);
    const env = {
      code,
      grammar,
      language: lang
    };
    Prism.hooks.run('before-highlight', env);
    const result = Prism.highlight(code, grammar, lang);
    const node = this._output;
    /* istanbul ignore else */
    if (node) {
      node.innerHTML += result;
    } else {
      if (!this.__results) {
        this.__results = '';
      }
      this.__results += result;
    }
  }

  /**
   * Handler for click events.
   * It dispatches `url-change-action` custom event when a link is clicked.
   *
   * @param {MouseEvent} e
   */
  _handleLinks(e) {
    const el = /** @type HTMLAnchorElement */ (e.target);
    if (el.localName !== 'a') {
      return;
    }
    const newEntity = e.ctrlKey || e.metaKey;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const url = el.href;
    if (newEntity) {
      this._dispatchNewRequest(url);
    } else {
      this._dispatchChangeUrl(url);
    }
  }

  _dispatchChangeUrl(url) {
    this.dispatchEvent(
      new CustomEvent('url-change-action', {
        detail: {
          url
        },
        bubbles: true,
        cancelable: true,
        composed: true
      })
    );
  }

  _dispatchNewRequest(url) {
    WorkspaceEvents.appendRequest(this, {
      method: 'GET',
      url,
    });
  }

  /**
   * Picks a Prism formatter based on the `lang` hint and `code`.
   *
   * @param {string} code The source being highlighted.
   * @param {string=} lang A language hint (e.g. ````LANG`).
   * @returns {Prism.Lang}
   */
  _detectLang(code, lang) {
    if (!lang) {
      // Stupid simple detection if we have no lang, courtesy of:
      // https://github.com/robdodson/mark-down/blob/ac2eaa/mark-down.html#L93-101
      return code.match(/^\s*</) ? Prism.languages.markup : Prism.languages.javascript;
    }
    if (this.languages[lang]) {
      return this.languages[lang];
    } 
    if (Prism.languages[lang]) {
      return Prism.languages[lang];
    }
    switch (lang.substr(0, 2)) {
      case 'js':
      case 'es':
      case 'mj':
        return Prism.languages.javascript;
      case 'c':
        return Prism.languages.clike;
      default:
        // The assumption is that you're mostly documenting HTML when in HTML.
        return Prism.languages.markup;
    }
  }

  /**
   * An event fired when the user clicked on any link in the response
   * panels or the headers
   *
   * @event url-change-action
   * @param {String} url An url value
   * @param {Boolean} asNew When true it should be treated as "new tab" action.
   */
}
