# Default urls.py file 

from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('', home, name='home'),
    path('app', app, name='app'),
    path('register_user', register_user, name='register_user'),
    path('login_user', login_user, name='login_user'),
    path('logout_user', logout_user, name='logout_user'),
    path('chat/<str:room_name>', chat_room, name='chat'),
]