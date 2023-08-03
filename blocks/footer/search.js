class SearchChat {
  /**
   * Creates a new SearchChat instance
   *
   * @constructor
   * @property {string} resultsElementId The id of the element to insert the results into
   * @property {string} resultLoadElementId The id of the element to attach clicked result into
   */
  constructor(resultsElementId, resultLoadElementId) {
    this._demoMode = false;
    this._instanceId = `chat-${Math.random().toString(32).slice(2)}`;
    this._resultsId = resultsElementId;
    this._resultsLoadId = resultLoadElementId;
  }

  mockResultCall = { 
    query: 'test',
    start: 0,
    total: 1,
    results: [
      {
        title: 'Asthma',
        url: '/drafts/ramboz/asthma',
      },
      {
        title: 'Asthma Personalized',
        url: '/drafts/ramboz/asthma-pzn',
      },
      {
        title: 'Covid',
        url: '/drafts/ramboz/covid',
      },
      {
        title: 'Covid Personalized',
        url: '/drafts/ramboz/covid-pzn',
      },
    ],
  };

  mockResultCallPopular = {
    query: 'test',
    start: 0,
    total: 1,
    results: [
      {
        title: 'Asthma',
        url: '/drafts/ramboz/asthma',
      },
      {
        title: 'Asthma Personalized',
        url: '/drafts/ramboz/asthma-pzn',
      },
      {
        title: 'Covid',
        url: '/drafts/ramboz/covid',
      },
      {
        title: 'Covid Personalized',
        url: '/drafts/ramboz/covid-pzn',
      },
    ],
  };

  get instanceId() {
    return this._instanceId;
  }

  /**
   * Gets the current demo mode
   *
   * @method demoMode
   * @returns {boolean} The current demo mode
   */
  get demoMode() {
    return this._demoMode;
  }

  /**
   * Sets the current demo mode
   * @param {boolean} enabled
   */
  set demoMode(enabled) {
    this._demoMode = enabled;
  }

  /**
   * Gets the current search query text
   * @returns {string} The current search query text
   */
  get searchQueryText() {
    const searchElement = document.getElementById(this._instanceId);
    const searchQueryText = searchElement.querySelector('input').value;
    return searchQueryText;
  }

  /**
   * Open the search element
   *
   * @method
   */
  openSearch() {
    const searchElement = document.querySelector('footer .chat-search');
    searchElement.classList.remove('chat-search-closed');
    searchElement.classList.add('chat-search-open');
  }

  /**
   * Close the search element
   *
   * @method
   */
  closeSearch() {
    const searchElement = document.querySelector('footer .chat-search');
    searchElement.classList.remove('chat-search-open');
    searchElement.classList.add('chat-search-closed');
  }

  async loadSelectedResult(url) {
    const response = await fetch(url);
    // *.plain.html
    document.getElementById(this._resultsLoadId).innerHTML = await response.text();
  }

  /**
   * Builds a new dom element for search entry
   *
   * @method
   * @name getNewSearchElement
   * @param {string} id element id to use for the search element if  not provided a new one will be generated
   * @param {string} resultsId The id of the element to attach the results to
   * @returns {Object} A new search dom element
   */
  getNewSearchElement(id) {
    if (!id) { this._instanceId = id; }
    const searchElement = document.createElement('div');
    searchElement.classList.add('chat-search');
    searchElement.classList.add('chat-search-closed');
    searchElement.setAttribute('id', `chatSearch-${this._instanceId}`);
    searchElement.innerHTML = `
    <a href='#' class='close'></a>
    <div class='chat-search-container' id='${id}'>
      <div class='chat-search-input'>
        <label for='site-search'></label>
        <input class='intent-discovery' type='search' name='q' spellcheck=true autocorrect=on incremental=true placeholder='How can we help?' autocomplete='off'>
        <button>Search</button>
      </div>
    </div>
    `;
    searchElement.querySelector('input').addEventListener('focus',this.handleInputSearchFocus.bind(this));
    searchElement.querySelector('input').addEventListener('click',this.handleInputSearchClick.bind(this));
    searchElement.querySelector('input').addEventListener('keyup',this.handleInputSearchChange.bind(this));
    searchElement.querySelector('button').addEventListener('click',this.handleSearchButtonClick.bind(this));
    searchElement.querySelector('.close').addEventListener('click',this.handleSearchToggleClick.bind(this));

    document.documentElement.addEventListener('click', (ev) => {
      if (searchElement.classList.contains('chat-search-closed')) {
        return;
      }
      if (ev.target.closest('.chat-search')) {
        return;
      }
      this.closeSearch();
    });
    return searchElement;
  }

  /**
   * Attaches a new search element to the DOM element passed
   *
   * @method
   * @name attachNewSearchElement
   * @param {string} element A dom element to attach the search to
   * @param {string} resultsId The id of the element to attach the results to
   * @returns {Object} The element passed in with a new search attached to it
   */
  appendNewSearchElement(element) {
    const searchElm = this.getNewSearchElement(this._instanceId)
    element.appendChild(searchElm);

    return searchElm;
  }

  /**
   * Prepends a new search element to the DOM element passed
   *
   * @method
   * @name prependNewSearchElement
   * @param {string} element A dom element to attach the search to
   * @returns {Object} The element passed in with a new search attached to it
   */
  prependNewSearchElement(element, id) {
    if (!id) { this._instanceId = id; }
    const searchElm = this.getNewSearchElement(id);
    element.prepend(searchElm);

    return searchElm;
  }

  /**
   * get search results for the query
   *
   * @method
   * @property {string} query The query to search for
   * @returns {Object} The search results
   */
  async getSearchResultsForQuery(query) {
    const segmentId = window.hlx.segmentation?.resolvedSegment?.id;
    let persona;
    switch (segmentId) {
      case 'user-registered':
      case 'user-registered-returning':
        persona = 'elderly female reader';
        break;
      case 'hcp-anonymous':
      case 'hcp-anonymous-returning':
        persona = 'asthma hcp persona';
        break;
      case 'hcp-registered':
      case 'hcp-registered-returning':
        persona = 'covid hcp persona';
        break;
      case 'user-anonymous-returning':
      case 'default':
        persona = 'non_personalised';
    }
    try {
      const res = await fetch('https://10.41.210.34:8887/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: {
            question: query,
            persona,
          },
        }),
        referrerPolicy: 'no-referrer-when-downgrade',
      });
      return res.json();
    } catch (err) {
      console.log(err);
      return this.mockResultCall;
    }
  }

  mapToUrl(str) {
    const doc = str.split('/').pop();
    let [illness, section] = doc.replace(/asset_\d+ - /i, '').trim().split('(')[0].split('-');
    illness = illness.trim().toLowerCase();
    section = section ? section.trim().toLowerCase() : null;
    if (section === 'treatment') {
      section = 'treatments';
    }
    let basePath = `/${illness}`;
    if (section) {
      basePath += `#${section}`;
    }
    return basePath;
  }

  renderSearchResults(query, results) {
    if (!this._resultsId) {
      const searchElement = document.querySelector('.chat-search-container');
      const newResultsElement = document.createElement('div');
      newResultsElement.id = 'searchChatResults';
      searchElement.append(newResultsElement);
      this._resultsId = 'searchChatResults';
    }
    const resultsElm = document.querySelector(`#${this._resultsId}`);
    resultsElm.innerHTML = '';

    if (results.answer) {
      const history = JSON.parse(sessionStorage.getItem('chat-history') || '[]');
      history.push({
        query,
        results,
      });
      sessionStorage.setItem('chat-history', JSON.stringify(history));
      const answer = document.createElement('blockquote');
      answer.textContent = results.answer;
      resultsElm.append(answer);
    }

    if (results.source_url) {
      const div = document.createElement('div');
      div.classList.add('source');
      div.textContent = 'Source: ';
      const a = document.createElement('a');
      a.href = this.mapToUrl(results.source_url);
      a.textContent = results.source_url.split('/').pop().split('(')[0].replace(/asset_\d+ - /i, '');
      div.append(a);
      resultsElm.append(div);
    }

    if (results.related_content && results.related_content.length) {
      const div = document.createElement('div');
      div.classList.add('related');
      div.textContent = 'Related: ';
      const ul = document.createElement('ul');
      results.related_content.forEach((content) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = this.mapToUrl(content);
        a.textContent = content.split('/').pop().split('(')[0].replace(/asset_\d+ - /i, '');
        li.append(a);
        ul.append(li);
      });
      div.append(ul)
      resultsElm.append(div);
    }
    if (results.total > 0) {
      resultsElm.innerHTML = `
        <div class='chat-search-results'>
          <b>Jump to</b>
          <ul class='results'>
            ${results.results.map((result) => `<li class='result-item'><a class='intent-interest' data-url='${result.url}' data-title='${result.title}' href='${result.url}'>${result.title}</a></li>`).join('')}
          </ul>
        </div>
      `;

      resultsElm.querySelectorAll('.result-item a').forEach((item) => {
        item.addEventListener('click', this.handleResultItemClick.bind(this));
      });
    }
  }

  /**
   * Handles the search click event
   */
  handleInputSearchFocus(event) {
    if (event.target.closest('.chat-search').classList.contains('chat-search-closed')) {
      this.openSearch();
    }
  }

  /**
   * Handles the search click event
   */
  async handleInputSearchClick(event) {
    // if (this.searchQueryText.length > 3) {
    //   const queryResults = await this.getSearchResultsForQuery(this.searchQueryText);
    //   this.renderSearchResults(queryResults);
    // }
  }

  /**
   * Handles the search button click event
   */
  async handleSearchButtonClick(event) {
    const history = JSON.parse(sessionStorage.getItem('chat-history') || '[]');
    const { query, results } = history.find((entry) => entry.query === this.searchQueryText) || {};
    if (query) {
      return this.renderSearchResults(query, results);
    }

    const queryResults = await this.getSearchResultsForQuery(this.searchQueryText);
    this.renderSearchResults(this.searchQueryText, queryResults);
  }

  /**
   * Handles the search result item click event
   * @method
   * @property {Object} event The event object
   */
  handleResultItemClick(event) {
    event.preventDefault();
    const url = event.target.getAttribute('data-url');
    this.closeSearch();
    // this.loadSelectedResult(url);
  }

  /**
   * Handles the search result item click event
   * @method
   * @property {Object} event The event object
   */
  async handleInputSearchChange(event) {
    // if (this.searchQueryText.length > 3) {
    //   const queryResults = await this.getSearchResultsForQuery(this.searchQueryText);
    //   this.renderSearchResults(queryResults);
    // }
    if (event.key === 'Enter') {
      this.handleSearchButtonClick(event);
    }
  }

  /**
   * Handles the search close click event
   * @method
   * @property {Object} event The event object
   */
  handleSearchToggleClick(event) {
    const searchElement = event.target.closest('.chat-search');
    event.stopPropagation();
    event.preventDefault();
    if (searchElement.classList.contains('chat-search-closed')) {
      this.openSearch();
    } else {
      this.closeSearch();
    }
  }
}

export { SearchChat };
