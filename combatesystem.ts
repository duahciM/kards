import { Game } from '../core/Game';
import { Unit } from '../core/Unit';
import { Player, PlayerId, ZoneType, Keyword } from '../core/';

export class CombatSystem {
  constructor(private game: Game) {}

  attack(attacker: Unit, defender: Unit | Player, player: Player): boolean {
    // 合法性检查：指挥点、攻击范围、是否可攻击等
    if (!this.canAttack(attacker, defender, player)) return false;

    // 扣指挥点（假设攻击消耗1点，可配置）
    player.commandPoints -= 1;

    // 触发攻击前关键词（如烟幕？烟幕不能被选为目标，已在canAttack中处理）
    attacker.triggerBeforeAttack(defender instanceof Unit ? defender : null, this.game);

    // 如果目标是单位，处理伏击
    if (defender instanceof Unit) {
      defender.triggerBeforeAttacked(attacker, this.game);
      // 伏击可能击杀攻击者，若击杀则攻击者死亡，攻击取消
      if (defender.health <= 0) {
        this.destroyUnit(defender);
        return true; // 伏击成功，攻击者无事发生
      }
    }

    // 正常战斗
    if (defender instanceof Unit) {
      // 单位对单位：互相造成伤害（除非炮兵）
      this.dealDamage(attacker, defender);
      if (attacker.health > 0 && !this.isArtillery(attacker)) {
        this.dealDamage(defender, attacker); // 反击
      }
      // 处理死亡
      if (attacker.health <= 0) this.destroyUnit(attacker);
      if (defender.health <= 0) this.destroyUnit(defender);
    } else {
      // 攻击总部
      defender.headquartersHealth -= attacker.attack;
      // 检查胜利条件
      if (defender.headquartersHealth <= 0) this.game.winner = attacker.owner;
    }

    attacker.hasAttacked = true;
    return true;
  }

  private canAttack(attacker: Unit, defender: Unit | Player, player: Player): boolean {
    // 1. 攻击者必须属于当前玩家
    if (attacker.owner !== player.id) return false;
    // 2. 攻击者本回合未攻击过
    if (attacker.hasAttacked) return false;
    // 3. 指挥点足够（假设攻击消耗1）
    if (player.commandPoints < 1) return false;
    // 4. 攻击范围检查
    if (defender instanceof Player) {
      // 攻击总部：必须在前线且敌方前线无单位
      if (attacker.zone !== ZoneType.Frontline) return false;
      const enemyPlayer = this.game.players[1 - player.id];
      if (enemyPlayer.getUnitsInZone(ZoneType.Frontline).length > 0) return false;
    } else {
      // 攻击单位
      const defenderZone = defender.zone;
      // 炮兵可从支援线攻击任意位置
      if (this.isArtillery(attacker)) {
        // 炮兵可攻击任何位置的敌方单位（但需考虑烟幕？烟幕阻止被选为目标，已在攻击者选择时处理）
      } else {
        // 非炮兵只能攻击前线或同区域？
        // 简化：只能攻击前线或相邻区域？《Kards》中单位只能攻击前线或自己区域的单位？需细化。
        // 这里简化：只能攻击前线或自己所在区域的敌方单位。
        if (attacker.zone !== defenderZone && attacker.zone !== ZoneType.Frontline) return false;
      }
    }
    // 5. 烟幕：不能攻击拥有烟幕且未行动的单位（烟幕效果：在移动或攻击前不能被选为目标）
    if (defender instanceof Unit && defender.keywords.has(Keyword.Smoke)) {
      // 如果烟幕单位本回合尚未移动/攻击，则不能成为目标
      if (!defender.hasMoved && !defender.hasAttacked) return false;
    }
    // 6. 守护：如果目标单位不是守护单位，且敌方有守护单位在前线，则必须攻击守护单位
    if (defender instanceof Unit && !defender.keywords.has(Keyword.Guard)) {
      const enemyPlayer = this.game.players[1 - player.id];
      const frontlineUnits = enemyPlayer.getUnitsInZone(ZoneType.Frontline);
      const guardUnits = frontlineUnits.filter(u => u.keywords.has(Keyword.Guard));
      if (guardUnits.length > 0 && !guardUnits.includes(defender)) return false;
    }
    return true;
  }

  private dealDamage(source: Unit, target: Unit) {
    target.health -= source.attack;
  }

  private isArtillery(unit: Unit): boolean {
    return unit.unitType === UnitType.Artillery;
  }

  private destroyUnit(unit: Unit) {
    // 从所在区域移除
    const player = this.game.players[unit.owner];
    const zoneUnits = player.zones.get(unit.zone)!;
    const idx = zoneUnits.indexOf(unit);
    if (idx !== -1) zoneUnits.splice(idx, 1);
    // 可触发死亡效果
  }
}
