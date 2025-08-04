export default class LocalStorageMock {
  store: { [key: string]: string } = {}

  clear () {
    this.store = {}
  }

  getItem (key: string): string | null {
    return this.store[key] || null
  }

  setItem (key: string, value: any) {
    this.store[key] = value.toString()
  }

  removeItem (key: string) {
    delete this.store[key]
  }
}
