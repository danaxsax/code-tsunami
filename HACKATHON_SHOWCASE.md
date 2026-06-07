# Tuali — Agente de Crecimiento para Tiendas de Abarrotes

> Una plataforma B2B *mobile-first* que convierte cada pedido en una oportunidad de crecimiento mutuo: la empresa vende más, el tendero hace crecer su negocio.

---

## 1. Resumen ejecutivo

**Tuali** es una aplicación de pedidos B2B diseñada para los pequeños comercios de barrio —las tiendas de abarrotes— que son el corazón de la distribución de consumo masivo en Latinoamérica. Pero Tuali no es un simple catálogo de pedidos: es un **agente de crecimiento** que acompaña al tendero con metas concretas, medibles y personalizadas, generadas a partir de su comportamiento de compra real.

La propuesta de valor descansa sobre un **doble beneficio** que alinea los incentivos de ambas partes:

| La empresa (distribuidor / marca) | El cliente (tendero) |
|-----------------------------------|----------------------|
| Vende más por pedido (ticket promedio) | Aumenta su rentabilidad por compra |
| Aumenta la frecuencia de recompra | Nunca pierde ventas por falta de stock |
| Diversifica el surtido colocado | Atrae nuevos clientes con más categorías |
| Captura datos de comportamiento | Recibe asesoría de negocio gratuita |
| Genera exposición orgánica (UGC) | Promociona su tienda en redes sociales |

El núcleo técnico es un **sistema de perfiles basado en JSON** derivado de datos reales de la empresa, que clasifica a cada tienda en un *cluster* de comportamiento y alimenta tanto la interfaz de metas (`MiMeta`) como un **asistente conversacional de IA** (`Ai`) con voz personalizada por país. Toda la personalización ocurre sin que el tendero tenga que configurar nada: el sistema **infiere la estrategia** de su propio historial.

En una frase: **Tuali transforma la relación transaccional "te vendo producto" en una relación de crecimiento "te ayudo a vender más".**

---

## 2. Perfiles de cliente

La personalización de Tuali no se basa en suposiciones, sino en **datos transaccionales reales** procesados y condensados en perfiles JSON. El proyecto incluye el dataset fuente en `agente-tuali/` (`Orders.csv`, `OrderDetails.csv`, `Resultados.csv`) y los perfiles ya destilados en `agente-tuali/Casos Principales/`.

### Los clusters de comportamiento

Cada tienda se clasifica en uno de los siguientes perfiles según sus métricas base (`frecuencia`, `ticket_promedio`, `score_nicho`):

| Perfil | Comportamiento | Estrategia priorizada por el agente |
|--------|----------------|-------------------------------------|
| **VIP** | Alto valor por pedido | Ticket promedio, combos y promociones de mayor impacto |
| **Recurrente** | Compra con frecuencia | Diversificación y nuevas oportunidades de surtido |
| **Nicho** | Alta concentración en pocos productos | Diversificación y *cross-sell* |
| **Ocasional** | Compra poco o dejó pasar varios días | Activación y recompra fácil |
| **Volumen** | Potencial de aumentar frecuencia | Pedidos programados y promociones |

Estas descripciones no son texto decorativo: viven en la constante `profileCopy` dentro de `src/pages/MiMeta.jsx` y se usan en las recomendaciones que genera el agente.

### Cómo funciona el sistema de perfiles JSON

Cada perfil es un documento autocontenido. Por ejemplo, el cliente VIP (`1_0012Eplus18.json`):

```json
{
  "customer_id": "1.0012E+18",
  "perfil": "VIP",
  "metricas_base": {
    "frecuencia": 2,
    "ticket_promedio": 4390.97,
    "score_nicho": 0.222
  },
  "metas": [
    { "tipo": "Aumentar promedio de ticket", "prioridad": "Alta" },
    {
      "tipo": "Diversificación",
      "prioridad": "Alta",
      "datos_asociados": {
        "sku_concentracion": "Ciel Agua Purificada",
        "share_producto_top": "22.2%",
        "categorias_actuales": 5
      }
    }
  ],
  "pais": "México"
}
```

El sistema técnico se articula en tres capas:

