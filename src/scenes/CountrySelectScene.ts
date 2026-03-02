import Phaser from 'phaser';
import { COUNTRIES } from '../data/countries';
import { Country, WealthPath } from '../types';

const WEALTH_PATHS: WealthPath[] = [
  {
    id: 'agriculture',
    nom: 'Agriculture',
    emoji: '🌾',
    description: 'Revenus stables, sensible aux sécheresses',
    multiplicateurBase: 1.0,
  },
  {
    id: 'commerce',
    nom: 'Commerce',
    emoji: '📦',
    description: 'Revenus variables, bonifiés par les accords commerciaux',
    multiplicateurBase: 1.1,
  },
  {
    id: 'entrepreneuriat',
    nom: 'Entrepreneuriat',
    emoji: '🏪',
    description: 'Croissance lente au début, exponentielle ensuite',
    multiplicateurBase: 0.8,
  },
];

export class CountrySelectScene extends Phaser.Scene {
  private selectedCountry: Country | null = null;
  private selectedPath: WealthPath | null = null;
  private startButton!: Phaser.GameObjects.Container;
  private countryCards: Map<string, Phaser.GameObjects.Container> = new Map();
  private pathButtons: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'CountrySelectScene' });
  }

  create(): void {
    this.selectedCountry = null;
    this.selectedPath = null;
    this.countryCards.clear();
    this.pathButtons.clear();

    const { width } = this.scale;
    const cx = width / 2;

    // Background
    this.add.rectangle(cx, 325, width, 650, 0x1a1a2e);

    // Title
    this.add.text(cx, 28, 'Choisissez votre pays', {
      fontSize: '26px',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Country cards grid — 3 per row, 2 rows
    const cardW = 260;
    const cardH = 110;
    const cols = 3;
    const startX = cx - (cols * cardW) / 2 + cardW / 2;
    const startY = 100;

    COUNTRIES.forEach((country, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cardW;
      const y = startY + row * (cardH + 10);
      this.createCountryCard(country, x, y, cardW - 10, cardH);
    });

    // Wealth path section
    this.add.text(cx, 350, 'Choisissez votre voie', {
      fontSize: '20px',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const pathW = 250;
    const pathStartX = cx - pathW - 10;
    WEALTH_PATHS.forEach((path, i) => {
      const x = pathStartX + i * (pathW + 10);
      this.createPathButton(path, x, 430, pathW, 80);
    });

    // Start button
    this.startButton = this.createStartButton(cx, 550);
    this.updateStartButton();
  }

  private createCountryCard(country: Country, x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, w, h, 0x16213e, 1);
    bg.setStrokeStyle(2, 0x333366);

    const nameText = this.add.text(-w / 2 + 10, -h / 2 + 8, `${country.drapeau} ${country.nom}`, {
      fontSize: '14px',
      color: '#FFD700',
      fontStyle: 'bold',
    });

    const resourceText = this.add.text(-w / 2 + 10, -h / 2 + 30, `🏭 ${country.ressource}`, {
      fontSize: '12px',
      color: '#CCCCCC',
    });

    const bonusText = this.add.text(-w / 2 + 10, -h / 2 + 50, `✨ ${country.bonusDescription}`, {
      fontSize: '11px',
      color: '#90EE90',
    });

    const incomeText = this.add.text(-w / 2 + 10, -h / 2 + 70, `💰 ${country.revenuBase.toLocaleString('fr-FR')} $/tour`, {
      fontSize: '11px',
      color: '#87CEEB',
    });

    container.add([bg, nameText, resourceText, bonusText, incomeText]);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.selectCountry(country));
    bg.on('pointerover', () => {
      if (this.selectedCountry?.id !== country.id) {
        bg.setFillStyle(0x1e2d5a);
      }
    });
    bg.on('pointerout', () => {
      if (this.selectedCountry?.id !== country.id) {
        bg.setFillStyle(0x16213e);
      }
    });

    this.countryCards.set(country.id, container);
  }

  private createPathButton(path: WealthPath, x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, w, h, 0x16213e, 1);
    bg.setStrokeStyle(2, 0x333366);

    const title = this.add.text(0, -h / 2 + 12, `${path.emoji} ${path.nom}`, {
      fontSize: '15px',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const desc = this.add.text(0, h / 2 - 20, path.description, {
      fontSize: '10px',
      color: '#CCCCCC',
      align: 'center',
      wordWrap: { width: w - 16 },
    }).setOrigin(0.5);

    container.add([bg, title, desc]);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.selectPath(path));
    bg.on('pointerover', () => {
      if (this.selectedPath?.id !== path.id) {
        bg.setFillStyle(0x1e2d5a);
      }
    });
    bg.on('pointerout', () => {
      if (this.selectedPath?.id !== path.id) {
        bg.setFillStyle(0x16213e);
      }
    });

    this.pathButtons.set(path.id, container);
  }

  private createStartButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 240, 48, 0x555555, 1);
    bg.setStrokeStyle(2, 0x888888);

    const label = this.add.text(0, 0, 'Commencer le jeu ▶', {
      fontSize: '18px',
      color: '#AAAAAA',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setData('bg', bg);
    container.setData('label', label);

    bg.setInteractive({ useHandCursor: false });

    return container;
  }

  private selectCountry(country: Country): void {
    // Deselect previous
    if (this.selectedCountry) {
      const prev = this.countryCards.get(this.selectedCountry.id);
      if (prev) {
        (prev.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(0x16213e);
        (prev.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x333366);
      }
    }

    this.selectedCountry = country;
    const card = this.countryCards.get(country.id);
    if (card) {
      (card.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(0x1a3a6e);
      (card.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0xFFD700);
    }

    this.updateStartButton();
  }

  private selectPath(path: WealthPath): void {
    // Deselect previous
    if (this.selectedPath) {
      const prev = this.pathButtons.get(this.selectedPath.id);
      if (prev) {
        (prev.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(0x16213e);
        (prev.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x333366);
      }
    }

    this.selectedPath = path;
    const btn = this.pathButtons.get(path.id);
    if (btn) {
      (btn.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(0x1a3a6e);
      (btn.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0xFFD700);
    }

    this.updateStartButton();
  }

  private updateStartButton(): void {
    const bg = this.startButton.getData('bg') as Phaser.GameObjects.Rectangle;
    const label = this.startButton.getData('label') as Phaser.GameObjects.Text;

    if (this.selectedCountry && this.selectedPath) {
      bg.setFillStyle(0xFFD700);
      bg.setStrokeStyle(2, 0xFFA500);
      label.setColor('#1a1a2e');

      bg.setInteractive({ useHandCursor: true });
      bg.removeAllListeners('pointerdown');
      bg.on('pointerdown', () => {
        this.scene.start('GameScene', {
          pays: this.selectedCountry,
          voie: this.selectedPath,
        });
      });
    } else {
      bg.setFillStyle(0x555555);
      bg.setStrokeStyle(2, 0x888888);
      label.setColor('#AAAAAA');
      bg.setInteractive({ useHandCursor: false });
      bg.removeAllListeners('pointerdown');
    }
  }
}
