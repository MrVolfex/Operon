
# Operon Constitution

Operon je softver za upravljanje auto servisom: Spring Boot REST API + React (Vite) frontend sa tri
portala (Owner, Radnik, Klijent). MVP pokriva jedan servis. Ovaj dokument važi za svaku novu
funkcionalnost; detaljan domenski model i dizajn sistem su u `CLAUDE.md`.

## Core Principles

### I. Slojevita arhitektura

- Backend MORA da prati tok `controller → service → repository`. Controller ne sadrži poslovnu
  logiku i ne poziva repository direktno.
- REST API MORA da prima i vraća DTO-ove iz paketa `dto` (`*CreateRequest`, `*DTO`); JPA entiteti
  iz `model` se nikad ne vraćaju direktno.
- Ulazni DTO-ovi MORAJU da se validiraju (`@Valid` + Jakarta Validation anotacije).
- Zavisnosti se ubacuju kroz konstruktor (`@RequiredArgsConstructor` + `private final`).
- Frontend MORA da šalje HTTP pozive kroz zajedničku Axios instancu (`frontend/src/api/axios.js`)
  i da drži autentifikaciju u `AuthContext`; stranice idu u `pages/<portal>/`.

Razlog: postojećih 20 controller-a i 13 servisa već prati ovaj obrazac; odstupanja otežavaju
održavanje i bezbednosne provere.

### II. Bezbednost i izolacija podataka

- Worker i Client imaju odvojene login endpointe, JWT tokene i filter chain-ove; nova funkcionalnost
  NE SME da ih spaja.
- Svaki novi endpoint MORA da bude eksplicitno pokriven u `SecurityConfig` i da poštuje tabelu
  autorizacije po rolama iz `CLAUDE.md` (OWNER = poslovni podaci, MECHANIC = operativni posao).
- Klijentski endpointi MORAJU da vraćaju samo podatke prijavljenog klijenta (identitet iz
  `Authentication`, ne iz parametra zahteva). Postojeća curenja (vozila, notifikacije) su poznat dug
  i ne smeju se ponavljati u novom kodu.
- Tajne (DB, JWT, Stripe, Anthropic, mail) MORAJU da dolaze iz environment varijabli ili
  `application-local.properties`; nikad u kodu ili commit-ovanim fajlovima.
- Lozinke se čuvaju isključivo kao bcrypt hash.

Razlog: aplikacija čuva lične podatke klijenata i finansije; greška u autorizaciji je najskuplja
vrsta greške u ovom projektu.

### III. Integritet domenskog modela

- Pravila iz `CLAUDE.md` su obavezna: nazivi klasa u jednini; FK uvek na strani "mnogo";
  `OrderItem` referencira ili `Part` ili `ServiceType`, nikad oba (uz null-check pri obradi).
- Cene se kopiraju u trenutku nastanka stavke (`OrderItem.price`, `ClientOrderItem.unitPrice`) i
  ne čitaju se naknadno iz `Part`/`ServiceType`.
- Ukupni iznosi (`getTotal()`) se računaju iz stavki i NE čuvaju u bazi.
- Novcem se rukuje kao `NUMERIC(10,2)` u bazi; nove kalkulacije NE SMEJU da gomilaju greške
  zaokruživanja (zaokružiti na 2 decimale pri prikazu i snimanju).
- Svaka promena entiteta, relacije ili enuma MORA da se upiše u `CLAUDE.md` u istom commit-u.

Razlog: fakture i narudžbine moraju da ostanu tačne i kada se cene kasnije promene.

### IV. Verifikacija pre završetka

- Funkcionalnost nije gotova dok ne prođu: `mvnw verify` za backend i `npm run build` +
  `npm run lint` za frontend.
- Nova poslovna logika u servisima (kalkulacije, promene statusa, autorizacione provere) TREBA da
  dobije unit test u `src/test`; logika koja dira novac ili pristup podacima MORA da ga dobije.
