class Words {
  constructor() {
    this.audio = new Audio();
    this.audio.autoplay = true;
    this.gameMode = false;
    this.currentGroup = '0';
    window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
    this.recognition = new window.SpeechRecognition();
  }

  createDOM() {
    this.wordImage = document.querySelector('.word-image');
    this.startButton = document.querySelector('.start-btn');
    this.blockWords = document.querySelector('.block-words');
    this.stringWord = document.querySelector('.word-string');
    this.speakButton = document.querySelector('.speak-btn');
    this.menu = document.querySelector('.menu');
  }

  addEventListener() {
    this.menu.addEventListener('click', (event) => this.selectcCmplexity(event));
    this.speakButton.addEventListener('click', () => this.startGame());
    this.startButton.addEventListener('click', () => this.getWords());
    this.blockWords.addEventListener('click', (event) => this.audioWord(event));
    this.recognition.addEventListener('result', (event) => this.recording(event));
    this.recognition.addEventListener('end', this.recognition.start);
  }

  selectcCmplexity(event) {
    const targetChain = event.target;
    if (targetChain.classList.contains(('chain'))) {
      if (targetChain.classList.contains('chain-active')) return;
      this.menu.querySelectorAll('.chain').forEach((item) => {
        item.classList.remove('chain-active');
        targetChain.classList.add('chain-active');
      });
      this.blockWords.querySelectorAll('.item-word').forEach((item) => {
        item.classList.remove('item-word-active');
      });
      this.currentGroup = targetChain.dataset.level - 1;
      this.getWords();
    }
  }

  startGame() {
    this.recognition.start();
    this.gameMode = true;
    this.stringWord.textContent = '';
    this.stringWord.classList.add('play-game');
    document.querySelector('.stars').style.opacity = '1';
  }


  recording(event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    if (event.results[0].isFinal) {
      this.stringWord.textContent = transcript;
      Array.from(this.blockWords.children).forEach((item) => {
        if (item.querySelector('.word').textContent === transcript) {
          item.classList.add('guessed-word');
          this.audio.src = 'audio/correct.mp3';
          const newStar = document.querySelector('.star-lose');
          newStar.classList.add('star-win');
          newStar.classList.remove('star-lose');
        }
      });
    }
  }

  async getWords() {
    document.querySelector('.start-window').style.display = 'none';
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
      this.blockWords.children[i].querySelector('.word').textContent = json[i].word;
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
      this.wordImage.src = `https://raw.githubusercontent.com/inq666/rslang-data/master/data/${this.page + 1}_${currentNumber}.jpg`;
      this.audio.src = `https://raw.githubusercontent.com/inq666/rslang-data/master/data/${this.page + 1}_${currentNumber}.mp3`;
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