1. **Registro de perfiles.** Tanto el frontend (`profileModules` en `MiMeta.jsx` y `Ai.jsx`) como el backend (`profileFiles` en `server/index.js`) mantienen un mapa `id → archivo`. El perfil activo se resuelve por prioridad: `localStorage.getItem('tuali_customer_profile')` → `import.meta.env.VITE_CUSTOMER_PROFILE` → `DEFAULT_PROFILE_FILE`.

2. **Normalización defensiva.** Los datos reales traen problemas de codificación (acentos rotos tipo `DiversificaciÃ³n`). Las funciones `normalizeText` y `normalizeDeep` sanean recursivamente cada string del perfil antes de usarlo, garantizando que la UI y la IA reciban texto limpio.

3. **Derivación de estrategia.** La función `buildGoalPlan(profile)` lee `metricas_base` y el arreglo `metas`, identifica la meta de mayor prioridad (`preferred`) y calcula objetivos concretos: ticket objetivo (`ticket * 1.1`), frecuencia objetivo, categorías a abrir y porcentaje de avance. **Nada está *hardcodeado* por tienda**: todo emerge del JSON.

### Por qué este enfoque escala

Agregar una tienda nueva —o un país nuevo— es agregar **un archivo JSON**. No hay que tocar componentes, ni lógica de UI, ni el prompt de la IA. El mismo motor de `buildGoalPlan` produce un plan coherente para una tienda VIP de México o una Ocasional de Argentina. Es **personalización masiva sin costo marginal de ingeniería**: la inteligencia vive en los datos, no en `if` repartidos por el código.

---

## 3. Sistema de Metas

Tuali implementa **tres dimensiones de metas** que se complementan: lo que el tendero hace solo, lo que hace compitiendo con sus pares y lo que hace en comunidad. Cada una está cuidadosamente diseñada para beneficiar simultáneamente a la empresa y al cliente.

### 3.1 Metas individuales

Definidas en la constante `goalCatalog` y desarrolladas paso a paso en `goalRoadmaps` y `buildGoalPath`. Cada tipo tiene ícono, color, descripción e impacto estimado:

| Meta (`goalCatalog`) | Qué hace | Beneficio empresa | Beneficio tendero |
|----------------------|----------|-------------------|-------------------|
| **Aumentar promedio de ticket** | Sube el valor de cada pedido con combos y complementarios | Más venta por orden | Más margen por compra |
| **Diversificación** | Reduce dependencia de un solo SKU, abre categorías | Coloca más portafolio | Negocio más resiliente |
| **Incrementar Pedidos** | Aumenta frecuencia con recordatorios y recompra | Más órdenes recurrentes | Cero quiebres de stock |
| **Aplicar Promociones** | Usa promos en productos clave sin complicar el pedido | Rotación de inventario | Ahorro y atracción de clientes |
| **Crear Combos** | Une productos frecuentes en un paquete | Venta cruzada | Ticket más alto, oferta atractiva |
| **Activación** | Reactiva compras con un gancho de bajo riesgo | Recupera clientes inactivos | Recupera ventas perdidas |

Cada meta no es un eslogan, sino un **camino de pasos accionable**. La función `buildGoalPath` devuelve una secuencia de 4 etapas con estados `done` / `active` / `locked` y recompensas en puntos. Por ejemplo, para *Crear Combos*:

> **Sinergia de Productos** → **Precio Psicológico** → **Impulso Social** → **Revisión de Mix**

Donde cada paso conecta con datos del perfil ("*Tuali sugiere que esto aumenta la conversión en tu cluster*") y con otras metas (el paso "Impulso Social" enlaza con las misiones sociales). El tendero crea sus propias metas además de las recomendadas mediante el formulario de `customGoalTypes`.

### 3.2 Metas por Cluster (competencia anónima entre pares)

Implementadas en la constante `clusterRankings`. A cada cluster le corresponde un **reto**, un **premio** y un **ranking** de tiendas:

```js
VIP: {
  challenge: 'Reto: sube tu ticket promedio 10%',
  prize: 'Premio: 450 puntos y combo destacado',
  ranking: [
    { store: 'Abarrotes Lupita', progress: 92 },
    { store: 'Abarrotes Chabelita', progress: 62, me: true },
    ...
  ]
}
```

La clave de UX está en el **anonimato competitivo**: en la interfaz, los competidores se renderizan como `Competidor 1`, `Competidor 2`… y solo la propia tienda (`item.me`) aparece con su nombre real. Esto genera la presión motivadora de un ranking **sin exponer datos sensibles** de negocios ajenos.

