import { Player, PlayerId, ZoneType, UnitType, Keyword } from './';
import { Unit } from './Unit';
import { CombatSystem } from '../systems/CombatSystem';
import { MovementSystem } from '../systems/MovementSystem';

export class Game {
  public players: [Player, Player];
  public currentTurn: PlayerId = PlayerId.Player1;
  public turnNumber: number = 1;
  public frontlineOwner: PlayerId | null = null; // 当前控制前线的玩家

  private combatSystem: CombatSystem;
  private movementSystem: MovementSystem;

  constructor() {
    this.players = [new Player(PlayerId.Player1), new Player(PlayerId.Player2)];
    this.combatSystem = new CombatSystem(this);
    this.movementSystem = new MovementSystem(this);
  }

  // 开始新回合
  startTurn() {
    const player = this.players[this.currentTurn];
    // 1. 增加指挥点上限（最多12）
    player.maxCommandPoints = Math.min(player.maxCommandPoints + 1, 12);
    // 2. 补满指挥点
    player.commandPoints = player.maxCommandPoints;
    // 3. 抽一张牌（可扩展）
    // 4. 重置单位行动状态
    this.resetUnitsForTurn(player);
    // 5. 触发单位回合开始关键词
    this.triggerTurnStart(player);
  }

  // 部署单位
  deployUnit(card: Card, player: Player, targetZone: ZoneType): boolean {
    // 检查指挥点、目标区域合法性（前线只能由控制者部署单位？这里简化，支援线可部署）
    if (player.commandPoints < card.cost) return false;
    // 创建单位实体
    const unit = new Unit(player.id, card.unitType, card.attack, card.health);
    // 根据卡牌关键词添加效果（需从关键词工厂获取）
    card.keywords.forEach(kw => {
      const effect = KeywordFactory.create(kw); // 假设存在工厂
      unit.addKeyword(effect);
    });
    // 设置初始区域
    unit.zone = targetZone;
    player.zones.get(targetZone)!.push(unit);
    player.commandPoints -= card.cost;
    // 触发部署关键词
    unit.triggerDeploy(this);
    // 如果是闪击单位，本回合可行动
    if (unit.keywords.has(Keyword.Flash)) {
      unit.canAttack = true;
      unit.canMove = true;
    }
    return true;
  }

  // 移动单位（由MovementSystem调用）
  moveUnit(unit: Unit, player: Player, toZone: ZoneType): boolean {
    return this.movementSystem.canMove(unit, player, toZone) &&
           this.movementSystem.executeMove(unit, player, toZone);
  }

  // 单位攻击（由CombatSystem处理）
  attack(attacker: Unit, defender: Unit | Player, player: Player): boolean {
    return this.combatSystem.attack(attacker, defender, player);
  }

  // 重置单位每回合行动状态
  private resetUnitsForTurn(player: Player) {
    player.zones.forEach(units => {
      units.forEach(unit => {
        // 基础重置：坦克默认可移动+攻击（但需指挥点），其他只能选其一
        unit.hasMoved = false;
        unit.hasAttacked = false;
        unit.canAttack = true;
        unit.canMove = true;
        // 根据类型调整（可在关键词中覆盖）
        if (unit.unitType === UnitType.Tank) {
          // 坦克可以移动后攻击，但需分别消耗指挥点（由玩家操作时判断）
        } else {
          // 步兵只能移动或攻击之一，在操作时由系统限制
        }
      });
    });
  }
}
