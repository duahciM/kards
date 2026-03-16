import { Game } from '../core/Game';
import { Unit } from '../core/Unit';
import { Player, ZoneType, Keyword, PlayerId } from '../core/';

export class MovementSystem {
  constructor(private game: Game) {}

  canMove(unit: Unit, player: Player, toZone: ZoneType): boolean {
    if (unit.owner !== player.id) return false;
    if (unit.hasMoved) return false;
    if (player.commandPoints < 1) return false;
    if (unit.zone === toZone) return false;

    // 只能从支援线到前线，或前线到支援线（不能直接跨到敌方支援线）
    if (!(unit.zone === ZoneType.FriendlySupport && toZone === ZoneType.Frontline) &&
        !(unit.zone === ZoneType.Frontline && toZone === ZoneType.FriendlySupport)) {
      return false;
    }

    // 移动到前线需敌方前线无单位
    if (toZone === ZoneType.Frontline) {
      const enemyPlayer = this.game.players[1 - player.id];
      if (enemyPlayer.getUnitsInZone(ZoneType.Frontline).length > 0) return false;
    }

    // 触发烟幕等关键词
    if (!unit.triggerBeforeMove(unit.zone, toZone, this.game)) return false;

    return true;
  }

  executeMove(unit: Unit, player: Player, toZone: ZoneType): boolean {
    if (!this.canMove(unit, player, toZone)) return false;
    player.commandPoints -= 1;
    player.moveUnit(unit, toZone);
    unit.hasMoved = true;
    // 步兵移动后不能攻击
    if (unit.unitType === UnitType.Infantry) {
      unit.canAttack = false;
    }
    // 坦克移动后仍可攻击（但需在攻击系统中判断）
    return true;
  }
}
