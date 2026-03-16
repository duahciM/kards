import { Keyword } from './Enums';
import { KeywordEffect } from './KeywordEffect';
import { PlayerId, ZoneType, UnitType } from './Enums';
import { Game } from './Game';

export class Unit {
  public owner: PlayerId;
  public unitType: UnitType;
  public name: string;
  public attack: number;
  public health: number;
  public maxHealth: number;
  public zone: ZoneType;
  public canAttack: boolean = false;
  public canMove: boolean = false;
  public hasMoved: boolean = false;
  public hasAttacked: boolean = false;
  public keywords: Set<Keyword> = new Set();
  private keywordEffects: KeywordEffect[] = [];

  constructor(owner: PlayerId, type: UnitType, name: string, attack: number, health: number) {
    this.owner = owner;
    this.unitType = type;
    this.name = name;
    this.attack = attack;
    this.health = health;
    this.maxHealth = health;
    this.zone = ZoneType.FriendlySupport;
  }

  addKeyword(effect: KeywordEffect) {
    this.keywords.add(effect.keyword);
    this.keywordEffects.push(effect);
  }

  triggerBeforeAttacked(attacker: Unit, game: Game) {
    this.keywordEffects.forEach(ef => ef.onBeforeAttacked?.(this, attacker, game));
  }
  triggerBeforeAttack(target: Unit | null, game: Game) {
    this.keywordEffects.forEach(ef => ef.onBeforeAttack?.(this, target, game));
  }
  triggerBeforeMove(from: ZoneType, to: ZoneType, game: Game): boolean {
    for (const ef of this.keywordEffects) {
      if (ef.onBeforeMove?.(this, from, to, game) === false) return false;
    }
    return true;
  }
  triggerDeploy(game: Game) {
    this.keywordEffects.forEach(ef => ef.onDeploy?.(this, game));
  }
  triggerTurnStart(game: Game) {
    this.keywordEffects.forEach(ef => ef.onTurnStart?.(this, game));
  }
}
