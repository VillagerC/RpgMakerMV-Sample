//=============================================================================
// Dualcast.js
//=============================================================================

/*:
 * @plugindesc 戦闘時、スキルを２個選んで使用可能になります。
 * @author 浦島
 *
 * @help
 *
 * 機能
 * FINAL FANTASYシリーズに登場する「連続魔」を一部、再現します
 * スキルを２個選んで使用可能になります。
 *
 * 使い方
 * コマンド:
 * Type
 * 連続魔法で選択するスキルタイプ
 *
 * Skill
 * 連続魔のスキルID
 *
 * Type
 * で設定したタイプのスキルを2個使用可能になります。
 *
 * 
 * サイト: 浦島日記
 * URL: http://urashima0401.blog.fc2.com/
 * readmeやスタッフロールの明記、使用報告は任意
 *
 * @param Type
 * @desc 連続魔で選択するスキルタイプ(デフォルトだと魔法(1)
 * デフォルト: 1
 * @default 1
 *
 * @param Skill
 * @desc 連続魔のスキルID
 * デフォルト: 15
 * @default 15
 *
 */

var Battle_Dualcast = Battle_Dualcast || {};
Battle_Dualcast.Status = []; // 格納用に配列の作成
Battle_Dualcast.Parameters = PluginManager.parameters('Battle_Dualcast');
// 初期設定
Battle_Dualcast.Status[0] = Number(Battle_Dualcast.Parameters["Type"])  || 1
Battle_Dualcast.Status[1] = Number(Battle_Dualcast.Parameters["Skill"])  || 15

