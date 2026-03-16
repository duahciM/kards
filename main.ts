import { Unit } from './core/Unit';
import './style.css'; // 稍后创建
import { Game } from './core/Game';
import { PlayerId, ZoneType, UnitType, Keyword } from './core/Enums';
import { Card } from './core/Card';

// 预设一些卡牌
const cardPool = [
  new Card('inf1', '步兵', 2, UnitType.Infantry, 2, 3),
  new Card('inf2', '守护步兵', 3, UnitType.Infantry, 1, 4, [Keyword.Guard]),
  new Card('tank1', '坦克', 4, UnitType.Tank, 3, 2, [Keyword.Flash]),
  new Card('art1', '炮兵', 3, UnitType.Artillery, 2, 2),
  new Card('amb1', '伏击兵', 2, UnitType.Infantry, 2, 2, [Keyword.Ambush]),
  new Card('smoke1', '烟幕兵', 2, UnitType.Infantry, 1, 3, [Keyword.Smoke]),
];

// 创建两个玩家的牌组（各包含相同卡牌，数量随意）
const deck1 = [...cardPool, ...cardPool, ...cardPool]; // 重复以便有足够卡牌
const deck2 = [...cardPool, ...cardPool, ...cardPool];

const game = new Game(deck1, deck2);
let selectedUnit: Unit | null = null; // 当前选中的己方单位
let selectedCard: Card | null = null; // 当前选中的手牌

// 获取DOM元素
const app = document.getElementById('app')!;

function render() {
  const currentPlayer = game.players[game.currentTurn];
  const opponent = game.players[1 - game.currentTurn];
  const winner = game.checkVictory();
  if (winner !== null) {
    app.innerHTML = `<h1>玩家${winner === PlayerId.Player1 ? '1' : '2'} 获胜！</h1>`;
    return;
  }

  let html = `
    <div class="game">
      <div class="player-info opponent">
        <h2>对手 (玩家${opponent.id === PlayerId.Player1 ? '1' : '2'})</h2>
        <div>总部血量: ${opponent.headquartersHealth}</div>
        <div>手牌数: ${opponent.hand.length}</div>
        <div>指挥点: ${opponent.commandPoints}/${opponent.maxCommandPoints}</div>
      </div>
      <div class="battlefield">
        <div class="zone enemy-support">
          <h3>敌方支援线</h3>
          ${renderUnits(opponent.getUnitsInZone(ZoneType.EnemySupport), opponent.id)}
        </div>
        <div class="zone frontline">
          <h3>前线</h3>
          <div>控制者: ${game.frontlineOwner !== null ? `玩家${game.frontlineOwner+1}` : '无'}</div>
          ${renderUnits(game.players[0].getUnitsInZone(ZoneType.Frontline).concat(game.players[1].getUnitsInZone(ZoneType.Frontline)), null)}
        </div>
        <div class="zone friendly-support">
          <h3>我方支援线</h3>
          ${renderUnits(currentPlayer.getUnitsInZone(ZoneType.FriendlySupport), currentPlayer.id)}
        </div>
      </div>
      <div class="player-info current">
        <h2>当前玩家 (玩家${currentPlayer.id === PlayerId.Player1 ? '1' : '2'})</h2>
        <div>总部血量: ${currentPlayer.headquartersHealth}</div>
        <div>指挥点: ${currentPlayer.commandPoints}/${currentPlayer.maxCommandPoints}</div>
        <div class="hand">
          <h3>手牌</h3>
          <div class="card-list">
            ${currentPlayer.hand.map((card, index) => `
              <div class="card ${selectedCard === card ? 'selected' : ''}" data-card-index="${index}">
                <div class="card-name">${card.name}</div>
                <div class="card-cost">费用: ${card.cost}</div>
                <div class="card-stats">${card.attack}/${card.health}</div>
                <div class="card-keywords">${card.keywords.join(' ')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="controls">
        <button id="end-turn">结束回合</button>
        <button id="clear-selection">取消选择</button>
      </div>
    </div>
  `;

  app.innerHTML = html;
  attachEvents();
}

function renderUnits(units: Unit[], ownerId: PlayerId | null): string {
  return units.map(unit => `
    <div class="unit ${selectedUnit === unit ? 'selected' : ''}" data-unit-id="${unit.owner}-${unit.name}-${Math.random()}">
      <div class="unit-name">${unit.name}</div>
      <div class="unit-stats">${unit.attack}/${unit.health}</div>
      <div class="unit-keywords">${Array.from(unit.keywords).join(' ')}</div>
      <div class="unit-status">
        ${unit.hasMoved ? '已移动' : ''} ${unit.hasAttacked ? '已攻击' : ''}
      </div>
    </div>
  `).join('');
}

function attachEvents() {
  // 单位点击
  document.querySelectorAll('.unit').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      // 解析单位标识（简化：通过索引查找，实际应用应使用唯一ID）
      // 这里用比较粗糙的方法：遍历所有单位找到匹配的
      const currentPlayer = game.players[game.currentTurn];
      const allUnits = [
        ...currentPlayer.getUnitsInZone(ZoneType.FriendlySupport),
        ...currentPlayer.getUnitsInZone(ZoneType.Frontline)
      ];
      // 根据点击元素的文本内容尝试匹配（不精确，仅供演示）
      const nameEl = el.querySelector('.unit-name');
      if (!nameEl) return;
      const unitName = nameEl.textContent;
      const found = allUnits.find(u => u.name === unitName); // 可能有重名，最好用ID
      if (found && found.owner === game.currentTurn) {
        selectedUnit = found;
        selectedCard = null;
        render();
      }
    });
  });

  // 手牌点击
  document.querySelectorAll('.card').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = el.getAttribute('data-card-index');
      if (index !== null) {
        const card = game.players[game.currentTurn].hand[parseInt(index)];
        selectedCard = card;
        selectedUnit = null;
        render();
      }
    });
  });

  // 区域点击（用于部署或移动）
  document.querySelectorAll('.zone').forEach(zoneEl => {
    zoneEl.addEventListener('click', (e) => {
      if (e.target !== zoneEl) return; // 只响应区域背景点击
      const zoneClass = zoneEl.classList;
      let zoneType: ZoneType;
      if (zoneClass.contains('enemy-support')) zoneType = ZoneType.EnemySupport;
      else if (zoneClass.contains('frontline')) zoneType = ZoneType.Frontline;
      else if (zoneClass.contains('friendly-support')) zoneType = ZoneType.FriendlySupport;
      else return;

      const player = game.players[game.currentTurn];

      if (selectedCard) {
        // 部署到目标区域（只允许部署到己方支援线或前线）
        if (zoneType === ZoneType.FriendlySupport || zoneType === ZoneType.Frontline) {
          game.deployCard(selectedCard, player, zoneType);
          selectedCard = null;
          render();
        }
      } else if (selectedUnit) {
        // 移动单位
        if (selectedUnit.owner === game.currentTurn) {
          const success = game.movementSystem.executeMove(selectedUnit, player, zoneType);
          if (success) {
            selectedUnit = null;
            render();
          } else {
            alert('不能移动到该区域');
          }
        }
      }
    });
  });

  // 结束回合按钮
  document.getElementById('end-turn')?.addEventListener('click', () => {
    game.endTurn();
    selectedUnit = null;
    selectedCard = null;
    render();
  });

  // 取消选择
  document.getElementById('clear-selection')?.addEventListener('click', () => {
    selectedUnit = null;
    selectedCard = null;
    render();
  });
}

// 初始渲染
render();
