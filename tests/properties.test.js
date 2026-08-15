const { getProperties, getPropertyCities } = require('../scripts/queryDb');
const pool = require('../db');

test('get properties from the location', async () => {
    const properties = await getProperties({ location: 'Philadelphia' });

    expect(properties.length).toBeGreaterThan(0);
    expect(properties[0].city).toBe('Philadelphia');
});

test('properties limit field is respected', async () => {
    const properties = await getProperties({
        location: 'Philadelphia',
        limit: 2,
    });

    expect(properties.length).toBeLessThanOrEqual(2);
});

test('guest count filter only returns properties that can host the party', async () => {
    const properties = await getProperties({
        location: 'Philadelphia',
        guests: 4,
    });

    expect(properties.length).toBeGreaterThan(0);
    expect(properties.every((property) => property.max_guests >= 4)).toBe(true);
});

test('price_low sort orders properties by ascending price', async () => {
    const properties = await getProperties({
        location: 'Philadelphia',
        sortBy: 'price_low',
    });

    expect(properties.length).toBeGreaterThan(0);

    for (let index = 1; index < properties.length; index += 1) {
        expect(
            Number(properties[index].price_per_night)
        ).toBeGreaterThanOrEqual(Number(properties[index - 1].price_per_night));
    }
});

test('getPropertyCities returns matching cities from the database', async () => {
    const cities = await getPropertyCities({ query: 'Phil' });

    expect(cities).toEqual(['Philadelphia']);
});

test('returns an empty array when no properties match', async () => {
    const properties = await getProperties({
        location: 'FakeCity',
    });

    expect(properties).toEqual([]);
});

afterAll(async () => {
    await pool.end();
});
