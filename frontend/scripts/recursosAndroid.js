import { cp } from 'node:fs/promises';
import path from 'node:path';

export function recursosAndroid() {
  let config;
  return {
    name: 'recursos-android-sem-midias',
    configResolved(resolved) { config = resolved; },
    async closeBundle() {
      const origem = path.resolve(config.root, 'public');
      const destino = path.resolve(config.root, config.build.outDir);
      await cp(origem, destino, { recursive: true, filter: (arquivo) => {
        const relativo = path.relative(origem, arquivo);
        return relativo !== 'videos' && !relativo.startsWith(`videos${path.sep}`) && !/\.pdf$/i.test(arquivo);
      } });
    },
  };
}
