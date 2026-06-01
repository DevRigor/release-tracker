# Release Tracker - Plan de Desarrollo

## 📋 Descripción del Proyecto

App para rastrear el ciclo de vida de componentes/módulos a través de los ambientes (dev → master/intg → prod), indicando si están homologados, en qué fase están, y guardando referencia al ticket de Jira de la última release a producción.

---

## 🔄 Flujo de Desarrollo por Componente

```
1. Crear rama desde master (ej: feat/button-v2)
   ├─ Asociar ticket: AIRCOR-60
   ↓
2. Desarrollar y mergear a dev
   ├─ Estado: "In Dev"
   ↓
3. Probar en dev ✅
   ↓
4. Mergear a master (intg) → Se despliega automáticamente
   ├─ Estado: "In Master" o "In Intg"
   ├─ Esperar check/validación de QA
   ↓
5. QA valida en intg ✅
   ├─ Estado: "Ready for Prod"
   ↓
6. Pasar a PROD → Ejecutar pipeline especial
   ├─ Se solicita ticket: AIRCOR-60
   ├─ Se guarda como "Último Ticket Prod"
   ├─ Estado: "In Prod"
```

---

## 📊 Vista Principal: Tabla de Componentes

**Columnas:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| **Componente** | Texto | Nombre del componente/módulo |
| **Rama** | Texto | Rama Git asociada (feat/button-v2) |
| **Dev Homologado** | Estado | ✅ Homologado / ⏳ In Progress / ❌ No |
| **Master Homologado** | Estado | ✅ Homologado / ⏳ Waiting QA / ❌ No |
| **En Prod** | Estado | ✅ Sí / ❌ No |
| **Último Ticket Prod** | Texto | AIRCOR-60 (solo si está en prod) |
| **Comentarios** | Texto | Por qué no avanza (blocker, esperar approval, etc.) |
| **Acciones** | Botones | Editar, Cambiar estado, Eliminar |

**Ejemplo:**

| Componente | Rama | Dev | Master | Prod | Último Ticket | Comentarios |
|---|---|---|---|---|---|---|
| Button Component | feat/button-v2 | ✅ | ✅ | ✅ | AIRCOR-60 | — |
| Modal Redesign | feat/modal-new | ✅ | ⏳ | ❌ | AIRCOR-55 | Esperando QA check |
| Card Layout | feat/card-layout | ⏳ | ❌ | ✅ | AIRCOR-50 | En desarrollo |

---

## ✅ Funcionalidades Principales

### **1. Dashboard / Lista de Componentes**
- [ ] Vista tabla/tarjetas de todos los componentes
- [ ] Filtros: por estado, por ambiente
- [ ] Búsqueda: por nombre de componente o rama
- [ ] Ordenar por: estado, nombre, fecha última actualización

### **2. Crear/Editar Componente**
- [ ] Formulario para añadir nuevo componente:
  - Nombre (único, validar duplicados)
  - Rama Git
  - Ticket asociado (AIRCOR-60)
  - Estado inicial: "In Dev"
- [ ] Si componente ya existe → mostrar existente, no permitir duplicado
- [ ] Editar componente: cambiar rama, ticket, estado, comentarios

### **3. Cambiar Estado**
- [ ] Botones rápidos para cambiar estado:
  - Dev Homologado ✅
  - Master Homologado ✅
  - En Prod ✅
- [ ] Al marcar "En Prod" → solicitar ticket (AIRCOR-60) y guardar

### **4. Comentarios/Blockers**
- [ ] Campo de comentarios por componente
- [ ] Explicar por qué no avanza (ej: "Faltan tests", "Esperando approval", "Bug crítico en QA")

### **5. Histórico de Releases**
- [ ] Listado de últimas releases a prod con:
  - Componente
  - Ticket
  - Fecha
  - Usuario que hizo el push

### **6. Validaciones**
- [ ] No permitir nombres de componentes duplicados
- [ ] Validar formato de ticket (AIRCOR-XXXX)
- [ ] No permitir pasar a prod sin ticket

---

## 🏗️ Arquitectura Propuesta

### **Frontend**
- Next.js 14+ (TypeScript)
- React 18+
- Componentes reutilizables (Button, Modal, Table, etc.)
- Página principal: Dashboard de componentes
- Página secundaria: Histórico de releases
- Deploy en Vercel

### **Backend**
- Next.js API Routes (serverless)
- Integración directa con Firebase

### **Base de Datos**
- Firebase Firestore:
  - Collection `components`:
    - id, name, branch, ticket, devStatus, masterStatus, prodStatus, lastTicketProd, comments, createdAt, updatedAt
  - Collection `releases` (histórico):
    - id, componentId, ticket, deployedAt, deployedBy
  - Collection `users` (opcional, para tracking de quién hizo cada cambio)

### **Validaciones en Firestore**
- Reglas de seguridad:
  - name único (validar en cliente + función Cloud)
  - branch único
  - formato de ticket (AIRCOR-XXXX)
  - Solo usuarios autenticados pueden escribir

---

## 🚀 Fases de Desarrollo

### **Fase 1: MVP** (Semana 1)
- [ ] Modelo de datos: components, releases
- [ ] API básica: CRUD de componentes
- [ ] Dashboard simple: tabla de componentes
- [ ] Cambiar estado manualmente
- [ ] Validar duplicados

### **Fase 2: Refinement** (Semana 2)
- [ ] Solicitar ticket al pasar a prod
- [ ] Guardar histórico de releases
- [ ] Comentarios/blockers
- [ ] Filtros y búsqueda

### **Fase 3: Polish** (Semana 3)
- [ ] UI mejorada
- [ ] Validaciones completas
- [ ] Tests
- [ ] Deploy

---

## 🛠️ Stack Tecnológico

- **Frontend/Backend**: Next.js 14+ (App Router) + TypeScript
- **BD**: Firebase Firestore
- **Auth**: Firebase Authentication (opcional)
- **Estilos**: Tailwind CSS
- **Validación**: Zod
- **Testing**: Jest + React Testing Library
- **Deploy**: Vercel (Frontend + API Routes)
- **Package Manager**: pnpm 11+

---

## 📝 Notas

- La app no tiene integración real con Git (no consultará API de GitHub/GitLab), los estados se actualizan manualmente
- Los tickets se ingresan manualmente, sin integración a Jira API
- Enfoque: simplicidad y usabilidad por encima de automatización

---

**Estado**: 📋 En planeación  
**Fecha creación**: 2026-06-01  
**Próximo paso**: Validar stack tecnológico y crear estructura de carpetas
