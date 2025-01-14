from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

# index page view, index.html located in templates
def home(request):
    return render(request, 'index.html')

def app(request):
    return render(request, 'app.html')
