const xor2 = (a: number[], b: number[]) => {
  const setA = new Set(a);
  const setB = new Set(b);
  return [
    ...[...setA].filter((v) => !setB.has(v)),
    ...[...setB].filter((v) => !setA.has(v)),
  ];
};
const union = (...arrays: number[][]) => [...new Set(arrays.flat())];

export { xor2, union };
