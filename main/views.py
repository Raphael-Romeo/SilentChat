from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotFound, HttpResponseForbidden, HttpResponseBadRequest
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db.models import Q
from datetime import datetime
from .models import *
import json


# index page view, index.html located in templates
def home(request):
    return render(request, 'index.html')

# Login is required to access this view.
def app(request):
    if request.user.is_authenticated:
        return render(request, 'app.html')
    else:
        return HttpResponseRedirect('/login')

# User registration and login/logout views
def signup_user(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        password2 = request.POST['password2']

        if password != password2:
            messages.error(request, 'Passwords do not match')
            return render(request, 'register.html')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return render(request, 'register.html')
        
        user = User.objects.create_user(username, email, password)
        user.save()
        messages.success(request, 'You are now registered and can log in')
        # login(request, user)
        return render(request, 'index.html')
    
    return render(request, 'register.html')

def login_user(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'You are now logged in')
            return HttpResponseRedirect("/app")
        else:
            messages.error(request, 'Invalid credentials')
            return render(request, 'login.html')
    
    return render(request, 'login.html')

def logout_user(request):
    logout(request)
    messages.success(request, 'You are now logged out')
    return render(request, 'index.html')



# API TYPE CALLS (Functions here return JSON data).

def app_get_user_details(request):
    if request.user.is_authenticated:
        user = request.user
        friends = User.objects.all() # FILTER FOR FRIENDS

        UserChats = UserChatRoom.objects.all().filter(Q(user_A=user) | Q(user_B=user))
        GroupChats = GroupChatRoom.objects.all().filter(users__in=[user])
        serialized_user_chats = []
        for chat in UserChats:
            last_message_date = chat.chat_room.last_message_date
            if chat.user_A == user:
                user_name = chat.user_B.username
                user_id = chat.user_B.id
            else:
                user_name = chat.user_A.username
                user_id = chat.user_A.id
            serialized_user_chats.append({
                "id": chat.chat_room.id,
                "user": {
                    "id": user_id,
                    "username": user_name
                },
                "photo": "/static/images/placeholder_profile_picture.webp",
                "type": "user",
                "last_message_date": last_message_date
            })

        for chat in GroupChats:
            last_message_date = chat.chat_room.last_message_date
            serialized_user_chats.append({
                "id": chat.chat_room.id,
                "name": chat.name,
                "photo": chat.chat_picture.url,
                "type": "group",
                "last_message_date": last_message_date
        })
            
        serialized_user_chats.sort(key=lambda x: x['last_message_date'], reverse=True)
        for chat in serialized_user_chats:
            chat.pop('last_message_date', None)
        
        serialized_friends = []

        for friend in friends:
            if friend != request.user:
                serialized_friends.append({
                    "id" : friend.id,
                    "username" : friend.username,
                    "profile_pic" : "/static/images/placeholder_profile_picture.webp",
                })
        data = {"username": user.username, "profile_pic": "/static/images/placeholder_profile_picture.webp", "user_chats": serialized_user_chats, "friends": serialized_friends}

        return HttpResponse(json.dumps(data), content_type="application/json")
    else:
        return HttpResponseForbidden()


def user_in_chatroom(user, chatroom):
    if chatroom.chat_room_type == "user":
        cr = UserChatRoom.objects.get(chat_room=chatroom)
        if cr.user_A == user or cr.user_B == user:
            return True
    else:
        cr = GroupChatRoom.objects.get(chat_room=chatroom)
        if cr.users.all().contains(user):
            return True
    return False


def app_get_messages(request, chatroom_id:int):
    if request.user.is_authenticated:
        try:
            chatroom = ChatRoom.objects.get(id = chatroom_id)
        except:
            return HttpResponseNotFound()
        messages = Message.objects.all().filter(chatroom_id=chatroom_id)
        if user_in_chatroom(request.user, chatroom):
            data = {"messages": []}
            for message in messages:
                owner = message.sender == request.user
                data["messages"].append({
                    "id": message.id,
                    "sender": message.sender.username,
                    "data": message.data,
                    "timestamp": str(message.timestamp),
                    "owner": owner,
                })
            return HttpResponse(json.dumps(data), content_type="application/json")
    return HttpResponseForbidden()


def app_post_message(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            data = json.loads(request.body)
            chatroom_id = data['chatroom_id']
            message = data['message']
            chatroom = ChatRoom.objects.get(id = chatroom_id)
            chatroom.last_message_date = datetime.now()
            chatroom.save()
            sender = User.objects.get(id = request.user.id)
            if user_in_chatroom(request.user, chatroom):
                new_message = Message.objects.create(
                    chatroom_id=chatroom,
                    sender=sender,
                    data=message
                )
                new_message.save()
                return HttpResponse(json.dumps(data), content_type="application/json")
    return HttpResponseForbidden()


def app_post_user_chatroom(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            data = json.loads(request.body)
            user_A = request.user
            user_B = User.objects.get(id=data['user_B'])
            if user_A == user_B:
                return HttpResponseBadRequest()
            chat_room_exists = UserChatRoom.objects.all().filter((Q(user_A=user_A) | Q(user_B=user_A)) & (Q(user_A=user_B) | Q(user_B=user_B)))
            if len(chat_room_exists) == 0:
                chatroom = ChatRoom.objects.create(chat_room_type="user")
                chatroom.save()
                user_chatroom = UserChatRoom.objects.create(chat_room=chatroom, user_A=user_A, user_B=user_B)
                user_chatroom.save()
                return HttpResponse(json.dumps({
                "id": chatroom.id,
                "user": {
                    "id": user_B.id,
                    "username": user_B.username
                },
                "photo": "/static/images/placeholder_profile_picture.webp",
                "type": "user",
                "created": True
            }), content_type="application/json")
            else:
                return HttpResponse(json.dumps({
                "id": chat_room_exists[0].id,
                "user": {
                    "id": user_B.id,
                    "username": user_B.username
                },
                "photo": "/static/images/placeholder_profile_picture.webp",
                "type": "user",
                "created": False
            }), content_type="application/json")
        return HttpResponseBadRequest()


def app_post_group_chatroom(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            data = json.loads(request.body)
            name = data['name']
            users = data['users']
            creator = User.objects.get(id=request.user.id)
            users.append(request.user.id)
            chatroom = ChatRoom.objects.create(chat_room_type="group")
            chatroom.save()
            group_chatroom = GroupChatRoom.objects.create(chat_room=chatroom, name=name, creator=creator)
            group_chatroom.save()
            for user_id in users:
                user = User.objects.get(id=user_id)
                group_chatroom.users.add(user)
            group_chatroom.save()
            return HttpResponse(json.dumps({
                "id": chatroom.id,
                "name": group_chatroom.name,
                "photo": group_chatroom.chat_picture.url,
                "type": "group",
                "created": True,
            }), content_type="application/json")
    return HttpResponseForbidden()


def app_post_delete_self(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            user = User.objects.get(id=request.user.id)
            user.delete()
            return HttpResponse(json.dumps({"status": "success"}), content_type="application/json")
    return HttpResponseForbidden()


def app_post_delete_chatroom(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            data = json.loads(request.body)
            chatroom_id = data['chatroom_id']
            chatroom_type = data['chatroom_type']
            if chatroom_type == "user":
                chatroom = UserChatRoom.objects.get(chat_room=chatroom_id)
                if chatroom.user_A == request.user or chatroom.user_B == request.user:
                    chatroom.delete()
                    return HttpResponse(json.dumps({"status": "success"}), content_type="application/json")
            else:
                chatroom = GroupChatRoom.objects.get(chat_room=chatroom_id)
                if GroupChatRoom.objects.get(chat_room=chatroom_id).creator == request.user:
                    chatroom.delete()
                    return HttpResponse(json.dumps({"status": "success"}), content_type="application/json")
    return HttpResponseForbidden()


def app_post_delete_message(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            data = json.loads(request.body)
            message_id = data['message_id']
            message = Message.objects.get(id=message_id)
            if message.sender == request.user:
                message.delete()
                return HttpResponse(json.dumps({"status": "success"}), content_type="application/json")
    return HttpResponseForbidden()