!function() {
	// コスト判定用
	var _Game_Temp_initialize_Dualcast = Game_Temp.prototype.initialize;
	Game_Temp.prototype.initialize = function() {
		_Game_Temp_initialize_Dualcast.call(this);
		this._Dualcost = [0, 0];
		this._Dualcast = { 0: [-1, -1], 1: [-1, -1], 2: [-1, -1], 3: [-1, -1], 4: [-1, -1], 5: [-1, -1]};
		this._Dualcast.min = 0;
		this._Dualcast.max = 0;
	};
	// 初期化
	Game_Temp.prototype.clear_skill_select = function(i) {
		var actor_id = i;
		this._Dualcost = [0, 0];
		this._Dualcast.min = 0;
		this._Dualcast.max = 0;
		this._Dualcast[actor_id][1] = [-1, -1];
		this._Dualcast[actor_id][2] = [-1, -1];
	};
	// コスト計算
	Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
		if ($gameTemp._Dualcost[0] > 0 !== $gameTemp._Dualcost[1] > 0) {
			return this._tp >= this.skillTpCost(skill) + $gameTemp._Dualcost[1] && this._mp >= this.skillMpCost(skill) + $gameTemp._Dualcost[0];
		} else {
			return this._tp >= this.skillTpCost(skill) && this._mp >= this.skillMpCost(skill);
		}
	};
	// 初期設定
	var _Scene_Battle_start_Dualcast = Scene_Battle.prototype.start;
	Scene_Battle.prototype.start = function() {
		_Scene_Battle_start_Dualcast.call(this);
		$gameTemp._Dualcost = [0, 0];
		$gameTemp._Dualcast = { 0: [-1, [-1, -1], [-1, -1]], 1: [-1, [-1, -1], [-1, -1]], 2: [-1, [-1, -1], [-1, -1]], 3: [-1, [-1, -1], [-1, -1]], 4: [-1, [-1, -1], [-1, -1]], 5: [-1, [-1, -1], [-1, -1]]};
		$gameTemp._Dualcast.min = 0;
		$gameTemp._Dualcast.max = 0;
	};
	// 連続魔で使用
	Scene_Battle.prototype.select_magic_selection = function() {
		this._skillWindow.setActor(BattleManager.actor());
		this._skillWindow.setStypeId(Battle_Dualcast.Status[0]);
		this._skillWindow.refresh();
		this._skillWindow.show();
		this._skillWindow.activate();
	};
	// アクター［決定］
	var _Scene_Battle_onActorOk_Dualcast = Scene_Battle.prototype.onActorOk;
	Scene_Battle.prototype.onActorOk = function() {
		var actor_id = BattleManager._actorIndex;
		if ($gameTemp._Dualcast.max === 0) {
			return _Scene_Battle_onActorOk_Dualcast.call(this);
		} else {
			if ($gameTemp._Dualcast.min !== 0) {
				$gameTemp._Dualcast[actor_id][$gameTemp._Dualcast.min][1] = this._actorWindow.index()
			}
			this._actorWindow.hide();
			this._skillWindow.hide();
			this._itemWindow.hide();
			if ($gameTemp._Dualcast.min === $gameTemp._Dualcast.max) {
				this.selectNextCommand();
			} else {
				this.select_magic_selection();
			}
			
		}
	};
	// アクター［キャンセル］
	var _Scene_Battle_onActorCancel_Dualcast = Scene_Battle.prototype.onActorCancel;
	Scene_Battle.prototype.onActorCancel = function() {
		$gameTemp.clear_skill_select(BattleManager._actorIndex);
		_Scene_Battle_onActorCancel_Dualcast.call(this);
    };
	// エネミー[決定]
	var _Scene_Battle_onEnemyOk_Dualcast = Scene_Battle.prototype.onEnemyOk;
	Scene_Battle.prototype.onEnemyOk = function() {
		var actor_id = BattleManager._actorIndex;
		if ($gameTemp._Dualcast.max === 0) {
			return _Scene_Battle_onEnemyOk_Dualcast.call(this);
		} else {
			if ($gameTemp._Dualcast.min !== 0) {
				$gameTemp._Dualcast[actor_id][$gameTemp._Dualcast.min][1] = this._enemyWindow.index()
			}
			this._enemyWindow.hide();
			this._skillWindow.hide();
			this._itemWindow.hide();
			if ($gameTemp._Dualcast.min === $gameTemp._Dualcast.max) {
				this.selectNextCommand();
			} else {
				this.select_magic_selection();
			}
		}
	};
	// 敵キャラ［キャンセル］
	var _Scene_Battle_onEnemyCancel_Dualcast = Scene_Battle.prototype.onEnemyCancel;
	Scene_Battle.prototype.onEnemyCancel = function() {
		$gameTemp.clear_skill_select(BattleManager._actorIndex);
		_Scene_Battle_onEnemyCancel_Dualcast.call(this);
	};
	// スキル［決定］
	Scene_Battle.prototype.onSkillOk = function() {
		// 初期設定
		var actor_id = BattleManager._actorIndex;
		var action = BattleManager.inputtingAction();
		var skill = this._skillWindow.item();
		// コスト計算用
		$gameTemp._Dualcost[0] += BattleManager.actor().skillMpCost(skill);
		$gameTemp._Dualcost[1] += BattleManager.actor().skillTpCost(skill);
		// 分岐
		if ($gameTemp._Dualcast.max < 1) {
			action.setSkill(skill.id);
			if (Battle_Dualcast.Status[1] === skill.id) {
				$gameTemp._Dualcast.max = 2
			}
		} else {
			$gameTemp._Dualcast.min += 1;
			$gameTemp._Dualcast[actor_id][$gameTemp._Dualcast.min][0] = skill.id;
		}

		if ($gameTemp._Dualcast.min === 2 || $gameTemp._Dualcast.max === 0) {
			this._skillWindow.hide();
		}
		BattleManager.actor().setLastBattleSkill(skill);
		this._skillWindow.hide();
		this._itemWindow.hide();
		if ($gameTemp._Dualcast.min === $gameTemp._Dualcast.max && ![1,7,9].contains(skill.scope)) {
			this.selectNextCommand();
		} else if (![1,7,9].contains(skill.scope)) {
			this.select_magic_selection();
		} else if ([1, 2, 3, 4, 5, 6].contains(skill.scope)) {
			this.selectEnemySelection();
		} else {
			this.selectActorSelection();
		}
	};
	// スキル［キャンセル］
	var _Scene_Battle_onSkillCancel_Dualcast = Scene_Battle.prototype.onSkillCancel;
	Scene_Battle.prototype.onSkillCancel = function() {
		$gameTemp.clear_skill_select(BattleManager._actorIndex);
		_Scene_Battle_onSkillCancel_Dualcast.call(this);
	};
	// 次のアクターへ
	BattleManager.selectNextCommand = function() {
		do {
			if (!this.actor() || !this.actor().selectNextCommand()) {
				$gameTemp.clear_skill_select(this._actorIndex + 1);// 初期化
				this.changeActor(this._actorIndex + 1, 'waiting');
				if (this._actorIndex >= $gameParty.size()) {
					this.startTurn();
					break;
				}
			}
		} while (!this.actor().canInput());
	};
	// 前のアクターへ
	BattleManager.selectPreviousCommand = function() {
		do {
			if (!this.actor() || !this.actor().selectPreviousCommand()) {
				if (this._actorIndex - 1 >= 0) {
					$gameTemp.clear_skill_select(this._actorIndex - 1);// 初期化
				}
				this.changeActor(this._actorIndex - 1, 'undecided');
				if (this._actorIndex < 0) {
					return;
				}
			}
		} while (!this.actor().canInput());
	};
	// ターン開始
	var _BattleManager_startTurn_Dualcast = BattleManager.startTurn;
	BattleManager.startTurn = function() {
		$gameParty.members().forEach(function(actor, index) {
			if ($gameTemp._Dualcast[index][1][0] !== -1) {
				for(var i=1;i<=2;i++){
					var action = new Game_Action(actor);
					action.setSkill($gameTemp._Dualcast[index][i][0]);
					action.setTarget($gameTemp._Dualcast[index][i][1]);
					actor._actions.push(action);
				}
				$gameTemp.clear_skill_select(index); // 初期化
			}
		}, this);
		$gameTemp._Dualcost = [0, 0]; // コストの初期化、忘れるとエネミーに引き継がれます
		_BattleManager_startTurn_Dualcast.call(this);
	};
}();