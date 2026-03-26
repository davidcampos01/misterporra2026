import { FIXTURES }          from "../constants/fixtures";
import { GROUPS_DATA }        from "../constants/groups";
import { EURO2024_FIXTURES }  from "../constants/euro2024Fixtures";
import { EURO2024_GROUPS }    from "../constants/euro2024Groups";

export const TOURNAMENTS = {
  euro2024: {
    id:           "euro2024",
    name:         "EURO 2024",
    fullName:     "Eurocopa Alemania 2024",
    emoji:        "🇪🇺",
    accentColor:  "#003399",
    accentLight:  "rgba(0,51,153,.15)",
    apiLeagueId:  4,
    apiSeason:    2024,
    fixtures:     EURO2024_FIXTURES,
    groups:       EURO2024_GROUPS,
    hasThirdPlace: false,
    numBest3rds:   4,   // 4 de los 6 terceros clasificados
  },
  mundial2026: {
    id:           "mundial2026",
    name:         "MUNDIAL 2026",
    fullName:     "Copa del Mundo 2026",
    emoji:        "🌍",
    accentColor:  "#f5c842",
    accentLight:  "rgba(245,200,66,.15)",
    apiLeagueId:  1,
    apiSeason:    2026,
    fixtures:     FIXTURES,
    groups:       GROUPS_DATA,
    hasThirdPlace: true,
    numBest3rds:   8,   // 8 de los 12 terceros clasificados
  },
};
