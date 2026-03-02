import Phaser from 'phaser';

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
        this.time.delayedCall(400, () => {
          this.scene.start('CountrySelectScene');
        });
      },
    });
  }
}
