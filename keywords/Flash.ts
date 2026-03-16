import { KeywordEffect } from '../core/KeywordEffect';
import { Keyword } from '../core/Enums';
import { Unit } from '../core/Unit';
import { Game } from '../core/Game';

export class Flash implements KeywordEffect {
  keyword = Keyword.Flash;
  onDeploy(unit: Unit, game: Game): void {
    unit.canMove = true;
    unit.canAttack = true;
  }
}
