// Onde as peças encaixam no Torrão, por fase. Usa as medidas de cada quadro (CF.ANCORAS: olhos, alto e largura da cabeça).
// afunda: quanto a aba do chapéu entra na cabeça (0 = no alto, 1 = nos olhos). larg: largura do chapéu x largura da cabeça.
// rosto: largura dos óculos x largura da cabeça. dx/olhoDx: ajuste pro lado. Conferir com: python tools/ver_roupas.py
window.CF = window.CF || {};
CF.VESTIR = {"1": {"afunda": 0.55, "larg": 1.0, "dx": -0.01, "rosto": 0.62, "olhoDx": 0.0}, "2": {"afunda": 0.55, "larg": 1.05, "dx": -0.01, "rosto": 0.66, "olhoDx": -0.01}, "3": {"afunda": 0.55, "larg": 1.3, "dx": -0.02, "rosto": 0.66, "olhoDx": -0.01}, "4": {"afunda": 0.58, "larg": 1.35, "dx": -0.02, "rosto": 0.66, "olhoDx": -0.01}};
CF.ROUPA_AJUSTE = {"bone": {"s": 1.0}, "palha": {"s": 1.35, "afunda": 0.05}, "gorro": {"s": 0.98, "afunda": 0.06}, "coroa": {"s": 0.78, "afunda": 0.1}, "cartola": {"s": 0.8}, "explorador": {"s": 1.2}, "escuros": {"s": 1.0}, "leitura": {"s": 1.0}, "flores": {"s": 1.0, "afunda": 0.16},
  "chef": {"s": 0.9, "afunda": 0.1}, "bruxo": {"s": 1.2}, "helice": {"s": 1.0}, "pirata": {"s": 1.15}, "cowboy": {"s": 1.35}, "fones": {"s": 1.18, "afunda": 0.2},
  "bandana": {"s": 1.0, "onde": "testa"}, "louros": {"s": 1.0, "afunda": 0.18}, "urso": {"s": 1.05, "afunda": 0.1}, "coracao": {"s": 1.0}, "mergulho": {"s": 1.05}, "bigode": {"s": 1.0, "onde": "boca"}};
