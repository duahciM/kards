import { KeywordEffect } from '../core/KeywordEffect';
import { Keyword } from '../core/Enums';
import { Unit } from '../core/Unit';
import { Game } from '../core/Game';

export class Guard implements KeywordEffect {
  keyword = Keyword.Guard;
  // 守护效果在战斗系统中通过合法性检查实现，无需额外钩子
}
