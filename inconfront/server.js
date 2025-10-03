const { createServer } = require('http');
const next = require('next');

const app = next({ dev: false }); // Aquí se indica que está en modo producción
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Server ready on http://localhost:${process.env.PORT || 3000}`);
  });
});
