const sum = (a, b) => {
  return a + b;
}



describe('Test jest', () => {
  test('1+2 = 3', () => {
    expect(sum(1, 2)).toBe(3);
  })
})