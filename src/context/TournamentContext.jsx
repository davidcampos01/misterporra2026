import { createContext, useContext } from "react";

// Provides: { fixtures, groups, tournament }
export const TournamentContext = createContext(null);

export function useTournament() {
  return useContext(TournamentContext);
}
