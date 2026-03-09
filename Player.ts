import { Unit } from './Unit';
import { ZoneType, PlayerId } from './Enums';

export class Player {
  public id: PlayerId;
  public headquartersHealth: number = 20;
  public commandPoints: number = 0;       // 当前可用指挥点
  public maxCommandPoints: number = 1;     // 上限，每回合+1
  public deck: Card[] = [];                // 牌库
  public hand: Card[] = [];                 // 手牌
  public zones: Map<ZoneType, Unit[]> = new Map([
    [ZoneType.FriendlySupport, []],
    [ZoneType.Frontline, []],
    [ZoneType.EnemySupport, []] // 敌方支援线由对方控制，此处仅用于查看
  ]);

  constructor(id: PlayerId) {
    this.id = id;
  }

  // 获取指定区域的单位
  getUnitsInZone(zone: ZoneType): Unit[] {
    return this.zones.get(zone) || [];
  }

  // 移动单位到另一个区域（仅修改位置，不检查合法性）
  moveUnit(unit: Unit, toZone: ZoneType) {
    const fromZone = unit.zone;
    const fromList = this.zones.get(fromZone)!;
    const index = fromList.indexOf(unit);
    if (index !== -1) fromList.splice(index, 1);
    unit.zone = toZone;
    this.zones.get(toZone)!.push(unit);
  }
}