- **Para la empresa:** convierte la mejora de KPIs (ticket, frecuencia, surtido) en un juego viral entre tiendas comparables, multiplicando la adopción de las metas sin incentivos monetarios directos.
- **Para el tendero:** compite contra negocios *parecidos al suyo* —no contra una cadena gigante—, lo que hace el reto justo y alcanzable, y le da un sentido de progreso medible (`Tu posicion: #3`).

### 3.3 Metas sociales (integración de redes y contenido UGC)

Definidas en `socialMissionSeed`, con feeds simulados en `tiktokParticipants` e `instagramParticipants`. Son acciones **fuera de la app** que promueven la tienda física:

| Misión (`id`) | Acción | Recompensa |
|---------------|--------|------------|
| `tiktok-combo` | Sube un TikTok con tu combo estrella | +120 pts |
| `story-store` | Comparte un reel de tu tienda | +80 pts |
| `display-photo` | Foto de tu exhibidor completo | +60 pts |
| `poster-counter` | Coloca un cartel de promo en mostrador | +70 pts |

Cada misión avanza por estados (`disponible` → `en progreso` → `completada`) y abre experiencias inmersivas: un **feed estilo TikTok** a pantalla completa (`showTikTokFeed`), un **feed estilo Instagram Reels** (`showInstagramFeed`) y un **menú de subida de evidencia** con *dropzone* (`showUploadMenu`). Los participantes mostrados son tiendas reales con enlaces a videos reales.

- **Para la empresa:** genera **contenido orgánico (UGC)** que promociona sus marcas a coste cero, convirtiendo a cada tendero en un microinfluencer de barrio. La exposición es exponencial y auténtica.
- **Para el tendero:** atrae clientes nuevos a su punto de venta, gana puntos canjeables y entra en una comunidad de comerciantes que comparten buenas prácticas.

---

## 4. Página: Mi Meta (`src/pages/MiMeta.jsx`)

`MiMeta` es el centro de comando del crecimiento del tendero. Es la pieza más densa de la app (~1000 líneas de React) y reúne toda la inteligencia del sistema de perfiles en una sola pantalla de scroll. Sus componentes, en orden, y la razón de UX detrás de cada uno:

### Tarjeta de meta activa (`active-goal-card`)
Encabezada por un **gráfico de progreso** (`goal-progress`) con porcentaje, valor actual vs. objetivo y "cuánto falta". El color (`--goal-color`) se hereda del tipo de meta. **Por qué:** lo primero que ve el tendero es su avance, presentado como una sola cifra grande y accionable. Un botón `goal-path-cta` ("Ver camino de pasos") lleva al detalle.

### Tira de impacto (`goal-impact`)
Tres métricas: impacto estimado, misiones aceptadas (`X de 3`) y puntos. **Por qué:** traduce el esfuerzo en resultados tangibles (dinero y puntos), reforzando la motivación.

### Plan generado por IA (`generated-goals`)
Renderiza `plan.goals` —las metas extraídas del JSON del usuario logueado— como *pills* con ícono y prioridad. **Por qué:** hace explícito que el plan **viene de sus propios datos**, no de una receta genérica. Cada pill abre su camino de pasos.

### Metas recomendadas (`missions-section`)
Tarjetas accionables (`mission-card`) con tag, impacto, puntos y dos acciones: **"Agregar al pedido"** (toggle de interés, `toggleRecommendation`) y **"No me interesa"** (descarte, `dismissedTags`). **Por qué:** el *interest toggle* es entrenamiento implícito del agente —cada aceptación o descarte ajusta futuras recomendaciones— sin pedir feedback explícito.

### Crea tu propia meta (`custom-goal-card`)
Formulario con `customGoalTypes` que permite al tendero **definir su intuición** junto a la IA. Las metas creadas obtienen su propio camino de pasos vía `openGoalPath`. **Por qué:** equilibra automatización con autonomía; el tendero no es un sujeto pasivo del algoritmo.

### Misiones sociales (`social-missions-card`)
La sección descrita en §3.3, con feeds UGC inmersivos. **Por qué:** lleva la gamificación más allá de la app, al mundo físico y a las redes.

