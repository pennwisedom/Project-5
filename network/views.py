import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, WatchList


def index(request):
    return render(request, "network/index.html")

# Show all posts
@login_required
def posts(request):
    posts = Post.objects.all()
    posts = posts.order_by("-timestamp")
    return JsonResponse([post.serialize() for post in posts], safe=False)

# Display a Users Profile page
@login_required
def userpage(request, id):
    return render(request, "network/userpage.html")

# JSON Request for User Profile Page
@login_required
def userposts(request, id):
    posts = Post.objects.filter(user=id)
    posts = posts.order_by("-timestamp")
    # Check if a user is following another already
    if WatchList.objects.filter(userwatcher=request.user.id, userwatchee=id):
        yes = 1
    else:
        yes = 0
    return JsonResponse([post.serialize(yes) for post in posts], safe=False)

# Follow and Unfollow
@csrf_exempt
@login_required
def follower(request):
    data = json.loads(request.body)

    if request.method == "POST":
    #    follow = WatchList(userwatcher=data["userwatcher"], userwatchee=data["userwatchee"])
        follow = WatchList()
        follow.save()
        follow.userwatcher.add(data["userwatcher"])
        follow.userwatchee.add(data["userwatchee"])
        return JsonResponse({"Following": "Successful"}, status=200)

    if request.method == "DELETE":
        unfollow = WatchList.objects.get(userwatcher=data["userwatcher"], userwatchee=data["userwatchee"])
        unfollow.delete()
        return JsonResponse({"DELETED": "DELETED"}, status=200)





# Add to likes
@csrf_exempt
@login_required
def like(request):
    pass

# Make a new post 
@csrf_exempt
@login_required
def post(request):

    # Request must be POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Otherwise create new Post
    data = json.loads(request.body)
    data["user"] = request.user
    new_post = Post(user=data["user"], text=data["text"])
    new_post.save()
    return JsonResponse({"Post": "Successful"}, status=200)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
