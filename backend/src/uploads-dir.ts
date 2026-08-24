import { join } from 'path';

// Medya kutuphanesine yuklenen dosyalarin diskte tutuldugu klasor -
// hem ServeStaticModule (statik sunum) hem de Medya modulu (multer hedefi)
// bu tek kaynaktan aldigi icin yol hesaplamasi iki yerde tekrarlanmiyor.
export const UPLOADS_DIR = join(__dirname, '..', 'uploads');