### Achievements / Insignias de logro (`achievements-card`)
Cuadrícula de 8 insignias (`buildAchievements`) con escudo de color e **íconos visuales propios** (`pedido`, `combo`, `meta`, `social`, `7 dias`, `promo`, `surtido`, `top`). Cada insignia se desbloquea según condiciones reales del estado: misiones aceptadas, metas personalizadas creadas o misiones sociales completadas.

```js
{ id: 'surtido', label: 'Surtido', image: surtidoIcon, color: '#7b61ff',
  unlocked: profile.perfil === 'Nicho' || acceptedCount >= 2 }
```

**Por qué:** los logros desbloqueables dan retroalimentación inmediata y coleccionable; el estado `locked`/`unlocked` mantiene una zanahoria visible que invita a seguir avanzando.

### Competencia de mi cluster (`cluster-competition`)
El **ranking de competidores anónimos** descrito en §3.2, con barras de progreso, la propia posición destacada y un modal de tabla completa (`showFullRanking`). **Por qué:** presión social positiva entre pares comparables.

### Caja de feedback (`feedback-card`)
Pregunta "¿Te ayudó esta recomendación?" con botones **Sí / No** y un área de comentarios libre que aparece al responder negativamente (`showCommentBox`). **Por qué:** cierra el ciclo de aprendizaje del agente con feedback explícito cuando el implícito no basta.

### Acompañamiento conversacional en el camino (`openGoalPath`)
Al abrir cualquier camino de metas, `MiMeta` hace `POST /api/agent` enviando `metaState` (pantalla, meta seleccionada, siguiente paso, cluster) para que **la IA genere un mensaje de coaching contextual**. Si el backend no está disponible, hay un *fallback* local elegante. **Por qué:** une la interfaz visual con la inteligencia conversacional sin fricción.

---

## 5. Página: AI Chat (`src/pages/Ai.jsx`)

El asistente conversacional es lo que convierte a Tuali de "app de pedidos con metas" en un **agente de crecimiento que habla con el tendero**. Está construido sobre **ElevenLabs Conversational AI** (`@elevenlabs/client`) con un backend que orquesta múltiples LLMs.

### Capacidades conversacionales

El agente está instruido (`systemPrompt` en `server/index.js`) para ser un **asesor práctico de negocio**, no un chatbot genérico:

```
Eres el agente de crecimiento de Tuali para tiendas de abarrotes.
Reglas:
- Responde siempre en espanol.
- Se breve: maximo 3 oraciones.
- Conecta la respuesta con una meta del perfil.
- Si sugieres una accion, incluye el impacto esperado.
- No inventes datos fuera del perfil.
```

El prompt **inyecta el perfil JSON completo** y el `metaState` visible, de modo que la IA conoce las métricas, metas y país del tendero, y puede hablar de **pedidos, metas y promociones** con datos concretos. El backend es agnóstico al proveedor: `callLLM` enruta a **OpenAI** (`gpt-4o-mini`), **Gemini** (`gemini-2.5-flash`) o **Claude** (`claude-3-5-haiku-latest`) según `LLM_PROVIDER`, con `temperature: 0.45` para respuestas consistentes.

### Doble modo: texto y voz

`Ai.jsx` soporta dos canales con la misma personalidad:
- **Texto** (`startTextSession`): WebSocket en modo `textOnly`, con respuestas **en streaming** token a token (`onAgentChatResponsePart`) para sensación de fluidez.
- **Voz** (`startVoice`): WebRTC en tiempo real, con detección de cuándo el agente habla vs. escucha (`onModeChange`).

Ambos usan `buildConversationOptions`, que pasa **variables dinámicas** del perfil (`buildDynamicVariables`: cluster, frecuencia, ticket, meta principal, metas en JSON) al agente de ElevenLabs, forzando idioma español (`overrides.agent.language: 'es'`).

### Diseño visual amigable y animaciones

El avatar es una animación **Lottie** (`lottie-react`) que reacciona al estado de la conversación, cambiando entre tres animaciones según el contexto:

| Animación | Cuándo |
|-----------|--------|
| `helloAnimation` | En reposo / saludo |
| `lookAnimation` | Pensando / el agente habla |
| `idleAnimation` | Escuchando en modo voz |

