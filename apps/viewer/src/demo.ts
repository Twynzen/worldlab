import { IntegratedWorld } from './systems/IntegratedWorld';

/**
 * WorldLab Demo - Integrated Systems Showcase
 * Demonstrates EventBus + CommandSystem + Physics + Generators + Three.js
 */

let world: IntegratedWorld;
let isRunning = false;

async function initDemo(): Promise<void> {
  console.log('🚀 Initializing WorldLab Demo...');

  // Get container
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Container #app not found');
  }

  // Initialize integrated world
  world = new IntegratedWorld(container);

  // Create UI
  createUI(container);

  // Start render loop
  startRenderLoop();

  // Add some demo commands to console
  addDemoCommands();

  console.log('✅ WorldLab Demo ready!');
  console.log('💡 Try commands like: world.cmd("spawn tree near player")');
}

function createUI(container: HTMLElement): void {
  const ui = document.createElement('div');
  ui.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
  `;

  const title = document.createElement('div');
  title.textContent = '🌍 WorldLab Demo';
  title.style.cssText = 'font-size: 16px; margin-bottom: 10px; color: #4CAF50;';
  ui.appendChild(title);

  const metrics = document.createElement('div');
  metrics.id = 'metrics';
  ui.appendChild(metrics);

  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <div style="margin-top: 10px; color: #FFA726;">Commands:</div>
    <div>world.cmd("spawn tree near player")</div>
    <div>world.cmd("spawn rock at (10, 0, 5)")</div>
    <div>world.metrics() - Show metrics</div>
  `;
  ui.appendChild(instructions);

  container.appendChild(ui);

  // Update metrics periodically
  setInterval(() => {
    const metricsEl = document.getElementById('metrics');
    if (metricsEl && world) {
      const data = world.getMetrics();
      metricsEl.innerHTML = `
        FPS: ${data.fps}<br>
        Entities: ${data.entities}<br>
        Chunks: ${data.chunks}
      `;
    }
  }, 1000);

  // Command input
  const commandInput = document.createElement('div');
  commandInput.style.cssText = `
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    background: rgba(0,0,0,0.9);
    padding: 10px;
    border-radius: 5px;
    pointer-events: auto;
  `;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter command (e.g., "spawn tree near player")';
  input.style.cssText = `
    width: 100%;
    padding: 5px;
    background: rgba(255,255,255,0.1);
    border: 1px solid #666;
    border-radius: 3px;
    color: white;
    font-family: monospace;
  `;

  input.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      try {
        await world.executeCommand(input.value.trim());
        input.value = '';
      } catch (error) {
        console.error('Command error:', error);
      }
    }
  });

  commandInput.appendChild(input);
  container.appendChild(commandInput);
}

function startRenderLoop(): void {
  isRunning = true;
  let lastTime = 0;

  function render(currentTime: number): void {
    if (!isRunning) return;

    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update world
    world.update(deltaTime);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function addDemoCommands(): void {
  // Add global commands for easy testing
  (window as any).world = {
    cmd: async (command: string) => {
      console.log(`🎮 Executing: ${command}`);
      await world.executeCommand(command);
    },

    metrics: () => {
      const data = world.getMetrics();
      console.table(data);
      return data;
    },

    spawn: async (entity: string, x = 0, z = 0) => {
      await world.executeCommand(`spawn ${entity} at (${x}, 0, ${z})`);
    },

    demo: async () => {
      console.log('🎬 Running demo sequence...');

      await world.executeCommand('spawn tree near player');
      await new Promise(resolve => setTimeout(resolve, 500));

      await world.executeCommand('spawn rock at (10, 0, 5)');
      await new Promise(resolve => setTimeout(resolve, 500));

      await world.executeCommand('spawn cactus at (-5, 0, 8)');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✨ Demo complete!');
    }
  };

  console.log('📝 Global commands available:');
  console.log('  world.cmd("command") - Execute any command');
  console.log('  world.spawn("tree", 10, 5) - Quick spawn');
  console.log('  world.metrics() - Show performance metrics');
  console.log('  world.demo() - Run demo sequence');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDemo);
} else {
  initDemo();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  isRunning = false;
  if (world) {
    world.destroy();
  }
});

export { initDemo };