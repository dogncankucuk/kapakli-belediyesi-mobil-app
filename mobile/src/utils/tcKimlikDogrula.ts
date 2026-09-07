// T.C. Kimlik No'nun resmi (Nufus ve Vatandaslik Isleri Genel Mudurlugu)
// checksum algoritmasi - backend'deki
// backend/src/modules/users/validators/tc-kimlik-no.validator.ts ile ayni
// mantik, mobil tarafta anlik on-kontrol icin tekrarlanmistir.
export function tcKimlikNoGecerliMi(tc: string): boolean {
  if (!/^[1-9]\d{10}$/.test(tc)) {
    return false;
  }

  const digits = tc.split("").map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const d10 = (((oddSum * 7 - evenSum) % 10) + 10) % 10;
  if (d10 !== digits[9]) {
    return false;
  }

  const sumFirst10 = digits.slice(0, 10).reduce((sum, d) => sum + d, 0);
  const d11 = sumFirst10 % 10;
  return d11 === digits[10];
}
