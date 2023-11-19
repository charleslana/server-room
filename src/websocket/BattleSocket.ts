import { BattleSingleton } from 'singleton/BattleSingleton';
import { Server, Socket } from 'socket.io';

export class BattleSocket {
  constructor() {
    this.battleSingleton = BattleSingleton.getInstance();
  }

  private battleSingleton: BattleSingleton;

  public setupSocket(io: Server, socket: Socket): void {
    this.getBattle(io, socket);
  }

  private getBattle(io: Server, socket: Socket) {}
}
