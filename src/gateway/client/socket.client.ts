import { Injectable, OnModuleInit } from '@nestjs/common';
import { error, log } from 'console';
import { Socket, io } from 'socket.io-client'; //we've already used Server object from socket.io library

@Injectable()
export class SocketClint implements OnModuleInit {
  public socketClient: Socket;

  constructor() {
    this.socketClient = io('http://localhost:3000');
  }

  onModuleInit() {
    this.socketClient.emitWithAck('client_new_message', {data:'hello from  socket client'})
    this.socketClient.on('connect', () => {
      log('client connected to gateway, connection id:', this.socketClient.id);
    });
    this.socketClient.on('client_new_message_gtw', (data) => {
        log('received message from server:', data);
        this.socketClient.emit('client_new_message_res', {msg:'ok from peer'})
      });
    this.socketClient.on('error', (e) => {
      error('error while client trying to connect:', e);
    });
  }
}
