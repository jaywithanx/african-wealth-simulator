export interface Country {
  id: string;
  nom: string;
  drapeau: string;
  ressource: string;
  bonusDescription: string;
  bonusType: 'commerce' | 'agriculture' | 'mines' | 'tous';
  bonusValeur: number;
  revenuBase: number;
  specialEvent?: string;
}

export interface WealthPath {
  id: 'agriculture' | 'commerce' | 'entrepreneuriat' | 'mines';
  nom: string;
  emoji: string;
  description: string;
  multiplicateurBase: number;
}

export interface GameEvent {
  id: string;
  nom: string;
  description: string;
  type: 'positif' | 'negatif';
  effet: EventEffect;
  cheminsCibles: Array<'agriculture' | 'commerce' | 'entrepreneuriat' | 'mines' | 'tous'>;
  paysCibles?: string[];
  duree?: number;
}

export interface EventEffect {
  typeEffet: 'multiplicateurRevenu' | 'valeurNette' | 'revenuFixe';
  valeur: number;
}

export interface ActiveEffect {
  eventId: string;
  typeEffet: 'multiplicateurRevenu' | 'valeurNette' | 'revenuFixe';
  valeur: number;
  toursRestants: number;
}

export interface GameState {
  pays: Country;
  voie: WealthPath;
  valeurNette: number;
  revenuParTour: number;
  actifs: number;
  tourActuel: number;
  niveauVoie: number;
  effetsActifs: ActiveEffect[];
}

export interface GameOverData {
  victoire: boolean;
  valeurNette: number;
  tours: number;
  pays: string;
  voie: string;
}
