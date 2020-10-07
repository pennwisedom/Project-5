document.addEventListener('DOMContentLoaded', function() {
    all_posts();   
})

// Load all posts
function all_posts() {
    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        // Print emails
        console.log(posts);
        posts.order
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
            elementlikes.innerHTML = `Likes: 0`;
            elementlikes.setAttribute("class", "likes");
            element.setAttribute("id",`user${index}`);
            document.querySelector(`#timestamp${index}`).append(elementlikes);

        })
        

    });
}