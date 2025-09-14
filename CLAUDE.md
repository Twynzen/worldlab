# CLAUDE.md - Documentación del Proyecto WorldLab

## 🎯 Visión del Proyecto
WorldLab es un proyecto open-source que demuestra capacidades de mundos interactivos 3D con eventos "promptables" y agentes que aprenden con diversidad. Diseñado para mostrar valor hacia DeepMind/Google y su Genie-3.

## 👤 Información del Equipo
- **Desarrollador Principal**: Daniel (Humano)
- **Asistente de Desarrollo**: Claude (IA)
- **Inicio del Proyecto**: 2025-08-21

## 🚀 Objetivos Principales
1. **Mundos Interactivos**: Entornos 3D navegables con física y colisiones
2. **Eventos Promptables**: Sistema de eventos dinámicos con validación de plausibilidad
3. **Agentes con Aprendizaje**: API Gym-like para entrenar agentes con RL/IL
4. **Métricas y Reproducibilidad**: Sistema robusto de evaluación y benchmarking

## 📋 Estado Actual del Proyecto

### ✅ Completado
- ✅ Documentación inicial del proyecto (CLAUDE.md, GLOSARIO.md)
- ✅ Configuración de la estructura base del monorepo
- ✅ Implementación del viewer con Three.js básico
- ✅ Sistema de generación procedural con seeds (RNG determinista)
- ✅ Sistema de métricas básicas (FPS, entidades, posición)
- ✅ README principal con visión del proyecto
- ✅ Entity-Component-System (ECS) arquitectura
- ✅ Sistema de Timeline para record/replay
- ✅ Control WASD + mouse para navegación
- ✅ Terreno procedural con variación de altura
- ✅ Spawning de objetos 3D (árboles, rocas)

### 🔄 En Progreso
- ⏳ Completando paquetes restantes (events, physics, etc.)

### 📅 Pendiente
- 📋 Eventos promptables v0 (DSL y validación)
- 📋 CI/CD con GitHub Actions
- 📋 Sistema de física avanzado (Cannon-es integration)
- 📋 Dashboard para métricas
- 📋 Sistema de agentes (Gym-like interface)

## 🏗️ Arquitectura del Sistema

### Estructura del Monorepo
```
worldlab/
├── apps/
│   ├── viewer/           # Three.js + TS + Vite: visualización y edición
│   └── dashboard/        # Metrics UI: métricas y replays
├── packages/
│   ├── core/            # Estado canónico, ECS, RNG/seed
│   ├── events/          # Sistema de eventos promptables
│   ├── agents/          # Interfaz Gym-like para agentes
│   ├── evals/           # Métricas de evaluación
│   ├── generators/      # Generación procedural
│   └── physics/         # Sistema de física (Cannon-es/Rapier)
├── python/
│   ├── runners/         # Entrenamiento RL/IL
│   └── baselines/       # Algoritmos de referencia
├── benchmarks/
│   └── procgen3d/       # Tareas tipo Procgen en 3D
└── docs/
    ├── paper/           # Documentación técnica estilo arXiv
    └── tutorials/       # Guías de uso
```

### Stack Tecnológico
- **Frontend**: Three.js, TypeScript, Vite
- **Física**: Cannon-es o Rapier.js
- **Backend Python**: PPO/IMPALA/SAC con CleanRL
- **Entornos Serios**: AI2-THOR o Habitat-Sim (opcional)
- **CI/CD**: GitHub Actions

## 📝 Proceso de Desarrollo

### Reglas Fundamentales
1. **Claridad Total**: Actualizar siempre CLAUDE.md con cada cambio significativo
2. **Pruebas con Daniel**: Socializar todas las pruebas con el humano antes de ejecutar
3. **Pedir Ayuda**: Si algo bloquea el desarrollo, pedir ayuda a Daniel inmediatamente

### Flujo de Trabajo
1. Planificar la tarea en el TodoList
2. Explicar a Daniel qué se va a hacer
3. Implementar con código claro y comentado
4. Actualizar documentación
5. Coordinar pruebas con Daniel
6. Marcar tarea como completada

## 🧪 Pruebas y Validación

### Procedimiento de Pruebas
1. **Pre-prueba**: Explicar a Daniel qué se va a probar
2. **Configuración**: Detallar comandos exactos a ejecutar
3. **Ejecución**: Daniel ejecuta las pruebas
4. **Retroalimentación**: Ajustar según resultados
5. **Documentación**: Registrar resultados y aprendizajes

### Comandos de Prueba
```bash
# Instalar dependencias (cuando esté configurado)
npm install

# Ejecutar viewer de desarrollo
npm run dev

# Ejecutar tests
npm test

# Build de producción
npm run build
```

## 🎯 Hitos de la Semana 1-2

### Objetivos Inmediatos
1. ✅ Crear documentación base (CLAUDE.md, GLOSARIO.md)
2. ✅ Configurar monorepo con estructura de carpetas
3. ✅ Implementar viewer Three.js básico con control WASD
4. ✅ Sistema de generación procedural con seeds
5. ⏳ Colisiones básicas y física (Cannon-es integration)
6. ✅ Sistema de record/replay determinista
7. ✅ Métricas FPS y pasos/seg

## 🔧 Configuración del Entorno

