import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHospitals } from './normalizeHospitals.js';

test('normalizes incomplete hospital payloads without crashing', () => {
  const raw = [
    {
      name: 'Example Hospital',
      location: 'Downtown',
      services: [{ name: 'MRI', price: 100, originalPrice: 150, category: 'Imaging' }],
      verified: true
    },
    {
      name: '',
      location: null,
      services: null,
      rating: '4.2'
    }
  ];

  const normalized = normalizeHospitals(raw);

  assert.equal(normalized.length, 2);
  assert.equal(normalized[0].name, 'Example Hospital');
  assert.equal(normalized[0].rating, 4.2);
  assert.deepEqual(normalized[0].services[0], {
    name: 'MRI',
    price: 100,
    originalPrice: 150,
    category: 'Imaging'
  });
  assert.equal(normalized[1].name, 'Unnamed Hospital');
  assert.equal(normalized[1].location, 'Unknown location');
  assert.equal(normalized[1].distance, 'N/A');
  assert.deepEqual(normalized[1].services, []);
});
