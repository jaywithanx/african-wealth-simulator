import Phaser from 'phaser';
import { Country, WealthPath, GameState, GameEvent, ActiveEffect } from '../types';
import { EVENTS } from '../data/events';
import { SaveService } from '../services/SaveService';
import { AssistantScene } from './AssistantScene';

const MAX_TOURS = 30;
const OBJECTIF_VICTOIRE = 1_000_000;
const COUT_UPGRADE_N2 = 50_000;
const COUT_UPGRADE_N3 = 200_000;
const COUT_IMMOBILIER = 20_000;
const REVENU_IMMOBILIER = 2_000;

export class GameScene extends Phaser.Scene {
  private state!: GameState;
  private hudTexts: Record<string, Phaser.GameObjects.Text> = {};
  private eventPanel!: Phaser.GameObjects.Container;
  private actionPanel!: Phaser.GameObjects.Container;
  private progressBar!: Phaser.GameObjects.Rectangle;
  private progressLabel!: Phaser.GameObjects.Text;
  private kofi?: AssistantScene;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { pays: Country; voie: WealthPath } | { savedState: GameState }): void {
    if ('savedState' in data) {
      this.state = data.savedState;
    } else {
      const revenuBase = this.calculateRevenu(data.pays, data.voie, 1, []);
      this.state = {
        pays: data.pays,
        voie: data.voie,
        valeurNette: data.pays.revenuBase * 2,
        revenuParTour: revenuBase,
        actifs: 0,
        tourActuel: 1,
        niveauVoie: 1,
        effetsActifs: [],
      };
    }
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Background
    this.add.rectangle(cx, height / 2, width, height, 0x1a1a2e);

    // HUD bar background
    this.add.rectangle(cx, 35, width, 70, 0x0f0f23);

    this.createHUD();
    this.createProgressBar();
    this.createActionPanel();
    this.createEventPanel();

    this.refreshHUD();
    this.refreshProgressBar();
    this.refreshActionPanel();

    // Launch Kofi assistant
    this.scene.launch('AssistantScene');
    this.kofi = this.scene.get('AssistantScene') as AssistantScene;

    // Onboarding if first time
    const onboarded = localStorage.getItem('kofi_onboarded');
    if (!onboarded) {
      localStorage.setItem('kofi_onboarded', '1');
      this.time.delayedCall(500, () => {
        this.kofi?.afficherDialogue('onboarding_bienvenue');
        this.time.delayedCall(3000, () => {
          const pathTrigger = `onboarding_${this.state.voie.id}`;
          this.kofi?.afficherDialogue(pathTrigger);
          this.time.delayedCall(3000, () => {
            this.kofi?.afficherDialogue('onboarding_premier_tour');
          });
        });
      });
    }
  }

  // ─── HUD ────────────────────────────────────────────────────────────────────

  private createHUD(): void {
    const topY = 18;
    const style = { fontSize: '13px', color: '#FFD700' };
    const positions = [20, 170, 340, 490, 620, 760];
    const keys = ['valeurNette', 'revenu', 'actifs', 'tour', 'pays', 'voie'];

    keys.forEach((key, i) => {
      this.hudTexts[key] = this.add.text(positions[i], topY, '', style);
    });

    // Second row
    this.hudTexts['niveauVoie'] = this.add.text(20, 42, '', {
      fontSize: '12px',
      color: '#CCCCCC',
    });
  }

  private refreshHUD(): void {
    const s = this.state;
    this.hudTexts['valeurNette'].setText(`💰 ${this.fmt(s.valeurNette)}`);
    this.hudTexts['revenu'].setText(`📈 ${this.fmt(s.revenuParTour)}/tour`);
    this.hudTexts['actifs'].setText(`🏦 Actifs: ${this.fmt(s.actifs)}`);
    this.hudTexts['tour'].setText(`🔄 Tour: ${s.tourActuel}/${MAX_TOURS}`);
    this.hudTexts['pays'].setText(`🌍 ${s.pays.nom}`);
    this.hudTexts['voie'].setText(`💼 ${s.voie.emoji} ${s.voie.nom}`);
    this.hudTexts['niveauVoie'].setText(`Niveau voie: ${s.niveauVoie}`);
  }

  // ─── Progress Bar ─────────────────────────────────────────────────────────────

  private createProgressBar(): void {
    const { width } = this.scale;
    const barY = 74;
    const barW = width - 200 - 20;
    const barX = 10;

    this.add.rectangle(barX + barW / 2, barY, barW, 12, 0x333355).setOrigin(0.5);
    this.progressBar = this.add.rectangle(barX, barY, 0, 12, 0xff4444).setOrigin(0, 0.5);
    this.progressLabel = this.add.text(barX + barW / 2, barY + 8, '', {
      fontSize: '10px',
      color: '#CCCCCC',
    }).setOrigin(0.5, 0);
  }

  private refreshProgressBar(): void {
    const pct = Math.min(1, this.state.valeurNette / OBJECTIF_VICTOIRE);
    const { width } = this.scale;
    const barW = width - 200 - 20;
    const newW = Math.round(pct * barW);
    this.progressBar.setDisplaySize(Math.max(2, newW), 12);
    // Color: red→green
    const r = Math.round(255 * (1 - pct));
    const g = Math.round(220 * pct);
    const color = (r << 16) | (g << 8);
    this.progressBar.setFillStyle(color);
    this.progressLabel.setText(`Objectif: ${Math.round(pct * 100)}% atteint`);
  }

  // ─── Action Panel ────────────────────────────────────────────────────────────

  private createActionPanel(): void {
    const { width, height } = this.scale;
    const panelX = width - 185;
    const panelY = 120;
    const panelW = 340;
    const panelH = height - 140;

    this.actionPanel = this.add.container(panelX, panelY);

    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x0f0f23).setOrigin(0);
    bg.setStrokeStyle(1, 0x333355);

    const title = this.add.text(panelW / 2, 14, '⚡ Actions', {
      fontSize: '16px',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.actionPanel.add([bg, title]);
    this.actionPanel.setData('bg', bg);
    this.actionPanel.setData('title', title);
  }

  private refreshActionPanel(): void {
    // Remove old buttons (keep bg + title)
    while (this.actionPanel.length > 2) {
      const child = this.actionPanel.getAt(2) as Phaser.GameObjects.GameObject;
      child.destroy();
      this.actionPanel.removeAt(2);
    }

    const s = this.state;
    const panelW = 340;
    let btnY = 50;
    const btnW = panelW - 20;
    const btnH = 52;

    // Upgrade button
    const nextNiveau = s.niveauVoie + 1;
    const upgradeCost = nextNiveau === 2 ? COUT_UPGRADE_N2 : nextNiveau === 3 ? COUT_UPGRADE_N3 : null;
    if (upgradeCost !== null) {
      const canAfford = s.valeurNette >= upgradeCost;
      const upgradeBtn = this.createActionButton(
        panelW / 2,
        btnY,
        btnW,
        btnH,
        `Améliorer votre activité\nNiveau ${nextNiveau} — Coût: ${this.fmt(upgradeCost)}`,
        canAfford ? 0x1a4a1a : 0x333333,
        canAfford ? 0x00FF88 : 0x666666,
        canAfford,
        () => this.doUpgrade(upgradeCost, nextNiveau),
      );
      this.actionPanel.add(upgradeBtn);
      btnY += btnH + 12;
    } else {
      const maxText = this.add.text(panelW / 2, btnY + 20, '✅ Activité au niveau maximum!', {
        fontSize: '13px',
        color: '#00FF88',
        align: 'center',
        wordWrap: { width: btnW },
      }).setOrigin(0.5, 0);
      this.actionPanel.add(maxText);
      btnY += 50;
    }

    // Real estate button
    const canBuyRE = s.valeurNette >= COUT_IMMOBILIER;
    const reBtn = this.createActionButton(
      panelW / 2,
      btnY,
      btnW,
      btnH,
      `Investir dans l'immobilier\nCoût: ${this.fmt(COUT_IMMOBILIER)} → +${this.fmt(REVENU_IMMOBILIER)}/tour`,
      canBuyRE ? 0x1a2a4a : 0x333333,
      canBuyRE ? 0x87CEEB : 0x666666,
      canBuyRE,
      () => this.doRealEstate(),
    );
    this.actionPanel.add(reBtn);
    btnY += btnH + 12;

    // Separator
    const sep = this.add.rectangle(panelW / 2, btnY + 5, btnW, 1, 0x333355).setOrigin(0.5, 0);
    this.actionPanel.add(sep);
    btnY += 18;

    // Next turn button
    const nextBtn = this.createActionButton(
      panelW / 2,
      btnY,
      btnW,
      btnH,
      'Passer au tour suivant ▶',
      0x3a2a00,
      0xFFD700,
      true,
      () => this.doNextTurn(),
    );
    this.actionPanel.add(nextBtn);

    // Active effects display
    if (s.effetsActifs.length > 0) {
      btnY += btnH + 20;
      const effTitle = this.add.text(panelW / 2, btnY, '⚡ Effets actifs:', {
        fontSize: '12px',
        color: '#FFAA00',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0);
      this.actionPanel.add(effTitle);
      btnY += 18;

      s.effetsActifs.forEach((eff) => {
        const effText = this.add.text(panelW / 2, btnY, `${eff.eventId} (${eff.toursRestants} tour(s))`, {
          fontSize: '10px',
          color: eff.valeur > 0 ? '#90EE90' : '#FF9999',
          wordWrap: { width: btnW },
          align: 'center',
        }).setOrigin(0.5, 0);
        this.actionPanel.add(effText);
        btnY += 16;
      });
    }
  }

  private createActionButton(
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    fillColor: number,
    textColor: number | string,
    enabled: boolean,
    callback: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, w, h, fillColor).setOrigin(0.5);
    bg.setStrokeStyle(1, typeof textColor === 'number' ? textColor : 0x888888);

    const label = this.add.text(0, 0, text, {
      fontSize: '12px',
      color: typeof textColor === 'number' ? `#${textColor.toString(16).padStart(6, '0')}` : textColor,
      align: 'center',
      wordWrap: { width: w - 12 },
    }).setOrigin(0.5);

    container.add([bg, label]);

    if (enabled) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setAlpha(0.8));
      bg.on('pointerout', () => bg.setAlpha(1));
      bg.on('pointerdown', callback);
    }

    return container;
  }

  // ─── Event Panel ─────────────────────────────────────────────────────────────

  private createEventPanel(): void {
    const { width } = this.scale;
    const panelX = 10;
    const panelY = 80;
    const panelW = width - 185 - 25;
    const panelH = 480;

    this.eventPanel = this.add.container(panelX, panelY);

    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x0f0f23).setOrigin(0);
    bg.setStrokeStyle(1, 0x333355);

    const title = this.add.text(panelW / 2, 14, '📰 Journal des événements', {
      fontSize: '15px',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.eventPanel.add([bg, title]);
  }

  private addEventLog(message: string, color: string): void {
    const panelW = (this.scale.width - 185 - 25);
    const existingLogs = this.eventPanel.getAll().filter((_, i) => i >= 2);

    // Shift existing logs down by removing old ones (keep last 8)
    if (existingLogs.length >= 8) {
      const oldest = existingLogs[0];
      oldest.destroy();
      this.eventPanel.remove(oldest);
    }

    // Shift existing texts down
    this.eventPanel.getAll().forEach((child, i) => {
      if (i >= 2) {
        const txt = child as Phaser.GameObjects.Text;
        txt.setY(txt.y + 38);
      }
    });

    const newLog = this.add.text(panelW / 2, 42, message, {
      fontSize: '12px',
      color: color,
      align: 'center',
      wordWrap: { width: panelW - 20 },
    }).setOrigin(0.5, 0);

    this.eventPanel.add(newLog);
  }

  // ─── Game Actions ─────────────────────────────────────────────────────────────

  private doUpgrade(cost: number, newLevel: number): void {
    this.state.valeurNette -= cost;
    this.state.niveauVoie = newLevel;

    const baseRevenu = this.calculateRevenu(
      this.state.pays,
      this.state.voie,
      newLevel,
      this.state.effetsActifs,
    );
    this.state.revenuParTour = baseRevenu;

    this.addEventLog(
      `⬆️ Activité améliorée au niveau ${newLevel}! Revenu: ${this.fmt(this.state.revenuParTour)}/tour`,
      '#00FF88',
    );

    this.refreshHUD();
    this.refreshActionPanel();
  }

  private doRealEstate(): void {
    this.state.valeurNette -= COUT_IMMOBILIER;
    this.state.actifs += COUT_IMMOBILIER;
    this.state.revenuParTour += REVENU_IMMOBILIER;

    this.addEventLog(
      `🏢 Investissement immobilier! +${this.fmt(REVENU_IMMOBILIER)}/tour`,
      '#87CEEB',
    );

    this.refreshHUD();
    this.refreshActionPanel();
  }

  private doNextTurn(): void {
    const s = this.state;
    const valeurAvant = s.valeurNette;

    // Apply income
    let revenuCeTour = this.calculateRevenu(s.pays, s.voie, s.niveauVoie, s.effetsActifs);

    // Apply one-shot effects (no duration)
    s.effetsActifs.forEach((eff) => {
      if (eff.typeEffet === 'valeurNette') {
        const delta = s.valeurNette * eff.valeur;
        s.valeurNette += delta;
      }
    });

    s.valeurNette += revenuCeTour;
    s.actifs += revenuCeTour * 0.1;

    // Decrement active effects
    s.effetsActifs = s.effetsActifs
      .map((eff) => ({ ...eff, toursRestants: eff.toursRestants - 1 }))
      .filter((eff) => eff.toursRestants > 0);

    // Fire random event
    const event = this.pickRandomEvent();
    if (event) {
      this.applyEvent(event);
    }

    // Gain/loss animation
    const delta = s.valeurNette - valeurAvant;
    this.showGainLossAnim(delta);

    // Advance turn
    s.tourActuel++;

    this.refreshHUD();
    this.refreshProgressBar();
    this.refreshActionPanel();

    // Save state
    SaveService.save(s);
    this.showSaveIndicator();

    // Kofi turn-based triggers
    if (s.valeurNette < 15000) {
      this.kofi?.afficherDialogue('argent_bas');
    } else if (s.tourActuel === 15) {
      this.kofi?.afficherDialogue('tour_15');
    } else if (s.tourActuel === 25) {
      this.kofi?.afficherDialogue('tour_25');
    } else {
      const nextNiveau = s.niveauVoie + 1;
      const upgradeCost = nextNiveau === 2 ? COUT_UPGRADE_N2 : nextNiveau === 3 ? COUT_UPGRADE_N3 : null;
      if (upgradeCost !== null && s.valeurNette >= upgradeCost) {
        this.kofi?.afficherDialogue('upgrade_disponible');
      }
    }

    // Check win/lose conditions
    this.checkEndConditions();
  }

  private showSaveIndicator(): void {
    const { width } = this.scale;
    const label = this.add.text(width - 10, 76, '💾 Sauvegardé ✓', {
      fontSize: '11px',
      color: '#90EE90',
    }).setOrigin(1, 0.5);

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: label,
        alpha: 0,
        duration: 400,
        onComplete: () => label.destroy(),
      });
    });
  }

  private showGainLossAnim(delta: number): void {
    if (Math.abs(delta) < 1) return;
    const { width, height } = this.scale;
    const x = width / 2 - 100;
    const y = height / 2;
    const sign = delta >= 0 ? '+' : '';
    const color = delta >= 0 ? '#00FF88' : '#FF4444';
    const label = this.add.text(x, y, `${sign}${this.fmt(delta)}`, {
      fontSize: '18px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);

    this.tweens.add({
      targets: label,
      y: y - 60,
      alpha: 0,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private pickRandomEvent(): GameEvent | null {
    const s = this.state;
    const eligible = EVENTS.filter((ev) => {
      // Check path target
      const pathMatch =
        ev.cheminsCibles.includes('tous') || ev.cheminsCibles.includes(s.voie.id);
      // Check country target if specified
      const countryMatch =
        !ev.paysCibles || ev.paysCibles.length === 0 || ev.paysCibles.includes(s.pays.id);
      return pathMatch && countryMatch;
    });

    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  private applyEvent(event: GameEvent): void {
    const s = this.state;
    const eff = event.effet;
    const color = event.type === 'positif' ? '#90EE90' : '#FF9999';

    if (event.duree && event.duree > 1) {
      // Add to active effects
      const activeEff: ActiveEffect = {
        eventId: event.nom,
        typeEffet: eff.typeEffet,
        valeur: eff.valeur,
        toursRestants: event.duree,
      };
      s.effetsActifs.push(activeEff);
      this.addEventLog(`${event.type === 'positif' ? '✅' : '⚠️'} ${event.nom}: ${event.description} (${event.duree} tours)`, color);
    } else {
      // Immediate effect
      if (eff.typeEffet === 'revenuFixe') {
        s.valeurNette += eff.valeur;
      } else if (eff.typeEffet === 'valeurNette') {
        s.valeurNette += s.valeurNette * eff.valeur;
      } else if (eff.typeEffet === 'multiplicateurRevenu') {
        // One-turn multiplier — recalculate next turn
        s.revenuParTour = Math.max(0, s.revenuParTour * (1 + eff.valeur));
      }
      this.addEventLog(`${event.type === 'positif' ? '✅' : '⚠️'} ${event.nom}: ${event.description}`, color);
    }

    // Kofi reacts to events
    if (event.type === 'positif') {
      this.kofi?.afficherDialogue('evenement_positif');
    } else {
      this.kofi?.afficherDialogue('evenement_negatif');
    }

    // Ensure net worth not negative after event
    if (s.valeurNette < 0) s.valeurNette = 0;
  }

  private calculateRevenu(
    pays: Country,
    voie: WealthPath,
    niveau: number,
    effets: ActiveEffect[],
  ): number {
    let revenu = pays.revenuBase * voie.multiplicateurBase;

    // Country bonus for matching path
    if (
      pays.bonusType === 'tous' ||
      (pays.bonusType === 'agriculture' && voie.id === 'agriculture') ||
      (pays.bonusType === 'commerce' && voie.id === 'commerce') ||
      (pays.bonusType === 'mines' && voie.id === 'mines')
    ) {
      revenu *= 1 + pays.bonusValeur;
    }

    // Level multiplier
    if (niveau === 2) revenu *= 1.5;
    if (niveau === 3) revenu *= 3.0;

    // Entrepreneuriat growth: slightly better at higher levels
    if (voie.id === 'entrepreneuriat' && niveau >= 2) {
      revenu *= 1.2;
    }

    // Apply active revenue multiplier effects
    let multiplier = 1.0;
    effets.forEach((eff) => {
      if (eff.typeEffet === 'multiplicateurRevenu') {
        multiplier += eff.valeur;
      }
    });
    revenu *= Math.max(0.1, multiplier);

    return Math.round(revenu);
  }

  private checkEndConditions(): void {
    const s = this.state;

    if (s.valeurNette >= OBJECTIF_VICTOIRE) {
      this.kofi?.afficherDialogue('victoire');
      SaveService.delete();
      this.time.delayedCall(1500, () => {
        this.scene.start('GameOverScene', {
          victoire: true,
          valeurNette: s.valeurNette,
          tours: s.tourActuel - 1,
          pays: s.pays.nom,
          voie: s.voie.nom,
        });
      });
      return;
    }

    if (s.valeurNette <= 0) {
      this.kofi?.afficherDialogue('defaite');
      SaveService.delete();
      this.time.delayedCall(1500, () => {
        this.scene.start('GameOverScene', {
          victoire: false,
          valeurNette: 0,
          tours: s.tourActuel - 1,
          pays: s.pays.nom,
          voie: s.voie.nom,
        });
      });
      return;
    }

    if (s.tourActuel > MAX_TOURS) {
      this.kofi?.afficherDialogue('defaite');
      SaveService.delete();
      this.time.delayedCall(1500, () => {
        this.scene.start('GameOverScene', {
          victoire: false,
          valeurNette: s.valeurNette,
          tours: MAX_TOURS,
          pays: s.pays.nom,
          voie: s.voie.nom,
        });
      });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private fmt(value: number): string {
    return `${Math.round(value).toLocaleString('fr-FR')} $`;
  }
}
