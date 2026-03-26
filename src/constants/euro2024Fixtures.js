// Eurocopa Alemania 2024 — 51 partidos (36 grupos + 15 eliminatorias)
// group "R16"/"QF"/"SF"/"FINAL" para rondas eliminatorias
// Los resultados son cargados automáticamente por el API sync

export const EURO2024_FIXTURES = [
  // ── GRUPO A ──────────────────────────────────────────
  { id: 1001, date: "2024-06-14", timeES: "21:00", group: "A", home: "Alemania",     away: "Escocia",      venue: "Múnich",      matchday: 1 },
  { id: 1002, date: "2024-06-15", timeES: "15:00", group: "A", home: "Hungría",      away: "Suiza",        venue: "Colonia",      matchday: 1 },
  { id: 1003, date: "2024-06-19", timeES: "18:00", group: "A", home: "Alemania",     away: "Hungría",      venue: "Stuttgart",    matchday: 2 },
  { id: 1004, date: "2024-06-19", timeES: "21:00", group: "A", home: "Escocia",      away: "Suiza",        venue: "Colonia",      matchday: 2 },
  { id: 1005, date: "2024-06-23", timeES: "21:00", group: "A", home: "Suiza",        away: "Alemania",     venue: "Frankfurt",    matchday: 3 },
  { id: 1006, date: "2024-06-23", timeES: "21:00", group: "A", home: "Escocia",      away: "Hungría",      venue: "Stuttgart",    matchday: 3 },

  // ── GRUPO B ──────────────────────────────────────────
  { id: 1007, date: "2024-06-15", timeES: "18:00", group: "B", home: "España",       away: "Croacia",      venue: "Berlín",       matchday: 1 },
  { id: 1008, date: "2024-06-15", timeES: "21:00", group: "B", home: "Italia",       away: "Albania",      venue: "Dortmund",     matchday: 1 },
  { id: 1009, date: "2024-06-19", timeES: "15:00", group: "B", home: "Croacia",      away: "Albania",      venue: "Hamburgo",     matchday: 2 },
  { id: 1010, date: "2024-06-20", timeES: "21:00", group: "B", home: "España",       away: "Italia",       venue: "Gelsenkirchen",matchday: 2 },
  { id: 1011, date: "2024-06-24", timeES: "21:00", group: "B", home: "Albania",      away: "España",       venue: "Düsseldorf",   matchday: 3 },
  { id: 1012, date: "2024-06-24", timeES: "21:00", group: "B", home: "Croacia",      away: "Italia",       venue: "Leipzig",      matchday: 3 },

  // ── GRUPO C ──────────────────────────────────────────
  { id: 1013, date: "2024-06-16", timeES: "15:00", group: "C", home: "Eslovenia",    away: "Dinamarca",    venue: "Stuttgart",    matchday: 1 },
  { id: 1014, date: "2024-06-16", timeES: "21:00", group: "C", home: "Serbia",       away: "Inglaterra",   venue: "Gelsenkirchen",matchday: 1 },
  { id: 1015, date: "2024-06-20", timeES: "15:00", group: "C", home: "Eslovenia",    away: "Serbia",       venue: "Múnich",       matchday: 2 },
  { id: 1016, date: "2024-06-20", timeES: "18:00", group: "C", home: "Dinamarca",    away: "Inglaterra",   venue: "Frankfurt",    matchday: 2 },
  { id: 1017, date: "2024-06-25", timeES: "21:00", group: "C", home: "Inglaterra",   away: "Eslovenia",    venue: "Colonia",      matchday: 3 },
  { id: 1018, date: "2024-06-25", timeES: "21:00", group: "C", home: "Dinamarca",    away: "Serbia",       venue: "Múnich",       matchday: 3 },

  // ── GRUPO D ──────────────────────────────────────────
  { id: 1019, date: "2024-06-16", timeES: "18:00", group: "D", home: "Polonia",      away: "Países Bajos", venue: "Hamburgo",     matchday: 1 },
  { id: 1020, date: "2024-06-17", timeES: "21:00", group: "D", home: "Austria",      away: "Francia",      venue: "Düsseldorf",   matchday: 1 },
  { id: 1021, date: "2024-06-21", timeES: "18:00", group: "D", home: "Polonia",      away: "Austria",      venue: "Berlín",       matchday: 2 },
  { id: 1022, date: "2024-06-21", timeES: "21:00", group: "D", home: "Países Bajos", away: "Francia",      venue: "Leipzig",      matchday: 2 },
  { id: 1023, date: "2024-06-25", timeES: "18:00", group: "D", home: "Países Bajos", away: "Austria",      venue: "Berlín",       matchday: 3 },
  { id: 1024, date: "2024-06-25", timeES: "18:00", group: "D", home: "Francia",      away: "Polonia",      venue: "Dortmund",     matchday: 3 },

  // ── GRUPO E ──────────────────────────────────────────
  { id: 1025, date: "2024-06-17", timeES: "15:00", group: "E", home: "Rumanía",      away: "Ucrania",      venue: "Múnich",       matchday: 1 },
  { id: 1026, date: "2024-06-17", timeES: "18:00", group: "E", home: "Bélgica",      away: "Eslovaquia",   venue: "Frankfurt",    matchday: 1 },
  { id: 1027, date: "2024-06-21", timeES: "15:00", group: "E", home: "Eslovaquia",   away: "Ucrania",      venue: "Düsseldorf",   matchday: 2 },
  { id: 1028, date: "2024-06-22", timeES: "18:00", group: "E", home: "Bélgica",      away: "Rumanía",      venue: "Colonia",      matchday: 2 },
  { id: 1029, date: "2024-06-26", timeES: "18:00", group: "E", home: "Eslovaquia",   away: "Rumanía",      venue: "Frankfurt",    matchday: 3 },
  { id: 1030, date: "2024-06-26", timeES: "18:00", group: "E", home: "Ucrania",      away: "Bélgica",      venue: "Stuttgart",    matchday: 3 },

  // ── GRUPO F ──────────────────────────────────────────
  { id: 1031, date: "2024-06-18", timeES: "18:00", group: "F", home: "Turquía",      away: "Georgia",      venue: "Dortmund",     matchday: 1 },
  { id: 1032, date: "2024-06-18", timeES: "21:00", group: "F", home: "Portugal",     away: "Chequia",      venue: "Leipzig",      matchday: 1 },
  { id: 1033, date: "2024-06-22", timeES: "15:00", group: "F", home: "Georgia",      away: "Chequia",      venue: "Hamburgo",     matchday: 2 },
  { id: 1034, date: "2024-06-22", timeES: "21:00", group: "F", home: "Turquía",      away: "Portugal",     venue: "Dortmund",     matchday: 2 },
  { id: 1035, date: "2024-06-26", timeES: "21:00", group: "F", home: "Chequia",      away: "Turquía",      venue: "Hamburgo",     matchday: 3 },
  { id: 1036, date: "2024-06-26", timeES: "21:00", group: "F", home: "Georgia",      away: "Portugal",     venue: "Gelsenkirchen",matchday: 3 },

  // ── OCTAVOS (R16) ─────────────────────────────────────
  // Equipos reales que jugaron Euro 2024 — resultados via API sync
  { id: 1037, date: "2024-06-29", timeES: "18:00", group: "R16", home: "Alemania",     away: "Dinamarca",    venue: "Dortmund"   },
  { id: 1038, date: "2024-06-29", timeES: "21:00", group: "R16", home: "España",        away: "Georgia",      venue: "Colonia"    },
  { id: 1039, date: "2024-06-30", timeES: "18:00", group: "R16", home: "Francia",       away: "Bélgica",      venue: "Düsseldorf" },
  { id: 1040, date: "2024-06-30", timeES: "21:00", group: "R16", home: "Portugal",      away: "Eslovenia",    venue: "Frankfurt"  },
  { id: 1041, date: "2024-07-01", timeES: "18:00", group: "R16", home: "Rumanía",       away: "Países Bajos", venue: "Múnich"     },
  { id: 1042, date: "2024-07-01", timeES: "21:00", group: "R16", home: "Austria",       away: "Turquía",      venue: "Leipzig"    },
  { id: 1043, date: "2024-07-02", timeES: "18:00", group: "R16", home: "Inglaterra",    away: "Eslovaquia",   venue: "Gelsenkirchen"},
  { id: 1044, date: "2024-07-02", timeES: "21:00", group: "R16", home: "Suiza",         away: "Italia",       venue: "Berlín"     },

  // ── CUARTOS (QF) ──────────────────────────────────────
  // winner(1037) vs winner(1038), winner(1039) vs winner(1040), etc.
  { id: 1045, date: "2024-07-05", timeES: "18:00", group: "QF", home: "España",        away: "Alemania",     venue: "Stuttgart"  },
  { id: 1046, date: "2024-07-05", timeES: "21:00", group: "QF", home: "Francia",       away: "Portugal",     venue: "Hamburgo"   },
  { id: 1047, date: "2024-07-06", timeES: "18:00", group: "QF", home: "Países Bajos",  away: "Turquía",      venue: "Berlín"     },
  { id: 1048, date: "2024-07-06", timeES: "21:00", group: "QF", home: "Inglaterra",    away: "Suiza",        venue: "Düsseldorf" },

  // ── SEMIFINALES (SF) ──────────────────────────────────
  // winner(1045) vs winner(1046), winner(1047) vs winner(1048)
  { id: 1049, date: "2024-07-09", timeES: "21:00", group: "SF", home: "España",        away: "Francia",      venue: "Múnich"     },
  { id: 1050, date: "2024-07-10", timeES: "21:00", group: "SF", home: "Países Bajos",  away: "Inglaterra",   venue: "Dortmund"   },

  // ── FINAL ─────────────────────────────────────────────
  { id: 1051, date: "2024-07-14", timeES: "21:00", group: "FINAL", home: "España",     away: "Inglaterra",   venue: "Berlín"     },
];
