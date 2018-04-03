/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   prism-highlight.html
 */

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../paper-button/paper-button.d.ts" />
/// <reference path="../paper-progress/paper-progress.d.ts" />
/// <reference path="../error-message/error-message.d.ts" />
/// <reference path="prism-import.d.ts" />
/// <reference path="prism-styles.d.ts" />

declare namespace UiElements {

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
   * The element is set to commit changes after this persiod. Otherwise it may display
   * old and new code due to the asynchronius nature of the code highligter.
   *
   * **Note** This element uses web workers with dependencies. It expect to find
   * workers files in current directory in the `workers` folder.
   * Your build process has to ensure that this files will be avaiable.
   *
   * Also this element expects the prism scripts to be available in the same
   * root folder as this element is (like bower_components).
   *
   * ### Required scripts
   *
   * - ../prism/prism.js
   * - ../prism/plugins/autolinker/prism-autolinker.min.js
   * - ../prism/components/*
   *
   * ### Styling
   *
   * `<prism-highlight>` provides the following custom properties and mixins for styling:
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--prism-highlight` | Mixin applied to the element | `{}`
   * `--prism-highlight-code` | Mixin applied to the `<pre>` element | `{}`
   * `--prism-highlight-mark-selected` | Background color for the `<mark>` element when using custom search | `#ff9632`
   */
  class PrismHighlight extends Polymer.Element {

    /**
     * A data to be highlighted and dispayed.
     */
    code: string|null|undefined;

    /**
     * Prism supported language.
     */
    lang: string|null|undefined;

    /**
     * A list of tokenized code.
     * It's a result of calling `Prism.tokenize` function.
     */
    readonly tokenized: any[]|null|undefined;

    /**
     * True if not all data has been displayed in the display.
     */
    readonly hasMore: boolean|null|undefined;

    /**
     * A number of Prism tokens to process at once.
     * Note, that elements like paragraphs, list items etc consists of
     * two tokens: description and content while regular text can be
     * consoisted of single token.
     *
     * After the limit is reached the display shows "load next
     * [maxRead] items" and "load all" buttons.
     */
    maxRead: number|null|undefined;

    /**
     * True when parsing code or tokens to HTML code.
     */
    readonly working: boolean|null|undefined;

    /**
     * A web worker instance that parses the syntax
     */
    readonly worker: object|null|undefined;

    /**
     * Number of miliseconds after which the tokenize task fail sending
     * `prism-highlight-timeout` event.
     * Set to "falsy" value to remove timeout.
     */
    tokenizeTimeout: number|null|undefined;
    detached(): void;

    /**
     * Resets the state of the display to initial state.
     */
    reset(): void;

    /**
     * Hightligt the code.
     */
    _highlight(code: any, lang: any): void;

    /**
     * Sends message to the hightligt worker if its already created.
     * If not, this will create worker and then post message.
     *
     * @param message An object to pass to the worker.
     */
    _runWorker(message: object|null): void;

    /**
     * Clears the tokenize timeout if set.
     */
    _clearTokenizeTimeout(): void;

    /**
     * Creates an instance of a web worker.
     * It does nothing if the worker is already created.
     */
    _registerWorker(): void;

    /**
     * Terminates the worker (if exists) and removes event listeners
     */
    _unregisterWorker(): void;

    /**
     * Handler for the worker `message` event
     */
    _onWorkerData(e: Event|null): void;

    /**
     * Handler for worker error.
     */
    _onWorkerError(e: Error|null): void;

    /**
     * Handler for worker function after code tokenization.
     *
     * @param tokens An array of tokens returnet by Prism.
     */
    _onTokenized(tokens: any[]|null): void;

    /**
     * Display next tokens from `this.tokenized` list - up to `this.maxRead`
     * elements. If after running this function the `this.tokenized`
     * array is empty it will be set to undefined.
     */
    _loadNext(): void;
    _loadAll(): void;

    /**
     * Display a HTML code generated by Prism.
     *
     * @param html HTML code to be displayed.
     */
    _display(html: String|null): void;

    /**
     * Computes if the element has more data to display.
     */
    _computeHasMore(tokenized: any): any;

    /**
     * Handler for click events.
     * It dispatches `url-change-action` custom event when a link is clicked.
     */
    _handleLinks(e: ClickEvent|null): void;

    /**
     * Called when the tokenize task exceeds timeout set in the `tokenizeTimeout`
     * property
     */
    _onTokenizeTimeout(): void;
  }
}

interface HTMLElementTagNameMap {
  "prism-highlight": UiElements.PrismHighlight;
}
