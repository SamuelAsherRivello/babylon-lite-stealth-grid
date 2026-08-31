import {
  BABYLON_LITE_SPRITE_API,
  createAsepriteSpriteInstance,
  loadAsepriteSpriteAtlas,
  validateAsepriteSpriteDescriptor,
} from "../../plugins/aseprite-babylon-lite/index.js";

export class AnimatedParticleEffect {
  static descriptor = null;

  static async create(options) {
    const descriptor = validateAsepriteSpriteDescriptor(this.descriptor);
    const api = options.api ?? BABYLON_LITE_SPRITE_API;
    const atlas = options.atlas
      ?? await loadAsepriteSpriteAtlas(options.engine, descriptor, api);

    return new this({ ...options, api, atlas });
  }

  constructor({
    atlas,
    animationManager,
    position,
    order = 0,
    visible,
    api = BABYLON_LITE_SPRITE_API,
  }) {
    this.descriptor = validateAsepriteSpriteDescriptor(
      this.constructor.descriptor,
    );
    this.animationManager = animationManager;
    this.api = api;
    this.animation = null;
    this.isPlaying = false;

    const instance = createAsepriteSpriteInstance({
      atlas,
      descriptor: this.descriptor,
      position,
      order,
      visible,
      api,
    });
    this.layer = instance.layer;
    this.sprite = instance.sprite;
  }

  play() {
    const { frameCount, frameDurationMs, loop } = this.descriptor;
    if (this.animation === null) {
      this.animation = this.api.playSprite2DAnimation(
        this.animationManager,
        this.sprite,
        0,
        frameCount - 1,
        loop,
        frameDurationMs,
      );
    } else {
      this.api.playSpriteFrameAnimation(
        this.animation,
        0,
        frameCount - 1,
        loop,
        frameDurationMs,
      );
    }
    this.isPlaying = true;
    return this;
  }

  playOnce(onComplete) {
    const { frameCount, frameDurationMs } = this.descriptor;
    const options = { onEnd: () => {
      this.isPlaying = false;
      if (onComplete) onComplete();
    } };
    if (this.animation !== null && this.isPlaying) this.api.stopSpriteAnimation(this.animation);
    this.animation = this.api.playSprite2DAnimation(
      this.animationManager, this.sprite, 0, frameCount - 1, false, frameDurationMs, options,
    );
    this.isPlaying = true;
    return this;
  }

  stop() {
    if (this.animation !== null && this.isPlaying) {
      this.api.stopSpriteAnimation(this.animation);
    }
    this.isPlaying = false;
    return this;
  }

  dispose() {
    this.stop();
    this.layer.visible = false;
    if (this.api.removeSprite2D) this.api.removeSprite2D(this.sprite);
  }
}
