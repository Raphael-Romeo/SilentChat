from django.urls import path, re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/app/socket/messages/(?P<chatroom_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
]