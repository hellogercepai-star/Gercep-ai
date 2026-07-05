// Error khusus untuk pelanggaran unique constraint di database.
// Service layer akan menangkap ini untuk ubah jadi pesan yang manusiawi,
// tanpa Repository perlu tahu pesan apa yang cocok untuk tiap kasus.
export class RepositoryUniqueViolationError extends Error {
  constructor(message = "Data duplikat terdeteksi.") {
    super(message);
    this.name = "RepositoryUniqueViolationError";
  }
}
