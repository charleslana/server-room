import { IPlayer } from 'interface/IPlayer';
import { IRoom } from 'interface/IRoom';

export class RoomSingleton {
  private constructor() {}

  private rooms: IRoom[] = [];

  private static instance: RoomSingleton | null = null;

  public static getInstance(): RoomSingleton {
    if (!this.instance) {
      this.instance = new RoomSingleton();
    }
    return this.instance;
  }

  public add(room: IRoom): void {
    this.rooms.push(room);
  }

  public get(name: string): IRoom | undefined {
    return this.rooms.find(room => room.name === name);
  }

  public getAll(): IRoom[] {
    return this.rooms;
  }

  public delete(name: string): void {
    const index = this.rooms.findIndex(room => room.name === name);
    if (index !== -1) {
      this.rooms.splice(index, 1);
    }
  }

  public hasRoomWithName(name: string): boolean {
    const lowerCaseName = name.toLowerCase();
    return this.rooms.some(room => room.name.toLowerCase() === lowerCaseName);
  }

  public addPlayerToRoom(roomName: string, player: IPlayer): void {
    const room = this.get(roomName);
    if (room) {
      room.players.push(player);
    }
  }

  public getPlayerInRoom(roomName: string, playerName: string): IPlayer | undefined {
    const room = this.get(roomName);
    if (room) {
      return room.players.find(player => player.name === playerName);
    }
    return undefined;
  }

  public getAllPlayersInRoom(roomName: string): IPlayer[] {
    const room = this.get(roomName);
    return room ? room.players : [];
  }

  public deletePlayerInRoom(roomName: string, playerName: string): void {
    const room = this.get(roomName);
    if (room) {
      const index = room.players.findIndex(player => player.name === playerName);
      if (index !== -1) {
        room.players.splice(index, 1);
      }
    }
  }

  public hasRoomPlayerWithName(roomName: string, playerName: string): boolean {
    const room = this.get(roomName);
    if (room) {
      return room.players.some(player => player.name === playerName);
    }
    return false;
  }

  public updateRoomPlayerWithName(
    roomName: string,
    playerName: string,
    isRoomOwner: boolean
  ): boolean {
    const room = this.get(roomName);
    if (room) {
      const player = room.players.find(player => player.name === playerName);
      if (player) {
        player.isRoomOwner = isRoomOwner;
        return true;
      }
    }
    return false;
  }

  public updateRoomPassword(roomName: string, newPassword: string): boolean {
    const room = this.get(roomName);
    if (room) {
      room.password = newPassword;
      return true;
    }
    return false;
  }

  public getTop20RoomsByPlayerCount(): IRoom[] {
    const sortedRooms = [...this.rooms].sort((a, b) => a.players.length - b.players.length);
    const top20Lowest = sortedRooms.slice(0, 20);
    return top20Lowest;
  }

  public getRoomsByNameLike(nameLike: string): IRoom[] {
    const lowerCaseNameLike = nameLike.toLowerCase();
    const filteredRooms = this.rooms.filter(room =>
      room.name.toLowerCase().includes(lowerCaseNameLike)
    );
    return filteredRooms;
  }
}
