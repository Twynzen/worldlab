export class StatsManager {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private fpsElement: HTMLElement | null;
  
  constructor() {
    this.fpsElement = document.getElementById('fps');
    this.updateFPS();
  }
  
  update(): void {
    this.frameCount++;
  }
  
  private updateFPS(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      if (this.fpsElement) {
        this.fpsElement.textContent = this.fps.toString();
        
        // Color code FPS
        if (this.fps >= 55) {
          this.fpsElement.style.color = '#00ff00';
        } else if (this.fps >= 30) {
          this.fpsElement.style.color = '#ffff00';
        } else {
          this.fpsElement.style.color = '#ff0000';
        }
      }
    }
    
    requestAnimationFrame(this.updateFPS.bind(this));
  }
}