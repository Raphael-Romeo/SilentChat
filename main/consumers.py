import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.socket_name = self.scope['url_route']['kwargs']['socket_name']
        await self.channel_layer.group_add(
            self.socket_name,
            self.channel_name
        )
        await self.accept()


    async def disconnect(self, close_code):
        pass

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
            'message_id': message_id,
            'message': message,
            'sender': sender,
            'chatroom_id': chatroom_id
        })) 