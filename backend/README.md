<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Kapaklı Belediyesi -- yerel geliştirme

1. `.env.example` dosyasını `.env` olarak kopyalayın ve `ADMIN_SESSION_SECRET` için rastgele bir string girin.
2. MongoDB'yi Docker ile başlatın:
   ```bash
   docker compose up -d
   ```
3. Bağımlılıkları kurup backend'i ayağa kaldırın:
   ```bash
   npm install
   npm run start:dev
   ```
4. Bir Süper Admin hesabı oluşturmak için (TOTP secret'ı konsola basar, bir authenticator app'e ekleyin):
   ```bash
   npm run seed:admin
   ```
5. Admin panel bir React SPA'dır (`../admin-panel`), ayrı bir Vite dev server olarak çalıştırılır:
   ```bash
   cd ../admin-panel
   npm install
   npm run dev
   ```
   Vite'ın verdiği adresten (örn. `http://localhost:5173`) admin panele erişin; `/admin-api` istekleri
   `admin-panel/vite.config.ts`'deki proxy ayarı sayesinde otomatik olarak backend'e (`http://localhost:3000`) yönlendirilir.
   Giriş: `admin@kapakli.local` + `.env`'deki `SEED_ADMIN_PASSWORD` + authenticator app'teki TOTP kodu.

### Prod

1. Admin panel SPA'sını derleyin:
   ```bash
   cd admin-panel
   npm run build
   ```
   Çıktı `admin-panel/dist/`'e yazılır.
2. Backend'i derleyip prod modunda başlatın:
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```
3. Artık admin panele ayrı bir Vite sunucusuna gerek kalmadan `http://localhost:3000/admin` üzerinden erişilir
   (backend, `admin-panel/dist`'i `@nestjs/serve-static` ile statik olarak servis eder; `/admin-api/*` istekleri
   static handler tarafından yutulmaz, gerçek NestJS controller'larına gider).

## Public API (mobil istemci için)

Aşağıdaki uç noktalar auth gerektirmez (misafir erişimi) ve mobil uygulamanın gerçek veriye bağlanan ilk ekranları tarafından kullanılır:

| Uç nokta | Açıklama |
|---|---|
| `GET /announcements` | Yayınlanmış duyuru/haber listesini döner |
| `POST /appointments` | Yeni randevu talebi oluşturur (`hizmetTuru`, `tarih`, `saat`, opsiyonel `userId`) |

> Not: Bu uç noktalarda henüz rate limiting yok — production öncesi eklenmesi gereken bilinen bir eksik (bkz. `architecture.md` §10).

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
