import { Game } from '../core/Game';
import { Unit } from '../core/Unit';
import { Player } from '../core/Player';
import { PlayerId, ZoneType, Keyword, UnitType } from '../core/Enums';
export class CombatSystem {
  constructor(private game: Game) {}

  attack(attacker: Unit, defender: Unit | Player, player: Player): boolean {
    if (!this.canAttack(attacker, defender, player)) return false;
    player.commandPoints -= 1;

    attacker.triggerBeforeAttack(defender instanceof Unit ? defender : null, this.game);

    if (defender instanceof Unit) {
      defender.triggerBeforeAttacked(attacker, this.game);
      // 如果伏击击杀了攻击者，攻击者可能已死亡，需要检查
      if (attacker.health <= 0) {
        this.destroyUnit(attacker);
        return true;
      }

      // 正常战斗
      this.dealDamage(attacker, defender);
      if (attacker.health > 0 && !this.isArtillery(attacker)) {
        this.dealDamage(defender, attacker); // 反击
      }
      if (attacker.health <= 0) this.destroyUnit(attacker);
      if (defender.health <= 0) this.destroyUnit(defender);
    } else {
      // 攻击总部
      defender.headquartersHealth -= attacker.attack;
      if (defender.headquartersHealth <= 0) this.game.winner = attacker.owner;
    }

    attacker.hasAttacked = true;
    return true;
  }

  private canAttack(attacker: Unit, defender: Unit | Player, player: Player): boolean {
    if (attacker.owner !== player.id) return false;
    if (attacker.hasAttacked) return false;
    if (player.commandPoints < 1) return false;
    if (defender instanceof Player && attacker.zone !== ZoneType.Frontline) return false;
    if (defender instanceof Player) {
      const enemyPlayer = this.game.players[1 - player.id];
      if (enemyPlayer.getUnitsInZone(ZoneType.Frontline).length > 0) return false;
    }

    // 攻击单位范围检查
    if (defender instanceof Unit) {
      // 炮兵可攻击任意位置
      if (!this.isArtillery(attacker)) {
        // 非炮兵只能攻击前线或同区域单位
        if (attacker.zone !== defender.zone && attacker.zone !== ZoneType.Frontline) return false;
        if (attacker.zone === ZoneType.Frontline && defender.zone !== ZoneType.Frontline && defender.zone !== ZoneType.EnemySupport) return false;
      }

      // 烟幕：不能攻击未行动的烟幕单位
      if (defender.keywords.has(Keyword.Smoke) && !defender.hasMoved && !defender.hasAttacked) {
        return false;
      }

      // 守护：必须优先攻击守护单位
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
    const player = this.game.players[unit.owner];
    const zoneUnits = player.zones.get(unit.zone)!;
    const idx = zoneUnits.indexOf(unit);
    if (idx !== -1) zoneUnits.splice(idx, 1);
  }
}
