const socket = io();

const websiteName = document.getElementById('websiteName');
const userCount = document.getElementById('userCount');
const thoughtForm = document.getElementById('thoughtForm');
const thoughtInput = document.getElementById('thoughtInput');
const thoughtsContainer = document.getElementById('thoughts');

let isAdmin = true;
let key = '';
let userVotes = new Set();
let ip = '';


console.log('[script.js loaded]')
document.addEventListener('DOMContentLoaded', ()=>{
  // console.log('[+] DOM Loaded');
  socket.emit('websiteName');
  socket.emit('ip');
})

// Fetch website name
socket.on('websiteName', (websiteName) => {
  document.title = websiteName;
  // console.log('[+] set title')
  loadThoughts();
})

socket.on('ip', (ip) =>{
    ip = ip;
    // console.log('[+] ip: ', ip)
})

function loadThoughts(){
  socket.emit('load', key);
}

socket.on('load', (props) =>{
    // console.log('[+] loading thoughts')
    userVotes = new Set(props.userVotes);
    isAdmin = props.isAdmin;
    thoughtsContainer.innerHTML = '';
    // console.log(props.thoughts);
    display(props.thoughts);
})

socket.on('updateOnlineUsers', (count) => {
  userCount.textContent = count;
});

socket.on('updateThoughts', (thoughts) => {
  thoughtsContainer.innerHTML = '';
  // console.log(thoughts)
  display(thoughts);
  // thoughts.forEach(thought => {
  //   const thoughtElement = createThoughtElement(thought);
  //   thoughtsContainer.appendChild(thoughtElement);
  // });
});

socket.on('userBlocked', () => {
  alert('You have been blocked from submitting thoughts!');
});

thoughtForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const content = thoughtInput.value.trim();
  if (content) {
    socket.emit('newThought', {thought: content, key: key});
    thoughtInput.value = '';
  }
});

function display(thoughts){
  thoughts.forEach(thought => {
    const thoughtElement = createThoughtElement(thought);
    thoughtsContainer.appendChild(thoughtElement);
  });
}

function createThoughtElement(thought) {
  const element = document.createElement('div');
  element.className = 'thought';
  if(isAdmin) element.setAttribute('class', 'thought adminView');
  element.innerHTML = `
    <p>${thought.content}</p>
    <div class="voteCount">${thought.votes} <span class="voteButton ${userVotes.has(thought.id) ? 'voted' : ''}">▲</span></div>
    ${isAdmin ? `
      <button class="deleteButton">Delete</button>
      <button class="blockButton">Block</button>
      <span class="thoughtIp">${thought.ip || ''}</span>
    ` : ''}
  `;

  const voteButton = element.querySelector('.voteButton');
  voteButton.addEventListener('click', () => {
    if(voteButton.classList.contains('voted')){
      userVotes.delete(thought.id);
      voteButton.classList.remove('voted');
      socket.emit('deleteVote', {thoughtId: thought.id, key: key});
    }
    else{
      if (!userVotes.has(thought.id)) {
        userVotes.add(thought.id);
        voteButton.classList.add('voted');
        socket.emit('vote', {thoughtId: thought.id, key: key});
      }
    }
  });


  // admin controls
  if(isAdmin){
    element.querySelector('.deleteButton').addEventListener('click', () => {
      if (isAdmin) {
        fetch('/admin/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: key, thoughtId: thought.id })
        });
      }
    });

    element.querySelector('.blockButton').addEventListener('click', () => {
      if (isAdmin) {
        let userIP = element.querySelector('.thoughtIp').textContent;
        fetch('/admin/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: key, userIP: userIP })
        });
      }
    });
  }
  return element;
}


// Admin login (for demonstration purposes, you should use a more secure method in production)
// You can call adminLogin() when needed, e.g., by adding a hidden button or using a specific key combination


