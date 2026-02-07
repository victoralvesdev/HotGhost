// Mapa de homoglifos - caracteres visualmente identicos de diferentes alfabetos
const HOMOGLYPH_MAP = {
  // Latim -> Cirilico/Grego
  'a': ['\u0430', '\u03B1'], // cyrillic a, greek alpha
  'A': ['\u0410', '\u0391'], // cyrillic A, greek Alpha
  'b': ['\u0184'], // cyrillic б similar
  'B': ['\u0412', '\u0392'], // cyrillic В, greek Beta
  'c': ['\u0441', '\u03F2'], // cyrillic с, greek lunate sigma
  'C': ['\u0421', '\u03F9'], // cyrillic С, greek Capital lunate sigma
  'd': ['\u0501'], // cyrillic d
  'e': ['\u0435', '\u03B5'], // cyrillic е, greek epsilon
  'E': ['\u0415', '\u0395'], // cyrillic Е, greek Epsilon
  'g': ['\u0261'], // latin small letter script g
  'h': ['\u04BB'], // cyrillic shha
  'H': ['\u041D', '\u0397'], // cyrillic Н, greek Eta
  'i': ['\u0456', '\u03B9'], // cyrillic і, greek iota
  'I': ['\u0406', '\u0399'], // cyrillic І, greek Iota
  'j': ['\u0458'], // cyrillic ј
  'J': ['\u0408'], // cyrillic Ј
  'k': ['\u03BA'], // greek kappa
  'K': ['\u039A', '\u041A'], // greek Kappa, cyrillic К
  'l': ['\u04CF', '\u0049'], // cyrillic palochka, latin I
  'm': ['\u043C'], // cyrillic м
  'M': ['\u041C', '\u039C'], // cyrillic М, greek Mu
  'n': ['\u0578'], // armenian no
  'N': ['\u039D'], // greek Nu
  'o': ['\u043E', '\u03BF'], // cyrillic о, greek omicron
  'O': ['\u041E', '\u039F'], // cyrillic О, greek Omicron
  'p': ['\u0440', '\u03C1'], // cyrillic р, greek rho
  'P': ['\u0420', '\u03A1'], // cyrillic Р, greek Rho
  'q': ['\u0566'], // armenian za (similar)
  's': ['\u0455'], // cyrillic s
  'S': ['\u0405'], // cyrillic S
  't': ['\u03C4'], // greek tau
  'T': ['\u0422', '\u03A4'], // cyrillic Т, greek Tau
  'u': ['\u03C5'], // greek upsilon
  'v': ['\u03BD'], // greek nu (looks like v)
  'w': ['\u03C9'], // greek omega
  'x': ['\u0445', '\u03C7'], // cyrillic х, greek chi
  'X': ['\u0425', '\u03A7'], // cyrillic Х, greek Chi
  'y': ['\u0443', '\u03B3'], // cyrillic у, greek gamma
  'Y': ['\u03A5', '\u04AE'], // greek Upsilon, cyrillic У
  'z': ['\u0290'], // latin z with retroflex hook
  'Z': ['\u0396'], // greek Zeta
  '0': ['\u041E', '\u039F'], // cyrillic О, greek Omicron
  '1': ['\u0406', '\u04CF'], // cyrillic І, cyrillic palochka
  '3': ['\u0417'], // cyrillic З
  '5': ['\u01BC'], // latin Tone Five
  '6': ['\u0431'], // cyrillic б (similar)
}

// Transforma texto usando homoglifos
export function transformText(text) {
  return text.split('').map(char => {
    if (HOMOGLYPH_MAP[char]) {
      const alternatives = HOMOGLYPH_MAP[char]
      return alternatives[Math.floor(Math.random() * alternatives.length)]
    }
    return char
  }).join('')
}
