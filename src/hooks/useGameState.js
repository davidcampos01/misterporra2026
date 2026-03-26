import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const STATE_REF = doc(db, "game", "state");

const DEFAULT_STATE = {
  players: [{ name: "Jugador 1" }, { name: "Jugador 2" }],
  results: {},
  predictions: { "0": {}, "1": {} },
};

// Siempre usamos setDoc con merge:true — crea el documento si no existe
// y solo actualiza los campos indicados si ya existe. Nunca falla por
// "document not found" a diferencia de updateDoc.
function write(data) {
  return setDoc(STATE_REF, data, { merge: true });
}

export function useGameState() {
  const [gameState, setGameState] = useState(null);
  const [fbError, setFbError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFbError("timeout: no se pudo conectar con Firestore");
      setGameState(DEFAULT_STATE);
    }, 8000);

    const unsub = onSnapshot(
      STATE_REF,
      (snap) => {
        clearTimeout(timer);
        setFbError(null);
        if (snap.exists()) {
          setGameState(snap.data());
        } else {
          // Documento no existe → crearlo con el estado inicial
          write(DEFAULT_STATE);
          setGameState(DEFAULT_STATE);
        }
      },
      (err) => {
        clearTimeout(timer);
        console.error("Firestore error:", err.code, err.message);
        setFbError(err.code ?? err.message);
        setGameState(DEFAULT_STATE);
      }
    );
    return () => { clearTimeout(timer); unsub(); };
  }, []);

  const setResult = useCallback((matchId, key, val) => {
    write({ results: { [matchId]: { [key]: val } } });
  }, []);

  const setPred = useCallback((playerIdx, matchId, key, val) => {
    write({ predictions: { [playerIdx]: { [matchId]: { [key]: val } } } });
  }, []);

  const addPlayer = useCallback((currentPlayers, currentPredictions) => {
    const idx = currentPlayers.length;
    const newPreds = {};
    currentPlayers.forEach((_, i) => { newPreds[String(i)] = { ...currentPredictions[i] }; });
    newPreds[String(idx)] = {};
    write({ players: [...currentPlayers, { name: `Jugador ${idx + 1}` }], predictions: newPreds });
  }, []);

  const removePlayer = useCallback((idx, currentPlayers, currentPredictions) => {
    if (currentPlayers.length <= 2) return;
    const newPlayers = currentPlayers.filter((_, i) => i !== idx);
    const newPreds = {};
    let newIdx = 0;
    for (let i = 0; i < currentPlayers.length; i++) {
      if (i !== idx) { newPreds[String(newIdx)] = currentPredictions[i] ?? {}; newIdx++; }
    }
    write({ players: newPlayers, predictions: newPreds });
  }, []);

  const renamePlayer = useCallback((idx, name, currentPlayers) => {
    const newPlayers = currentPlayers.map((p, i) => i === idx ? { ...p, name } : p);
    write({ players: newPlayers });
  }, []);

  return { gameState, fbError, setResult, setPred, addPlayer, removePlayer, renamePlayer };
}
