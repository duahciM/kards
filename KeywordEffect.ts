import { Unit } from '../core/Unit';
import { Game } from '../core/Game';

export interface KeywordEffect {
  keyword: Keyword;
  // 单位即将被攻击时调用（伏击用）
  onBeforeAttacked?(unit: Unit, attacker: Unit, game: Game): void;
  // 单位攻击前调用（闪击、烟幕等）
  onBeforeAttack?(unit: Unit, target: Unit | null, game: Game): void;
  // 单位移动前调用
  onBeforeMove?(unit: Unit, from: ZoneType, to: ZoneType, game: Game): boolean;
  // 单位部署时调用
  onDeploy?(unit: Unit, game: Game): void;
  // 回合开始/结束时调用
  onTurnStart?(unit: Unit, game: Game): void;
  onTurnEnd?(unit: Unit, game: Game): void;
  // ... 可根据需要增加钩子
}
