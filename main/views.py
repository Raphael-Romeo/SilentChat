from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required

# index page view, index.html located in templates
def home(request):
    return render(request, 'index.html')

@login_required
def app(request):
    return render(request, 'app.html')

# User registration and login/logout views
def register_user(request):
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
            return render(request, 'index.html')
        else:
            messages.error(request, 'Invalid credentials')
            return render(request, 'login.html')
    
    return render(request, 'login.html')

def logout_user(request):
    logout(request)
    messages.success(request, 'You are now logged out')
    return render(request, 'index.html')