import { Socket, Server } from 'socket.io';
import { RedisClient } from 'redis';
import * as rateLimit from 'express-rate-limit';
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
  } from '@nestjs/websockets';
@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayInit {
  private redisClient: RedisClient;

  afterInit(server: Server) {
    this.redisClient = new RedisClient({ host: 'localhost', port: 6379 });
  }

  @SubscribeMessage('join_room')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    client.join(data.room);
    this.redisClient.sadd(`room:${data.room}`, client.id); // Track clients in Redis
    client.to(data.room).emit('user_joined', { userId: client.id });
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; message: string }
  ) {
    // Apply rate limiting per user
    const limiter = rateLimit({
      windowMs: 1000,
      max: 5, // Limit each client to 5 messages per second
    });

    const response = { userId: client.id, message: data.message, timestamp: new Date() };
    client.to(data.room).emit('receive_message', response);
  }

//   handleDisconnect(client: Socket) {
//     this.redisClient.srem(`room:${this.activeUsers.get(client.id)}`, client.id);
//   }
}