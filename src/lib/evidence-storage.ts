/** Device-local Blob storage. No upload or server synchronization is implied. */
export type StoredEvidence = { id: string; name: string; video: boolean; blob: Blob }
const database = 'rosa-assessment-evidence-v1'
let queue: Promise<unknown> = Promise.resolve()
function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, done: (value: T) => void) => void): Promise<T> {
  const operation = queue.catch(() => {}).then(() => new Promise<T>((resolve, reject) => {
    const opening = indexedDB.open(database, 1)
    opening.onupgradeneeded = () => opening.result.createObjectStore('evidence')
    opening.onerror = () => reject(opening.error)
    opening.onsuccess = () => {
      const db = opening.result, tx = db.transaction('evidence', mode)
      let value: T
      tx.oncomplete = () => { db.close(); resolve(value) }
      tx.onerror = tx.onabort = () => { db.close(); reject(tx.error ?? new Error('Unable to save evidence')) }
      run(tx.objectStore('evidence'), result => { value = result })
    }
  }))
  queue = operation
  return operation
}
export function readEvidence(key: string) {
  return transaction<StoredEvidence[]>('readonly', (store, done) => {
    const request = store.get(key); request.onsuccess = () => done(request.result ?? [])
  })
}
export function writeEvidence(key: string, files: StoredEvidence[]) {
  return transaction<void>('readwrite', (store, done) => { store.put(files, key); done(undefined) })
}
export function clearEvidence(prefix: string) {
  return transaction<void>('readwrite', (store, done) => {
    const cursor = store.openCursor()
    cursor.onsuccess = () => { const row = cursor.result; if (!row) { done(undefined); return } if (String(row.key).startsWith(prefix + ':')) row.delete(); row.continue() }
  })
}