- Svaka funkcionalnost MORA da bude ručno proverena kroz portal(e) kojih se tiče, uz rolu koja
  sme i rolu koja ne sme da joj pristupi.

Razlog: projekat danas ima samo test pokretanja konteksta; uvodimo testove postepeno, počevši od
mesta gde je greška najskuplja, umesto strogog TDD-a koji ne odgovara trenutnom stanju.

### V. Jednostavnost i postojeći stack

- Rešenje MORA da koristi ono što projekat već ima (Spring Data JPA, postojeći servisi, Axios,
  React Router, lucide-react ikone, postojeće layout komponente).
- Nova biblioteka (Maven ili npm) se dodaje samo uz obrazloženje u planu zašto postojeći alati nisu
  dovoljni.
- MVP = jedan servis: NE uvoditi `Workshop`/multi-tenant koncept dok to nije posebna funkcionalnost.
- Bez spekulativnih apstrakcija (YAGNI): ne praviti generičke slojeve "za kasnije".

Razlog: manji broj zavisnosti i obrazaca čini projekat razumljivim jednom programeru i AI agentu.

## Tehnička ograničenja

- **Backend:** Spring Boot 4.0.6, Java 21 (prema `pom.xml`), Maven, Lombok, Spring Security + JJWT.
- **Baza:** PostgreSQL; šema se trenutno vodi kroz entitete (`ddl-auto=update`). Promene koje
  brišu ili preimenuju kolone MORAJU u planu da navedu kako se čuvaju postojeći podaci.
- **Greške:** idu kroz `GlobalExceptionHandler` u obliku `{"error": "<poruka>"}`. Nov kod TREBA da
  vraća odgovarajući status (404 za nepostojeće, 400 za nevalidan unos, 403 za zabranjeno) umesto
  generičkog 500.
- **Integracije:** Stripe (plaćanja), Anthropic API (AI analiza), Gmail SMTP (email), Google OAuth
  (login klijenta). Pozivi ka spoljnim servisima idu kroz postojeće servise (`StripeConfig`,
  `AiAnalysisService`, `EmailService`).
- **Frontend:** React 19, Vite 8, React Router 7, Axios. Stilovi su inline i MORAJU da koriste boje,
  razmake i komponente iz Operon dizajn sistema u `CLAUDE.md` (akcenat `#F97316`, kartice 16px,
  status badge-evi, sidebar 240px).

## Razvojni tok

- Rad ide na posebnoj grani (`feature/...`, `fix/...`, `chore/...`), ne direktno na glavnoj grani.
- Funkcionalnosti veće od manje izmene prolaze Spec Kit tok: `/speckit-specify` → (opciono
  `/speckit-clarify`) → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` →
  `/speckit-converge`. Sitne popravke se rade direktno.
- Specifikacija opisuje ponašanje iz ugla korisnika portala (Owner, Radnik, Klijent); tehnologija
  ulazi tek u plan.
- Plan MORA da navede koje postojeće fajlove menja i koje endpointe/role dodaje.
- Jedna funkcionalnost = jedan logički commit (ili mali niz) sa specifikacijom i planom u repou.

## Governance

- Ovaj dokument ima prednost nad navikama i ad-hoc odlukama; `CLAUDE.md` je izvor detalja o modelu
  i dizajnu i mora biti usklađen sa njim.
- Izmena se radi kroz `/speckit-constitution`, uz objašnjenje razloga i povećanje verzije:
  MAJOR za uklanjanje ili redefinisanje principa, MINOR za novi princip ili sekciju, PATCH za
  pojašnjenja.
- Svaki plan (`/speckit-plan`) MORA da proveri usklađenost sa principima I–V; odstupanje je
  dozvoljeno samo uz zapisano obrazloženje u planu.

**Version**: 1.0.0 | **Ratified**: 2026-11-25 | **Last Amended**: 2026-11-25
