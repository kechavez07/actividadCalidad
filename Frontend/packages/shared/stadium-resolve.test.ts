import { describe, expect, test } from 'bun:test';
import { resolveStadiumForPartido } from './data/stadiums';

describe('resolveStadiumForPartido', () => {
  test('matches Guadalajara from SOAP lugar', () => {
    const stadium = resolveStadiumForPartido({
      estadio: 'Estadio Guadalajara',
      ciudad: 'Guadalajara',
    });
    expect(stadium?.id).toBe('gdl');
  });

  test('matches Houston from SOAP lugar string', () => {
    const stadium = resolveStadiumForPartido({
      estadio: 'Houston Stadium, Houston',
      ciudad: 'Houston',
    });
    expect(stadium?.id).toBe('hou');
  });

  test('matches MetLife via East Rutherford alias', () => {
    const stadium = resolveStadiumForPartido({
      estadio: 'MetLife Stadium',
      ciudad: 'East Rutherford',
    });
    expect(stadium?.id).toBe('nyc');
  });
});
