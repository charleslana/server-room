import { IBattleCard } from './IBattleCard';
import { IField } from './IField';

export interface IBattle {
  playerId: string;
  opponentId: string;
  turn: number;
  timer: Date;
  snap: number;
  historic: string[];
  player: IBattleCard;
  opponent: IBattleCard;
  fields: IField[];
  finish: boolean;
  started: boolean;
}