### Requisitos
- Node.js 18+
- npm o pnpm
- Python 3.9+ (para componentes de IA)
- Git

### Instalación (próximamente)
```bash
git clone https://github.com/[tu-usuario]/worldlab
cd worldlab
npm install
npm run dev
```

## 📊 Métricas del Proyecto

### KPIs Técnicos
- **FPS Target**: 60fps en hardware medio
- **Latencia Eventos**: <100ms respuesta a prompts
- **Determinismo**: 100% reproducibilidad con mismo seed
- **Cobertura Tests**: >80%

### Métricas de Evaluación
- **Consistency Score**: Coherencia visual al rotar cámara
- **Causality Lag**: Retardo en efectos causales
- **Rare-Event Fail Rate**: Tasa de fallo en eventos raros
- **Diversity Index**: Variedad en generación procedural

## 🚨 Problemas Conocidos y Soluciones

### Registro de Problemas
- (Ninguno hasta ahora)

## 📅 Historial de Cambios

### 2025-08-21 - Sesión 1
- ✅ Inicio del proyecto
- ✅ Creación de documentación base (CLAUDE.md, GLOSARIO.md)
- ✅ Definición de arquitectura y estructura del monorepo
- ✅ Configuración completa del monorepo con workspaces
- ✅ Implementación del viewer Three.js con:
  - Escena 3D básica con iluminación
  - Control WASD + mouse look
  - Generación de terreno procedural
  - Sistema RNG determinista con seeds
  - Spawning de entidades (árboles, rocas)
  - HUD con métricas (FPS, posición, entidades)
- ✅ Sistema core con ECS, Timeline, RNG
- ✅ README completo con documentación del proyecto

### Estado de Implementación
**Archivos principales creados:**
- `/package.json` - Configuración del monorepo
- `/apps/viewer/` - Aplicación Three.js completa
- `/packages/core/` - Sistema ECS y utilidades base
- `/README.md` - Documentación del proyecto
- `/tsconfig.json` - Configuración TypeScript

**Funcionalidades operativas:**
- Mundo 3D navegable con WASD + mouse
- Generación procedural determinista
- Sistema de métricas en tiempo real
- Arquitectura ECS preparada para extensión

## 🔗 Enlaces Importantes
- **Repositorio**: (por configurar en GitHub)
- **Demo**: (próximamente en GitHub Pages)
- **Documentación Técnica**: /docs/paper/
- **Referencias**:
  - [DeepMind Genie-3](https://deepmind.google/discover/blog/genie-3-a-new-frontier-for-world-models/)
  - [AI2-THOR](https://ai2thor.allenai.org/)
  - [Habitat-Sim](https://aihabitat.org/)

## 📌 Notas para el Próximo Desarrollador/Claude

### Contexto Crítico
- Este proyecto busca demostrar capacidades relevantes para Genie-3 de DeepMind
- El enfoque es en eventos promptables y reproducibilidad
- La interacción con Daniel es fundamental - siempre explicar y coordinar pruebas
- Mantener este documento actualizado es CRÍTICO para la continuidad

### Próximos Pasos Inmediatos
1. Completar la configuración del monorepo
2. Implementar el viewer básico con Three.js
3. Añadir control de cámara y movimiento WASD
4. Comenzar con generación procedural simple

### Estado del TodoList
Ver sección "Estado Actual del Proyecto" arriba para tareas pendientes

---
*Última actualización: 2025-08-21 - Sesión 1 completada - Base del proyecto operativa*

## 🧪 Próximas Pruebas a Realizar con Daniel

### Prueba 1: Instalación y Primer Arranque
**Objetivo**: Verificar que el monorepo se instala correctamente y el viewer arranca
**Comandos a ejecutar:**
```bash
cd /Users/dcastiblanco/Desktop/GPTsProyects/worldlab
npm install
npm run dev
```
**Resultado esperado**: 
- Instalación sin errores
- Servidor de desarrollo arranca en puerto 3000
- Navegador abre automáticamente mostrando mundo 3D

### Prueba 2: Navegación y Controles
**Objetivo**: Verificar que los controles funcionan correctamente
**Acciones a realizar:**
1. Hacer clic en el mundo para activar pointer lock
2. Usar WASD para moverse
3. Usar mouse para mirar alrededor
4. Presionar Shift para correr
5. Presionar Space para saltar
6. Verificar que el HUD muestra métricas actualizándose

### Prueba 3: Generación Determinista
**Objetivo**: Verificar que mismo seed produce mismo mundo
**Acciones a realizar:**
1. Anotar el seed mostrado en el HUD
2. Refrescar la página varias veces
3. Verificar que mundos son diferentes (seeds diferentes)
4. Modificar código para usar seed fijo y verificar consistencia

### Indicadores de Éxito
- ✅ FPS > 30 (preferiblemente 60)
- ✅ Movimiento fluido sin lag perceptible
- ✅ Árboles y rocas se generan en posiciones consistentes
- ✅ HUD muestra datos correctos y actualizados
- ✅ Terreno tiene variación de altura
- ✅ Iluminación y sombras funcionan

### Plan Post-Pruebas
Si las pruebas son exitosas, continuaremos con:
1. Implementar eventos promptables (DSL básica)
2. Integrar sistema de física (Cannon-es)
3. Crear interfaz para inyectar eventos
4. Comenzar con benchmarks simples