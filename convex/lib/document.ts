export function createDoc<T>(doc: T) {
  const date = new Date();
  return {
    ...doc,
    createdAt: date,
    updatedAt: date,
  }
}

export function updateDoc<T>(doc: T) {
  return {
    ...doc,
    updatedAt: new Date(),
  }
}