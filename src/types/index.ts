import { TarotCard } from '../data/tarotDeck';
import { SpreadConfig } from '../data/spreads';
import { ReaderPersona } from '../data/readers';

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
  positionName: string;
  positionDescription?: string;
}

export interface MirrorViewData {
  partnerThoughts: string;
  defenseMechanism: string;
  hiddenFears: string;
  whatTheyWishYouKnew: string;
}

export interface ActionChecklistItem {
  day: number;
  title: string;
  task: string;
  advice: string;
}

export interface ReadingResult {
  id: string;
  timestamp: number;
  readerId: string;
  readerName: string;
  topic: string;
  question: string;
  spreadId: string;
  spreadName: string;
  cards: DrawnCard[];
  punchline: string;
  generalOverview: string;
  cardsAnalysis: {
    cardName: string;
    position: string;
    interpretation: string;
  }[];
  realityCheck: string;
  actionAdvice: string[];
  verdict: string;
  closingMessage: string;
  mirrorView?: MirrorViewData;
  threeDayActionPlan?: ActionChecklistItem[];
  shareableQuote?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface UserAccount {
  credits: number;
  isVip: boolean;
  vipExpiryDate?: string;
  hasDrawnDailyToday: boolean;
  lastDailyCardDate?: string;
  savedReadings: ReadingResult[];
}