La velocidad se ajusta a `SPEED = 2.5` para un avatar vivo y enérgico. En modo voz, un indicador textual muestra *"Tuali esta hablando…"* o *"Escuchando…"* con colores semánticos. El componente `HelloAvatar` —presente en **todas** las páginas— flota como acceso directo al chat, alternando frases ("¿Necesitas ayuda? Pregúntale a la IA") y reproduciéndolas con voz al tocarlo.

### Sistema de voz/personalidad por país

Esta es una de las decisiones más sofisticadas. La función `voiceForProfile({ cluster, country })` en `server/index.js` selecciona la **voz de ElevenLabs según el cluster Y el país** del tendero, con un sistema de *fallback* en cascada:

1. Voz específica por cluster: `ELEVENLABS_VOICE_CLUSTER_<ALIAS>` (con alias flexibles en `clusterVoiceAliases`, p. ej. `VOLUMEN` ≈ `BAJO_VOLUMEN`).
2. Voz por país: `ELEVENLABS_VOICE_<PAIS>` (México, Argentina, Perú, Ecuador).
3. Voz por defecto.

El país se detecta del propio perfil (`detectCountry` en `src/services/location.js`, mapeado en `COUNTRY_MAP`), de modo que **un tendero argentino escucha un acento argentino** y uno mexicano el suyo. La síntesis usa `eleven_multilingual_v2`. Esto crea cercanía cultural inmediata.

### Atención a usuarios de baja alfabetización digital

Todo el diseño está pensado para un tendero que **no es un usuario técnico**:
- **Hablar en vez de escribir:** el modo voz elimina la barrera del teclado por completo.
- **Avatar antropomórfico:** una mascota animada es más acogedora que una caja de texto fría.
- **Respuestas cortas:** el límite de 3 oraciones evita muros de texto.
- **Idioma y acento local:** el tendero escucha a "alguien de su país", no a un robot neutro.
- **Acceso ubicuo:** `HelloAvatar` en cada pantalla significa que la ayuda nunca está a más de un toque de distancia.

---

## 6. Impacto para la empresa

El diseño de Tuali está optimizado para mover los KPIs que importan al distribuidor:

- **Mayor ticket promedio.** Las metas *Aumentar ticket* y *Crear Combos* empujan sistemáticamente el valor por pedido. El motor calcula el objetivo en `ticket * 1.1` (+10%) y lo refuerza tanto en `MiMeta` como en el coaching de la IA.
- **Mayor frecuencia de pedidos.** La meta *Incrementar Pedidos* con recordatorios, pedidos anticipados y sincronización con picos de demanda combate directamente los quiebres de stock que hacen perder ventas.
- **Diversificación del surtido colocado.** La meta *Diversificación* usa `share_producto_top` y `categorias_actuales` del perfil para empujar al tendero a abrir categorías nuevas, colocando más portafolio de la empresa.
- **Reactivación de clientes dormidos.** La meta *Activación* (perfil Ocasional) recupera tiendas que dejaron de comprar (`dias_desde_ultimo_pedido`), rescatando ingresos que de otro modo se perderían.
- **Recolección de datos de comportamiento.** Cada interacción —aceptar/descartar recomendaciones (`accepted`, `dismissedTags`), feedback (`feedbackType`), progreso en metas— es señal de entrenamiento que afina la personalización y nutre la inteligencia de negocio del distribuidor.
- **Exposición orgánica vía UGC.** Las misiones sociales convierten a la red de tenderos en un ejército de creadores de contenido que promocionan las marcas en TikTok e Instagram **sin inversión publicitaria**.
- **Adopción viral mediante competencia.** Los rankings por cluster gamifican la mejora de KPIs, logrando que los tenderos *quieran* vender más por motivación intrínseca, no solo por margen.

---

## 7. Impacto para el cliente (tendero)

Para el dueño de la tienda, Tuali resuelve problemas reales de un negocio que normalmente opera por intuición:

