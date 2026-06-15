import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TurnoLlamadoPayload, WS_EVENTS } from '@turno-ya/types';

@WebSocketGateway({ cors: true, namespace: '/turnos' })
export class TurnosGateway {
  @WebSocketServer()
  server: Server;

  emitTurnoLlamado(payload: TurnoLlamadoPayload) {
    this.server?.emit(WS_EVENTS.TURNO_LLAMADO, payload);
  }

  emitTurnoActualizado(turnoId: number) {
    this.server?.emit(WS_EVENTS.TURNO_ACTUALIZADO, { turnoId });
  }

  emitCajaActualizada() {
    this.server?.emit(WS_EVENTS.CAJA_ACTUALIZADA);
  }

  emitConfigActualizada() {
    this.server?.emit(WS_EVENTS.CONFIG_ACTUALIZADA);
  }
}
