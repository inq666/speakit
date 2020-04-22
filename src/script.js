class Words {
  constructor() {
    this.name = 'words';
    this.currentGroup = '0';
  }

  createDOM() {
    this.startButton = document.querySelector('.start-btn');
    this.blockWords = document.querySelector('.block-words');
  }

  addEventListener() {
    this.startButton.addEventListener('click', () => this.getWords());
  }

  async getWords() {
    const page = Math.floor(Math.random() * (29 + 1));
    const url = `https://afternoon-falls-25894.herokuapp.com/words?page=${page}&group=${this.currentGroup}`;
    const res = await fetch(url);
    const json = await res.json();
    this.createWords(json);
  }

  async createWords(json) {
    for (let i = 0; i < this.blockWords.children.length; i += 1) {
      const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200422T174219Z.a6338781f9423192.28f2896df71fd9376630fd91e64a03518d511f99&text= ${json[i].word} &lang=en-ru`;
      const res = await fetch(url);
      const data = await res.json();
      this.blockWords.children[i].querySelector('.word').textContent = json[i].word;
      this.blockWords.children[i].querySelector('.transcription').textContent = json[i].transcription;
      this.blockWords.children[i].querySelector('.translate').textContent = data.text;
    }
  }
}


const words = new Words();
words.createDOM();
words.addEventListener();