- **Facilidad para pedir.** Interfaz *mobile-first* (máximo 430px, `App.css`), búsqueda, resurtido sugerido y carrito. Pedir es rápido y familiar.
- **Asesoría de negocio gratuita.** Recibe lo que normalmente costaría un consultor: diagnóstico de su negocio, identificación de su producto más concentrado, sugerencias de combos rentables y caminos paso a paso —todo derivado de sus propios datos.
- **Crecimiento guiado y medible.** Cada meta tiene objetivo, progreso y "cuánto falta". El tendero ve su negocio mejorar con números, no con corazonadas.
- **Motivación por gamificación.** Puntos, insignias desbloqueables (`achievements`) y rankings convierten la gestión del negocio en un juego con recompensas tangibles.
- **Sentido de comunidad.** Compite y aprende junto a tiendas parecidas a la suya, y promociona su negocio en redes con el respaldo de un reto colectivo. No está solo.
- **Cercanía cultural.** Un asistente que le habla en su idioma, con su acento, y al que puede simplemente *hablarle* sin teclear, derriba la barrera tecnológica.

---

## 8. Arquitectura técnica destacada

Las decisiones de ingeniería más impresionantes del proyecto:

1. **Personalización dirigida por datos (data-driven), no por código.** El sistema de perfiles JSON (`profileModules` / `profileFiles`) es la columna vertebral. Toda la estrategia —metas, recomendaciones, progreso, coaching de IA— se *deriva* del JSON mediante `buildGoalPlan` y `buildGoalPath`. Escalar a miles de tiendas o a un nuevo país es agregar archivos, no reescribir lógica.

2. **Backend de IA agnóstico al proveedor.** `callLLM` en `server/index.js` abstrae OpenAI, Gemini y Claude tras una sola interfaz, seleccionable por variable de entorno. El mismo `systemPrompt` —que inyecta perfil + `metaState`— funciona con cualquiera, evitando *vendor lock-in*.

3. **Voz contextual en cascada por cluster y país.** `voiceForProfile` con `clusterVoiceAliases` y *fallbacks* multinivel entrega una voz culturalmente adecuada a cada tendero. La detección de país (`detectCountry`) cierra el círculo de localización.

4. **Conversación dual texto/voz en tiempo real.** La integración con ElevenLabs Conversational AI maneja WebSocket (texto con streaming) y WebRTC (voz), con manejo cuidadoso de estados, deduplicación de mensajes (`isRepeatedGreeting`, `appendMessage`) y *fallbacks* robustos (signed-url → agentId directo).

5. **Normalización defensiva de datos del mundo real.** `normalizeText` / `normalizeDeep` saneando recursivamente acentos corruptos demuestra madurez: los datos reales son sucios, y el sistema los limpia antes de que lleguen al usuario o a la IA.

6. **Estado de UI rico pero contenido.** `MiMeta` orquesta más de una docena de piezas de estado (metas, misiones, modales, feedback) en React 19 puro, sin librerías de estado externas, manteniendo el *bundle* ligero.

7. **Sincronización frontend/backend de perfiles.** El mismo identificador de perfil resuelve igual en cliente (`localStorage` / `import.meta.env`) y servidor (`DEFAULT_CUSTOMER_PROFILE`), garantizando que la UI y la IA hablen siempre del mismo tendero.

**Stack:** React 19 · Vite 6 · Express 5 · ElevenLabs Conversational AI · lottie-react · OpenAI / Gemini / Claude (intercambiables).

---

## 9. Conclusión

Tuali resuelve un problema que parecía irresoluble: cómo dar asesoría de negocio personalizada, a escala y a coste marginal cero, a millones de pequeños comerciantes que operan por intuición. Lo logra con una idea elegante —**convertir datos transaccionales en perfiles JSON que dirigen toda la experiencia**— y la ejecuta con profundidad técnica real: un agente conversacional multimodal con voz localizada, un backend de IA intercambiable y una capa de gamificación que alinea perfectamente los incentivos de la empresa y del tendero.

La innovación no está en una sola pieza, sino en cómo encajan: el perfil JSON alimenta a la vez la pantalla de metas, las recomendaciones, los rankings, las insignias y la voz del asistente. Y la escalabilidad está integrada desde el diseño: **una tienda nueva es un archivo; un país nuevo es una voz; un modelo de IA nuevo es una variable de entorno.**

Cuando la empresa vende más *porque* el tendero crece, ambos ganan. Tuali no es una herramienta de ventas disfrazada de app de crecimiento: es genuinamente un **socio de crecimiento** para el comercio de barrio. Y eso lo hace tan defensible como escalable.

---

*Tuali — donde cada pedido es un paso hacia un negocio más grande.*
