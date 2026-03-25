import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const STATE_REF = doc(db, "game", "state");

const DEFAULT_STATE = {
  players: [{ name: "Jugador 1" }, { name: "Jugador 2" }],
  results: {},
  predictions: { "0": {}, "1": {} },
};

export function useGameState() {
  const [gameState, setGameState] = useState(null); // null = cargando

  useEffect(() => {
    const unsub = onSnapshot(STATE_REF, (snap) => {
      if (snap.exists()) {
        setGameState(snap.data());
      } else {
        // Primera vez: inicializar el documento
        setDoc(STATE_REF, DEFAULT_STATE);
        setGameState(DEFAULT_STATE);
      }
    });
    return unsub;
  }, []);

  const setResult = useCallback((matchId, key, val) => {
    updateDoc(STATE_REF, { [`results.${matchId}.${key}`]: val });
  }, []);

  const setPred = useCallback((playerIdx, matchId, key, val) => {
    updateDoc(STATE_REF, { [`predictions.${playerIdx}.${matchId}.${key}`]: val });
  }, []);

  const addPlayer = useCallback((currentPlayers) => {
    const idx = currentPlayers.length;
    updateDoc(STATE_REF, {
      players: [...currentPlayers, { name: `Jugador ${idx + 1}` }],
      [`predictions.${idx}`]: {},
    });
  }, []);

  const removePlayer = useCallback((idx, currentPlayers, currentPredictions) => {
    if (currentPlayers.length <= 2) return;
    const newPlayers = currentPlayers.filter((_, i) => i !== idx);
    // Re-indexar predicciones
    const newPreds = {};
    let newIdx = 0;
    for (let i = 0; i < currentPlayers.length; i++) {
      if (i !== idx) {
        newPreds[String(newIdx)] = currentPredictions[String(i)] ?? {};
        newIdx++;
      }
    }
    updateDoc(STATE_REF, { players: newPlayers, predictions: newPreds });
  }, []);

  const renamePlayer = useCallback((idx, name) => {
    updateDoc(STATE_REF, { [`players.${idx}.name`]: name });
  }, []);

  return { gameState, setResult, setPred, addPlayer, removePlayer, renamePlayer };
}
