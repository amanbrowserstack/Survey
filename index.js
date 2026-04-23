const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello! This is Nike.net intended for internal use only. Goto: https://nikee.com');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/api`);
});
