const test = require('node:test');
const assert = require('node:assert');
const { checkRoomAvailability } = require('../services/availabilityService');

test('Availability: rejects invalid dates', async () => {
  await assert.rejects(
    async () => {
      await checkRoomAvailability('507f1f77bcf86cd799439011', 'invalid-date', '2026-12-01');
    },
    {
      message: 'Invalid check-in or check-out date'
    }
  );
});

test('Availability: rejects check-in date in the past', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await assert.rejects(
    async () => {
      await checkRoomAvailability(
        '507f1f77bcf86cd799439011',
        yesterday.toISOString(),
        tomorrow.toISOString()
      );
    },
    {
      message: 'Check-in date cannot be in the past'
    }
  );
});

test('Availability: rejects check-out date before or equal to check-in date', async () => {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 5);
  const checkOut = new Date(checkIn);

  await assert.rejects(
    async () => {
      await checkRoomAvailability(
        '507f1f77bcf86cd799439011',
        checkIn.toISOString(),
        checkOut.toISOString()
      );
    },
    {
      message: 'Check-out date must be strictly after check-in date'
    }
  );
});
