import logger from 'utils/logger';
import { LobbySocket } from './LobbySocket';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { Server, Socket } from 'socket.io';

export class UserSocket {
  constructor() {
    this.playerSingleton = PlayerSingleton.getInstance();
    this.lobbySocket = new LobbySocket();
  }

  private playerSingleton: PlayerSingleton;
  private lobbySocket: LobbySocket;

  public setupSocket(io: Server, socket: Socket) {
    this.join(io, socket);
  }

  public removePlayer(_io: Server, socket: Socket): void {
    const player = this.playerSingleton.get(socket.id);
    if (player) {
      this.playerSingleton.delete(player.id);
      logger.info(`${player.name} disconnected`);
    }
  }

  private join(io: Server, socket: Socket): void {
    socket.on('join', (playerName: string) => {
      if (!this.isValidPlayerCharacter(playerName) || !this.isValidPlayerName(playerName)) {
        return;
      }
      if (this.playerNameExists(playerName)) {
        socket.emit('user-join-failed', 'Nome do usuário já existe.');
        return;
      }
      this.addPlayer(socket, playerName);
      socket.emit('join-success');
      logger.info(`${playerName} connected`);
      this.lobbySocket.join(io, socket);
    });
  }

  private isValidPlayerCharacter(playerName: string): boolean {
    return playerName.trim() !== '' && playerName.length <= 15;
  }

  private isValidPlayerName(playerName: string): boolean {
    const roomNameRegex = /^[a-z0-9]+$/;
    return roomNameRegex.test(playerName);
  }

  private playerNameExists(playerName: string): boolean {
    return this.playerSingleton.hasPlayerWithName(playerName.trim());
  }

  private addPlayer(socket: Socket, playerName: string) {
    this.playerSingleton.add({
      id: socket.id,
      name: playerName,
    });
  }
}
