import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, WatchList, Likes


def index(request):
    return render(request, "network/index.html")

# Show all posts
@login_required
def posts(request):
    posts = Post.objects.all()
    posts = posts.order_by("-timestamp")
    return JsonResponse([post.serialize(user=request.user.id) for post in posts], safe=False)

# Display a Users Profile page
@login_required
def userpage(request, id):
    profile = User.objects.get(id=id)
    return render(request, "network/userpage.html", {"profile": profile})

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
    
        follow = WatchList()
        follow.save()
        follow.userwatcher.add(data["userwatcher"])
        follow.userwatchee.add(data["userwatchee"])
        return JsonResponse({"Following": "Successful"}, status=200)

    if request.method == "DELETE":
        unfollow = WatchList.objects.get(userwatcher=data["userwatcher"], userwatchee=data["userwatchee"])
        unfollow.delete()
        return JsonResponse({"DELETED": "DELETED"}, status=200)

# Followers Page
@login_required
def followers(request):
    return render(request, "network/followers.html")

# Query for Followers to Display
def watching(request, ui):
    people = WatchList.objects.filter(userwatcher=ui)
    watchlist = []
    for person in people:
        watchlist.append(person.userwatchee.get().id)

    watch = Post.objects.filter(user__in=watchlist)
    return JsonResponse([watchs.serialize() for watchs in watch], safe=False)


# Add to likes
@csrf_exempt
@login_required
def like(request, postid):
    if request.method == "POST":
        like = Likes(post=Post.objects.get(pk=postid))
        like.save()
        like.user.add(request.user)
        print(like)
        return JsonResponse({"Like": "Updated Successfully"}, status=201)
    elif request.method == "DELETE":
        unlike = Likes.objects.get(post=postid, user=request.user)
        unlike.delete()
        return JsonResponse({"Unike": "Updated Successfully"}, status=201)
    else:
        return JsonResponse({"error": "GET requests disallowed"}, status=400)


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

 # Update Post   

@csrf_exempt
@login_required
def edit(request, postid):

    if request.method == "POST":        
        update = Post.objects.get(pk=postid)
        # Check if user is the post creator
        if (request.user == update.user):
            response = json.loads(request.body)
            newpost = response["text"]
            update.text = newpost
            update.save()
            return JsonResponse({"Post": "Updated Succesfully"}, status=201)
        else:
            return JsonResponse({"Error": "Post can only be updated by post creator."}, status=500)
    


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
