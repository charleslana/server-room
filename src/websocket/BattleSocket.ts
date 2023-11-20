import logger from 'utils/logger';
import { BattleSingleton } from 'singleton/BattleSingleton';
import { IChat } from 'interface/IChat';
import { IPlayer } from 'interface/IPlayer';
import { IRoom } from 'interface/IRoom';
import { RoomSingleton } from 'singleton/RoomSingleton';
import { Server, Socket } from 'socket.io';

export class BattleSocket {
  constructor() {
    this.battleSingleton = BattleSingleton.getInstance();
    this.roomSingleton = RoomSingleton.getInstance();
  }

  private battleSingleton: BattleSingleton;
  private roomSingleton: RoomSingleton;
  chats: IChat[] = [];

  public setupSocket(io: Server, socket: Socket): void {
    this.startBattle(io, socket);
    this.getBattle(io, socket);
  }

  private getBattle(_io: Server, socket: Socket): void {
    socket.on('get-battle', () => {});
  }

  private startBattle(io: Server, socket: Socket): void {
    socket.on('start-battle', (roomName: string) => {
      const room = this.roomSingleton.get(roomName);
      if (!room) {
        return;
      }
      const player = this.roomSingleton.getPlayerBySocketId(socket.id);
      if (!player) {
        return;
      }
      this.emitStartBattleSuccess(io, socket, player, room);
    });
  }

  private emitStartBattleSuccess(io: Server, socket: Socket, player: IPlayer, room: IRoom): void {
    if (player.isRoomOwner) {
      const opponent = this.roomSingleton.getOpponentByPlayerId(socket.id);
      if (!opponent) {
        return;
      }
      if (!opponent.hasReady) {
        return;
      }
      this.roomSingleton.updatePlayerRoomReadyWithPlayerId(room, player.id, true);
      io.to(room.name).emit('start-battle-success');
      logger.info(`Battle with player ${player.name} and opponent ${opponent.name} started`);
    }
  }
}
