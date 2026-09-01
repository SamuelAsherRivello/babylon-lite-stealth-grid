import {
  playSpriteFrameAnimation,
  stopSpriteAnimation,
} from "@babylonjs/lite";

const DEFAULT_ANIMATION_API = Object.freeze({
  playSpriteFrameAnimation,
  stopSpriteAnimation,
});

export function applyParticleFxPreviewSetting(effects, enabled) {
  for (const effect of effects) {
    effect.layer.visible = enabled;
    if (enabled) {
      effect.play();
    } else {
      effect.stop();
    }
  }
}

export function applyAnimatedTilePreviewSetting(
  layer,
  animation,
  enabled,
  api = DEFAULT_ANIMATION_API,
  options = {},
) {
  layer.visible = enabled;
  if (enabled) {
    api.playSpriteFrameAnimation(
      animation,
      options.from ?? 0,
      options.to ?? 0,
      options.loop ?? true,
      options.frameDurationMs ?? 100,
    );
  } else {
    api.stopSpriteAnimation(animation);
  }
}
