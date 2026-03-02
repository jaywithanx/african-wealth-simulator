import Phaser from 'phaser';
import { SaveService } from '../services/SaveService';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Title
    this.add.text(cx, cy - 100, 'Simulateur de Richesse Africaine', {
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 50, '🌍 Bâtissez votre empire économique', {
      fontSize: '18px',
      color: '#E8E8E8',
      align: 'center',
    }).setOrigin(0.5);

    // Progress bar background
    const barBg = this.add.rectangle(cx, cy + 30, 400, 20, 0x333355);
    barBg.setOrigin(0.5);

    const barFill = this.add.rectangle(cx - 200, cy + 30, 0, 20, 0xFFD700);
    barFill.setOrigin(0, 0.5);

    const loadingText = this.add.text(cx, cy + 65, 'Chargement...', {
      fontSize: '14px',
      color: '#AAAAAA',
    }).setOrigin(0.5);

    // Animate loading bar
    this.tweens.add({
      targets: barFill,
      width: 400,
      duration: 1500,
      ease: 'Linear',
      onComplete: () => {
        loadingText.setText('Prêt !');

        // Show resume button if save exists
        if (SaveService.hasSave()) {
          const resumeBg = this.add.rectangle(cx, cy + 110, 280, 48, 0x1a4a1a);
          resumeBg.setStrokeStyle(2, 0xFFD700);

          this.add.text(cx, cy + 110, '▶ Reprendre la partie', {
            fontSize: '18px',
            color: '#FFD700',
            fontStyle: 'bold',
          }).setOrigin(0.5);

          resumeBg.setInteractive({ useHandCursor: true });
          resumeBg.on('pointerover', () => resumeBg.setAlpha(0.8));
          resumeBg.on('pointerout', () => resumeBg.setAlpha(1));
          resumeBg.on('pointerdown', () => {
            const saved = SaveService.load();
            if (saved) {
              this.scene.start('GameScene', { savedState: saved });
            }
          });
        }

        this.time.delayedCall(400, () => {
          if (!SaveService.hasSave()) {
            this.scene.start('CountrySelectScene');
          }
        });
      },
    });
  }
}
