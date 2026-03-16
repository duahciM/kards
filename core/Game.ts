import { Player, PlayerId, ZoneType } from './';
import { CombatSystem } from '../systems/CombatSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { Unit } from './Unit';

export class Game {
  public players: [Player, Player];
  public currentTurn: PlayerId = PlayerId.Player1;
  public turnNumber: number = 1;
  public frontlineOwner: PlayerId | null = null;
  public winner: PlayerId | null = null;

  public combatSystem: CombatSystem;
  public movementSystem: MovementSystem;

  constructor(player1Deck: Card[], player2Deck: Card[]) {
    this.players = [new Player(PlayerId.Player1, player1Deck), new Player(PlayerId.Player2, player2Deck)];
    this.combatSystem = new CombatSystem(this);
    this.movementSystem = new MovementSystem(this);
  }

  startTurn() {
    if (this.winner) return;
    const player = this.players[this.currentTurn];
    player.maxCommandPoints = Math.min(player.maxCommandPoints + 1, 12);
    player.commandPoints = player.maxCommandPoints;
    player.drawCard(); // 每回合抽一张
    this.resetUnitsForTurn(player);
    this.triggerTurnStart(player);
  }

  endTurn() {
    if (this.winner) return;
    // 触发回合结束关键词
    const player = this.players[this.currentTurn];
    this.triggerTurnEnd(player);
    // 切换玩家
    this.currentTurn = this.currentTurn === PlayerId.Player1 ? PlayerId.Player2 : PlayerId.Player1;
    this.startTurn();
  }

  private resetUnitsForTurn(player: Player) {
    player.zones.forEach(units => {
      units.forEach(unit => {
        unit.hasMoved = false;
        unit.hasAttacked = false;
        unit.canAttack = true;
        unit.canMove = true;
        // 如果是坦克，保留移动后攻击能力（已在攻击系统中处理）
      });
    });
  }

  private triggerTurnStart(player: Player) {
    player.zones.forEach(units => units.forEach(u => u.triggerTurnStart(this)));
  }

  private triggerTurnEnd(player: Player) {
    // 可扩展
  }

  // 部署单位
  deployCard(card: Card, player: Player, targetZone: ZoneType): boolean {
    if (player.commandPoints < card.cost) return false;
    // 只能部署到己方支援线或前线？简单起见允许部署到支援线
    if (targetZone !== ZoneType.FriendlySupport && targetZone !== ZoneType.Frontline) return false;
    // 前线部署需要控制前线？暂简化允许
    const unit = new Unit(player.id, card.unitType, card.name, card.attack, card.health);
    // 添加关键词效果
    card.keywords.forEach(kw => {
      let effect;
      switch (kw) {
        case Keyword.Flash: effect = new Flash(); break;
        case Keyword.Guard: effect = new Guard(); break;
        case Keyword.Ambush: effect = new Ambush(); break;
        case Keyword.Smoke: effect = new Smoke(); break;
      }
      if (effect) unit.addKeyword(effect);
    });
    unit.zone = targetZone;
    player.zones.get(targetZone)!.push(unit);
    player.commandPoints -= card.cost;
    // 从手牌移除
    const handIndex = player.hand.indexOf(card);
    if (handIndex !== -1) player.hand.splice(handIndex, 1);

    unit.triggerDeploy(this);
    if (unit.keywords.has(Keyword.Flash)) {
      unit.canAttack = true;
      unit.canMove = true;
    }
    return true;
  }

  // 检查胜利条件
  checkVictory(): PlayerId | null {
    if (this.players[0].headquartersHealth <= 0) return PlayerId.Player2;
    if (this.players[1].headquartersHealth <= 0) return PlayerId.Player1;
    return null;
  }
}
