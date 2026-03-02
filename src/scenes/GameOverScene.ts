import Phaser from 'phaser';
import { GameOverData } from '../types';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    this.add.rectangle(cx, cy, width, height, 0x1a1a2e);

    if (data.victoire) {
      // Victory overlay
      this.add.rectangle(cx, cy, width, height, 0x1a3a1a, 0.4);

      this.add.text(cx, cy - 180, '🏆 Félicitations!', {
        fontSize: '42px',
        color: '#FFD700',
        fontStyle: 'bold',
        align: 'center',
      }).setOrigin(0.5);

      this.add.text(cx, cy - 110, 'Vous avez atteint 1 000 000 $!', {
        fontSize: '24px',
        color: '#90EE90',
        align: 'center',
      }).setOrigin(0.5);
    } else {
      // Defeat overlay
      this.add.rectangle(cx, cy, width, height, 0x3a1a1a, 0.4);

      this.add.text(cx, cy - 180, '💀 Vous avez perdu.', {
        fontSize: '36px',
        color: '#FF6666',
        fontStyle: 'bold',
        align: 'center',
      }).setOrigin(0.5);

      this.add.text(cx, cy - 120, 'Votre valeur nette est tombée à 0 $ ou le temps est écoulé.', {
        fontSize: '16px',
        color: '#FFAAAA',
        align: 'center',
        wordWrap: { width: 600 },
      }).setOrigin(0.5);
    }

    // Stats panel
    const statsY = cy - 40;
    const panelW = 500;
    const panelH = 200;
    this.add.rectangle(cx, statsY + panelH / 2, panelW, panelH, 0x0f0f23).setOrigin(0.5);
    this.add.rectangle(cx, statsY + panelH / 2, panelW, panelH, 0x333355, 0).setStrokeStyle(1, 0x333355);

    const statStyle = { fontSize: '16px', color: '#E8E8E8' };
    const valeurStr = Math.round(data.valeurNette).toLocaleString('fr-FR');
    const stats = [
      `💰 Valeur nette finale: ${valeurStr} $`,
      `🔄 Tours joués: ${data.tours} / 30`,
      `🌍 Pays: ${data.pays}`,
      `💼 Voie: ${data.voie}`,
    ];

    stats.forEach((stat, i) => {
      this.add.text(cx, statsY + 20 + i * 40, stat, statStyle).setOrigin(0.5, 0);
    });

    // Replay button
    const replayBg = this.add.rectangle(cx, cy + 200, 220, 50, 0xFFD700);
    replayBg.setStrokeStyle(2, 0xFFA500);

    this.add.text(cx, cy + 200, '🔄 Rejouer', {
      fontSize: '20px',
      color: '#1a1a2e',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    replayBg.setInteractive({ useHandCursor: true });
    replayBg.on('pointerover', () => replayBg.setAlpha(0.8));
    replayBg.on('pointerout', () => replayBg.setAlpha(1));
    replayBg.on('pointerdown', () => {
      this.scene.start('CountrySelectScene');
    });
  }
}
