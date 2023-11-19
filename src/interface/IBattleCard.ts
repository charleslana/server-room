import { IInfoBattleCard } from './IInfoBattleCard';
import { IPlayer } from './IPlayer';

export interface IBattleCard {
  user: IPlayer;
  handCards: IInfoBattleCard[];
  fieldCards: IInfoBattleCard[];
  discardedCards: IInfoBattleCard[];
  destroyedCards: IInfoBattleCard[];
}
