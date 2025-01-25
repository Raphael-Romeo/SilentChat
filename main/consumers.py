import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.socket_name = self.scope['url_route']['kwargs']['chatroom_id']
        print(self.socket_name)
        await self.channel_layer.group_add(
            self.socket_name,
            self.channel_name
        )

    async def disconnect(self, code):
        return await super().disconnect(code)
    


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        chatroom_id = text_data_json['chatroom_id']
        message = text_data_json['message']
        sender = text_data_json['sender']
        message_id = text_data_json['message_id']
        await self.channel_layer.group_send(
            self.socket_name,
            {
                'type': 'sendMessage',
                'message_id': message_id,
                'chatroom_id': chatroom_id,
                'message': message,
                'sender': sender
            }
        )
    
    async def sendMessage(self, event):
        message_id = event['message_id']
        message = event['message']
        sender = event['sender']
        chatroom_id = event['chatroom_id']

        await self.send(text_data=json.dumps({
            'type': 'sendMessage',
            'message_id': message_id,
            'chatroom_id': chatroom_id,
            'message': message,
            'sender': sender
        }))

class PresenceConsumer(AsyncWebsocketConsumer):
    
    connections = []
    
    async def connect(self):
        await self.accept()
        self.user = self.scope['user']
        self.socket_name = self.scope['url_route']['kwargs']
        self.connections.append(self)
        self.update_indicator(msg="Connected")
    
    async def disconnect(self, code):
        self.update_indicator(msg="Disconnected")
        self.connections.remove(self)
        return await super().disconnect(code)
    
    async def update_indicator(self, msg):
        print("test")
        for connection in self.connections:
            connection.send(text_data=json.dumps({
                'message': f"{self.user.username} {msg}",
                'online': f"{len(self.connections)}",
                'users': [f"{user.scope['user'].username}" for user in self.connections],
            }))

    async def receive(self, text_data):
        pass