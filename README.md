# Tuali - Code Tsunami

Tuali is a mobile-first B2B ordering experience for small convenience stores, built for Hack4Her 2026. The app turns customer purchase behavior into personalized growth goals, recommendations, social missions, achievements, and an AI voice agent.

The core idea: every logged-in store has a JSON profile with its cluster, base metrics, and recommended goals. The UI uses that profile to guide the owner through actions that can increase ticket size, improve assortment, reactivate purchases, apply promotions, and earn points.

## Features

- **Inicio**: store dashboard, product search, restock suggestions, and cart summary.
- **Productos**: catalog organized by product categories.
- **Pedidos**: order history and status tracking.
- **Gana**: loyalty points, rewards, and retos.
- **Mi Meta**: gamified growth screen with recommended goals, custom goals, social missions, achievements, cluster competition, and a Candy Crush-style goal path.
- **AI Agent**: ElevenLabs Conversational AI agent with text and voice, enriched with customer profile variables.

## Tech Stack

- React 19
- Vite 6
- Express 5 backend
- ElevenLabs Conversational AI and TTS
- Gemini / OpenAI / Claude fallback support through the backend
- Lottie animations
- Local JSON customer profiles

## Project Structure

```txt
code-tsunami/
  agente-tuali/
    Casos Principales/        # Valid customer profile JSONs used by the app
  server/
    index.js                  # Express API for agent/TTS/session helpers
  src/
    components/
    pages/
      Ai.jsx                  # ElevenLabs text and voice agent UI
      MiMeta.jsx              # Gamified goal experience
      Gana.jsx
      Productos.jsx
    services/
  .env.example
  package.json
  vite.config.js
```

## Requirements

- Node.js 18 or newer
- npm
- ElevenLabs account with an Agent ID
- Optional: Gemini/OpenAI/Claude API key for backend fallback flows

## Environment Variables

Create a `.env` file from `.env.example`:

```powershell
Copy-Item .env.example .env
```

Minimum setup for the ElevenLabs agent:

```env
VITE_ELEVENLABS_AGENT_ID=agent_5601ktgk8z39f7nbxt0hshsc8jpj
VITE_ELEVENLABS_KEY=your_elevenlabs_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

Optional LLM fallback:

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash
```

Optional voice routing by cluster:

```env
ELEVENLABS_VOICE_CLUSTER_VIP=
ELEVENLABS_VOICE_CLUSTER_NICHO=
ELEVENLABS_VOICE_CLUSTER_OCASIONAL=
ELEVENLABS_VOICE_CLUSTER_VOLUMEN=
ELEVENLABS_VOICE_CLUSTER_RECURRENTE=
```

Do not commit `.env`.

## Run Locally

Install dependencies:

```powershell
npm install
```

Run frontend and backend together:

```powershell
npm run dev:full
```

Open:

```txt
http://localhost:5173
```

The backend runs at:

```txt
http://127.0.0.1:8787
```

Check backend health:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/health
```

## Scripts

```powershell
npm run dev       # Vite frontend only
npm run server    # Express backend only
npm run dev:full  # Frontend + backend
npm run build     # Production build
npm run preview   # Preview built app
```

## Customer Profiles

The app uses explicit imports from:

```txt
agente-tuali/Casos Principales/
```

Valid profile files include:

- `1_0012Eplus18.json`
- `1_00004Eplus18.json`
- `3_87064Eplus17.json`
- `ocasional_sample.json`
- `volumen_sample.json`

The selected profile can be controlled with:

```env
VITE_CUSTOMER_PROFILE=1_0012Eplus18
```

## AI Agent Behavior

`src/pages/Ai.jsx` connects to ElevenLabs Conversational AI using:

```env
VITE_ELEVENLABS_AGENT_ID
```

It passes dynamic variables from the current customer profile, including:

- `customer_id`
- `perfil` / `cluster`
- `pais`
- `frecuencia`
- `ticket_promedio`
- `meta_principal`
- `metas_json`

This lets the agent answer with store-specific context instead of generic support text.

## Troubleshooting

If the app does not start:

```powershell
Get-Process node | Stop-Process
npm run dev:full
```

If the backend health says `elevenlabs: false`, check that `.env` has:

```env
ELEVENLABS_API_KEY=...
```

If voice does not start, check:

- Browser microphone permission is allowed.
- The ElevenLabs agent is public, or your API key has Conversational AI permissions.
- `VITE_ELEVENLABS_AGENT_ID` matches the agent in ElevenLabs.

If Gemini returns a model error, use:

```env
GEMINI_MODEL=gemini-2.5-flash
```

## Build

```powershell
npm run build
```

The build may warn about Lottie `eval` usage or large chunks. Those are warnings, not build failures.

## License

MIT. See [LICENSE](LICENSE).
