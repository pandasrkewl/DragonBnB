const { getProperties } = require("../scripts/queryDb");
const pool = require("../db");

test("get properties from the city", async () => {
    const properties = await getProperties({city: "Philadelphia"});

    expect(properties.length).toBeGreaterThan(0);
    expect(properties[0].city).toBe("Philadelphia")
});

test("properties limit field is respected", async() => {
    const properties = await getProperties({
        city: "Philadelphia",
        limit: 2
    })

    expect(properties.length).toBeLessThanOrEqual(2);
});

test("returns an empty array when no properties match", async() => {
    const properties = await getProperties({
        city: "FakeCity"
    })

    expect(properties).toEqual([]);
});

afterAll(async () => {
    await pool.end();
});