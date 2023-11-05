export class PlayerSingleton {
  private constructor() {}

  private players: Map<string, string> = new Map();

  private static instance: PlayerSingleton | null = null;

  public static getInstance(): PlayerSingleton {
    if (!this.instance) {
      this.instance = new PlayerSingleton();
    }
    return this.instance;
  }

  public set(key: string, value: string): void {
    this.players.set(key, value);
  }

  public get(key: string): string | undefined {
    return this.players.get(key);
  }

  public getAll(): Map<string, string> {
    return this.players;
  }

  public delete(key: string): boolean {
    return this.players.delete(key);
  }
}
