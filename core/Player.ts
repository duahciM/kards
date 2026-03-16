import { Unit } from './Unit';
import { Card } from './Card';
import { ZoneType, PlayerId } from './Enums';

export class Player {
  public id: PlayerId;
  public headquartersHealth: number = 20;
  public commandPoints: number = 0;
  public maxCommandPoints: number = 1;
  public deck: Card[] = [];
  public hand: Card[] = [];
  public discardPile: Card[] = [];
  public zones: Map<ZoneType, Unit[]> = new Map([
    [ZoneType.FriendlySupport, []],
    [ZoneType.Frontline, []],
    [ZoneType.EnemySupport, []]
  ]);

  constructor(id: PlayerId, deck: Card[]) {
    this.id = id;
    this.deck = this.shuffle([...deck]);
    this.drawInitialHand();
  }

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private drawInitialHand() {
    for (let i = 0; i < 5; i++) this.drawCard();
  }

  drawCard() {
    if (this.deck.length === 0) return; // 暂不处理疲劳
    const card = this.deck.pop()!;
    this.hand.push(card);
  }

  getUnitsInZone(zone: ZoneType): Unit[] {
    return this.zones.get(zone) || [];
  }

  moveUnit(unit: Unit, toZone: ZoneType) {
    const fromZone = unit.zone;
    const fromList = this.zones.get(fromZone)!;
    const index = fromList.indexOf(unit);
    if (index !== -1) fromList.splice(index, 1);
    unit.zone = toZone;
    this.zones.get(toZone)!.push(unit);
  }
}
