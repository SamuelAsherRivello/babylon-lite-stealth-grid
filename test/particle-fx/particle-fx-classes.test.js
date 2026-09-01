import test from "node:test";
import assert from "node:assert/strict";

import { AnimatedParticleEffect } from "../../src/particle-fx/AnimatedParticleEffect.js";
import {
  Dust01ParticleEffect,
  Dust02ParticleEffect,
  Explosion01ParticleEffect,
  Explosion02ParticleEffect,
  Fire01ParticleEffect,
  Fire02ParticleEffect,
  Fire03ParticleEffect,
  WaterSplashParticleEffect,
} from "../../src/particle-fx/index.js";
import { PARTICLE_FX_CATALOG } from "../../src/particle-fx/particle-fx.catalog.js";

const CLASSES = [
  [Dust01ParticleEffect, PARTICLE_FX_CATALOG.dust01],
  [Dust02ParticleEffect, PARTICLE_FX_CATALOG.dust02],
  [Explosion01ParticleEffect, PARTICLE_FX_CATALOG.explosion01],
  [Explosion02ParticleEffect, PARTICLE_FX_CATALOG.explosion02],
  [Fire01ParticleEffect, PARTICLE_FX_CATALOG.fire01],
  [Fire02ParticleEffect, PARTICLE_FX_CATALOG.fire02],
  [Fire03ParticleEffect, PARTICLE_FX_CATALOG.fire03],
  [WaterSplashParticleEffect, PARTICLE_FX_CATALOG.waterSplash],
];

test("every Particle FX animation has an independently importable class", () => {
  assert.equal(CLASSES.length, 8);
  for (const [EffectClass, descriptor] of CLASSES) {
    assert.equal(EffectClass.descriptor, descriptor);
    assert.ok(EffectClass.prototype instanceof AnimatedParticleEffect);
    assert.equal(typeof EffectClass.prototype.play, "function");
    assert.equal(typeof EffectClass.prototype.stop, "function");
  }
});

test("every concrete class constructs with its corresponding descriptor", async () => {
  const api = {
    async loadSpriteAtlas() { return {}; },
    createSprite2DLayer() { return { view: { zoom: 1 } }; },
    addSprite2D() { return {}; },
    playSprite2DAnimation() { return {}; },
    playSpriteFrameAnimation() {},
    stopSpriteAnimation() {},
  };

  for (const [EffectClass, descriptor] of CLASSES) {
    const effect = await EffectClass.create({
      engine: {},
      animationManager: {},
      position: [0, 0],
      api,
    });
    assert.equal(effect.descriptor, descriptor);
  }
});
