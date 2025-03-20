import json
from django.conf import settings
from django.core.paginator import Paginator
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from .models import Room, Topic, Message, User, MessageFile, AudioMessage
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from .form import RoomForm, UserForm, MyUserCreationForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.core.files.storage import default_storage, FileSystemStorage

# Create your views here.

def loginView(request):
    me = ''

    if request.user.is_authenticated:
        return redirect('home')

    if request.method == "POST":
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, email=email, password=password)

        if user != None:
            login(request, user)
            return redirect('home')
        else:
            me = "Invalid email or password!" 

    return render(request, 'base/login_register.html', {'me': me, 'page': 'login'})


def Userlogout(request):
    logout(request)
    return redirect('home')

def registerUser(request):
    form = MyUserCreationForm()
    me = ""

    if request.method == 'POST':
        form = MyUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
        else:
            me = 'User already exists or passwords did not match!'

    return render(request, 'base/login_register.html', {'me': me, 'form': form})




@login_required(login_url='login')
def updateUser(request):
    user = request.user
    form = UserForm(instance=user)

    if request.method == 'POST':
        form = UserForm(request.POST, request.FILES, instance=user) 
        if form.is_valid():
            form.save()
            return redirect('user-profile', pk=user.id)

    return render(request, 'base/update_user.html', {"form" : form})

@login_required(login_url='login')
@csrf_exempt
def update_avatar(request):
    user = request.user

    if request.method == 'POST' and request.FILES.get('avatar'):
        user.avatar = request.FILES['avatar']
        user.save()
        return JsonResponse({'success': True, 'avatar_url': user.avatar.url})

    return JsonResponse({'success': False, 'error': 'No avatar uploaded'}, status=400)

def userProfile(request, pk):
    user = User.objects.get(id=pk)
    rooms = user.room_set.all().order_by('-created')

    paginator = Paginator(rooms, 4) 
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    messages = user.message_set.all()
    topics = Topic.objects.all()

    return render(request, 'base/profile.html', {
        'user': user,
        'rooms': page_obj, 
        'messages': messages,
        'topics': topics
    })

def home(request):
    q = request.GET.get('q', '')
    rooms = Room.objects.filter(
        Q(topic__name__icontains=q) |
        Q(host__username__icontains=q) |
        Q(name__icontains=q) |
        Q(description__icontains=q) 
    )
    paginator = Paginator(rooms, 4) 
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    topics = Topic.objects.all()
    room_count = rooms.count()
    messages = Message.objects.filter(
        Q(room__topic__name__icontains=q) |
        Q(body__icontains=q)|
        Q(room__name__icontains=q)
    )[:5]

    return render(request, 'base/Home.html', {
        "rooms": page_obj, 
        "topics": topics,
        "room_count": room_count,
        "messages": messages
    })

def handle_uploaded_file(file):
    fs = FileSystemStorage(location=settings.MEDIA_ROOT / 'messages')
    filename = fs.save(file.name, file)  
    file_url = fs.url(filename)
    return file_url

def room(request, pk):
    room = Room.objects.get(id=pk)
    messages = room.message_set.prefetch_related('audiomessage', 'files').all()
    participants = room.participants.all()

    if request.method == "POST":
        body = request.POST.get('body', '').strip()
        files = request.FILES.getlist('file')
        audio_file = request.FILES.get('audio_file')

        # Create the message only if there is content (either text, file, or audio)
        if body or files or audio_file:
            # Create a message object with the body (if any)
            message = Message.objects.create(
                user=request.user,
                room=room,
                body=body if body else ""  # Ensure body is an empty string if no text
            )

            uploaded_files = set()

            # Handle uploaded files (attachments)
            for file in files:
                if file.name not in uploaded_files:
                    MessageFile.objects.create(message=message, file=file, original_name=file.name)
                    uploaded_files.add(file.name)

            # Handle audio file if provided
            if audio_file:
                # Make sure to create the AudioMessage and associate it with the same message
                audio_message = AudioMessage.objects.create(
                    user=request.user,
                    room=room,
                    message=message,  # Link the AudioMessage to the Message
                    audio_file=audio_file
                )
                print(f"AudioMessage created and linked to Message ID: {message.id}")  # Debugging line
            room.participants.add(request.user)
            return JsonResponse({"success": True, "message": "Message sent successfully"}, status=200)
        
        return JsonResponse({"error": "No message, file, or audio received"}, status=400)

    return render(request, 'base/room.html', {"room": room, "messages": messages, "participants": participants})




@login_required(login_url='login')
def createRoom(request):
    form = RoomForm()
    topics = Topic.objects.all()
    if request.method == 'POST':
        topic_name = request.POST.get('topic')
        topic, created = Topic.objects.get_or_create(name=topic_name)
        form = RoomForm(request.POST)
        Room.objects.create(
            host = request.user,
            topic = topic,
            name = request.POST.get('name'),
            description = request.POST.get('description')
        )
        return redirect("home")
    return render(request, 'base/room_form.html', {"form" : form , "topics" : topics})
@login_required(login_url='login')
def updateRoom(request, pk):
    room = Room.objects.get(id=pk)
    form = RoomForm(instance=room)
    topics = Topic.objects.all()
    if request.user != room.host:
        return HttpResponse('You are not allowed here!!')

    if request.method == 'POST':
        topic_name = request.POST.get('topic')
        topic, created = Topic.objects.get_or_create(name=topic_name)
        room.name = request.POST.get('name')
        room.description = request.POST.get('description')
        room.topic = topic
        room.save()
        return redirect('home')
    return render(request, 'base/room_form.html', {'form' : form, "topics" : topics, "room" : room})

@login_required(login_url='login')
def deleteRoom(request, pk):
    room = Room.objects.get(id=pk)
    if request.user != room.host:
        return HttpResponse('You can\'t delete this room!!')
    if request.method == 'POST':
        room.delete()
        return redirect('home')
    return render(request, 'base/delete.html', {'obj' : room})
@login_required(login_url='login')
def deleteMessage(request, pk):
    message = get_object_or_404(Message, id=pk) 

    if request.user != message.user:
        return HttpResponse("You can't delete this message!")

    if request.method == "POST":
        room = message.room 
        message.delete()  
        userMessages = Message.objects.filter(room=room, user=request.user).exists()

        if not userMessages:
            room.participants.remove(request.user)

        next_url = request.GET.get("next") or request.META.get("HTTP_REFERER") or "home"
        return redirect(next_url)  

    return render(request, "base/delete.html", {"obj": message, 'page': 'delete_message'})


@ensure_csrf_cookie
def edit_message(request, pk):
    message = get_object_or_404(Message, id=pk)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            new_text = data.get("new_text", "").strip()

            if not new_text:
                return JsonResponse({"success": False, "error": "Message cannot be empty"}, status=400)

            message.body = new_text
            message.save()
            return JsonResponse({"success": True, "new_text": new_text})

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

    return JsonResponse({"success": False, "error": "Invalid request"}, status=405)

def room_list(request):
    rooms = Room.objects.all() 
    paginator = Paginator(rooms, 5)  

    page_number = request.GET.get("page") 
    page_obj = paginator.get_page(page_number) 

    return render(request, "room_component.html", {"page_obj": page_obj})

#! Mobile Menu
def topicsPage(request):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    topics = Topic.objects.filter(name__icontains=q)
    return render (request, 'base/topics.html', {"topics": topics})

def activityPage(request):
    messages = Message.objects.all()[:5]
    return render(request, 'base/activity.html', {"messages" : messages})