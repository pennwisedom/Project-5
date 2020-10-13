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
    } else { 
        user_posts();
    }

    if (document.querySelector('#follows')) {
        // Follow or Unfollow User
        const u1 = document.querySelector('#watcher').dataset.foll;
        const u2 = document.querySelector('#watchee').dataset.foll;
        document.querySelector('#followbutton').addEventListener('click', () => follow(u1, u2));
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


// Function for like button and amount
function likelisten() {

    document.querySelectorAll('input.likes').forEach((input,index) => {
        input.onclick = () => {
            // Add to like count
            
            const newlike = document.querySelector(`#like${input.dataset.num}`);;
            console.log(input.dataset.lik);
            console.log(input.dataset.num);
            newlike.innerHTML = `Likes: ${input.dataset.lik++}`;
            
        };
        
    });
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
         document.querySelector('#all-posts').append(postdiv)

         // Post text
         const element = document.createElement('div');
         element.innerHTML = posts[index].text;
         element.setAttribute("id",`text${index}`);
         document.querySelector(`#post-container${index}`).append(element);

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
         elementlikes.setAttribute("id",`like${index}`);
         document.querySelector(`#timestamp${index}`).append(elementlikes);

         // Like button
         const likebutton = document.createElement('input');
         likebutton.setAttribute("type", "button");
         likebutton.setAttribute("data-lik", `${posts[index].likes}`);
         likebutton.setAttribute("data-num", `${index}`);
         likebutton.setAttribute("value", "Like!");
         likebutton.setAttribute("class", `likes btn btn-outline-info`);
         document.querySelector(`#text${index}`).append(likebutton);

     })
}

