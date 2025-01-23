from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db.models import Q
from .models import Message

# index page view, index.html located in templates
def home(request):
    return render(request, 'index.html')

# Login is required to access this view.
def app(request):
    if request.user.is_authenticated:
        return render(request, 'app.html')
    else:
        return HttpResponseRedirect('signup')

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
            return HttpResponseRedirect("app")
        else:
            messages.error(request, 'Invalid credentials')
            return render(request, 'login.html')
    
    return render(request, 'login.html')

def logout_user(request):
    logout(request)
    messages.success(request, 'You are now logged out')
    return render(request, 'index.html')


def chat_room(request, room_name):
    search_query = request.GET.get('search', '')
    users = User.objects.exclude(id=request.user.id)
    chats = Message.objects.filter(
        (Q(sender=request.user) & Q(receiver__username=room_name) |
        Q(receiver=request.user) & Q(sender__username=room_name))
    )

    if search_query:
        chats = chats.filter(Q(content__icontains=search_query))

    chats = chats.order_by('timestamp')
    user_last_message = []

    for user in users:
        last_message = Message.objects.filter(
            (Q(sender=request.user) & Q(receiver=user) |
            Q(receiver=request.user) & Q(sender=user))
        ).order_by('-timestamp').first()

        user_last_message.append({
            'user': user,
            'last_message': last_message
        })

    user_last_message.sort(
        key=lambda x: x['last_message'].timestamp if x['last_message'] else None,
        reverse=True
    )
    
    return render(request, 'chat.html', {
        'room_name': room_name,
        'chats': chats,
        'users': user_last_message,
        'search_query': search_query,
        'user_last_message': user_last_message
    })