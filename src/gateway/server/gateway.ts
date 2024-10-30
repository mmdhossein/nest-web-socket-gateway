import { Body, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { log } from 'console';

@WebSocketGateway()
export class WSGateway implements OnModuleInit {
  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('server connection id: ', socket.id);
    });
  }

  @WebSocketServer() //default port is the port number of the server while listening in app bootstrap
  server: Server;
  constructor() {}
  @SubscribeMessage('client_new_message')
  onMessage(@MessageBody() body) {
    console.log('new body received from client:', body);
    this.server.emit('client_new_message_gtw', body)// best practice to seperate events for response and request
    return {data:'ok', event:'client_new_message'}
  }

  @SubscribeMessage('client_new_message_res')
  onResponse(@MessageBody() body) {
    console.log('response received from client:', body);
    this.server.emit('client_new_message_res', body)
    // return {data:'body', event:'client_new_message_res'}
  }
  

}
