import Phaser from 'phaser';
import { DIALOGUES } from '../data/dialogues';

type Emotion = 'neutre' | 'heureux' | 'triste' | 'inquiet' | 'excite';

export class AssistantScene extends Phaser.Scene {
  private kofiBody!: Phaser.GameObjects.Arc;
  private mouthGraphics!: Phaser.GameObjects.Graphics;
  private bubble!: Phaser.GameObjects.Container;
  private bubbleText!: Phaser.GameObjects.Text;
  private nextBtn!: Phaser.GameObjects.Text;
  private currentLines: string[] = [];
  private currentLineIndex = 0;
  private isSpeaking = false;
  private lineTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'AssistantScene' });
  }

  create(): void {
    const { height } = this.scale;
    const avatarX = 80;
    const avatarY = height - 80;

    this.createKofi(avatarX, avatarY);
    this.createBubble(avatarX, avatarY);
    this.hideBubble();
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  afficherDialogue(trigger: string): void {
    let lines = DIALOGUES[trigger];
    if (!lines || lines.length === 0) return;

    // For random-variant triggers (evenement_positif / evenement_negatif) pick one line
    if (trigger === 'evenement_positif' || trigger === 'evenement_negatif') {
      const idx = Math.floor(Math.random() * lines.length);
      lines = [lines[idx]];
    }

    const emotion: Emotion =
      trigger.includes('positif') || trigger === 'victoire' || trigger === 'upgrade_disponible'
        ? 'heureux'
        : trigger.includes('negatif') || trigger === 'defaite'
        ? 'triste'
        : trigger === 'argent_bas' || trigger === 'tour_25'
        ? 'inquiet'
        : trigger.includes('onboarding')
        ? 'excite'
        : 'neutre';

    this.startLines(lines, emotion);
  }

  afficherMessage(message: string, emotion: Emotion = 'neutre'): void {
    this.startLines([message], emotion);
  }

  estEnTrain(): boolean {
    return this.isSpeaking;
  }

  // ─── Kofi avatar ─────────────────────────────────────────────────────────────

  private createKofi(x: number, y: number): void {
    // Body circle
    this.kofiBody = this.add.circle(x, y, 32, 0xe8822a);

    // Eyes
    this.add.circle(x - 10, y - 8, 5, 0xffffff);
    this.add.circle(x + 10, y - 8, 5, 0xffffff);
    this.add.circle(x - 10, y - 8, 2, 0x333333);
    this.add.circle(x + 10, y - 8, 2, 0x333333);

    // Mouth (redrawn based on emotion)
    this.mouthGraphics = this.add.graphics();
    this.drawMouth(x, y, 'neutre');
  }

  private drawMouth(x: number, y: number, emotion: Emotion): void {
    const g = this.mouthGraphics;
    g.clear();
    g.lineStyle(2, 0x333333, 1);
    const mx = x;
    const my = y + 10;

    if (emotion === 'heureux' || emotion === 'excite') {
      // Smile
      g.beginPath();
      g.moveTo(mx - 10, my);
      g.lineTo(mx - 5, my + 6);
      g.lineTo(mx + 5, my + 6);
      g.lineTo(mx + 10, my);
      g.strokePath();
    } else if (emotion === 'triste') {
      // Frown
      g.beginPath();
      g.moveTo(mx - 10, my + 6);
      g.lineTo(mx - 5, my);
      g.lineTo(mx + 5, my);
      g.lineTo(mx + 10, my + 6);
      g.strokePath();
    } else if (emotion === 'inquiet') {
      // Wavy line
      g.beginPath();
      g.moveTo(mx - 10, my + 3);
      g.lineTo(mx - 5, my);
      g.lineTo(mx, my + 5);
      g.lineTo(mx + 5, my);
      g.lineTo(mx + 10, my + 3);
      g.strokePath();
    } else {
      // Neutral flat line
      g.beginPath();
      g.moveTo(mx - 8, my + 2);
      g.lineTo(mx + 8, my + 2);
      g.strokePath();
    }
  }

  private bounceKofi(): void {
    this.tweens.add({
      targets: this.kofiBody,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  // ─── Dialogue bubble ─────────────────────────────────────────────────────────

  private createBubble(avatarX: number, avatarY: number): void {
    const bubbleW = 420;
    const bubbleH = 80;
    const bubbleX = avatarX + 60;
    const bubbleY = avatarY - 50;

    this.bubble = this.add.container(bubbleX, bubbleY);

    const bg = this.add.rectangle(bubbleW / 2, 0, bubbleW, bubbleH, 0xfff8e7)
      .setStrokeStyle(2, 0xffd700)
      .setOrigin(0, 0.5);

    this.bubbleText = this.add.text(12, 0, '', {
      fontSize: '13px',
      color: '#222222',
      wordWrap: { width: bubbleW - 24 },
      align: 'left',
    }).setOrigin(0, 0.5);

    this.nextBtn = this.add.text(bubbleW - 10, bubbleH / 2 - 8, '[Suivant →]', {
      fontSize: '11px',
      color: '#996600',
      fontStyle: 'bold',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    this.nextBtn.on('pointerdown', () => this.showNextLine());

    this.bubble.add([bg, this.bubbleText, this.nextBtn]);
  }

  private hideBubble(): void {
    this.bubble.setAlpha(0);
    this.bubble.setVisible(false);
  }

  private showBubble(): void {
    this.bubble.setVisible(true);
    this.bubble.setAlpha(1);
  }

  // ─── Line sequencing ─────────────────────────────────────────────────────────

  private startLines(lines: string[], emotion: Emotion): void {
    if (this.lineTimer) {
      this.lineTimer.remove(false);
      this.lineTimer = undefined;
    }

    this.currentLines = lines;
    this.currentLineIndex = 0;
    this.isSpeaking = true;

    const { height } = this.scale;
    this.drawMouth(80, height - 80, emotion);
    this.showBubble();
    this.displayLine(lines[0]);
  }

  private displayLine(line: string): void {
    this.bubbleText.setText(line);
    this.bounceKofi();
    this.nextBtn.setVisible(true);

    // Auto-advance after 2.5s
    this.lineTimer = this.time.delayedCall(2500, () => {
      this.showNextLine();
    });
  }

  private showNextLine(): void {
    if (this.lineTimer) {
      this.lineTimer.remove(false);
      this.lineTimer = undefined;
    }

    this.currentLineIndex++;

    if (this.currentLineIndex < this.currentLines.length) {
      this.displayLine(this.currentLines[this.currentLineIndex]);
    } else {
      // Last line — fade out after 3s
      this.time.delayedCall(3000, () => {
        this.tweens.add({
          targets: this.bubble,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.bubble.setVisible(false);
            this.isSpeaking = false;
          },
        });
      });
      this.nextBtn.setVisible(false);
    }
  }
}
