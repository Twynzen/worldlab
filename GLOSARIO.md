# GLOSARIO - WorldLab

## Términos Técnicos del Proyecto

### A

**Agent (Agente)**
- Entidad de IA que puede percibir el entorno y tomar acciones. En WorldLab, los agentes usan una interfaz Gym-like con observaciones RGB-D y acciones discretas.

**AI2-THOR**
- Entorno de simulación 3D fotorealista para IA embodied, desarrollado por Allen Institute. Proporciona casas interactivas para entrenar agentes.

### B

**Benchmark**
- Conjunto estandarizado de tareas para evaluar y comparar el rendimiento de diferentes sistemas o algoritmos.

### C

**Cannon-es**
- Motor de física JavaScript para simulaciones 3D en el navegador. Alternativa ligera para colisiones y triggers.

**CARLA**
- Simulador open-source para conducción autónoma con entornos urbanos realistas.

**Causality (Causalidad)**
- Relación causa-efecto entre eventos. En WorldLab, medimos el "causality lag" para evaluar la coherencia temporal.

**CI/CD**
- Continuous Integration/Continuous Deployment. Automatización de pruebas y despliegue del código.

**Consistency Score**
- Métrica que evalúa la coherencia visual del mundo al cambiar el punto de vista (girar cámara).

### D

**DeepMind**
- Laboratorio de IA de Google que desarrolló Genie-3, el modelo de mundos generativos que inspira este proyecto.

**Determinismo**
- Propiedad del sistema donde el mismo seed produce exactamente el mismo resultado. Crítico para reproducibilidad.

**Domain Randomization**
- Técnica de variar parámetros del entorno (luz, texturas, layouts) para mejorar la generalización de agentes.

**DSL (Domain-Specific Language)**
- Lenguaje específico de dominio. En WorldLab, usamos un DSL para definir eventos promptables.

### E

**ECS (Entity-Component-System)**
- Patrón arquitectónico para organizar la lógica del juego/simulación separando entidades, componentes y sistemas.

**Embodied AI**
- IA que interactúa con entornos físicos o simulados a través de un "cuerpo" virtual con sensores y actuadores.

**Events (Eventos)**
- Sucesos dinámicos en el mundo. En WorldLab son "promptables": se pueden invocar mediante descripciones de texto.

### F

**FPS (Frames Per Second)**
- Tasa de fotogramas por segundo. Métrica de rendimiento del renderizado.

### G

**Genie-3**
- Modelo de DeepMind que genera mundos 3D interactivos a partir de prompts. Opera a 720p@24fps con sesiones de minutos.

**Gym-like Interface**
- API estándar para agentes de RL: reset(), step(action), que retorna (obs, reward, done, info).

### H

**Habitat-Sim**
- Simulador 3D de alto rendimiento para IA embodied, especializado en navegación y SLAM.

### I

**IL (Imitation Learning)**
- Aprendizaje por imitación. Técnica donde el agente aprende observando demostraciones expertas.

**IMPALA**
- Algoritmo de RL distribuido escalable desarrollado por DeepMind.

**Isaac Sim**
- Simulador de robótica de NVIDIA basado en Omniverse para entrenamiento de robots.

### M

**MineRL**
- Entorno de Minecraft para investigación en RL con tareas complejas y datos humanos.

**ML-Agents**
- Toolkit de Unity para entrenar agentes usando RL en entornos Unity.

**Monorepo**
- Repositorio único que contiene múltiples proyectos/paquetes relacionados.

### O

**Observability (Observabilidad)**
- Capacidad de entender el estado interno del sistema mediante logs, métricas y trazas.

### P

**Plausibilidad**
- Coherencia lógica de los eventos. Ej: un elefante no aparece mágicamente, debe entrar por el borde de la escena.

**PPO (Proximal Policy Optimization)**
- Algoritmo de RL popular por su estabilidad y eficiencia.

**Procgen**
- Benchmark de OpenAI con entornos procedurales para evaluar generalización en RL.

**Promptable Events**
- Eventos que se pueden invocar mediante descripciones en lenguaje natural, validados por plausibilidad.

### R

**Rapier**
- Motor de física moderno escrito en Rust con bindings para JavaScript, alternativa a Cannon-es.

**Rare Events**
- Eventos poco frecuentes pero importantes para robustez. WorldLab los genera para entrenar agentes resilientes.

**Replay**
- Grabación determinista de una sesión que puede reproducirse exactamente dado el mismo seed.

**RGB-D**
- Observación que combina imagen a color (RGB) con información de profundidad (Depth).

**RL (Reinforcement Learning)**
- Aprendizaje por refuerzo. Paradigma donde agentes aprenden mediante prueba y error con recompensas.

**RNG (Random Number Generator)**
- Generador de números aleatorios. En WorldLab, seedeable para determinismo.

### S

**SAC (Soft Actor-Critic)**
- Algoritmo de RL que maximiza tanto recompensa como entropía para exploración.

**Seed**
- Valor inicial para RNG que garantiza reproducibilidad. Mismo seed = mismo mundo/eventos.

**SLAM**
- Simultaneous Localization and Mapping. Técnica para construir mapas mientras se navega.

**SLI (Service Level Indicator)**
- Métrica cuantitativa del rendimiento del servicio. En WorldLab: FPS, latencia, consistency score.

**SSIM (Structural Similarity Index)**
- Métrica para comparar similitud entre imágenes, usada en consistency score.

### T

**Three.js**
- Biblioteca JavaScript para gráficos 3D en el navegador usando WebGL/WebGPU.

**Timeline**
- Registro temporal de todos los eventos ocurridos en una sesión, permite replay y análisis.

### V

**Vite**
- Herramienta de build rápida para aplicaciones web modernas, usada con Three.js.

### W

**Wave Function Collapse**
- Algoritmo de generación procedural que crea patrones coherentes a partir de ejemplos.

**WebGL/WebGPU**
- APIs de gráficos para renderizado 3D acelerado en navegadores web.

**World Model**
- Modelo que puede simular/predecir la dinámica de un entorno. Genie-3 es un world model generativo.

## Acrónimos Comunes

- **API**: Application Programming Interface
- **CI**: Continuous Integration
- **CD**: Continuous Deployment
- **DSL**: Domain-Specific Language
- **ECS**: Entity-Component-System
- **FPS**: Frames Per Second
- **IL**: Imitation Learning
- **KPI**: Key Performance Indicator
- **RL**: Reinforcement Learning
- **RNG**: Random Number Generator
- **SLAM**: Simultaneous Localization and Mapping
- **SLI**: Service Level Indicator
- **SSIM**: Structural Similarity Index
- **TS**: TypeScript
- **UI**: User Interface

---
*Este glosario se actualiza continuamente según el proyecto evoluciona*