# Release Tracker — Registro de Desarrollo

## Stack

- **Frontend/Backend**: Next.js 16 (App Router) + TypeScript
- **Base de datos**: Firebase Firestore
- **Estilos**: Tailwind CSS + variables CSS personalizadas
- **Fuente**: Inter + JetBrains Mono (Google Fonts)
- **Deploy**: Vercel (pendiente)
- **Package manager**: pnpm 11+

---

## Arquitectura

```
release-tracker/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Dashboard principal
│   │   ├── layout.tsx                  # Root layout (Inter font)
│   │   ├── globals.css                 # Variables LATAM + keyframes
│   │   └── api/gitlab/
│   │       ├── projects/route.ts       # Lista proyectos del grupo GitLab
│   │       ├── statuses/route.ts       # Estado pipelines por environment
│   │       └── pipeline/route.ts       # Pipeline individual (legado)
│   ├── components/
│   │   ├── SummaryPanel.tsx            # Cards resumen + barra progreso
│   │   ├── ComponentsTable.tsx         # Tabla principal con buscador
│   │   ├── PipelineStatus.tsx          # Círculos dev→master→prod
│   │   ├── PipelineTooltip.tsx         # Tooltip con guía de uso
│   │   ├── GitlabProjectSearch.tsx     # Autocomplete de proyectos GitLab
│   │   ├── AddComponentModal.tsx       # Modal añadir componente
│   │   ├── ProdModal.tsx               # Modal paso a prod (ticket + comentario)
│   │   ├── SummaryCard.tsx             # Card individual (legado)
│   │   ├── StatusBadge.tsx             # Badge de estado (legado)
│   │   └── GitlabPipelineBadge.tsx     # Badge GitLab (legado)
│   └── lib/
│       ├── firebase.ts                 # Init Firebase (singleton)
│       ├── db.ts                       # CRUD Firestore
│       └── types.ts                    # Interfaces TypeScript
```

---

## Modelo de datos (Firestore)

### Collection `components`
```ts
{
  id: string
  name: string                  // Nombre del proyecto GitLab
  gitlabProjectId?: number      // ID del proyecto en GitLab
  gitlabProjectName?: string    // Nombre del proyecto
  gitlabProjectPath?: string    // Path completo (para mostrar subgrupos)
  lastTicketProd?: string       // Último ticket registrado en prod (ej: AIRCOR-60)
  comments?: string             // Comentario del último deploy a prod
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Collection `releases`
```ts
{
  id: string
  componentId: string           // ID del componente en Firestore
  componentName: string
  ticket: string                // Ticket de la tarea (ej: AIRCOR-60)
  deployedAt: Timestamp
}
```

> **Nota**: Al eliminar un componente, sus releases asociadas se eliminan automáticamente (cascade delete).

---

## Integración GitLab

### Grupo base
```
latamairlines/oper/flight-operation-safety-and-security/aircraft-operations
```

### Variables de entorno requeridas (`.env.local`)
```env
GITLAB_TOKEN=glpat-...
GITLAB_GROUP_PATH=latamairlines/oper/flight-operation-safety-and-security/aircraft-operations
# Subgrupos a trackear (relativos al grupo base, separados por coma). Vacío = grupo completo.
GITLAB_SUBGROUPS=bcpcco,opsfle,gdh20,opltm

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### API Routes (server-side — el token nunca llega al cliente)

#### `GET /api/gitlab/projects`
- Lista proyectos de los subgrupos definidos en `GITLAB_SUBGROUPS` (con paginación automática). Si la var está vacía, lista el grupo completo.
- Un subgrupo inexistente o vacío (ej: `bcpcco` aún sin repos) no rompe el resto
- Excluye proyectos archivados
- Retorna: `{ id, name, path }[]` (dedupe por id, ordenado por nombre)

#### `GET /api/gitlab/statuses?projectId=123`
- Consulta el último deploy a cada environment via **GitLab Deployments API**
- Environments: `dev`, `intg`, `prod`
- Retorna: `{ dev, master, prod }` con `{ status, webUrl }`

> **Por qué Deployments API y no Pipelines API**: Los pipelines de master están dominados por `security_orchestration_policy` (GitLab Security Policy Bot) que no son deploys reales. La Deployments API solo retorna deploys reales a environments, ignorando scans de seguridad automáticamente.

### Estados de pipeline (desde GitLab)
| Estado | Ícono | Color |
|--------|-------|-------|
| `success` | ✓ | Verde |
| `failed` | ✕ | Rojo |
| `running` | ▶ | Azul (pulsando) |
| `pending` | ⏳ | Amarillo |
| `canceled` | ⊘ | Gris |
| Sin pipeline | ○ | Blanco |

---

## Pipeline Visual (dev → master → prod)

- **Dev**: último deploy al environment `dev` en GitLab
- **Master**: último deploy al environment `intg` en GitLab
- **Prod**: último deploy al environment `prod` en GitLab
- Los círculos son links directos al pipeline en GitLab
- Las líneas conectoras se vuelven verdes cuando el step anterior fue exitoso
- Click en **Prod** → abre modal para registrar ticket y comentario del deploy

