import {
  PLAYOFF_INT1, PLAYOFF_INT2,
} from "./groups";

export const FIXTURES = [
  // J1 ── 11 junio
  { id: 1,  date: "2026-06-11", timeES: "21:00",    group: "A", home: "México",         away: "Sudáfrica",       venue: "Azteca, CDMX",              matchday: 1 },
  { id: 2,  date: "2026-06-11", timeES: "04:00+1",  group: "A", home: "Corea del Sur",  away: "Chequia",    venue: "Akron, Zapopan",            matchday: 1 },
  // J1 ── 12 junio
  { id: 3,  date: "2026-06-12", timeES: "19:00",    group: "B", home: "Canadá",         away: "Bosnia",    venue: "BMO Field, Toronto",        matchday: 1 },
  { id: 4,  date: "2026-06-12", timeES: "22:00",    group: "B", home: "Qatar",          away: "Suiza",           venue: "Levi's, Santa Clara",       matchday: 1 },
  { id: 5,  date: "2026-06-12", timeES: "01:00+1",  group: "D", home: "EE.UU.",         away: "Paraguay",        venue: "SoFi, Inglewood",           matchday: 1 },
  // J1 ── 13 junio
  { id: 6,  date: "2026-06-13", timeES: "00:00",    group: "C", home: "Brasil",         away: "Marruecos",       venue: "MetLife, NJ",               matchday: 1 },
  { id: 7,  date: "2026-06-13", timeES: "03:00",    group: "C", home: "Haití",          away: "Escocia",         venue: "Gillette, Foxborough",      matchday: 1 },
  // J1 ── 14 junio
  { id: 8,  date: "2026-06-14", timeES: "07:00",    group: "D", home: "Australia",      away: "Turquía",    venue: "BC Place, Vancouver",       matchday: 1 },
  { id: 9,  date: "2026-06-14", timeES: "17:00",    group: "E", home: "Alemania",       away: "Curazao",         venue: "NRG, Houston",              matchday: 1 },
  { id: 10, date: "2026-06-14", timeES: "20:00",    group: "F", home: "Países Bajos",   away: "Japón",           venue: "AT&T, Arlington",           matchday: 1 },
  { id: 11, date: "2026-06-14", timeES: "23:00",    group: "E", home: "Costa de Marfil",away: "Ecuador",         venue: "Lincoln, Phila.",           matchday: 1 },
  { id: 12, date: "2026-06-15", timeES: "02:00",    group: "F", home: "Suecia",   away: "Túnez",           venue: "BBVA, Guadalupe",           matchday: 1 },
  // J1 ── 15 junio
  { id: 13, date: "2026-06-15", timeES: "16:00",    group: "H", home: "España",         away: "Cabo Verde",      venue: "Mercedes-Benz, Atlanta",    matchday: 1 },
  { id: 14, date: "2026-06-15", timeES: "19:00",    group: "G", home: "Bélgica",        away: "Egipto",          venue: "Lumen Field, Seattle",      matchday: 1 },
  { id: 15, date: "2026-06-15", timeES: "22:00",    group: "H", home: "Arabia Saudí",   away: "Uruguay",         venue: "Hard Rock, Miami",          matchday: 1 },
  { id: 16, date: "2026-06-16", timeES: "01:00",    group: "G", home: "Irán",           away: "Nueva Zelanda",   venue: "SoFi, Inglewood",           matchday: 1 },
  // J1 ── 16 junio
  { id: 17, date: "2026-06-16", timeES: "19:00",    group: "I", home: "Francia",        away: "Senegal",         venue: "MetLife, NJ",               matchday: 1 },
  { id: 18, date: "2026-06-16", timeES: "22:00",    group: "I", home: PLAYOFF_INT2,     away: "Noruega",         venue: "Gillette, Foxborough",      matchday: 1 },
  { id: 19, date: "2026-06-17", timeES: "01:00",    group: "J", home: "Argentina",      away: "Argelia",         venue: "Arrowhead, KC",             matchday: 1 },
  // J1 ── 17 junio
  { id: 20, date: "2026-06-17", timeES: "04:00",    group: "J", home: "Austria",        away: "Jordania",        venue: "Levi's, Santa Clara",       matchday: 1 },
  { id: 21, date: "2026-06-17", timeES: "17:00",    group: "K", home: "Portugal",       away: PLAYOFF_INT1,      venue: "NRG, Houston",              matchday: 1 },
  { id: 22, date: "2026-06-17", timeES: "20:00",    group: "L", home: "Inglaterra",     away: "Croacia",         venue: "AT&T, Arlington",           matchday: 1 },
  { id: 23, date: "2026-06-17", timeES: "23:00",    group: "L", home: "Ghana",          away: "Panamá",          venue: "BMO Field, Toronto",        matchday: 1 },
  { id: 24, date: "2026-06-18", timeES: "02:00",    group: "K", home: "Uzbekistán",     away: "Colombia",        venue: "Azteca, CDMX",              matchday: 1 },

  // J2 ── 18 junio
  { id: 25, date: "2026-06-18", timeES: "16:00",    group: "A", home: "Sudáfrica",      away: "Chequia",    venue: "Mercedes-Benz, Atlanta",    matchday: 2 },
  { id: 26, date: "2026-06-18", timeES: "19:00",    group: "B", home: "Suiza",          away: "Bosnia",    venue: "SoFi, Inglewood",           matchday: 2 },
  { id: 27, date: "2026-06-18", timeES: "22:00",    group: "B", home: "Canadá",         away: "Qatar",           venue: "BC Place, Vancouver",       matchday: 2 },
  { id: 28, date: "2026-06-19", timeES: "01:00",    group: "A", home: "México",         away: "Corea del Sur",   venue: "Akron, Zapopan",            matchday: 2 },
  // J2 ── 19 junio
  { id: 29, date: "2026-06-19", timeES: "19:00",    group: "D", home: "EE.UU.",         away: "Australia",       venue: "Lumen Field, Seattle",      matchday: 2 },
  { id: 30, date: "2026-06-19", timeES: "22:00",    group: "C", home: "Escocia",        away: "Marruecos",       venue: "Gillette, Foxborough",      matchday: 2 },
  { id: 31, date: "2026-06-20", timeES: "01:00",    group: "C", home: "Brasil",         away: "Haití",           venue: "Lincoln, Phila.",           matchday: 2 },
  // J2 ── 20 junio
  { id: 32, date: "2026-06-20", timeES: "04:00",    group: "D", home: "Paraguay",       away: "Turquía",    venue: "Levi's, Santa Clara",       matchday: 2 },
  { id: 33, date: "2026-06-20", timeES: "17:00",    group: "E", home: "Ecuador",        away: "Alemania",        venue: "MetLife, NJ",               matchday: 2 },
  { id: 34, date: "2026-06-20", timeES: "20:00",    group: "F", home: "Túnez",          away: "Países Bajos",    venue: "Arrowhead, KC",             matchday: 2 },
  { id: 35, date: "2026-06-21", timeES: "23:00",    group: "F", home: "Japón",          away: "Suecia",    venue: "AT&T, Arlington",           matchday: 2 },
  { id: 36, date: "2026-06-21", timeES: "02:00",    group: "E", home: "Curazao",        away: "Costa de Marfil", venue: "Lincoln, Phila.",           matchday: 2 },
  // J2 ── 21 junio
  { id: 37, date: "2026-06-21", timeES: "19:00",    group: "H", home: "Cabo Verde",     away: "Arabia Saudí",    venue: "Hard Rock, Miami",          matchday: 2 },
  { id: 38, date: "2026-06-21", timeES: "22:00",    group: "G", home: "Egipto",         away: "Irán",            venue: "Lumen Field, Seattle",      matchday: 2 },
  { id: 39, date: "2026-06-22", timeES: "01:00",    group: "H", home: "España",         away: "Uruguay",         venue: "Akron, Zapopan",            matchday: 2 },
  { id: 40, date: "2026-06-22", timeES: "04:00",    group: "G", home: "Bélgica",        away: "Nueva Zelanda",   venue: "BC Place, Vancouver",       matchday: 2 },
  // J2 ── 22 junio
  { id: 41, date: "2026-06-22", timeES: "19:00",    group: "I", home: "Noruega",        away: "Senegal",         venue: "MetLife, NJ",               matchday: 2 },
  { id: 42, date: "2026-06-22", timeES: "22:00",    group: "J", home: "Jordania",       away: "Argelia",         venue: "Levi's, Santa Clara",       matchday: 2 },
  { id: 43, date: "2026-06-23", timeES: "01:00",    group: "I", home: "Francia",        away: PLAYOFF_INT2,      venue: "Mercedes-Benz, Atlanta",    matchday: 2 },
  { id: 44, date: "2026-06-23", timeES: "04:00",    group: "J", home: "Argentina",      away: "Austria",         venue: "AT&T, Arlington",           matchday: 2 },
  // J2 ── 23 junio
  { id: 45, date: "2026-06-23", timeES: "17:00",    group: "K", home: PLAYOFF_INT1,     away: "Uzbekistán",      venue: "NRG, Houston",              matchday: 2 },
  { id: 46, date: "2026-06-23", timeES: "20:00",    group: "L", home: "Croacia",        away: "Ghana",           venue: "Lincoln, Phila.",           matchday: 2 },
  { id: 47, date: "2026-06-23", timeES: "23:00",    group: "K", home: "Colombia",       away: "Portugal",        venue: "BMO Field, Toronto",        matchday: 2 },
  { id: 48, date: "2026-06-24", timeES: "02:00",    group: "L", home: "Panamá",         away: "Inglaterra",      venue: "MetLife, NJ",               matchday: 2 },

  // J3 ── todos simultáneos por grupo
  // 24 junio
  { id: 49, date: "2026-06-24", timeES: "22:00",    group: "A", home: "México",         away: "Chequia",    venue: "Azteca, CDMX",              matchday: 3 },
  { id: 50, date: "2026-06-24", timeES: "22:00",    group: "A", home: "Sudáfrica",      away: "Corea del Sur",   venue: "BBVA, Guadalupe",           matchday: 3 },
  { id: 51, date: "2026-06-24", timeES: "19:00",    group: "B", home: "Suiza",          away: "Canadá",          venue: "Levi's, Santa Clara",       matchday: 3 },
  { id: 52, date: "2026-06-24", timeES: "19:00",    group: "B", home: "Bosnia",   away: "Qatar",           venue: "Lumen Field, Seattle",      matchday: 3 },
  { id: 53, date: "2026-06-24", timeES: "22:00",    group: "C", home: "Brasil",         away: "Escocia",         venue: "Mercedes-Benz, Atlanta",    matchday: 3 },
  { id: 54, date: "2026-06-24", timeES: "22:00",    group: "C", home: "Marruecos",      away: "Haití",           venue: "Mercedes-Benz, Atlanta",    matchday: 3 },
  // 25 junio
  { id: 55, date: "2026-06-25", timeES: "01:00",    group: "D", home: "EE.UU.",         away: "Turquía",    venue: "SoFi, Inglewood",           matchday: 3 },
  { id: 56, date: "2026-06-25", timeES: "01:00",    group: "D", home: "Paraguay",       away: "Australia",       venue: "Levi's, Santa Clara",       matchday: 3 },
  { id: 57, date: "2026-06-25", timeES: "20:00",    group: "E", home: "Alemania",       away: "Costa de Marfil", venue: "NRG, Houston",              matchday: 3 },
  { id: 58, date: "2026-06-25", timeES: "20:00",    group: "E", home: "Ecuador",        away: "Curazao",         venue: "MetLife, NJ",               matchday: 3 },
  { id: 59, date: "2026-06-25", timeES: "23:00",    group: "F", home: "Japón",          away: "Túnez",           venue: "BBVA, Guadalupe",           matchday: 3 },
  { id: 60, date: "2026-06-25", timeES: "23:00",    group: "F", home: "Países Bajos",   away: "Suecia",    venue: "Arrowhead, KC",             matchday: 3 },
  // 26 junio
  { id: 61, date: "2026-06-26", timeES: "20:00",    group: "G", home: "Bélgica",        away: "Irán",            venue: "SoFi, Inglewood",           matchday: 3 },
  { id: 62, date: "2026-06-26", timeES: "20:00",    group: "G", home: "Nueva Zelanda",  away: "Egipto",          venue: "Lumen Field, Seattle",      matchday: 3 },
  { id: 63, date: "2026-06-26", timeES: "23:00",    group: "H", home: "España",         away: "Arabia Saudí",    venue: "Hard Rock, Miami",          matchday: 3 },
  { id: 64, date: "2026-06-26", timeES: "23:00",    group: "H", home: "Uruguay",        away: "Cabo Verde",      venue: "Akron, Zapopan",            matchday: 3 },
  { id: 65, date: "2026-06-26", timeES: "20:00",    group: "I", home: "Francia",        away: "Noruega",         venue: "Arrowhead, KC",             matchday: 3 },
  { id: 66, date: "2026-06-26", timeES: "20:00",    group: "I", home: "Senegal",        away: PLAYOFF_INT2,      venue: "Gillette, Foxborough",      matchday: 3 },
  // 27 junio
  { id: 67, date: "2026-06-27", timeES: "01:00",    group: "J", home: "Argentina",      away: "Jordania",        venue: "AT&T, Arlington",           matchday: 3 },
  { id: 68, date: "2026-06-27", timeES: "01:00",    group: "J", home: "Argelia",        away: "Austria",         venue: "Levi's, Santa Clara",       matchday: 3 },
  { id: 69, date: "2026-06-27", timeES: "22:00",    group: "K", home: "Colombia",       away: PLAYOFF_INT1,      venue: "Akron, Zapopan",            matchday: 3 },
  { id: 70, date: "2026-06-27", timeES: "22:00",    group: "K", home: "Portugal",       away: "Uzbekistán",      venue: "NRG, Houston",              matchday: 3 },
  { id: 71, date: "2026-06-27", timeES: "22:00",    group: "L", home: "Croacia",        away: "Panamá",          venue: "Lincoln, Phila.",           matchday: 3 },
  { id: 72, date: "2026-06-27", timeES: "22:00",    group: "L", home: "Inglaterra",     away: "Ghana",           venue: "BMO Field, Toronto",        matchday: 3 },
];
