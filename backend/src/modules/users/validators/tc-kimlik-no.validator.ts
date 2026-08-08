import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

// T.C. Kimlik No'nun resmi (Nufus ve Vatandaslik Isleri Genel Mudurlugu)
// checksum algoritmasi. Sadece "11 haneli mi" kontrolunden farkli olarak,
// uydurma ama 11 haneli sayilari da eler (ör. "11111111111" veya
// "12345678901" checksum'i tutmadigi icin gecersiz sayilir).
export function isValidTcKimlikNo(value: unknown): boolean {
  if (typeof value !== 'string' || !/^[1-9]\d{10}$/.test(value)) {
    return false;
  }

  const digits = value.split('').map(Number);
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

@ValidatorConstraint({ name: 'isValidTcKimlikNo', async: false })
class IsValidTcKimlikNoConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidTcKimlikNo(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} geçerli bir T.C. Kimlik No değil`;
  }
}

export function IsValidTcKimlikNo(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsValidTcKimlikNoConstraint,
    });
  };
}
