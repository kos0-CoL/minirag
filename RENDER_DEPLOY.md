# 🚀 Deploy su Render.com - Guida Completa

## 📋 Riepilogo Modifiche

### File Modificati:
1. ✅ `frontend/src/services/apiClient.ts` - Usa `VITE_API_URL` per il backend
2. ✅ `frontend/vite.config.ts` - Define `VITE_API_URL` durante build
3. ✅ `frontend/.env` - Variabile per sviluppo locale
4. ✅ `.env.example` - Documentato con variabili Render
5. ✅ `server.js` - CORS configurato per Render
6. ✅ `.gitignore` - Permette .env.production

### File Creati:
1. ✅ `frontend/.env.production` - URL backend per produzione
2. ✅ `render.yaml` - Configurazione automatica Render

---

## 🎯 **ISTRUZIONI PASSO-PASSO**

### **STEP 1: Preparare il Repository**

1. Assicurati di aver committato tutte le modifiche:
   ```bash
   cd "/home/naza/Documentos/minirag de claude/minirag"
   git add .
   git commit -m "feat: configura deploy su Render"
   git push origin main
   ```

2. Verifica che `render.yaml` sia nel repository (Render lo usa per la config automatica)

---

### **STEP 2: Creare Backend su Render**

1. **Vai su** [Render Dashboard](https://dashboard.render.com)
2. **Clicca** "New" → "Blueprint"
3. **Seleziona** il tuo repository GitHub
4. Render leggerà `render.yaml` e creerà automaticamente:
   - Backend Web Service
   - PostgreSQL Database

5. **Aggiungi le variabili d'ambiente mancanti** nel backend:
   - Vai sul servizio "mini-rag-backend"
   - Clicca "Environment"
   - Aggiungi:
     ```
     GEMINI_API_KEY = la-tua-chiave-gemini
     ```
   - Il `JWT_SECRET` viene generato automaticamente

6. **Nota l'URL del backend** (es. `https://mini-rag-backend-xxx.onrender.com`)

---

### **STEP 3: Creare Frontend su Render**

1. **Vai su** Render Dashboard
2. **Clicca** "New" → "Static Site"
3. **Seleziona** lo stesso repository GitHub
4. **Configura**:
   ```
   Name: mini-rag-frontend
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```

5. **Aggiungi Variabili d'Ambiente**:
   ```
   VITE_API_URL = https://mini-rag-backend-xxx.onrender.com/api
   ```
   ⚠️ **IMPORTANTE**: Sostituisci con il tuo URL reale del backend!

6. **Nota l'URL del frontend** (es. `https://mini-rag-frontend-xxx.onrender.com`)

---

### **STEP 4: Aggiornare CORS nel Backend**

1. **Vai sul servizio backend** su Render
2. **Clicca** "Environment"
3. **Aggiorna** la variabile:
   ```
   FRONTEND_URL = https://mini-rag-frontend-xxx.onrender.com
   ```
   ⚠️ **IMPORTANTE**: Sostituisci con il tuo URL reale del frontend!

4. **Riavvia** il servizio (Render lo fa automaticamente quando cambiano le env vars)

---

### **STEP 5: Verificare il Deploy**

1. **Apri il frontend** nel browser:
   ```
   https://mini-rag-frontend-xxx.onrender.com
   ```

2. **Apri Console del browser** (F12 → Network tab)

3. **Prova a fare login** o una query

4. **Verifica** che le chiamate API:
   - Siano dirette a `https://mini-rag-backend-xxx.onrender.com/api/*`
   - Non mostrino errori CORS
   - Ritornino dati corretti

---

## ⚡ **PROBLEMI COMUNI E SOLUZIONI**

### ❌ **Problema: "Cannot GET /"**
**Causa**: Il frontend non riesce a contattare il backend

**Soluzione**:
1. Verifica che `VITE_API_URL` sia corretto nel frontend
2. Verifica che il backend sia online (controlla i log)
3. Verifica che CORS sia configurato

### ❌ **Problema: "CORS Error"**
**Causa**: Il backend non accetta richieste dal frontend

**Soluzione**:
1. Verifica che `FRONTEND_URL` nel backend sia corretto
2. Riavvia il backend
3. Verifica che il protocollo sia `https://` (non `http://`)

### ❌ **Problema: "401 Unauthorized"**
**Causa**: Il token non viene passato correttamente

**Soluzione**:
1. Verifica che il login funzioni (controlla Console)
2. Verifica che `localStorage` contenga `auth_token`
3. Prova a fare logout e re-login

### ❌ **Problema: Build fallisce su Render**
**Causa**: Dipendenze mancanti o errori di compilazione

**Soluzione**:
1. Controlla i log del build su Render
2. Verifica che il build funzioni localmente:
   ```bash
   cd frontend && npm install && npm run build
   ```
3. Assicurati che il `package.json` del frontend sia corretto

---

## 📊 **SCHEMA ARCHITETTURA RENDER**

```
┌─────────────────────────────────────────────────┐
│                  UTENTE                         │
│                    │                            │
│                    ▼                            │
│  ┌─────────────────────────────────┐           │
│  │    STATIC SITE (Frontend)       │           │
│  │    https://frontend.onrender.com│           │
│  │    Porta: 443 (HTTPS)           │           │
│  └────────────────┬────────────────┘           │
│                   │                            │
│                   │ Chiamate API               │
│                   │ /api/*                     │
│                   ▼                            │
│  ┌─────────────────────────────────┐           │
│  │    WEB SERVICE (Backend)        │           │
│  │    https://backend.onrender.com │           │
│  │    Porta: 5000 (interno)        │           │
│  └────────────────┬────────────────┘           │
│                   │                            │
│                   │ Query SQL                  │
│                   ▼                            │
│  ┌─────────────────────────────────┐           │
│  │    POSTGRESQL (Database)        │           │
│  │    dpg-xxx.render.com           │           │
│  │    Porta: 5432 (interno)        │           │
│  └─────────────────────────────────┘           │
└─────────────────────────────────────────────────┘
```

---

## 💰 **COSTI RENDER**

| Servizio | Piano | Costo mensile |
|----------|-------|---------------|
| Backend (Web Service) | Starter | $7 |
| Frontend (Static Site) | Starter | $0 (free tier) |
| PostgreSQL (Database) | Starter | $7 |
| **Totale** | | **~$14/mese** |

*Il piano Starter include 512MB RAM e 0.5 CPU per il backend*

---

## 🔧 **VARIABILI D'AMBIENTE COMPLETE**

### Backend (Web Service):
```env
# Obligatorio
NODE_ENV=production
PORT=5000
DB_TYPE=postgres

# Database (da Render)
DB_HOST=dpg-xxx.a.oregon-postgres.render.com
DB_PORT=5432
DB_USER=mini_rag_db_user_xxx
DB_PASSWORD=xxx
DB_NAME=mini_rag_pro

# API Keys (da impostare manualmente)
GEMINI_API_KEY=xxx
JWT_SECRET=auto-generato

# CORS
FRONTEND_URL=https://mini-rag-frontend-xxx.onrender.com
```

### Frontend (Static Site):
```env
# URL del backend su Render
VITE_API_URL=https://mini-rag-backend-xxx.onrender.com/api
```

---

## ✅ **CHECKLIST FINALE**

### Prima del deploy:
- [ ] Tutto committato su GitHub
- [ ] `render.yaml` presente nella root
- [ ] `frontend/.env.production` presente con URL backend
- [ ] `VITE_API_URL` definito in `vite.config.ts`
- [ ] CORS configurato in `server.js`

### Dopo il deploy:
- [ ] Backend online e risponde a `/health`
- [ ] Database PostgreSQL creato e connesso
- [ ] Frontend online e compilato
- [ ] Login/registrazione funzionano
- [ ] Le chiamate API raggiungono il backend
- [ ] Nessun errore CORS nella Console
- [ ] Le query RAG funzionano

---

## 🐛 **DEBUG RAPIDO**

1. **Verifica backend online**:
   ```
   https://mini-rag-backend-xxx.onrender.com/health
   ```
   Deve ritornare: `{"status":"ok","timestamp":"..."}`

2. **Verifica database**:
   - Vai su Render Dashboard → Database
   - Verifica che le tabelle siano state create
   - Controlla i log per errori di connessione

3. **Verifica frontend**:
   - Apri Console del browser (F12)
   - Guarda Network tab durante il login
   - Verifica che le chiamate vanno al backend giusto

4. **Verifica logs**:
   - Backend: Render Dashboard → Backend Service → Logs
   - Frontend: Render Dashboard → Static Site → Logs

---

## 📝 **NOTE IMPORTANTI**

### SQLite vs PostgreSQL
Il progetto usa SQLite in sviluppo e PostgreSQL in produzione su Render. TypeORM gestisce automaticamente la differenza.

### File Upload
Se hai implementato upload di file, su Render usa:
- **Disco persistente** (piano Starter: $0.5/GB/mese)
- Oppure integra **AWS S3** per storage remoto

### Database Backups
Render fa backup automatici del database PostgreSQL ogni giorno (piano Starter).
Per backup manuali, usa il Render Dashboard → Database → Backups.

### SSL/HTTPS
Render fornisce automaticamente certificati SSL per tutti i servizi.
Non serve configurare nulla per HTTPS.

### Rate Limiting
Il backend ha rate limiting configurato (100 richieste per 15 minuti).
Se necessario, puoi modificarlo in `server.js`.

---

**Ultimo aggiornamento**: 3 Luglio 2026
**Progetto**: Mini RAG Pro
**Autore**: Nazareno
