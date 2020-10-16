document.addEventListener('DOMContentLoaded', function() {
    
    
    if (document.querySelector("#post-form")) {
        document.querySelector("#post-form").addEventListener('submit', submit);
        document.querySelector("#post-form").addEventListener('submit', function(event){
            event.preventDefault()
      });
    }; 

    if (document.querySelector("#post-form")) { 
        
    // Load all posts when page loads.
    all_posts();  
    } else if (document.querySelector('#follows')){ 
        user_posts();
    }

    if (document.querySelector('#follows')) {
        // Follow or Unfollow User
        const u1 = document.querySelector('#watcher').dataset.foll;
        const u2 = document.querySelector('#watchee').dataset.foll;
        document.querySelector('#followbutton').addEventListener('click', () => follow(u1, u2));
    }

    if (window.location.pathname === "/followers") {
        followers();
    }
});

// Submit a post
function submit() {
    fetch('/post', {
        method: 'POST',
        body: JSON.stringify({
          text: document.querySelector('#post-text').value
        })
      })
      .then(response => response.json())
      .then(result => {
        console.log(result)
        
        document.querySelector('#post-form').style.display = 'none';
        document.querySelector('#success').style.display = 'block';

      });
      return false;
}

// Load all posts
function all_posts() {
    fetch('/posts')
    .then(response => response.json())
    .then(posts => {

       // Make a list of the posts 
        generateposts(posts);

        // Add event listeners for Like buttons
        likelisten();
                   

    });
}

// Follow or Unfollow User
function follow(user1, user2) {
    
    const f  = document.querySelector('#followbutton').dataset.follow;

    var meth = 'POST';

    if (f === "unfollow") {
        meth = 'DELETE';
    };

    fetch('/follower', {
        method: meth,
        body: JSON.stringify({
          userwatcher: user1,
          userwatchee: user2
        })
      })
      .then(response => response.json())
      .then(result => {
          if (meth === 'DELETE') {
            document.querySelector("#followbutton").innerHTML = "Follow";
        } else if (meth === 'POST') {
            document.querySelector("#followbutton").innerHTML = "Unfollow";
        }        
        console.log(result)
    
      });
      return false;
}

// Get a specific users posts
function user_posts() {
    const path = window.location.pathname.split('/');
    const userid = path[2]
    fetch(`/userposts/${userid}`)
    .then(response => response.json())
    .then(posts => {

       // Make a list of the posts 
        generateposts(posts);

        // Add event listeners for Like buttons
        likelisten();

        // Display Followers and Following Count
        document.querySelector('#following').innerHTML = `Following: ${posts[0].following}`;
        document.querySelector('#followers').innerHTML = `Followers: ${posts[0].followers}`;

        // Check if user is already following and set button correctly
        if (posts[0].user_is_following === 1) {
            document.querySelector("#followbutton").innerHTML = "Unfollow";
            document.querySelector("#followbutton").setAttribute("data-follow", "unfollow");
        }
                   

    });

}

// Load Followers Page
function followers() {
    document.querySelector
    const user_id = document.querySelector('#watcher').dataset.foll;
    fetch(`/watching/${user_id}`)
    .then(response => response.json())
    .then(posts => {

        // Make a list of the posts 
         generateposts(posts);
 
         // Add event listeners for Like buttons
         likelisten();
 
    });
}


// Function for like button and amount
function likelisten() {

    document.querySelectorAll('input.likes').forEach((input,index) => {
        input.onclick = () => {
            // Add to like count
            
            const newlike = document.querySelector(`#like${input.dataset.num}`);

            if (newlike.dataset.l === "like") {
            newlike.innerHTML = `Likes: ${input.dataset.lik++}`;
            newlike.innerHTML = `Likes: ${input.dataset.lik}`;
            newlike.dataset.l = "unlike";
            document.querySelector(`#lbutton${input.dataset.num}`).value = "Unlike.";
            likeadd(input.dataset.postid, "add");
            
            } else { 
                newlike.innerHTML = `Likes: ${input.dataset.lik--}`;
                newlike.innerHTML = `Likes: ${input.dataset.lik}`;
                newlike.dataset.l = "like";
                document.querySelector(`#lbutton${input.dataset.num}`).value = "Like!";
                likeadd(input.dataset.postid, "subtract");

            }
            
        };
        
    });

    // Add for edit buttons as well
    document.querySelectorAll('input.edit').forEach((input, index) => {
        input.onclick = () => {
            document.querySelector(`#text${index}`).style.display = "None";
            document.querySelector(`#tarea${index}`).style.display = "block";
            document.querySelector(`#save${index}`).style.display = "block";

            ebutton = document.querySelector(`#edit${index}`);
            lbutton = document.querySelector(`#lbutton${index}`)

            // Call to JSON update function
            editpost(index);


        }

    });
}

// JSON call to update likes
function likeadd(postid, change) {
    if (change === "add") {
        fetch(`/like/${postid}`, {
            method: "Post"
        })
    
    .then(response => response.json())
    .then(info => {
        console.log(info)
        })
    }
    else if (change === "subtract") {
        fetch(`/like/${postid}`, {
            method: "Delete"
        })
    
    .then(response => response.json())
    .then(info => {
        console.log(info)
        })
    }

}

