import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { log } from 'console';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private activeUsers = new Map<string, string>(); // Maps socket ID to room name for tracking

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const room = this.activeUsers.get(client.id);
    if (room) {
      client.to(room).emit('user_left', { userId: client.id });
      this.activeUsers.delete(client.id);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; username: string },
  ) {
    log('join request ', client.id);
    client.join(data.room);
    this.activeUsers.set(client.id, data.room);
    client
      .to(data.room)
      .emit('user_joined', { userId: client.id, username: data.username });
    return {
      event: 'joined_room',
      data: { room: data.room, userId: client.id, username: data.username },
    };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.activeUsers.delete(client.id);
    client.to(data.room).emit('user_left', { userId: client.id });
    return { event: 'left_room', data: { room: data.room, userId: client.id } };
  }

  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; message: string },
  ) {
    const response = {
      userId: client.id,
      message: data.message,
      timestamp: new Date(),
    };
    client.to(data.room).emit('receive_message', response); // Broadcasts to all users in the room except the sender
    return response; // Sends acknowledgment to the sender
  }

  @SubscribeMessage('member_room')
  roomMembers(
    @ConnectedSocket() client: Socket
  ) {
    return { event: 'member_room', data: { room: this.activeUsers.get(client.id)} };
  }
}

//what is your tip for large scale chat applications, possible pit falls
