export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=DM+Sans:wght@300;400;500;700;800&family=Space+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  body{background:#080811;font-family:'DM Sans',sans-serif;color:#f0f0f8}
  input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
  input[type=number]{-moz-appearance:textfield}
  ::-webkit-scrollbar{display:none}
  .fade-in{animation:fadeIn .3s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
`;
