import { Game } from '../core/Game';
import { Unit } from '../core/Unit';
import { Player, ZoneType, Keyword, PlayerId } from '../core/';

export class MovementSystem {
  constructor(private game: Game) {}

  canMove(unit: Unit, player: Player, toZone: ZoneType): boolean {
    // 1. 归属检查
    if (unit.owner !== player.id) return false;
    // 2. 是否可移动（本回合未移动过）
    if (unit.hasMoved) return false;
    // 3. 指挥点（假设移动消耗1，坦克可能0？这里简化，统一消耗1）
    if (player.commandPoints < 1) return false;
    // 4. 不能原地移动
    if (unit.zone === toZone) return false;
    // 5. 前线移动规则：只能从支援线移动到前线，或从前线移动到敌方支援线
    if (toZone === ZoneType.Frontline) {
      // 从支援线到前线：需要当前前线无人控制或自己控制？
      // 规则：同一时间只能一方控制前线。只有当敌方在前线没有单位时，你的单位才能移动到前线。
      const enemyPlayer = this.game.players[1 - player.id];
      if (enemyPlayer.getUnitsInZone(ZoneType.Frontline).length > 0) return false;
    }
    if (unit.zone === ZoneType.Frontline && toZone === ZoneType.EnemySupport) {
      // 从前线移动到敌方支援线：需要敌方前线无单位？实际上《Kards》中前线单位可以直接攻击敌方支援线，移动规则类似？
      // 这里简化：允许直接移动（攻击指令由战斗系统处理）
    }
    // 6. 烟幕单位移动后失去烟幕？暂不处理
    return true;
  }

  executeMove(unit: Unit, player: Player, toZone: ZoneType): boolean {
    if (!this.canMove(unit, player, toZone)) return false;
    player.commandPoints -= 1;
    // 从原区域移除
    const fromZone = unit.zone;
    const fromList = player.zones.get(fromZone)!;
    const idx = fromList.indexOf(unit);
    if (idx !== -1) fromList.splice(idx, 1);
    // 加入新区域
    unit.zone = toZone;
    player.zones.get(toZone)!.push(unit);
    unit.hasMoved = true;
    // 如果是步兵，移动后不能攻击（可在此设置标记，由攻击系统检查）
    if (unit.unitType === UnitType.Infantry) {
      unit.canAttack = false; // 步兵移动后不可攻击
    }
    // 坦克移动后仍可攻击（由攻击系统检查hasAttacked）
    return true;
  }
}
