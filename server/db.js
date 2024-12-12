let thoughts = [];
let thoughtId = 0;
let votes = [];

// async function getAdminByUsername(username) {
//   const query = 'SELECT * FROM admins WHERE username = $1';
//   const result = await pool.query(query, [username]);
//   return result.rows[0];
// }

module.exports = {
  refreshData: () => {
    thoughts = [];
    thoughtId = 0;
    votes = [];
  },

  addThought: (content, ip) => {
    // console.log(votes);
    thoughts.push({ id: thoughtId++, content, ip, votes: 0, voters: new Set() });
    thoughts.sort((a, b) => b.votes - a.votes);
  },

  voteThought: (id, ip) => {
    const thought = thoughts.find(t => t.id === id);
    if (thought && !thought.voters.has(ip)) {
      const user = votes.find(u => u.ip === ip);
      user.thoughtsIDUserVotedTo.add(id);
      thought.votes++;
      thought.voters.add(ip);
      thoughts.sort((a, b) => b.votes - a.votes);
    }
  },

  deleteThought: (id) => {
    thoughts = thoughts.filter(t => t.id !== id);
  },

  getThoughts: (key) => {
    // console.log('[all thoughts]', thoughts)
    let newThoughts;
    if(key===process.env.ADMIN_SECRET_KEY) newThoughts = thoughts.map(({ id, content, ip, votes }) => ({ id, content, ip, votes }))
    else newThoughts = thoughts.map(({ id, content, votes }) => ({ id, content, votes }))
    // console.log(newThoughts);
    return newThoughts;
  },

  setVotesOfUser: ip => {
    let user = votes.find(u => u.ip === ip);
    if(!user) votes.push({ip, thoughtsIDUserVotedTo: new Set()});
  },

  getVotes: ip => {
    try {
      const userVotes = votes.find(u => u.ip === ip);
      // votes.map(({thoughtsIDUserVotedTo}) => ({thoughtsIDUserVotedTo}))
      return userVotes.thoughtsIDUserVotedTo; 
    } catch (error) {
      return votes;
    }
  },

  deleteVote: (id, ip) => {
    const thought = thoughts.find(t => t.id === id);
    if (thought && thought.voters.has(ip)) {
      const user = votes.find(u => u.ip === ip);
      user.thoughtsIDUserVotedTo.delete(id);
      thought.votes--;
      thought.voters.delete(ip);
      thoughts.sort((a, b) => b.votes - a.votes);
    }
  },

  // getAdminByUsername
};
