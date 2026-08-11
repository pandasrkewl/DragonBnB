const {
    getProperties,
    getPropertyById,
    getPropertyImages,
    getPropertyAmenities,
    getPropertyReviews
} = require("../scripts/queryDb");

const pool = require("../db");

test("gets a property by id", async () => {
    const property = await getPropertyById(1);

    expect(property).toBeDefined();
    expect(property.id).toBe(1);
});

test("returns no property for nonexistent id", async () => {
    const property = await getPropertyById(999999);

    expect(property).toBeFalsy();
});

test("gets images for a property", async () => {
    const images = await getPropertyImages(1);

    expect(Array.isArray(images)).toBe(true);
    expect(images.length).toBeGreaterThan(0);
});

test("gets amenities for a property", async () => {
    const amenities = await getPropertyAmenities(1);

    expect(Array.isArray(amenities)).toBe(true);
});

test("gets reviews for a property", async () => {
    const reviews = await getPropertyReviews(1);

    expect(Array.isArray(reviews)).toBe(true);
});

test("returns empty images for nonexistent property", async () => {
    const images = await getPropertyImages(999999);

    expect(images).toEqual([]);
});

test("returns empty amenities for nonexistent property", async () => {
    const amenities = await getPropertyAmenities(999999);

    expect(amenities).toEqual([]);
});

test("returns empty reviews for nonexistent property", async () => {
    const reviews = await getPropertyReviews(999999);

    expect(reviews).toEqual([]);
});

afterAll(async () => {
    await pool.end();
});