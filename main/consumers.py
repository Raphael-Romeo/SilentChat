import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.socket_name = self.scope['url_route']['kwargs']['chatroom_id']
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
        self.group_name = "app"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

        self.user = self.scope['user']

        self.connections.append(self)

        await self.update_indicator(msg="Connected")

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        if self in self.connections:
            self.connections.remove(self)

        await self.update_indicator(msg="Disconnected")

        return await super().disconnect(code)

    async def update_indicator(self, msg):
        """
        Sends a presence update to every connection in `self.connections`.
        If a connection is already closed, remove it from the list.
        """
        disconnected = []

        for connection in list(self.connections):
            try:
                await connection.send(text_data=json.dumps({
                    "type": "presence_indicator",
                    "msg": f"{self.user} {msg}",
                    "online": str(len(self.connections)),
                    "users_id": [str(conn.user.id) for conn in self.connections]
                }))
            except Exception:
                disconnected.append(connection)

        for dead_conn in disconnected:
            if dead_conn in self.connections:
                self.connections.remove(dead_conn)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        user_id = self.user.id
        msg_type = text_data_json['type']
        chatroom_id = text_data_json['chatroom_id']

        if msg_type == "typing":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'typing',
                    'chatroom_id': chatroom_id,
                    'user_id': user_id
                }
            )
        elif msg_type == "new_chat":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'new_chat',
                    'creator_id': user_id,
                    'chatroom_id': chatroom_id
                }
            )

    async def typing(self, event):
        """
        This method is called when a 'typing' event is dispatched by group_send.
        """
        user_id = event['user_id']
        chatroom_id = event['chatroom_id']

        await self.send(text_data=json.dumps({
            'type': 'typing',
            'chatroom_id': chatroom_id,
            'user_id': user_id
        }))

    async def new_chat(self, event):
        """
        This method is called when a 'new_chat' event is dispatched by group_send.
        """
        creator_id = event['creator_id']
        chatroom_id = event['chatroom_id']

        await self.send(text_data=json.dumps({
            'type': 'new_chat',
            'creator_id': creator_id,
            'chatroom_id': chatroom_id
        }))