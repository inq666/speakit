const getWords = async (page, group) => {
  const url = `https://afternoon-falls-25894.herokuapp.com/words?page=${page}&group=${group}`;
  const res = await fetch(url);
  const json = await res.json();
  console.log(JSON.stringify(json, null, 1));
};

getWords(1, 1)
