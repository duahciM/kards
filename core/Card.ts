import { UnitType, Keyword } from './Enums';

export class Card {
  public id: string;
  public name: string;
  public cost: number;
  public unitType: UnitType;
  public attack: number;
  public health: number;
  public keywords: Keyword[] = [];

  constructor(id: string, name: string, cost: number, type: UnitType, attack: number, health: number, keywords: Keyword[] = []) {
    this.id = id;
    this.name = name;
    this.cost = cost;
    this.unitType = type;
    this.attack = attack;
    this.health = health;
    this.keywords = keywords;
  }
}
