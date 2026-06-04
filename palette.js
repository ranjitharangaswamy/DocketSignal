/** Shared warm editorial palette — matches scrolly hero (cream + oxblood + gold). */
window.DOCKET_PALETTE = {
  paper: "#fdf8f1",
  paperStrong: "#fffdf8",
  ink: "#1a1612",
  muted: "#6b6256",
  charcoal: "#2c2620",
  oxblood: "#7b3f32",
  gold: "#b8935a",
  goldLight: "#d4bc8a",
  sand: "#b59a6d",
  sage: "#5a6b57",
  slate: "#4a5d68",
  slateDeep: "#354650",
  sienna: "#9a5538",
  line: "#e8dcc8",
  sentiment: {
    positive: "#5a6b57",
    neutral: "#b59a6d",
    negative: "#7b3f32",
  },
  themes: {
    accuracy_trust: "#7b3f32",
    adoption_resistance: "#b59a6d",
    ethics_regulation: "#4a5d68",
    efficiency_gains: "#5a6b57",
    job_displacement: "#b8935a",
    tool_review: "#6b6256",
    ediscovery_review: "#354650",
    cost_value: "#9a5538",
  },
};

window.themeChartColor = function themeChartColor(themeId) {
  return window.DOCKET_PALETTE.themes[themeId] || window.DOCKET_PALETTE.slate;
};
