import { KeywordEffect } from '../core/KeywordEffect';
import { Keyword } from '../core/Enums';
import { Unit } from '../core/Unit';
import { Game } from '../core/Game';

export class Ambush implements KeywordEffect {
  keyword = Keyword.Ambush;
  onBeforeAttacked(unit: Unit, attacker: Unit, game: Game): void {
    // 伏击：先对攻击者造成伤害，若击杀则攻击者死亡
    attacker.health -= unit.attack;
    if (attacker.health <= 0) {
      // 攻击者死亡，移除
      const attackerPlayer = game.players[attacker.owner];
      const zone = attacker.zone;
      const units = attackerPlayer.getUnitsInZone(zone);
      const idx = units.indexOf(attacker);
      if (idx !== -1) units.splice(idx, 1);
    }
  }
}
