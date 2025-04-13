import express from "express";

// This is just a development server for easy testing. The actual
// deployment will be a static app, but this lets us do things like
// e.g. pretend we're fetching the `xml` files from the real server,
// since I think that one is locked behind a CORS policy we can't
// send a request too from a browser.
//
// We can use this dev server as a sort of a proxy for the remote server
// and go from there.
//
// Doing a fetch on this app on whatever resource is the same as doing it
// on the remote.
const app = express();
const port = 8000;

app.listen(port, () => console.log(`Listening on ${port}`))

async function proxy(req, res) {
  console.log(req.url);
  const resp = await fetch(`https://w3.winona.edu/${req.url}`, {
    "headers": {
        "Accept": "application/xml",
        "Host": "w3.winona.edu",
    },
    "method": "GET",
  });
  const body = await resp.text();
  res.set("Content-Type", "application/xml");
  res.status(200).send(body);
}

app.get("/locations/api/themes/:id", proxy)
app.get("/locations/api/themes", proxy)
app.get("/locations/api/entities/:id", proxy)
app.use(express.static("static/"))
