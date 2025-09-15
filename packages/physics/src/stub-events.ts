// Stub temporal para EventBus mientras resolvemos las dependencias
export interface EventBus {
  on: (event: string, handler: any) => void;
  emit: (event: string, payload: any) => void;
}