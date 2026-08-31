export { AnimatedParticleEffect } from "./AnimatedParticleEffect.js";
import { Dust01ParticleEffect } from "./dust-01/Dust01ParticleEffect.js";
import { Dust02ParticleEffect } from "./dust-02/Dust02ParticleEffect.js";
import { Explosion01ParticleEffect } from "./explosion-01/Explosion01ParticleEffect.js";
import { Explosion02ParticleEffect } from "./explosion-02/Explosion02ParticleEffect.js";
import { Fire01ParticleEffect } from "./fire-01/Fire01ParticleEffect.js";
import { Fire02ParticleEffect } from "./fire-02/Fire02ParticleEffect.js";
import { Fire03ParticleEffect } from "./fire-03/Fire03ParticleEffect.js";
import { WaterSplashParticleEffect } from "./water-splash/WaterSplashParticleEffect.js";

export {
  Dust01ParticleEffect,
  Dust02ParticleEffect,
  Explosion01ParticleEffect,
  Explosion02ParticleEffect,
  Fire01ParticleEffect,
  Fire02ParticleEffect,
  Fire03ParticleEffect,
  WaterSplashParticleEffect,
};

export const PARTICLE_FX_CLASS_BY_KEY = Object.freeze({
  dust01: Dust01ParticleEffect,
  dust02: Dust02ParticleEffect,
  explosion01: Explosion01ParticleEffect,
  explosion02: Explosion02ParticleEffect,
  fire01: Fire01ParticleEffect,
  fire02: Fire02ParticleEffect,
  fire03: Fire03ParticleEffect,
  waterSplash: WaterSplashParticleEffect,
});
