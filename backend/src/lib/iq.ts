const IQ_TABLE: Record<number, number> = {
  0:36,1:36,2:36,3:36,4:36,5:36,6:36,7:36,8:36,9:36,10:36,11:36,
  12:60,13:62,14:64,15:66,16:68,17:70,18:72,19:74,20:76,21:78,22:80,
  23:84,24:84,25:86,26:88,27:90,28:92,29:94,30:96,31:98,32:100,33:102,
  34:104,35:106,36:108,37:110,38:112,39:114,40:116,41:118,42:120,43:122,
  44:126,45:128,46:130,47:132,48:134,49:136,50:138,51:140,52:142,53:144,
  54:146,55:148,56:150,57:155,58:160,59:170,60:180,
};

export function scoreToIQ(score: number): number {
  return IQ_TABLE[Math.max(0, Math.min(60, score))] ?? 36;
}

export function getIQClassification(iq: number): string {
  if (iq >= 160) return "Genialidade excepcional";
  if (iq >= 140) return "Superdotado";
  if (iq >= 130) return "Muito superior";
  if (iq >= 120) return "Superior";
  if (iq >= 110) return "Acima da média";
  if (iq >= 90)  return "Médio";
  if (iq >= 80)  return "Abaixo da média";
  if (iq >= 70)  return "Limítrofe";
  return "Muito abaixo da média";
}
