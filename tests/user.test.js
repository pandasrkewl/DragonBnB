const { getUser } = require('../scripts/queryDb');
const pool = require('../db');

test('get user by email', async () => {
    const user = await getUser(1);

    expect(user).not.toBeNull();
    expect(user.email).toBe('maxkchiu@gmail.com');
});

afterAll(async () => {
    await pool.end();
});
