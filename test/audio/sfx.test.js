import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { createSfxPlayer, SFX_FILES, isInteractiveButton } from "../../src/audio/sfx.js";

test("assigned sound files exist and Attack05 is excluded", async () => {
  assert.equal(Object.keys(SFX_FILES).length, 11);
  assert.ok(!Object.values(SFX_FILES).includes("Attack05.mp3"));
  await Promise.all(Object.values(SFX_FILES).map(file => access(new URL(`../../public/audio/sfx/${file}`, import.meta.url))));
});

test("playback unlocks, overlaps, respects mute and live volume", async () => {
  let volume = 50;
  const sources = [];
  const gain = { gain: { value: 1 }, connect() {} };
  const gains = [];
  const context = {
    state: "suspended", destination: {},
    createGain: () => {
      const node = gains.length === 0 ? gain : { gain: { value: 1 }, connect() {}, disconnect() {} };
      gains.push(node);
      return node;
    },
    decodeAudioData: async data => data,
    resume() { this.state = "running"; return Promise.resolve(); },
    createBufferSource() {
      const source = { playbackRate: { value: 1 }, connect() {}, start() { this.started = true; }, disconnect() {} };
      sources.push(source); return source;
    }, close() { return Promise.resolve(); },
  };
  const player = createSfxPlayer({ context, baseUrl: "/game/", volume: () => volume,
    fetchAudio: async url => {
      assert.ok(url.startsWith("/game/audio/sfx/"));
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    } });
  await player.ready;
  assert.equal(player.play("pickup"), false);
  await player.unlock();
  assert.equal(player.play("pickup"), true);
  assert.equal(player.play("goblin"), true);
  assert.equal(sources.length, 2);
  for (const pitch of [0.65, 0.82, 1]) {
    assert.equal(player.play("alert", { pitch, volume: 0.2 }), true);
    assert.equal(sources.at(-1).playbackRate.value, pitch);
    assert.equal(gains.at(-1).gain.value, 0.2);
  }
  assert.ok(sources.every(source => source.started));
  assert.equal(gain.gain.value, 0.5);
  volume = 0;
  player.setVolume(volume);
  assert.equal(gain.gain.value, 0);
  assert.equal(player.play("win"), false);
  assert.equal(player.play("unknown"), false);
});

test("button click eligibility excludes disabled and hidden controls", () => {
  const target = (disabled, hidden) => ({ closest: () => ({ matches: () => disabled, closest: () => hidden }) });
  assert.equal(isInteractiveButton(target(false, null)), true);
  assert.equal(isInteractiveButton(target(true, null)), false);
  assert.equal(isInteractiveButton(target(false, {})), false);
  assert.equal(isInteractiveButton({ closest: () => null }), false);
});
