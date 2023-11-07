import { IPlayer } from 'interface/IPlayer';

export class PlayerSingleton {
  private constructor() {}

  private players: IPlayer[] = [];

  private static instance: PlayerSingleton | null = null;

  public static getInstance(): PlayerSingleton {
    if (!this.instance) {
      this.instance = new PlayerSingleton();
    }
    return this.instance;
  }

  public add(player: IPlayer): void {
    this.players.push(player);
  }

  public get(id: string): IPlayer | undefined {
    return this.players.find(player => player.id === id);
  }

  public getAll(): IPlayer[] {
    return this.players;
  }

  public delete(id: string): void {
    const index = this.players.findIndex(player => player.id === id);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  public hasPlayerWithName(name: string): boolean {
    return this.players.some(player => player.name === name);
  }
}
