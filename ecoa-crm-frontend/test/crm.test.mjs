import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDropTarget, isAfterTarget } from '../src/lib/drop-target.ts';
import { normalizeDealDates } from '../src/lib/deal-dates.ts';
import { getApiErrorMessage } from '../src/lib/api-error.ts';

const deals = [
  { id: 1, stageId: 1, position: 0 },
  { id: 2, stageId: 1, position: 1 },
  { id: 3, stageId: 1, position: 2 },
  { id: 4, stageId: 2, position: 0 },
];
test('inserção antes e depois de um card usa o índice final sem o próprio card', () => {
  assert.deepEqual(getDropTarget('deal-2', deals, 1, false), { stageId: 1, index: 0 });
  assert.deepEqual(getDropTarget('deal-2', deals, 1, true), { stageId: 1, index: 1 });
  assert.deepEqual(getDropTarget('deal-1', deals, 3, false), { stageId: 1, index: 0 });
});
test('destinos em outra coluna, no fim e em coluna vazia', () => {
  assert.deepEqual(getDropTarget('deal-4', deals, 1, true), { stageId: 2, index: 1 });
  assert.deepEqual(getDropTarget('stage-1', deals, 1), { stageId: 1, index: 2 });
  assert.deepEqual(getDropTarget('stage-3', deals, 1), { stageId: 3, index: 0 });
  assert.equal(getDropTarget('deal-999', deals, 1), null);
});
test('arraste por teclado insere depois ao descer e antes ao subir', () => {
  const event = (active, over) => ({ activatorEvent: { type: 'keydown' }, active: { id: active }, over: { id: over } });
  assert.equal(isAfterTarget(event('deal-1', 'deal-2'), deals), true);
  assert.equal(isAfterTarget(event('deal-3', 'deal-2'), deals), false);
});
test('arraste por ponteiro distingue as duas metades do destino', () => {
  const event = (top) => ({ activatorEvent: { type: 'pointerdown' }, active: { rect: { current: { translated: { top, height: 100 } } } }, over: { rect: { top: 100, height: 100 } } });
  assert.equal(isAfterTarget(event(90), deals), false);
  assert.equal(isAfterTarget(event(110), deals), true);
});
test('datas mantêm o dia, aceitam DATE e preservam fechamento nulo', () => {
  const original = { expectedCloseDate: '2026-11-30T00:00:00.000Z', closedAt: null };
  const normalized = normalizeDealDates(original);
  assert.equal(normalized.expectedCloseDate, '2026-11-30');
  assert.equal(normalized.closedAt, null);
  assert.equal(original.expectedCloseDate, '2026-11-30T00:00:00.000Z');
  assert.equal(normalizeDealDates({ ...original, closedAt: '2026-10-29T00:00:00Z' }).closedAt, '2026-10-29');
});
test('mensagens da API são mostradas em vez do status genérico do Axios', () => {
  const error = (message) => ({ isAxiosError: true, message: 'Request failed with status code 400', response: { data: { message } } });
  assert.equal(getApiErrorMessage(error('Informe o motivo da perda'), 'Falha'), 'Informe o motivo da perda');
  assert.equal(getApiErrorMessage(error(['Título obrigatório', 'Valor inválido']), 'Falha'), 'Título obrigatório; Valor inválido');
  assert.equal(getApiErrorMessage(error({}), 'Falha'), 'Falha');
  assert.match(getApiErrorMessage({ isAxiosError: true }, 'Falha'), /conectar/);
});