// JSON update to edit post. 
function editpost(index) {
    save = document.querySelector(`#save${index}`);
    save.onclick = () => {
        text = document.querySelector(`#tarea${index}`);
        
        
        fetch(`/edit/${save.dataset.postid}`, {
            method: "Post",
            body: JSON.stringify({
                text: text.value
              })

        })
        .then(response => response.json())
        .then(post => {
            console.log(post)
            document.querySelector(`#text${index}`).innerHTML = text.value;
            document.querySelector(`#text${index}`).style.display = "block";
            
            // Replace Edit and Like Button
            document.querySelector(`#text${index}`).append(ebutton);
            document.querySelector(`#text${index}`).append(lbutton);

            document.querySelector(`#tarea${index}`).style.display = "None";
            document.querySelector(`#save${index}`).style.display = "None";
            

        })
    }
    

}

function generateposts(posts) {
     // Print emails
     console.log(posts);
     posts.order //Does this line do anything or was it a mistake?
     posts.forEach((post, index) => {

         // Div Container for each post
         const postdiv = document.createElement('div');
         postdiv.setAttribute("class", "post-container");
         postdiv.setAttribute("id", `post-container${index}`);
         postdiv.setAttribute("data-postid", `${posts[index].id}`);
         document.querySelector('#all-posts').append(postdiv)

         // Post text
         const element = document.createElement('div');
         element.innerHTML = posts[index].text;
         element.setAttribute("id",`text${index}`);
         element.setAttribute("data-postid", `${posts[index].id}`);
         document.querySelector(`#post-container${index}`).append(element);

         // Textarea for editing
         const tarea = document.createElement('textarea');
         tarea.setAttribute("id",`tarea${index}`);
         tarea.setAttribute("class",`tarea`);
         tarea.style.display = "None";
         tarea.innerHTML = posts[index].text;
         tarea.setAttribute("data-postid", `${posts[index].id}`);
         document.querySelector(`#post-container${index}`).append(tarea);

         // Save Button for that Edit
         const editsave = document.createElement('input');
         editsave.setAttribute("type", "button");
         editsave.setAttribute("value", "Save");
         editsave.setAttribute("id", `save${index}`);
         editsave.setAttribute("class", `save btn btn-outline-info`);
         editsave.setAttribute("data-postid", `${posts[index].id}`);
         editsave.style.display = "None";
         document.querySelector(`#post-container${index}`).append(editsave);


         // Post User
         const elementuser = document.createElement('div');
         elementuser.innerHTML = `by <a class="userlink" href="/user/${posts[index].user_id}">${posts[index].user}</a>`;
         elementuser.setAttribute("id",`user${index}`);
         document.querySelector(`#post-container${index}`).append(elementuser);

         // Post Timestamp
         const elementtime = document.createElement('div');
         elementtime.innerHTML = `at ${posts[index].timestamp}`;
         elementtime.setAttribute("id",`timestamp${index}`);
         document.querySelector(`#post-container${index}`).append(elementtime);

         // Likes
         const elementlikes = document.createElement('span');
         elementlikes.innerHTML = `Likes: ${posts[index].likes}`;
         elementlikes.setAttribute("class", "likeamount");
         elementlikes.setAttribute("data-lik", `${posts[index].likes}`);
         elementlikes.setAttribute("data-num", `${index}`);
         elementlikes.setAttribute("data-l", "like");
         if (posts[index].user_has_liked === "yes") {
            elementlikes.setAttribute("data-l", "unlike");
         }
         elementlikes.setAttribute("id",`like${index}`);
         document.querySelector(`#timestamp${index}`).append(elementlikes);

         // Edit Button
         const editbutton = document.createElement('input');
         editbutton.setAttribute("type", "button");
         editbutton.setAttribute("value", "Edit");
         editbutton.setAttribute("id", `edit${index}`);
         editbutton.setAttribute("class", `edit btn btn-outline-info`);
         document.querySelector(`#text${index}`).append(editbutton);
         document.querySelector(`#edit${index}`).style.visibility = 'display';
         

            // Only display for my own posts
            if ( document.querySelector('#watcher').dataset.foll != posts[index].user_id) {
                document.querySelector(`#edit${index}`).style.visibility = 'hidden';

            };

         // Like button
         const likebutton = document.createElement('input');
         likebutton.setAttribute("type", "button");
         likebutton.setAttribute("data-lik", `${posts[index].likes}`);
         likebutton.setAttribute("data-num", `${index}`);
         likebutton.setAttribute("data-postid", `${posts[index].id}`);
         likebutton.setAttribute("value", "Like!");
         if (posts[index].user_has_liked === "yes") {
            likebutton.setAttribute("value", "Unlike.");
         }
         likebutton.setAttribute("class", `likes btn btn-outline-info`);
         likebutton.setAttribute("id", `lbutton${index}`);
         document.querySelector(`#text${index}`).append(likebutton);

     })
}

