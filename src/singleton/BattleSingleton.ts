import { IBattle } from 'interface/IBattle';

export class BattleSingleton {
  private constructor() {}

  private battles: IBattle[] = [];

  private static instance: BattleSingleton | null = null;

  public static getInstance(): BattleSingleton {
    if (!this.instance) {
      this.instance = new BattleSingleton();
    }
    return this.instance;
  }

  public add(battle: IBattle): void {
    this.battles.push(battle);
  }

  public getAllBattles(): IBattle[] {
    return this.battles;
  }

  public delete(playerId: string): void {
    const index = this.battles.findIndex(
      battle => battle.playerId === playerId && battle.finish === true
    );
    if (index !== -1) {
      this.battles.splice(index, 1);
    }
  }

  public getPlayerBattle(playerId: string): IBattle | undefined {
    return this.battles.find(battle => battle.playerId === playerId);
  }

  public getOpponentBattle(opponentId: string): IBattle | undefined {
    return this.battles.find(battle => battle.opponentId === opponentId);
  }

  public getPlayerOrOpponentBattle(playerId: string): IBattle | undefined {
    const playerBattle = this.battles.find(battle => battle.playerId === playerId);
    if (playerBattle) {
      return playerBattle;
    }
    return this.battles.find(battle => battle.opponentId === playerId);
  }
}
