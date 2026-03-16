import { KeywordEffect } from '../core/KeywordEffect';
import { Keyword } from '../core/Enums';
import { Unit } from '../core/Unit';
import { Game } from '../core/Game';

export class Smoke implements KeywordEffect {
  keyword = Keyword.Smoke;
  onBeforeAttack(unit: Unit, target: Unit | null, game: Game): void {
    // 攻击后移除烟幕
    this.removeSmoke(unit);
  }
  onBeforeMove(unit: Unit, from: ZoneType, to: ZoneType, game: Game): boolean {
    // 移动后移除烟幕
    this.removeSmoke(unit);
    return true;
  }
  private removeSmoke(unit: Unit) {
    // 从关键词集合中移除，但实际效果已在canAttack中通过检查实现
    // 这里标记为已行动，下次检查时烟幕失效
    // 简便做法：不真正移除，而是依赖 hasMoved/hasAttacked 状态
  }
}
