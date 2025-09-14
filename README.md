# 🌍 WorldLab

> **Interactive 3D worlds with promptable events and learning agents**

WorldLab is an open-source platform that demonstrates next-generation capabilities in interactive 3D world generation, featuring promptable events, reproducible simulations, and agent training. Designed to showcase technologies relevant to world models like DeepMind's Genie-3.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://github.com/[username]/worldlab/workflows/CI/badge.svg)](https://github.com/[username]/worldlab/actions)
[![Demo](https://img.shields.io/badge/Demo-Live-blue.svg)](https://[username].github.io/worldlab)

## ✨ Features

### 🎮 Interactive 3D Worlds
- **Real-time navigation** with WASD controls and mouse look
- **Procedural generation** with deterministic seeds for reproducibility
- **Physics simulation** with collisions and environmental interactions
- **Dynamic lighting** and realistic shadows

### 🎯 Promptable Events
- **Natural language event triggers**: Describe events in plain text
- **Plausibility validation**: Events follow logical world rules
- **Timeline recording**: Complete event history for analysis and replay
- **Event types**: Weather changes, object spawning, NPC interactions, and more

### 🤖 Agent Learning
- **Gym-like interface** for reinforcement learning agents
- **Multiple observation modes**: RGB, depth, semantic segmentation
- **Baseline implementations**: PPO, IMPALA, SAC algorithms
- **Integration with serious simulators**: AI2-THOR, Habitat-Sim support

### 📊 Metrics & Reproducibility
- **Deterministic replays** from recorded seeds and events
- **Performance metrics**: FPS, latency, consistency scoring
- **Robustness evaluation**: Rare event handling, stress testing
- **Automated benchmarking** with Procgen3D-style tasks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Installation
```bash
git clone https://github.com/[username]/worldlab.git
cd worldlab
npm install
```

### Run the Viewer
```bash
npm run dev
```

Open your browser to `http://localhost:3000` and start exploring!

## 🏗️ Architecture

WorldLab is built as a monorepo with specialized packages:

```
worldlab/
├── apps/
│   ├── viewer/           # Three.js web viewer
│   └── dashboard/        # Metrics and analysis UI
├── packages/
│   ├── core/            # ECS, RNG, Timeline
│   ├── events/          # Promptable events system
│   ├── agents/          # RL agent interfaces
│   ├── evals/           # Benchmarking and metrics
│   ├── generators/      # Procedural world generation
│   └── physics/         # Physics simulation
├── python/
│   ├── runners/         # Training scripts
│   └── baselines/       # Reference algorithms
└── benchmarks/
    └── procgen3d/       # 3D generalization tasks
```

## 🎮 Controls

- **WASD** - Move around
- **Mouse** - Look around (click to enable pointer lock)
- **Space** - Jump
- **Shift** - Run
- **R** - Replay recorded session
- **E** - Open event prompt menu

## 📚 Documentation

- **[Getting Started](docs/tutorials/getting-started.md)** - Your first world
- **[Promptable Events](docs/tutorials/events.md)** - Creating custom events
- **[Agent Training](docs/tutorials/agents.md)** - RL with WorldLab
- **[API Reference](docs/api/)** - Complete API documentation
- **[Architecture](docs/architecture.md)** - System design deep-dive

## 🧪 Examples

### Spawn a Tree with Natural Language
```typescript
// In the viewer console or API
await worldlab.events.prompt("A large oak tree appears near the pond");
```

### Train an Agent
```python
# Python training script
import worldlab_agents as wl

env = wl.make_env("WorldLab-Navigate-v0", seed=42)
agent = wl.PPO(env.observation_space, env.action_space)

for episode in range(1000):
    obs = env.reset()
    done = False
    while not done:
        action = agent.act(obs)
        obs, reward, done, info = env.step(action)
    agent.learn()
```

### Record and Replay
```typescript
// Start recording
worldlab.timeline.startRecording();

// Perform actions, trigger events...
await worldlab.events.prompt("A thunderstorm begins");

// Export for analysis
const timeline = worldlab.timeline.export();

// Later: replay deterministically
worldlab.timeline.import(timeline);
worldlab.timeline.startReplay();
```

## 🏆 Benchmarks

WorldLab includes standardized tasks for evaluating world models and agents:

- **Navigation**: Find objects in procedural environments
- **Manipulation**: Interact with physics objects
- **Social**: Multi-agent coordination tasks
- **Robustness**: Rare events and distribution shifts

### Running Benchmarks
```bash
npm run benchmark:procgen3d
python python/runners/evaluate_baselines.py
```

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
npm install
npm run dev              # Start viewer in dev mode
npm run test             # Run tests
npm run lint             # Check code style
npm run build            # Build all packages
```

### Key Development Principles
1. **Deterministic**: Same seed = same world
2. **Modular**: Clean separation of concerns
3. **Observable**: Rich logging and metrics
4. **Testable**: Comprehensive test coverage

## 🌟 Roadmap

### Weeks 1-2: Foundation ✅
- [x] Monorepo structure and build system
- [x] Three.js viewer with basic controls
- [x] Seeded procedural generation
- [x] Entity-Component-System architecture

### Weeks 3-4: Events & Metrics
- [ ] Promptable events DSL and validation
- [ ] Timeline recording and replay system
- [ ] Performance and consistency metrics
- [ ] Event plausibility scoring

### Weeks 5-6: Agents
- [ ] Gym-like agent interface
- [ ] Baseline RL algorithms (PPO, SAC)
- [ ] Integration with AI2-THOR/Habitat
- [ ] Multi-agent support

### Weeks 7-8: Benchmarks
- [ ] Procgen3D task suite
- [ ] Automated evaluation pipeline
- [ ] Robustness testing framework
- [ ] Performance optimization

### Weeks 9-10: Polish & Launch
- [ ] Dashboard with metrics visualization
- [ ] GitHub Pages deployment
- [ ] Technical paper/blog post
- [ ] Community onboarding

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Related Projects

- **[Genie-3](https://deepmind.google/discover/blog/genie-3-a-new-frontier-for-world-models/)** - DeepMind's 3D world model
- **[AI2-THOR](https://ai2thor.allenai.org/)** - Interactive 3D environments for AI
- **[Habitat-Sim](https://aihabitat.org/)** - High-performance 3D simulator
- **[Procgen](https://openai.com/index/procgen-benchmark/)** - Procedural generation benchmark
- **[Unity ML-Agents](https://github.com/Unity-Technologies/ml-agents)** - RL training toolkit

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/[username]/worldlab/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[username]/worldlab/discussions)
- **Email**: [your-email@domain.com](mailto:your-email@domain.com)

---

<div align="center">
  <strong>Made with ❤️ for the future of interactive AI</strong>
</div>