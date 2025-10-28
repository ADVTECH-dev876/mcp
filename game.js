import { getFirestore, collection, addDoc, onSnapshot, where, query, limit, updateDoc, doc } from "firebase/firestore";

const db = getFirestore();
const queueRef = collection(db, "matchmaking");

// Function for a player to join the matchmaking queue
async function joinQueue(playerId) {
  await addDoc(queueRef, {
    playerId: playerId,
    timestamp: new Date(),
    status: "waiting"
  });
  console.log(`Player ${playerId} joined the queue.`);
}

// Listen for a match
function listenForMatch(playerId, onMatchFound) {
  const q = query(queueRef, where("playerId", "==", playerId), where("status", "==", "matched"));
  onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const matchData = doc.data();
      onMatchFound(matchData.matchId, matchData.opponentId);
    });
  });
}

// Server-side logic for matchmaking (using a Cloud Function)
// This would run on the server, not the client
// Example: Find two waiting players and update their status
async function runMatchmaking() {
  const q = query(queueRef, where("status", "==", "waiting"), limit(2));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.size === 2) {
    const players = querySnapshot.docs;
    const player1Id = players[0].data().playerId;
    const player2Id = players[1].data().playerId;
    const matchId = `match_${Date.now()}`;

    // Create a new game document
    await setDoc(doc(db, "games", matchId), {
      players: [player1Id, player2Id],
      state: "pending",
      turn: player1Id
    });

    // Update players in the matchmaking queue
    await updateDoc(doc(queueRef, players[0].id), {
      status: "matched",
      matchId: matchId,
      opponentId: player2Id
    });
    await updateDoc(doc(queueRef, players[1].id), {
      status: "matched",
      matchId: matchId,
      opponentId: player1Id
    });
  }
}
