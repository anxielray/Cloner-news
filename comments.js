function toggleReply(button) {
    const replyForm = button.nextElementSibling;
    replyForm.style.display = replyForm.style.display === 'block' ? 'none' : 'block';
}

function submitReply(button) {
    const replyForm = button.parentElement;
    const replyInput = replyForm.querySelector('.reply-input');
    const replyText = replyInput.value.trim();

    if (replyText) {
        const repliesDiv = button.closest('.comment').querySelector('.replies');
        const newReply = document.createElement('div');

        newReply.classList.add('comment');
        newReply.innerHTML = `
            <div class="comment-header">You</div>
            <div class="comment-body">${replyText}</div>
            `;
        repliesDiv.appendChild(newReply);
        replyInput.value = '';
        toggleReply(button);
    } else {
        alert("Reply cannot be empty!");
    }
}


const toggleComments = (id) => {
    comments = collectComments(id);
    const comment = document.getElementById("comments");
    comment.innerHTML = "";
    const comm = createElement("div");
    comments.forEach(element => {
        comm.innerHTML = `
            <div class="comment">
            <div class="comment-header">${element.by}</div>
            <div class="comment-body">${element.text}</div>
            <button class="reply-button" onclick="toggleReply(this)">Reply</button>
            
            <div class="reply-form">
            <textarea class="reply-input" placeholder="Write a reply..."></textarea>
            <button class="submit-button" onclick="submitReply(this)">Submit Reply</button>
            </div>
            
            <div class="replies"></div>
            </div>
            `;
        comment.appendChild(comm);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("comments").addEventListener("click", toggleComments)
});