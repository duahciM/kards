import { KeywordEffect } from './KeywordEffect';
import { Keyword } from '../core/Enums';
import { Unit } from '../core/Unit';
import { Game } from '../core/Game';

export class Flash implements KeywordEffect {
  keyword = Keyword.Flash;

  onDeploy(unit: Unit, game: Game): void {
    // 部署当回合可移动、攻击
    unit.canMove = true;
    unit.canAttack = true;
  }

  onTurnStart(unit: Unit, game: Game): void {
    // 每回合重置时，闪击单位仍正常重置（已在Game中处理）
  }
}
