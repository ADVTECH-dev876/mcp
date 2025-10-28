import { getFirestore, doc, onSnapshot, updateDoc, collection } from "firebase/firestore";

const db = getFirestore();

// Listen for real-time updates to the game state
function listenForGameState(matchId, onStateChange) {
  const gameRef = doc(db, "games", matchId);
  onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      onStateChange(doc.data());
    }
  });
}

// Function to update the game state (e.g., a player's move)
async function updateGameState(matchId, newState) {
  const gameRef = doc(db, "games", matchId);
  await updateDoc(gameRef, newState);
}

// Example usage: Player makes a move
async function makeMove(matchId, playerId, moveDetails) {
  const gameRef = doc(db, "games", matchId);
  // Get current game state to validate move
  const gameDoc = await getDoc(gameRef);
  if (gameDoc.exists() && gameDoc.data().turn === playerId) {
    const newState = {
      ...gameDoc.data(),
      // Logic for processing the move
      turn: gameDoc.data().players.find(p => p !== playerId), // Switch turns
      lastMove: moveDetails
    };
    await updateGameState(matchId, newState);
  }
}
