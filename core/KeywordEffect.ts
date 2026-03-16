import { Unit } from './Unit';
import { Game } from './Game';

export interface KeywordEffect {
  keyword: Keyword;
  onBeforeAttacked?(unit: Unit, attacker: Unit, game: Game): void;
  onBeforeAttack?(unit: Unit, target: Unit | null, game: Game): void;
  onBeforeMove?(unit: Unit, from: ZoneType, to: ZoneType, game: Game): boolean;
  onDeploy?(unit: Unit, game: Game): void;
  onTurnStart?(unit: Unit, game: Game): void;
  onTurnEnd?(unit: Unit, game: Game): void;
}
