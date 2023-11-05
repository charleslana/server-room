export class RoomSingleton {
  private constructor() {}

  private rooms: Map<string, string[]> = new Map();

  private static instance: RoomSingleton | null = null;

  public static getInstance(): RoomSingleton {
    if (!this.instance) {
      this.instance = new RoomSingleton();
    }
    return this.instance;
  }

  public set(key: string, values: string[]): void {
    this.rooms.set(key, values);
  }

  public get(key: string): string[] | undefined {
    return this.rooms.get(key);
  }

  public getAll(): Map<string, string[]> {
    return this.rooms;
  }

  public delete(key: string): boolean {
    return this.rooms.delete(key);
  }
}
