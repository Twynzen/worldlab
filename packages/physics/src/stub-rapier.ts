// Stub temporal para RAPIER mientras resolvemos las dependencias
export default {
  init: () => Promise.resolve(),
  World: class {
    constructor() {}
    step() {}
    createCharacterController() { return {}; }
    // Más métodos según sea necesario
  },
  Vector3: class {
    constructor(public x: number, public y: number, public z: number) {}
  }
} as any;