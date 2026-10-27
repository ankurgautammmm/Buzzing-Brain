import { OrganModelSpec, AnatomicalStructure } from '../types/anatomy';
import { HEART_ORGAN_SPEC } from './heartAnatomyData';
import { KIDNEY_ORGAN_SPEC } from './kidneyAnatomyData';
import { BRAIN_ORGAN_SPEC } from './brainAnatomyData';

export const ANATOMY_ORGAN_REGISTRY: OrganModelSpec[] = [
  HEART_ORGAN_SPEC,
  KIDNEY_ORGAN_SPEC,
  BRAIN_ORGAN_SPEC
];

export function getOrganById(id: string): OrganModelSpec | undefined {
  return ANATOMY_ORGAN_REGISTRY.find(o => o.id === id);
}

export interface SearchMatch {
  organ: OrganModelSpec;
  structure: AnatomicalStructure;
  matchField: 'name' | 'latin' | 'hindi' | 'synonym' | 'term' | 'function';
}

export function searchAnatomicalStructures(query: string): SearchMatch[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const matches: SearchMatch[] = [];

  for (const organ of ANATOMY_ORGAN_REGISTRY) {
    for (const structure of organ.structures) {
      if (structure.name.toLowerCase().includes(q)) {
        matches.push({ organ, structure, matchField: 'name' });
        continue;
      }
      if (structure.latinName.toLowerCase().includes(q)) {
        matches.push({ organ, structure, matchField: 'latin' });
        continue;
      }
      if (structure.hindiName.toLowerCase().includes(q)) {
        matches.push({ organ, structure, matchField: 'hindi' });
        continue;
      }
      // Check terminology
      const termMatch = structure.importantTerminology.some(
        t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
      );
      if (termMatch) {
        matches.push({ organ, structure, matchField: 'term' });
        continue;
      }
      // Check substructures & synonyms
      const subMatch = structure.substructures.some(s => s.toLowerCase().includes(q));
      if (subMatch) {
        matches.push({ organ, structure, matchField: 'synonym' });
        continue;
      }
      // Check function
      if (structure.mainFunction.toLowerCase().includes(q)) {
        matches.push({ organ, structure, matchField: 'function' });
        continue;
      }
    }
  }

  return matches;
}
