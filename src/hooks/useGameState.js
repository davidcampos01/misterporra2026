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
  const [gameState, setGameState] = useState(null);
  const [fbError, setFbError] = useState(null);

  useEffect(() => {
    // Si en 8s no hay respuesta, arrancar con estado local
    const timer = setTimeout(() => {
      setFbError("timeout");
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
          setDoc(STATE_REF, DEFAULT_STATE);
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

  // ─── Helpers para normalizar datos de Firestore ────────────────────────────
  // Firestore convierte arrays a objetos {"0":x,"1":x} cuando se usan
  // dot-notation updates. Siempre escribimos el objeto completo para evitarlo.

  const setResult = useCallback((matchId, key, val, currentResults) => {
    const updated = { ...currentResults, [matchId]: { ...currentResults?.[matchId], [key]: val } };
    updateDoc(STATE_REF, { results: updated });
  }, []);

  const setPred = useCallback((playerIdx, matchId, key, val, currentPlayers, currentPredictions) => {
    const newPreds = {};
    currentPlayers.forEach((_, i) => {
      newPreds[String(i)] = { ...currentPredictions[i] };
    });
    newPreds[String(playerIdx)] = {
      ...newPreds[String(playerIdx)],
      [matchId]: { ...newPreds[String(playerIdx)]?.[matchId], [key]: val },
    };
    updateDoc(STATE_REF, { predictions: newPreds });
  }, []);

  const addPlayer = useCallback((currentPlayers, currentPredictions) => {
    const idx = currentPlayers.length;
    const newPreds = {};
    currentPlayers.forEach((_, i) => { newPreds[String(i)] = { ...currentPredictions[i] }; });
    newPreds[String(idx)] = {};
    updateDoc(STATE_REF, {
      players: [...currentPlayers, { name: `Jugador ${idx + 1}` }],
      predictions: newPreds,
    });
  }, []);

  const removePlayer = useCallback((idx, currentPlayers, currentPredictions) => {
    if (currentPlayers.length <= 2) return;
    const newPlayers = currentPlayers.filter((_, i) => i !== idx);
    const newPreds = {};
    let newIdx = 0;
    for (let i = 0; i < currentPlayers.length; i++) {
      if (i !== idx) { newPreds[String(newIdx)] = currentPredictions[i] ?? {}; newIdx++; }
    }
    updateDoc(STATE_REF, { players: newPlayers, predictions: newPreds });
  }, []);

  const renamePlayer = useCallback((idx, name, currentPlayers) => {
    const newPlayers = currentPlayers.map((p, i) => i === idx ? { ...p, name } : p);
    updateDoc(STATE_REF, { players: newPlayers });
  }, []);

  return { gameState, fbError, setResult, setPred, addPlayer, removePlayer, renamePlayer };
}
