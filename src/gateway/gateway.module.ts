import { Module } from '@nestjs/common'; 
import { WSGateway } from './server/gateway';
import { SocketClint } from './client/socket.client';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [WSGateway, SocketClint,ChatGateway ],
})
export class GatewayModule {}
