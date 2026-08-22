import assert from "node:assert/strict";
import test from "node:test";

test("renders the public project and contribution path", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /The open map of humanity/);
  assert.match(html, /A memome is the set of memes present in a population/);
  assert.match(html, /visible by default/);
  assert.match(html, /How Open Memome evaluates a meme/);
  assert.match(html, /github\.com\/open-memome\/open-memome\/issues\/new/);
  assert.doesNotMatch(html, /Proposal downloaded|example reviews|Download proposal/);
  assert.doesNotMatch(html, /What belongs on the map/);
});
