document.addEventListener('DOMContentLoaded', function() {
    

    document.querySelector("#post-form").addEventListener('submit', submit);
    document.querySelector("#post-form").addEventListener('submit', function(event){
        event.preventDefault()
      });

    all_posts();  
})

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
            elementuser.innerHTML = `by ${posts[index].user}`;
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
            element.setAttribute("id",`like${index}`);
            document.querySelector(`#timestamp${index}`).append(elementlikes);

            // Like button
            const likebutton = document.createElement('input');
            likebutton.setAttribute("type", "button");
            likebutton.setAttribute("value", "Like!");
            likebutton.setAttribute("class", `likes btn btn-outline-info`);
            document.querySelector(`#like${index}`).append(likebutton);

        })
        

    });
}