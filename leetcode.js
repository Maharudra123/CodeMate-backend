const countSubstr = (s, k) => {
  // Create an array to store substrings
  const substrings = [];

  for (let i = 0; i <= s.length - k; i++) {
    substrings.push(s.substring(i, i + k));
  }
  console.log(substrings);

  console.log(substrings.length);
};

countSubstr("aba", 2);
