import { BasicDemo } from './BasicDemo';

console.log('🌍 WorldLab Basic Demo Starting...');

let demo: BasicDemo;

async function initDemo() {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Container #app not found');
  }

  demo = new BasicDemo(container);

  // Render loop
  function animate() {
    demo.update();
    requestAnimationFrame(animate);
  }
  animate();

  console.log('✅ WorldLab Basic Demo ready!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDemo);
} else {
  initDemo();
}

// Cleanup
window.addEventListener('beforeunload', () => {
  if (demo) {
    demo.destroy();
  }
});