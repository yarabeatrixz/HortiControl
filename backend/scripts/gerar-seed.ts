// Gera supabase/seed.sql a partir dos dados fictícios do domínio.
// Uso: pnpm --filter @hortilink/backend gerar:seed

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { criarExemplo } from "@hortilink/dominio/exemplo";
import { gerarSeedSql } from "../src/2-adapters/supabase/seedSql";

const agora = new Date();
const destino = fileURLToPath(new URL("../../supabase/seed.sql", import.meta.url));

writeFileSync(destino, gerarSeedSql(criarExemplo(agora), agora), "utf8");
console.log(`Seed gerado em ${destino}`);
