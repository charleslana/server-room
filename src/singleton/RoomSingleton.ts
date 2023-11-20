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

  public addPlayerToRoom(player: IPlayer, roomName: string): void {
    const room = this.get(roomName);
    if (room) {
      room.players.push(player);
    }
  }

  public getPlayerByIdAndRoomName(playerId: string, roomName: string): IPlayer | undefined {
    const room = this.get(roomName);
    if (room) {
      return room.players.find(player => player.id === playerId);
    }
    return undefined;
  }

  public getAllPlayersInRoom(roomName: string): IPlayer[] {
    const room = this.get(roomName);
    return room ? room.players : [];
  }

  public deletePlayerByIdAndRoomName(playerId: string, roomName: string): void {
    const room = this.get(roomName);
    if (room) {
      const index = room.players.findIndex(player => player.id === playerId);
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

  public updatePlayerRoomOwnerWithName(
    room: IRoom,
    playerName: string,
    isRoomOwner: boolean
  ): void {
    const player = room.players.find(player => player.name === playerName);
    if (player) {
      player.isRoomOwner = isRoomOwner;
    }
  }

  public updatePlayerRoomReadyWithPlayerId(room: IRoom, playerId: string, hasReady: boolean): void {
    const player = room.players.find(player => player.id === playerId);
    if (player) {
      player.hasReady = hasReady;
    }
  }

  public updateRoomPassword(roomName: string, newPassword?: string): void {
    const room = this.get(roomName);
    if (room) {
      room.password = newPassword;
    }
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

  public getPlayerBySocketId(socketId: string): IPlayer | undefined {
    for (const room of this.rooms) {
      const opponent = room.players.find(player => player.id === socketId);
      if (opponent) {
        return opponent;
      }
    }
    return undefined;
  }

  public getOpponentByPlayerId(playerId: string): IPlayer | undefined {
    for (const room of this.rooms) {
      const opponent = room.players.find(p => p.id !== playerId);
      if (opponent) {
        return opponent;
      }
    }
    return undefined;
  }
}
