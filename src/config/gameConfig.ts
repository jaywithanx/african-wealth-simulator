import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { CountrySelectScene } from '../scenes/CountrySelectScene';
import { GameScene } from '../scenes/GameScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { AssistantScene } from '../scenes/AssistantScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 900,
  height: 650,
  backgroundColor: '#1a1a2e',
  scene: [BootScene, CountrySelectScene, GameScene, GameOverScene, AssistantScene],
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
