import { ICard } from './ICard';

export interface IInfoBattleCard {
  card: ICard;
  cost: number;
  power: number;
  position: number;
  columnPosition?: number;
}
