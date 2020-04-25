class Words {
  constructor() {
    this.audio = new Audio();
    this.audio.autoplay = true;
    this.gameMode = false;
    this.currentGroup = '00';
    window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
    this.recognition = new window.SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.statisticsInfo = JSON.parse(localStorage.getItem('statistics')) || [];
  }

  createDOM() {
    this.wordImage = document.querySelector('.word-image');
    this.startButton = document.querySelector('.start-btn');
    this.resultButton = document.querySelector('.result-btn');
    this.newGameButtonResult = document.querySelector('.results-new-game');
    this.backButton = document.querySelector('.stat-back');
    this.newGameButton = document.querySelector('.new-game-btn');
    this.blockWords = document.querySelector('.block-words');
    this.stringWord = document.querySelector('.word-string');
    this.speakButton = document.querySelector('.speak-btn');
    this.menu = document.querySelector('.menu');
    this.results = document.querySelector('.results');
    this.guessedContainer = document.querySelector('.guessed-container');
    this.unsolvedContainer = document.querySelector('.unsolved-container');
    this.countGuess = document.querySelector('.count-guessed');
    this.countUnsolved = document.querySelector('.count-unsolved');
    this.returnButton = document.querySelector('.results-return');
    this.statistics = document.querySelector('.statistics');
    this.statisticsButton = document.querySelector('.statistics-btn');
    this.itemStatistics = document.querySelector('.item-statistics');
    this.imageSrc = this.wordImage.getAttribute('src');
    this.itemStatistics.remove();
  }

  addEventListener() {
    this.newGameButtonResult.addEventListener('click', () => this.newGame());
    this.backButton.addEventListener('click', () => this.backStatistics());
    this.statisticsButton.addEventListener('click', () => this.openStatistics());
    this.newGameButton.addEventListener('click', () => this.newGame());
    this.menu.addEventListener('click', (event) => this.selectcCmplexity(event));
    this.speakButton.addEventListener('click', () => this.startGame());
    this.returnButton.addEventListener('click', () => this.returnGame());
    this.startButton.addEventListener('click', () => this.getWords());
    this.resultButton.addEventListener('click', () => this.openResult());
    window.addEventListener('click', (event) => this.audioWord(event));
    window.addEventListener('unload', () => {
      localStorage.setItem('statistics', JSON.stringify(this.statisticsInfo));
    });
    this.recognition.addEventListener('result', (event) => this.recording(event));
    this.recognition.addEventListener('end', () => {
      if (this.gameMode) {
        this.recognition.start();
      }
    });
  }

  backStatistics() {
    this.statistics.style.display = 'none';
    if (!this.statisticsInfo.length) return;
    document.querySelector('.statistics-modal-window').innerHTML = '';
  }

  openStatistics() {
    this.statistics.style.display = 'block';
    for (let i = 0; i < this.statisticsInfo.length; i += 1) {
      if (i === 8) return;
      if (this.statisticsInfo.length) {
        if (document.querySelector('.statistics-text') !== null) {
          document.querySelector('.statistics-text').style.display = 'none';
        }
      }
      const newItem = this.itemStatistics.cloneNode(true);
      newItem.querySelector('.date').textContent = (this.statisticsInfo[i].date).slice(0, 25);
      newItem.querySelector('.stat-guess').textContent = `Guessed: ${this.statisticsInfo[i].guessed}`;
      newItem.querySelector('.stat-unsolved').textContent = `Unsolved ${this.statisticsInfo[i].unsolved}`;
      document.querySelector('.statistics-modal-window').append(newItem);
    }
  }

  newGame() {
    this.returnGame(true);
    this.getWords();
    this.resetStat();
  }

  returnGame(mode) {
    this.results.style.display = 'none';
    this.results.querySelectorAll('.item-word').forEach((item) => {
      item.classList.remove('words-results');
      this.blockWords.append(item);
      if (!mode) {
        if (item.dataset.guess === 'true') {
          item.classList.add('guessed-word');
        }
      }
    });
  }

  resetStat() {
    this.wordImage.src = this.imageSrc;
    document.querySelector('.stars').style.opacity = '0';
    document.querySelectorAll('.star-win').forEach((item) => {
      item.classList.remove('star-win');
      item.classList.add('star-lose');
    });
    this.blockWords.querySelectorAll('.item-word').forEach((item) => {
      item.classList.remove('guessed-word');
      if (item.classList.contains('item-word-active')) {
        item.classList.remove('item-word-active');
      }
    });
    this.stringWord.textContent = '';
    this.stringWord.classList.remove('play-game');
    this.recognition.stop();
    if (!this.gameMode) return;
    const obj = {
      guessed: this.correctly,
      unsolved: this.unsolved,
      date: `${new Date()}`,
    };
    this.statisticsInfo.unshift(obj);
    this.gameMode = false;
  }

  openResult() {
    if (this.correctly === 10) {
      this.resetStat();
    }
    this.results.style.display = 'block';
    this.blockWords.querySelectorAll('.item-word').forEach((item) => {
      item.classList.add('words-results');
      if (item.classList.contains('guessed-word')) {
        this.guessedContainer.append(item);
        item.classList.remove('guessed-word');
        item.dataset.guess = true;
      } else {
        this.unsolvedContainer.append(item);
      }
    });
  }


  selectcCmplexity(event) {
    const targetChain = event.target;
    if (targetChain.classList.contains(('chain'))) {
      if (targetChain.classList.contains('chain-active')) return;
      this.menu.querySelectorAll('.chain').forEach((item) => {
        item.classList.remove('chain-active');
        targetChain.classList.add('chain-active');
      });
      this.currentGroup = targetChain.dataset.level;
      this.getWords();
      this.resetStat();
    }
  }

  startGame() {
    if (this.gameMode) return;
    const activeWord = document.querySelector('.item-word-active');
    if (activeWord !== null) {
      activeWord.classList.remove('item-word-active');
    }
    this.correctly = 0;
    this.unsolved = 10;
    this.recognition.start();
    this.gameMode = true;
    this.stringWord.textContent = '';
    this.stringWord.classList.add('play-game');
    document.querySelector('.stars').style.opacity = '1';
  }


  recording(event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    if (event.results[0].isFinal) {
      this.stringWord.textContent = transcript.split(' ')[0];
      Array.from(this.blockWords.children).forEach((item) => {
        if (item.querySelector('.word').textContent === transcript) {
          const currentNumber = item.dataset.number;
          let currentPage = this.page + 1;
          if (currentPage < 10) {
            currentPage = `0${currentPage}`;
          }
          this.correctly += 1;
          this.unsolved -= 1;
          this.audio.src = 'audio/correct.mp3';
          this.wordImage.src = `https://raw.githubusercontent.com/inq666/rslang-data/master/data/${currentPage}_${currentNumber}.jpg`;
          this.countGuess.textContent = `${this.correctly}`;
          this.countUnsolved.textContent = `${this.unsolved}`;
          item.classList.add('guessed-word');
          const newStar = document.querySelector('.star-lose');
          newStar.classList.add('star-win');
          newStar.classList.remove('star-lose');
          if (this.correctly === 10) {
            this.audio.src = 'audio/success.mp3';
            setTimeout(() => this.openResult(), 500);
          }
        }
      });
    }
  }

  async getWords() {
    setTimeout(() => {
      document.querySelector('.start-window').style.display = 'none';
    }, 3500);
    document.querySelector('.modal-window').style.display = 'none';
    document.querySelector('.good-luck').style.display = 'block';
    this.page = Math.floor(Math.random() * (29 + 1));
    const url = `https://afternoon-falls-25894.herokuapp.com/words?page=${this.page}&group=${this.currentGroup}`;
    const res = await fetch(url);
    const json = await res.json();
    this.createWords(json);
  }

  async createWords(json) {
    const urlArray = [];
    for (let i = 0; i < this.blockWords.children.length; i += 1) {
      const number = json[i].image.slice(-8, -4);
      this.blockWords.children[i].dataset.number = number;
      this.blockWords.children[i].querySelector('.word').textContent = (json[i].word).toLowerCase();
      this.blockWords.children[i].querySelector('.transcription').textContent = json[i].transcription;
      urlArray.push(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200422T174219Z.a6338781f9423192.28f2896df71fd9376630fd91e64a03518d511f99&text= ${json[i].word} &lang=en-ru`);
    }
    const requests = urlArray.map((url) => fetch(url));
    const wordArray = [];

    await Promise.all(requests)
      .then((responses) => Promise.all(responses.map((data) => data.json())))
      .then((translate) => translate.forEach((word) => wordArray.push(word.text)));

    for (let k = 0; k < this.blockWords.children.length; k += 1) {
      this.blockWords.children[k].querySelector('.translate').textContent = wordArray[k];
    }
  }

  audioWord(event) {
    if (this.gameMode) return;
    const targetWord = event.target.closest('.item-word');
    if (targetWord !== null) {
      const currentNumber = targetWord.dataset.number;
      let currentPage = this.page + 1;
      if (currentPage < 10) {
        currentPage = `0${currentPage}`;
      }
      this.wordImage.src = `https://raw.githubusercontent.com/inq666/rslang-data/master/data/${currentPage}_${currentNumber}.jpg`;
      this.audio.src = `https://raw.githubusercontent.com/inq666/rslang-data/master/data/${currentPage}_${currentNumber}.mp3`;
      this.stringWord.textContent = targetWord.querySelector('.translate').textContent.toUpperCase();
      this.blockWords.querySelectorAll('.item-word').forEach((item) => {
        item.classList.remove('item-word-active');
        targetWord.classList.add('item-word-active');
      });
    }
  }
}


const words = new Words();
words.createDOM();
words.addEventListener();
