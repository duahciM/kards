import { Keyword, KeywordEffect } from '../keywords/KeywordEffect';
import { PlayerId, ZoneType } from './Enums';

export class Unit {
  public owner: PlayerId;
  public unitType: UnitType;
  public attack: number;
  public health: number;
  public maxHealth: number;
  public zone: ZoneType;                // 当前位置
  public canAttack: boolean = false;    // 本回合是否可攻击
  public canMove: boolean = false;      // 本回合是否可移动
  public hasMoved: boolean = false;     // 是否已移动（用于坦克）
  public hasAttacked: boolean = false;  // 是否已攻击
  public keywords: Set<Keyword> = new Set();
  private keywordEffects: KeywordEffect[] = [];

  constructor(owner: PlayerId, type: UnitType, attack: number, health: number) {
    this.owner = owner;
    this.unitType = type;
    this.attack = attack;
    this.health = health;
    this.maxHealth = health;
    this.zone = ZoneType.FriendlySupport; // 默认部署在己方支援线
  }

  // 添加关键词及其效果
  addKeyword(effect: KeywordEffect) {
    this.keywords.add(effect.keyword);
    this.keywordEffects.push(effect);
  }

  // 触发关键词钩子
  triggerBeforeAttacked(attacker: Unit, game: Game) {
    this.keywordEffects.forEach(ef => ef.onBeforeAttacked?.(this, attacker, game));
  }
  triggerBeforeAttack(target: Unit | null, game: Game) {
    this.keywordEffects.forEach(ef => ef.onBeforeAttack?.(this, target, game));
  }
  // ... 其他钩子类似
}
