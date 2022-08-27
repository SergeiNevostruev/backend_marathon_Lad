const a = +(0o101111).toString(10);
const b = 0xffff;
const c = +(50).toString(2);
console.log(a, b, c);
Buffer.from;
console.log(Buffer.alloc(2, a), Buffer.alloc(2, b), Buffer.alloc(2, c));
