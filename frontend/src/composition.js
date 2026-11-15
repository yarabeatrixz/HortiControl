// Composition root: fora das camadas, é o ÚNICO lugar que escolhe implementações.
// Back-end pronto → trocar `criarLocalStorageRepository()` pelo adapter da API.

import { criarLocalStorageRepository } from "@adapters";
import { criarCasosDeUso } from "@application";

const repositorio = criarLocalStorageRepository();

export const casosDeUso = criarCasosDeUso(repositorio);
