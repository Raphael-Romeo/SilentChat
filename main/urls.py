# Default urls.py file 

from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('', home, name='home'),
    path('app', app, name='app'),
    path('signup', signup_user, name='signup'),
    path('login', login_user, name='login'),
    path('logout', logout_user, name='logout'),
    path('chat/<str:room_name>', chat_room, name='chat'),
]