---

## Flujo de trabajo

```
1. Añadir componente
   → Buscar proyecto en GitLab (autocomplete entre ~180 proyectos)
   → Se guarda nombre + ID + path del proyecto

2. Dashboard muestra automáticamente
   → Estado de dev (GitLab environment "dev")
   → Estado de master/intg (GitLab environment "intg")
   → Estado de prod (GitLab environment "prod")

3. Al pasar a prod
   → Click en círculo prod
   → Ingresar ticket (ej: AIRCOR-60)
   → Ingresar comentario ("qué se desplegó")
   → Se guarda en Firestore y aparece en "Última release"
```

---

## Diseño — Aerostructure Core (LATAM)

Sistema de diseño basado en los colores corporativos de LATAM Airlines:

| Token | Valor | Uso |
|-------|-------|-----|
| `--latam-red` | `#E31837` | Botones primarios, barra progreso, alerts |
| `--latam-navy` | `#1B2A4A` | Header, tabla headers, texto principal |
| `--latam-navy-light` | `#E8EBF2` | Fondos de cards, badges de subgrupo |
| `--latam-navy-dark` | `#111D33` | Header oscuro |
| `--latam-red-light` | `#FDECEA` | Card "Sin documentar" |
| `--latam-bg` | `#F5F6FA` | Fondo general |

**Principios**: Flat design, sin sombras, border-radius 4px, fuente Inter.

---

## Panel de resumen

| Card | Fuente de datos |
|------|----------------|
| Total componentes | Firestore — count de documents |
| En prod | Firestore — documentos con `lastTicketProd` |
| Sin documentar | Firestore — documentos sin `lastTicketProd` |
| Última release | Firestore — colección `releases` ordenada por `deployedAt` desc |
| Barra de progreso | `documentados / total × 100%` |

---

## Decisiones técnicas relevantes

### Por qué Deployments API en vez de Pipelines API
Los pipelines de la rama `master` están dominados por scans de seguridad automáticos (`security_orchestration_policy`) que no son deploys reales. Intentamos filtrar por `source=push` y `source=web`, pero resultó complejo e impreciso. La Deployments API resuelve esto directamente — solo muestra deploys reales a environments.

### Detección de prod: GitLab es la fuente de verdad (no el ticket manual)
El paso a prod se dispara corriendo el pipeline de `master` con `CI_TRIGGER_RELEASE=true`. No se puede leer esa variable con rol Developer, **pero no hace falta**: el deploy con el trigger activo aterriza en el environment `prod` de GitLab, que es perfectamente consultable vía Deployments API (verificado en vivo — ej. `co-gestion-bl` prod success en master, pipeline distinto al de intg).

**"En prod" se determina comparando el SHA del deploy de prod con el de intg/master**, no solo por `prod.status === 'success'`. Razón: el environment `prod` guarda el *último* deploy exitoso, que puede ser una versión vieja mientras master tiene cambios nuevos en QA (caso real: `changemap-bff` con prod de abril y master 42 commits adelante). Estados del círculo prod:
- `prod.sha === master.sha` (+ prod success) → verde ✓ **En prod**. Si falta el ticket, punto ámbar "falta documentar".
- prod success pero `prod.sha !== master.sha` → ámbar ↑ **Desactualizado**: hay una versión anterior en prod y master tiene cambios sin liberar (en QA).
- prod failed/running → ✕ rojo / ▶ azul. Sin deploy a prod → ○.

El ticket manual (`lastTicketProd`) quedó como **documentación** del deploy (qué se desplegó), no como mecanismo de detección. El status que se usa es el del **deployment** (`dep.status`), no el del pipeline completo, porque es más preciso por environment. La API `statuses` retorna `{ status, webUrl, sha, deployedAt }` por environment.

> Convención de environments confirmada en los subgrupos trackeados (`opsfle`, `gdh20`, `opltm`): la activa es `dev` / `intg` / `prod`. Los `development` / `staging` / `testing` / `production` que aparecen en varios repos son artefactos del scaffold (deploys viejos, sin job asociado) y se ignoran al consultar los nombres exactos.

### Cascade delete en Firestore
Al eliminar un componente, se eliminan automáticamente sus releases asociadas para evitar datos huérfanos en la colección `releases`.

### Autocomplete de proyectos GitLab
Con ~180 proyectos en el grupo, un `<select>` no es usable. El autocomplete filtra por nombre y path completo, muestra los subgrupos como badges `[opsfle] › [oneintf]` para diferenciar proyectos con el mismo nombre en distintos subgrupos.

---

## Pendiente / Mejoras futuras

- [ ] Deploy en Vercel
- [ ] Limpiar releases huérfanas desde la UI (actualmente requiere ir a Firebase Console)
- [ ] Auto-detectar cuando prod pipeline cambia a success y sugerir registrar ticket
- [ ] Historial de releases por componente
- [ ] Filtros en la tabla (por estado de pipeline)
- [ ] Refresh automático de estados GitLab cada X minutos
