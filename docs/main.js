/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ui_answer_panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui/answer-panel */ "./src/ui/answer-panel.ts");
/* harmony import */ var _renderer_mount__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./renderer/mount */ "./src/renderer/mount.ts");
/* harmony import */ var _renderer_reactivity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderer/reactivity */ "./src/renderer/reactivity.ts");
/* harmony import */ var _ui_letter_panel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ui/letter-panel */ "./src/ui/letter-panel.ts");
/* harmony import */ var _logic_game_game_factory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./logic/game/game-factory */ "./src/logic/game/game-factory.ts");
/* harmony import */ var _logic_game_game_store__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./logic/game/game-store */ "./src/logic/game/game-store.ts");
/* harmony import */ var _renderer_el__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./renderer/el */ "./src/renderer/el.ts");







function main() {
  const cx = new _renderer_reactivity__WEBPACK_IMPORTED_MODULE_2__.Runtime();
  const gameInner = (0,_logic_game_game_factory__WEBPACK_IMPORTED_MODULE_4__.gameFactory)({
    restore: _logic_game_game_store__WEBPACK_IMPORTED_MODULE_5__.GameStore.checkSaveAndAsk(),
    listeners: {
      onFinish(data) {
        alert(JSON.stringify(data));
      },
      onSurrender(next) {
        setTimeout(() => {
          next();
          // trigger update, since Game doesn't know anything about reactivity
          game.update(g => g);
        }, 2000);
      }
    }
  });
  const game = cx.createSignal(gameInner);
  cx.createEffect(() => {
    _logic_game_game_store__WEBPACK_IMPORTED_MODULE_5__.GameStore.save(game.get());
  });
  (0,_renderer_mount__WEBPACK_IMPORTED_MODULE_1__.mount)(document.querySelector("#answer"), (0,_ui_answer_panel__WEBPACK_IMPORTED_MODULE_0__.AnswerPanel)(cx, {
    game
  }));
  (0,_renderer_mount__WEBPACK_IMPORTED_MODULE_1__.mount)(document.querySelector("#letters"), (0,_ui_letter_panel__WEBPACK_IMPORTED_MODULE_3__.LetterPanel)(cx, {
    game
  }));
  (0,_renderer_mount__WEBPACK_IMPORTED_MODULE_1__.mount)(document.querySelector("#current_question"), _renderer_el__WEBPACK_IMPORTED_MODULE_6__.El.new("span").textDyn(cx, () => (game.get().currentRoundIndex + 1).toString()));
  (0,_renderer_mount__WEBPACK_IMPORTED_MODULE_1__.mount)(document.querySelector("#total_questions"), _renderer_el__WEBPACK_IMPORTED_MODULE_6__.El.new("span").textDyn(cx, () => game.get().rounds.length.toString()));
}
main();

/***/ }),

/***/ "./src/logic/game/game-factory.ts":
/*!****************************************!*\
  !*** ./src/logic/game/game-factory.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gameFactory: () => (/* binding */ gameFactory)
/* harmony export */ });
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ "./src/logic/game/game.ts");
/* harmony import */ var _letter_picker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../letter-picker */ "./src/logic/letter-picker.ts");
/* harmony import */ var _randomizer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../randomizer */ "./src/logic/randomizer.ts");
/* harmony import */ var _word_picker__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../word-picker */ "./src/logic/word-picker.ts");
/* harmony import */ var _game_store__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./game-store */ "./src/logic/game/game-store.ts");





function gameFactory(options) {
  const game = new _game__WEBPACK_IMPORTED_MODULE_0__.Game(options.listeners);
  if (options.restore) {
    _game_store__WEBPACK_IMPORTED_MODULE_4__.GameStore.restore(game);
  } else {
    _word_picker__WEBPACK_IMPORTED_MODULE_3__.WordPicker.pickRandomWords(_word_picker__WEBPACK_IMPORTED_MODULE_3__.MAX_WORDS_IN_QUEUE).forEach(word => {
      const randomizer = new _randomizer__WEBPACK_IMPORTED_MODULE_2__.Randomizer();
      const letterPicker = new _letter_picker__WEBPACK_IMPORTED_MODULE_1__.LetterPicker(randomizer);
      const randomWordLetters = letterPicker.randomize(word);
      const round = new _game__WEBPACK_IMPORTED_MODULE_0__.Round(game, word, randomWordLetters);
      game.addRound(round);
    });
  }
  return game;
}

/***/ }),

/***/ "./src/logic/game/game-store.ts":
/*!**************************************!*\
  !*** ./src/logic/game/game-store.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameStore: () => (/* binding */ GameStore)
/* harmony export */ });
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ "./src/logic/game/game.ts");

const KEY = "gamestate-numfin";
class GameStore {
  constructor() {}
  static checkSaveAndAsk() {
    try {
      const parsedData = JSON.parse(localStorage.getItem(KEY) ?? "");
      return typeof parsedData["currentRoundIndex"] === "number" && confirm("Restore last session?");
    } catch (_) {
      return false;
    }
  }
  static save(game) {
    const gameState = {
      currentRoundIndex: game.currentRoundIndex,
      rounds: game.rounds.map(r => ({
        word: r.word,
        currentErrors: r.currentErrors,
        pickedIndexes: Array.from(r.pickedIndexes.values()),
        abandoned: r.abandoned,
        randomWordLetters: r.randomWordLetters
      }))
    };
    localStorage.setItem(KEY, JSON.stringify(gameState));
  }
  /** Mutate game state */
  static restore(game) {
    const gameState = JSON.parse(localStorage.getItem(KEY) ?? "");
    for (const savedRound of gameState.rounds) {
      const newRound = new _game__WEBPACK_IMPORTED_MODULE_0__.Round(game, savedRound.word, savedRound.randomWordLetters, savedRound.currentErrors);
      savedRound.pickedIndexes.forEach(index => newRound.pickedIndexes.add(index));
      newRound.abandoned = savedRound.abandoned;
      game.addRound(newRound);
    }
    game.currentRoundIndex = gameState.currentRoundIndex;
    if (game.currentRound().abandoned) {
      game.nextRound();
    }
  }
}

/***/ }),

/***/ "./src/logic/game/game.ts":
/*!********************************!*\
  !*** ./src/logic/game/game.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Game: () => (/* binding */ Game),
/* harmony export */   Round: () => (/* binding */ Round)
/* harmony export */ });
const MAX_ROUND_ERRORS = 3;
class Round {
  game;
  word;
  randomWordLetters;
  currentErrors;
  maxErrors = MAX_ROUND_ERRORS;
  pickedIndexes = new Set();
  abandoned = false;
  constructor(game, word, randomWordLetters) {
    let currentErrors = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    this.game = game;
    this.word = word;
    this.randomWordLetters = randomWordLetters;
    this.currentErrors = currentErrors;
  }
  visibleRandomLetters() {
    return this.randomWordLetters.map((letter, index) => ({
      letter,
      index
    })).filter(_ref => {
      let {
        index
      } = _ref;
      return !this.pickedIndexes.has(index);
    });
  }
  guess(randomLetterIndex) {
    if (this.abandoned) {
      return;
    }
    const guessedLetter = this.randomWordLetters[randomLetterIndex];
    const currentLetter = this.word[this.pickedIndexes.size];
    const guessedRight = guessedLetter === currentLetter;
    if (guessedRight) {
      this.acceptLetter(randomLetterIndex);
    } else {
      this.triggerMistake();
    }
    return guessedRight;
  }
  acceptLetter(randomLetterIndex) {
    this.pickedIndexes.add(randomLetterIndex);
    if (this.pickedIndexes.size >= this.word.length) {
      this.game.nextRound();
    }
  }
  triggerMistake() {
    this.currentErrors += 1;
    if (this.currentErrors >= this.maxErrors) {
      this.abandoned = true;
      this.game.surrender();
    }
  }
}
class Game {
  listeners;
  currentRoundIndex;
  rounds = [];
  constructor(listeners) {
    let currentRoundIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    this.listeners = listeners;
    this.currentRoundIndex = currentRoundIndex;
  }
  get gameStats() {
    const correctRounds = this.rounds.filter(r => r.currentErrors === 0);
    const errorAmount = this.rounds.reduce((sum, r) => {
      return sum + r.currentErrors;
    }, 0);
    const sortedByErrorsDesc = this.rounds.filter(r => r.currentErrors > 0).sort((a, b) => b.currentErrors - a.currentErrors);
    const worstWord = sortedByErrorsDesc[0]?.word ?? "";
    return {
      correctRounds: correctRounds.length,
      errorAmount,
      worstWord
    };
  }
  addRound(round) {
    this.rounds.push(round);
  }
  currentRound() {
    return this.rounds[this.currentRoundIndex];
  }
  guess(randomLetterIndex) {
    return this.currentRound()?.guess(randomLetterIndex);
  }
  surrender() {
    this.listeners.onSurrender(() => this.nextRound());
  }
  nextRound() {
    const nextRound = this.currentRoundIndex + 1;
    if (nextRound >= this.rounds.length) {
      this.listeners.onFinish(this.gameStats);
    } else {
      this.currentRoundIndex = nextRound;
    }
  }
}

/***/ }),

/***/ "./src/logic/letter-picker.ts":
/*!************************************!*\
  !*** ./src/logic/letter-picker.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LetterPicker: () => (/* binding */ LetterPicker)
/* harmony export */ });
class LetterPicker {
  randomizer;
  constructor(randomizer) {
    this.randomizer = randomizer;
  }
  randomize(word) {
    const letters = word.split("");
    const pickedIndexes = new Set();
    return letters.map(() => {
      const freshSet = letters.map((item, index) => ({
        item,
        index
      })).filter(_ref => {
        let {
          index
        } = _ref;
        return !pickedIndexes.has(index);
      });
      const {
        item,
        index
      } = this.randomizer.pick(freshSet);
      pickedIndexes.add(index);
      return item;
    });
  }
}

/***/ }),

/***/ "./src/logic/randomizer.ts":
/*!*********************************!*\
  !*** ./src/logic/randomizer.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Randomizer: () => (/* binding */ Randomizer)
/* harmony export */ });
class Randomizer {
  pick(collection) {
    const index = Math.floor(Math.random() * collection.length);
    return collection[index];
  }
}

/***/ }),

/***/ "./src/logic/word-picker.ts":
/*!**********************************!*\
  !*** ./src/logic/word-picker.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MAX_WORDS_IN_QUEUE: () => (/* binding */ MAX_WORDS_IN_QUEUE),
/* harmony export */   WORD_VARIANTS: () => (/* binding */ WORD_VARIANTS),
/* harmony export */   WordPicker: () => (/* binding */ WordPicker)
/* harmony export */ });
/* harmony import */ var _randomizer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./randomizer */ "./src/logic/randomizer.ts");

const WORD_VARIANTS = ["apple", "function", "timeout", "task", "application", "data", "tragedy", "sun", "symbol", "button", "software"];
const MAX_WORDS_IN_QUEUE = 6;
class WordPicker {
  randomizer;
  words;
  constructor(randomizer, words) {
    this.randomizer = randomizer;
    this.words = words;
  }
  getRandomWords(amount) {
    const pickedIndexes = new Set();
    const chosenWords = [];
    for (const _ of Array(amount).keys()) {
      const freshSet = this.words.map((item, index) => ({
        item,
        index
      })).filter(_ref => {
        let {
          index
        } = _ref;
        return !pickedIndexes.has(index);
      });
      const {
        index,
        item
      } = this.randomizer.pick(freshSet);
      pickedIndexes.add(index);
      chosenWords.push(item);
    }
    return chosenWords;
  }
  static pickRandomWords(amount) {
    const randomizer = new _randomizer__WEBPACK_IMPORTED_MODULE_0__.Randomizer();
    const wordPicker = new WordPicker(randomizer, WORD_VARIANTS);
    const wordCollection = wordPicker.getRandomWords(amount);
    return wordCollection;
  }
}

/***/ }),

/***/ "./src/renderer/component.ts":
/*!***********************************!*\
  !*** ./src/renderer/component.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createComponent: () => (/* binding */ createComponent)
/* harmony export */ });
function createComponent(fn) {
  return fn;
}

/***/ }),

/***/ "./src/renderer/el.ts":
/*!****************************!*\
  !*** ./src/renderer/el.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   El: () => (/* binding */ El)
/* harmony export */ });
class El {
  htmlEl;
  constructor(htmlEl) {
    this.htmlEl = htmlEl;
  }
  static new(tagName) {
    const el = document.createElement(tagName);
    return new El(el);
  }
  /** Static attribute bind */
  attr(attrName, attrValue) {
    this.htmlEl.setAttribute(attrName, attrValue);
    return this;
  }
  /** Reactive attribute bind */
  attrDyn(cx, attrName, attrValue) {
    cx.createEffect(() => {
      this.htmlEl.removeAttribute(attrName);
      const value = attrValue();
      if (typeof value === "boolean") {
        if (value) {
          this.htmlEl.setAttribute(attrName, "true");
        } else {
          this.htmlEl.removeAttribute(attrName);
        }
      } else {
        this.htmlEl.setAttribute(attrName, value);
      }
    });
    return this;
  }
  /** addEventListener */
  on(eventName, cb) {
    this.htmlEl.addEventListener(eventName, cb);
    return this;
  }
  /** Static render for text */
  text(data) {
    const node = document.createTextNode(data);
    this.htmlEl.appendChild(node);
    return this;
  }
  /** Reactive render for text */
  textDyn(cx, f) {
    const node = document.createTextNode("");
    this.htmlEl.appendChild(node);
    cx.createEffect(() => {
      node.textContent = f();
    });
    return this;
  }
  /** Render for child component */
  child(child) {
    this.htmlEl.appendChild(child.htmlEl);
    return this;
  }
  /** Static render for iterators */
  iter(itemsIter, mapper) {
    for (const item of itemsIter) {
      const el = mapper(item);
      this.htmlEl.appendChild(el.htmlEl);
    }
    return this;
  }
  /** Reactive render for iterators */
  iterDyn(cx, itemsIter, mapper) {
    const disposers = [];
    const iterEnd = document.createComment("iter end");
    this.htmlEl.appendChild(iterEnd);
    cx.createEffect(() => {
      for (const disposer of disposers) {
        disposer();
      }
      let index = 0;
      for (const item of itemsIter()) {
        const el = mapper(item, index++);
        this.htmlEl.insertBefore(el.htmlEl, iterEnd);
        disposers.push(() => el.htmlEl.remove());
      }
    });
    return this;
  }
}

/***/ }),

/***/ "./src/renderer/mount.ts":
/*!*******************************!*\
  !*** ./src/renderer/mount.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mount: () => (/* binding */ mount)
/* harmony export */ });
function mount(root, el) {
  root.replaceChildren(el.htmlEl);
}

/***/ }),

/***/ "./src/renderer/reactivity.ts":
/*!************************************!*\
  !*** ./src/renderer/reactivity.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Runtime: () => (/* binding */ Runtime),
/* harmony export */   Signal: () => (/* binding */ Signal)
/* harmony export */ });
/**
 * Signal that allows to subscribe inside effects on "get"
 * and notify subscribers on "set"
 */
class Signal {
  cx;
  id;
  constructor(cx, id) {
    this.cx = cx;
    this.id = id;
  }
  get() {
    if (this.cx.runningEffectId) {
      if (!this.cx.signalSubs.has(this.id)) {
        this.cx.signalSubs.set(this.id, new Set());
      }
      this.cx.signalSubs.get(this.id)?.add(this.cx.runningEffectId);
    }
    return this.cx.signalValues.get(this.id);
  }
  set(value) {
    this.cx.signalValues.set(this.id, value);
    const subIds = this.cx.signalSubs.get(this.id);
    if (subIds) {
      for (const subId of subIds) {
        this.cx.runEffect(subId);
      }
    }
    return value;
  }
  update(fn) {
    const value = fn(this.cx.signalValues.get(this.id));
    this.set(value);
    return value;
  }
}
/**
 * "Arena allocator" for reactive values and subscribers
 */
class Runtime {
  signalValues = new Map();
  runningEffectId;
  signalSubs = new Map();
  effects = new Map();
  constructor() {}
  createSignal(value) {
    const signalId = Symbol();
    this.signalValues.set(signalId, value);
    return new Signal(this, signalId);
  }
  createEffect(effect) {
    const effectId = Symbol();
    this.effects.set(effectId, effect);
    this.runEffect(effectId);
  }
  runEffect(effectId) {
    const prevEffectId = this.runningEffectId;
    this.runningEffectId = effectId;
    this.effects.get(effectId)?.();
    this.runningEffectId = prevEffectId;
  }
}

/***/ }),

/***/ "./src/ui/answer-panel.ts":
/*!********************************!*\
  !*** ./src/ui/answer-panel.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnswerPanel: () => (/* binding */ AnswerPanel)
/* harmony export */ });
/* harmony import */ var _renderer_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../renderer/component */ "./src/renderer/component.ts");
/* harmony import */ var _renderer_el__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../renderer/el */ "./src/renderer/el.ts");
/* harmony import */ var _letter_btn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./letter-btn */ "./src/ui/letter-btn.ts");



const AnswerPanel = (0,_renderer_component__WEBPACK_IMPORTED_MODULE_0__.createComponent)((cx, _ref) => {
  let {
    game
  } = _ref;
  const round = () => game.get().currentRound();
  return _renderer_el__WEBPACK_IMPORTED_MODULE_1__.El.new("div").attr("class", "d-flex justify-content-center").attr("style", "gap: 0.5em").iterDyn(cx, () => {
    const r = round();
    if (!r) {
      return [];
    }
    if (r.abandoned) {
      return r.word.split("");
    }
    return r.word.slice(0, r.pickedIndexes.size).split("");
  }, letter => {
    return (0,_letter_btn__WEBPACK_IMPORTED_MODULE_2__.LetterBtn)(cx, {
      letter,
      isInvalid: () => !!round()?.abandoned,
      pick: () => {}
    });
  });
});

/***/ }),

/***/ "./src/ui/letter-btn.ts":
/*!******************************!*\
  !*** ./src/ui/letter-btn.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LetterBtn: () => (/* binding */ LetterBtn)
/* harmony export */ });
/* harmony import */ var _renderer_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../renderer/component */ "./src/renderer/component.ts");
/* harmony import */ var _renderer_el__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../renderer/el */ "./src/renderer/el.ts");


const LetterBtn = (0,_renderer_component__WEBPACK_IMPORTED_MODULE_0__.createComponent)((cx, props) => {
  return _renderer_el__WEBPACK_IMPORTED_MODULE_1__.El.new("button").on("click", () => props.pick?.()).attr("type", "button").attrDyn(cx, "class", () => props.isInvalid?.() ? `btn btn-danger` : `btn btn-primary`).attr("style", "width: 2.5em; height: 2.5em").text(props.letter);
});

/***/ }),

/***/ "./src/ui/letter-panel.ts":
/*!********************************!*\
  !*** ./src/ui/letter-panel.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LetterPanel: () => (/* binding */ LetterPanel)
/* harmony export */ });
/* harmony import */ var _renderer_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../renderer/component */ "./src/renderer/component.ts");
/* harmony import */ var _renderer_el__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../renderer/el */ "./src/renderer/el.ts");
/* harmony import */ var _letter_btn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./letter-btn */ "./src/ui/letter-btn.ts");



const LetterPanel = (0,_renderer_component__WEBPACK_IMPORTED_MODULE_0__.createComponent)((cx, _ref) => {
  let {
    game
  } = _ref;
  window.addEventListener("keydown", e => {
    const char = e.code.slice(3).toLowerCase();
    const invalidIndexesInner = invalidIndexes.get();
    const round = game.get().currentRound();
    const found = round.visibleRandomLetters().find(_ref2 => {
      let {
        letter,
        index
      } = _ref2;
      const notInvalid = !invalidIndexesInner.has(index);
      return notInvalid && char === letter;
    });
    if (found) {
      pick(found.index);
    }
  });
  function pick(index) {
    const isValid = game.get().guess(index);
    game.set(game.get());
    if (!isValid) {
      triggerInvalidIndex(index);
    }
  }
  const invalidIndexes = cx.createSignal(new Set());
  function triggerInvalidIndex(index) {
    invalidIndexes.update(ii => {
      ii.add(index);
      return ii;
    });
    setTimeout(() => {
      invalidIndexes.update(ii => {
        ii.delete(index);
        return ii;
      });
    }, 200);
  }
  return _renderer_el__WEBPACK_IMPORTED_MODULE_1__.El.new("div").attr("class", "d-flex justify-content-center").attr("style", "gap: 0.5em").iterDyn(cx, () => game.get().currentRound()?.visibleRandomLetters() ?? [], _ref3 => {
    let {
      letter,
      index
    } = _ref3;
    return (0,_letter_btn__WEBPACK_IMPORTED_MODULE_2__.LetterBtn)(cx, {
      letter,
      isInvalid: () => invalidIndexes.get().has(index),
      pick: () => pick(index)
    });
  });
});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		try {
/******/ 			var execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
/******/ 			__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
/******/ 			module = execOptions.module;
/******/ 			execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
/******/ 		} catch(e) {
/******/ 			module.error = e;
/******/ 			throw e;
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/******/ 	// expose the module execution interceptor
/******/ 	__webpack_require__.i = [];
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript update chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.hu = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + "." + __webpack_require__.h() + ".hot-update.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get update manifest filename */
/******/ 	(() => {
/******/ 		__webpack_require__.hmrF = () => ("main." + __webpack_require__.h() + ".hot-update.json");
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	(() => {
/******/ 		__webpack_require__.h = () => ("8112a8b28db1ef1d6be2")
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "fundraiseup-test:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hot module replacement */
/******/ 	(() => {
/******/ 		var currentModuleData = {};
/******/ 		var installedModules = __webpack_require__.c;
/******/ 		
/******/ 		// module and require creation
/******/ 		var currentChildModule;
/******/ 		var currentParents = [];
/******/ 		
/******/ 		// status
/******/ 		var registeredStatusHandlers = [];
/******/ 		var currentStatus = "idle";
/******/ 		
/******/ 		// while downloading
/******/ 		var blockingPromises = 0;
/******/ 		var blockingPromisesWaiting = [];
/******/ 		
/******/ 		// The update info
/******/ 		var currentUpdateApplyHandlers;
/******/ 		var queuedInvalidatedModules;
/******/ 		
/******/ 		// eslint-disable-next-line no-unused-vars
/******/ 		__webpack_require__.hmrD = currentModuleData;
/******/ 		
/******/ 		__webpack_require__.i.push(function (options) {
/******/ 			var module = options.module;
/******/ 			var require = createRequire(options.require, options.id);
/******/ 			module.hot = createModuleHotObject(options.id, module);
/******/ 			module.parents = currentParents;
/******/ 			module.children = [];
/******/ 			currentParents = [];
/******/ 			options.require = require;
/******/ 		});
/******/ 		
/******/ 		__webpack_require__.hmrC = {};
/******/ 		__webpack_require__.hmrI = {};
/******/ 		
/******/ 		function createRequire(require, moduleId) {
/******/ 			var me = installedModules[moduleId];
/******/ 			if (!me) return require;
/******/ 			var fn = function (request) {
/******/ 				if (me.hot.active) {
/******/ 					if (installedModules[request]) {
/******/ 						var parents = installedModules[request].parents;
/******/ 						if (parents.indexOf(moduleId) === -1) {
/******/ 							parents.push(moduleId);
/******/ 						}
/******/ 					} else {
/******/ 						currentParents = [moduleId];
/******/ 						currentChildModule = request;
/******/ 					}
/******/ 					if (me.children.indexOf(request) === -1) {
/******/ 						me.children.push(request);
/******/ 					}
/******/ 				} else {
/******/ 					console.warn(
/******/ 						"[HMR] unexpected require(" +
/******/ 							request +
/******/ 							") from disposed module " +
/******/ 							moduleId
/******/ 					);
/******/ 					currentParents = [];
/******/ 				}
/******/ 				return require(request);
/******/ 			};
/******/ 			var createPropertyDescriptor = function (name) {
/******/ 				return {
/******/ 					configurable: true,
/******/ 					enumerable: true,
/******/ 					get: function () {
/******/ 						return require[name];
/******/ 					},
/******/ 					set: function (value) {
/******/ 						require[name] = value;
/******/ 					}
/******/ 				};
/******/ 			};
/******/ 			for (var name in require) {
/******/ 				if (Object.prototype.hasOwnProperty.call(require, name) && name !== "e") {
/******/ 					Object.defineProperty(fn, name, createPropertyDescriptor(name));
/******/ 				}
/******/ 			}
/******/ 			fn.e = function (chunkId) {
/******/ 				return trackBlockingPromise(require.e(chunkId));
/******/ 			};
/******/ 			return fn;
/******/ 		}
/******/ 		
/******/ 		function createModuleHotObject(moduleId, me) {
/******/ 			var _main = currentChildModule !== moduleId;
/******/ 			var hot = {
/******/ 				// private stuff
/******/ 				_acceptedDependencies: {},
/******/ 				_acceptedErrorHandlers: {},
/******/ 				_declinedDependencies: {},
/******/ 				_selfAccepted: false,
/******/ 				_selfDeclined: false,
/******/ 				_selfInvalidated: false,
/******/ 				_disposeHandlers: [],
/******/ 				_main: _main,
/******/ 				_requireSelf: function () {
/******/ 					currentParents = me.parents.slice();
/******/ 					currentChildModule = _main ? undefined : moduleId;
/******/ 					__webpack_require__(moduleId);
/******/ 				},
/******/ 		
/******/ 				// Module API
/******/ 				active: true,
/******/ 				accept: function (dep, callback, errorHandler) {
/******/ 					if (dep === undefined) hot._selfAccepted = true;
/******/ 					else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 					else if (typeof dep === "object" && dep !== null) {
/******/ 						for (var i = 0; i < dep.length; i++) {
/******/ 							hot._acceptedDependencies[dep[i]] = callback || function () {};
/******/ 							hot._acceptedErrorHandlers[dep[i]] = errorHandler;
/******/ 						}
/******/ 					} else {
/******/ 						hot._acceptedDependencies[dep] = callback || function () {};
/******/ 						hot._acceptedErrorHandlers[dep] = errorHandler;
/******/ 					}
/******/ 				},
/******/ 				decline: function (dep) {
/******/ 					if (dep === undefined) hot._selfDeclined = true;
/******/ 					else if (typeof dep === "object" && dep !== null)
/******/ 						for (var i = 0; i < dep.length; i++)
/******/ 							hot._declinedDependencies[dep[i]] = true;
/******/ 					else hot._declinedDependencies[dep] = true;
/******/ 				},
/******/ 				dispose: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				addDisposeHandler: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				removeDisposeHandler: function (callback) {
/******/ 					var idx = hot._disposeHandlers.indexOf(callback);
/******/ 					if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 				},
/******/ 				invalidate: function () {
/******/ 					this._selfInvalidated = true;
/******/ 					switch (currentStatus) {
/******/ 						case "idle":
/******/ 							currentUpdateApplyHandlers = [];
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							setStatus("ready");
/******/ 							break;
/******/ 						case "ready":
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							break;
/******/ 						case "prepare":
/******/ 						case "check":
/******/ 						case "dispose":
/******/ 						case "apply":
/******/ 							(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
/******/ 								moduleId
/******/ 							);
/******/ 							break;
/******/ 						default:
/******/ 							// ignore requests in error states
/******/ 							break;
/******/ 					}
/******/ 				},
/******/ 		
/******/ 				// Management API
/******/ 				check: hotCheck,
/******/ 				apply: hotApply,
/******/ 				status: function (l) {
/******/ 					if (!l) return currentStatus;
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				addStatusHandler: function (l) {
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				removeStatusHandler: function (l) {
/******/ 					var idx = registeredStatusHandlers.indexOf(l);
/******/ 					if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
/******/ 				},
/******/ 		
/******/ 				//inherit from previous dispose call
/******/ 				data: currentModuleData[moduleId]
/******/ 			};
/******/ 			currentChildModule = undefined;
/******/ 			return hot;
/******/ 		}
/******/ 		
/******/ 		function setStatus(newStatus) {
/******/ 			currentStatus = newStatus;
/******/ 			var results = [];
/******/ 		
/******/ 			for (var i = 0; i < registeredStatusHandlers.length; i++)
/******/ 				results[i] = registeredStatusHandlers[i].call(null, newStatus);
/******/ 		
/******/ 			return Promise.all(results);
/******/ 		}
/******/ 		
/******/ 		function unblock() {
/******/ 			if (--blockingPromises === 0) {
/******/ 				setStatus("ready").then(function () {
/******/ 					if (blockingPromises === 0) {
/******/ 						var list = blockingPromisesWaiting;
/******/ 						blockingPromisesWaiting = [];
/******/ 						for (var i = 0; i < list.length; i++) {
/******/ 							list[i]();
/******/ 						}
/******/ 					}
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function trackBlockingPromise(promise) {
/******/ 			switch (currentStatus) {
/******/ 				case "ready":
/******/ 					setStatus("prepare");
/******/ 				/* fallthrough */
/******/ 				case "prepare":
/******/ 					blockingPromises++;
/******/ 					promise.then(unblock, unblock);
/******/ 					return promise;
/******/ 				default:
/******/ 					return promise;
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function waitForBlockingPromises(fn) {
/******/ 			if (blockingPromises === 0) return fn();
/******/ 			return new Promise(function (resolve) {
/******/ 				blockingPromisesWaiting.push(function () {
/******/ 					resolve(fn());
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function hotCheck(applyOnUpdate) {
/******/ 			if (currentStatus !== "idle") {
/******/ 				throw new Error("check() is only allowed in idle status");
/******/ 			}
/******/ 			return setStatus("check")
/******/ 				.then(__webpack_require__.hmrM)
/******/ 				.then(function (update) {
/******/ 					if (!update) {
/******/ 						return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
/******/ 							function () {
/******/ 								return null;
/******/ 							}
/******/ 						);
/******/ 					}
/******/ 		
/******/ 					return setStatus("prepare").then(function () {
/******/ 						var updatedModules = [];
/******/ 						currentUpdateApplyHandlers = [];
/******/ 		
/******/ 						return Promise.all(
/******/ 							Object.keys(__webpack_require__.hmrC).reduce(function (
/******/ 								promises,
/******/ 								key
/******/ 							) {
/******/ 								__webpack_require__.hmrC[key](
/******/ 									update.c,
/******/ 									update.r,
/******/ 									update.m,
/******/ 									promises,
/******/ 									currentUpdateApplyHandlers,
/******/ 									updatedModules
/******/ 								);
/******/ 								return promises;
/******/ 							},
/******/ 							[])
/******/ 						).then(function () {
/******/ 							return waitForBlockingPromises(function () {
/******/ 								if (applyOnUpdate) {
/******/ 									return internalApply(applyOnUpdate);
/******/ 								} else {
/******/ 									return setStatus("ready").then(function () {
/******/ 										return updatedModules;
/******/ 									});
/******/ 								}
/******/ 							});
/******/ 						});
/******/ 					});
/******/ 				});
/******/ 		}
/******/ 		
/******/ 		function hotApply(options) {
/******/ 			if (currentStatus !== "ready") {
/******/ 				return Promise.resolve().then(function () {
/******/ 					throw new Error(
/******/ 						"apply() is only allowed in ready status (state: " +
/******/ 							currentStatus +
/******/ 							")"
/******/ 					);
/******/ 				});
/******/ 			}
/******/ 			return internalApply(options);
/******/ 		}
/******/ 		
/******/ 		function internalApply(options) {
/******/ 			options = options || {};
/******/ 		
/******/ 			applyInvalidatedModules();
/******/ 		
/******/ 			var results = currentUpdateApplyHandlers.map(function (handler) {
/******/ 				return handler(options);
/******/ 			});
/******/ 			currentUpdateApplyHandlers = undefined;
/******/ 		
/******/ 			var errors = results
/******/ 				.map(function (r) {
/******/ 					return r.error;
/******/ 				})
/******/ 				.filter(Boolean);
/******/ 		
/******/ 			if (errors.length > 0) {
/******/ 				return setStatus("abort").then(function () {
/******/ 					throw errors[0];
/******/ 				});
/******/ 			}
/******/ 		
/******/ 			// Now in "dispose" phase
/******/ 			var disposePromise = setStatus("dispose");
/******/ 		
/******/ 			results.forEach(function (result) {
/******/ 				if (result.dispose) result.dispose();
/******/ 			});
/******/ 		
/******/ 			// Now in "apply" phase
/******/ 			var applyPromise = setStatus("apply");
/******/ 		
/******/ 			var error;
/******/ 			var reportError = function (err) {
/******/ 				if (!error) error = err;
/******/ 			};
/******/ 		
/******/ 			var outdatedModules = [];
/******/ 			results.forEach(function (result) {
/******/ 				if (result.apply) {
/******/ 					var modules = result.apply(reportError);
/******/ 					if (modules) {
/******/ 						for (var i = 0; i < modules.length; i++) {
/******/ 							outdatedModules.push(modules[i]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		
/******/ 			return Promise.all([disposePromise, applyPromise]).then(function () {
/******/ 				// handle errors in accept handlers and self accepted module load
/******/ 				if (error) {
/******/ 					return setStatus("fail").then(function () {
/******/ 						throw error;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				if (queuedInvalidatedModules) {
/******/ 					return internalApply(options).then(function (list) {
/******/ 						outdatedModules.forEach(function (moduleId) {
/******/ 							if (list.indexOf(moduleId) < 0) list.push(moduleId);
/******/ 						});
/******/ 						return list;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				return setStatus("idle").then(function () {
/******/ 					return outdatedModules;
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function applyInvalidatedModules() {
/******/ 			if (queuedInvalidatedModules) {
/******/ 				if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
/******/ 				Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 					queuedInvalidatedModules.forEach(function (moduleId) {
/******/ 						__webpack_require__.hmrI[key](
/******/ 							moduleId,
/******/ 							currentUpdateApplyHandlers
/******/ 						);
/******/ 					});
/******/ 				});
/******/ 				queuedInvalidatedModules = undefined;
/******/ 				return true;
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = __webpack_require__.hmrS_jsonp = __webpack_require__.hmrS_jsonp || {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		var currentUpdatedModulesList;
/******/ 		var waitingUpdateResolves = {};
/******/ 		function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 			currentUpdatedModulesList = updatedModulesList;
/******/ 			return new Promise((resolve, reject) => {
/******/ 				waitingUpdateResolves[chunkId] = resolve;
/******/ 				// start update chunk loading
/******/ 				var url = __webpack_require__.p + __webpack_require__.hu(chunkId);
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				var loadingEnded = (event) => {
/******/ 					if(waitingUpdateResolves[chunkId]) {
/******/ 						waitingUpdateResolves[chunkId] = undefined
/******/ 						var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 						var realSrc = event && event.target && event.target.src;
/******/ 						error.message = 'Loading hot update chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 						error.name = 'ChunkLoadError';
/******/ 						error.type = errorType;
/******/ 						error.request = realSrc;
/******/ 						reject(error);
/******/ 					}
/******/ 				};
/******/ 				__webpack_require__.l(url, loadingEnded);
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		self["webpackHotUpdatefundraiseup_test"] = (chunkId, moreModules, runtime) => {
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					currentUpdate[moduleId] = moreModules[moduleId];
/******/ 					if(currentUpdatedModulesList) currentUpdatedModulesList.push(moduleId);
/******/ 				}
/******/ 			}
/******/ 			if(runtime) currentUpdateRuntime.push(runtime);
/******/ 			if(waitingUpdateResolves[chunkId]) {
/******/ 				waitingUpdateResolves[chunkId]();
/******/ 				waitingUpdateResolves[chunkId] = undefined;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var currentUpdateChunks;
/******/ 		var currentUpdate;
/******/ 		var currentUpdateRemovedChunks;
/******/ 		var currentUpdateRuntime;
/******/ 		function applyHandler(options) {
/******/ 			if (__webpack_require__.f) delete __webpack_require__.f.jsonpHmr;
/******/ 			currentUpdateChunks = undefined;
/******/ 			function getAffectedModuleEffects(updateModuleId) {
/******/ 				var outdatedModules = [updateModuleId];
/******/ 				var outdatedDependencies = {};
/******/ 		
/******/ 				var queue = outdatedModules.map(function (id) {
/******/ 					return {
/******/ 						chain: [id],
/******/ 						id: id
/******/ 					};
/******/ 				});
/******/ 				while (queue.length > 0) {
/******/ 					var queueItem = queue.pop();
/******/ 					var moduleId = queueItem.id;
/******/ 					var chain = queueItem.chain;
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (
/******/ 						!module ||
/******/ 						(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 					)
/******/ 						continue;
/******/ 					if (module.hot._selfDeclined) {
/******/ 						return {
/******/ 							type: "self-declined",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					if (module.hot._main) {
/******/ 						return {
/******/ 							type: "unaccepted",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					for (var i = 0; i < module.parents.length; i++) {
/******/ 						var parentId = module.parents[i];
/******/ 						var parent = __webpack_require__.c[parentId];
/******/ 						if (!parent) continue;
/******/ 						if (parent.hot._declinedDependencies[moduleId]) {
/******/ 							return {
/******/ 								type: "declined",
/******/ 								chain: chain.concat([parentId]),
/******/ 								moduleId: moduleId,
/******/ 								parentId: parentId
/******/ 							};
/******/ 						}
/******/ 						if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 						if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 							if (!outdatedDependencies[parentId])
/******/ 								outdatedDependencies[parentId] = [];
/******/ 							addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 							continue;
/******/ 						}
/******/ 						delete outdatedDependencies[parentId];
/******/ 						outdatedModules.push(parentId);
/******/ 						queue.push({
/******/ 							chain: chain.concat([parentId]),
/******/ 							id: parentId
/******/ 						});
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				return {
/******/ 					type: "accepted",
/******/ 					moduleId: updateModuleId,
/******/ 					outdatedModules: outdatedModules,
/******/ 					outdatedDependencies: outdatedDependencies
/******/ 				};
/******/ 			}
/******/ 		
/******/ 			function addAllToSet(a, b) {
/******/ 				for (var i = 0; i < b.length; i++) {
/******/ 					var item = b[i];
/******/ 					if (a.indexOf(item) === -1) a.push(item);
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			// at begin all updates modules are outdated
/******/ 			// the "outdated" status can propagate to parents if they don't accept the children
/******/ 			var outdatedDependencies = {};
/******/ 			var outdatedModules = [];
/******/ 			var appliedUpdate = {};
/******/ 		
/******/ 			var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 				);
/******/ 			};
/******/ 		
/******/ 			for (var moduleId in currentUpdate) {
/******/ 				if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 					var newModuleFactory = currentUpdate[moduleId];
/******/ 					/** @type {TODO} */
/******/ 					var result;
/******/ 					if (newModuleFactory) {
/******/ 						result = getAffectedModuleEffects(moduleId);
/******/ 					} else {
/******/ 						result = {
/******/ 							type: "disposed",
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					/** @type {Error|false} */
/******/ 					var abortError = false;
/******/ 					var doApply = false;
/******/ 					var doDispose = false;
/******/ 					var chainInfo = "";
/******/ 					if (result.chain) {
/******/ 						chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 					}
/******/ 					switch (result.type) {
/******/ 						case "self-declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of self decline: " +
/******/ 										result.moduleId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of declined dependency: " +
/******/ 										result.moduleId +
/******/ 										" in " +
/******/ 										result.parentId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "unaccepted":
/******/ 							if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 							if (!options.ignoreUnaccepted)
/******/ 								abortError = new Error(
/******/ 									"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "accepted":
/******/ 							if (options.onAccepted) options.onAccepted(result);
/******/ 							doApply = true;
/******/ 							break;
/******/ 						case "disposed":
/******/ 							if (options.onDisposed) options.onDisposed(result);
/******/ 							doDispose = true;
/******/ 							break;
/******/ 						default:
/******/ 							throw new Error("Unexception type " + result.type);
/******/ 					}
/******/ 					if (abortError) {
/******/ 						return {
/******/ 							error: abortError
/******/ 						};
/******/ 					}
/******/ 					if (doApply) {
/******/ 						appliedUpdate[moduleId] = newModuleFactory;
/******/ 						addAllToSet(outdatedModules, result.outdatedModules);
/******/ 						for (moduleId in result.outdatedDependencies) {
/******/ 							if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
/******/ 								if (!outdatedDependencies[moduleId])
/******/ 									outdatedDependencies[moduleId] = [];
/******/ 								addAllToSet(
/******/ 									outdatedDependencies[moduleId],
/******/ 									result.outdatedDependencies[moduleId]
/******/ 								);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 					if (doDispose) {
/******/ 						addAllToSet(outdatedModules, [result.moduleId]);
/******/ 						appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 			currentUpdate = undefined;
/******/ 		
/******/ 			// Store self accepted outdated modules to require them later by the module system
/******/ 			var outdatedSelfAcceptedModules = [];
/******/ 			for (var j = 0; j < outdatedModules.length; j++) {
/******/ 				var outdatedModuleId = outdatedModules[j];
/******/ 				var module = __webpack_require__.c[outdatedModuleId];
/******/ 				if (
/******/ 					module &&
/******/ 					(module.hot._selfAccepted || module.hot._main) &&
/******/ 					// removed self-accepted modules should not be required
/******/ 					appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 					// when called invalidate self-accepting is not possible
/******/ 					!module.hot._selfInvalidated
/******/ 				) {
/******/ 					outdatedSelfAcceptedModules.push({
/******/ 						module: outdatedModuleId,
/******/ 						require: module.hot._requireSelf,
/******/ 						errorHandler: module.hot._selfAccepted
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			var moduleOutdatedDependencies;
/******/ 		
/******/ 			return {
/******/ 				dispose: function () {
/******/ 					currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 						delete installedChunks[chunkId];
/******/ 					});
/******/ 					currentUpdateRemovedChunks = undefined;
/******/ 		
/******/ 					var idx;
/******/ 					var queue = outdatedModules.slice();
/******/ 					while (queue.length > 0) {
/******/ 						var moduleId = queue.pop();
/******/ 						var module = __webpack_require__.c[moduleId];
/******/ 						if (!module) continue;
/******/ 		
/******/ 						var data = {};
/******/ 		
/******/ 						// Call dispose handlers
/******/ 						var disposeHandlers = module.hot._disposeHandlers;
/******/ 						for (j = 0; j < disposeHandlers.length; j++) {
/******/ 							disposeHandlers[j].call(null, data);
/******/ 						}
/******/ 						__webpack_require__.hmrD[moduleId] = data;
/******/ 		
/******/ 						// disable module (this disables requires from this module)
/******/ 						module.hot.active = false;
/******/ 		
/******/ 						// remove module from cache
/******/ 						delete __webpack_require__.c[moduleId];
/******/ 		
/******/ 						// when disposing there is no need to call dispose handler
/******/ 						delete outdatedDependencies[moduleId];
/******/ 		
/******/ 						// remove "parents" references from all children
/******/ 						for (j = 0; j < module.children.length; j++) {
/******/ 							var child = __webpack_require__.c[module.children[j]];
/******/ 							if (!child) continue;
/******/ 							idx = child.parents.indexOf(moduleId);
/******/ 							if (idx >= 0) {
/******/ 								child.parents.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// remove outdated dependency from module children
/******/ 					var dependency;
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									dependency = moduleOutdatedDependencies[j];
/******/ 									idx = module.children.indexOf(dependency);
/******/ 									if (idx >= 0) module.children.splice(idx, 1);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				},
/******/ 				apply: function (reportError) {
/******/ 					// insert new code
/******/ 					for (var updateModuleId in appliedUpdate) {
/******/ 						if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 							__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// run new runtime modules
/******/ 					for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 						currentUpdateRuntime[i](__webpack_require__);
/******/ 					}
/******/ 		
/******/ 					// call accept handlers
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							var module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								var callbacks = [];
/******/ 								var errorHandlers = [];
/******/ 								var dependenciesForCallbacks = [];
/******/ 								for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									var dependency = moduleOutdatedDependencies[j];
/******/ 									var acceptCallback =
/******/ 										module.hot._acceptedDependencies[dependency];
/******/ 									var errorHandler =
/******/ 										module.hot._acceptedErrorHandlers[dependency];
/******/ 									if (acceptCallback) {
/******/ 										if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 										callbacks.push(acceptCallback);
/******/ 										errorHandlers.push(errorHandler);
/******/ 										dependenciesForCallbacks.push(dependency);
/******/ 									}
/******/ 								}
/******/ 								for (var k = 0; k < callbacks.length; k++) {
/******/ 									try {
/******/ 										callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 									} catch (err) {
/******/ 										if (typeof errorHandlers[k] === "function") {
/******/ 											try {
/******/ 												errorHandlers[k](err, {
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k]
/******/ 												});
/******/ 											} catch (err2) {
/******/ 												if (options.onErrored) {
/******/ 													options.onErrored({
/******/ 														type: "accept-error-handler-errored",
/******/ 														moduleId: outdatedModuleId,
/******/ 														dependencyId: dependenciesForCallbacks[k],
/******/ 														error: err2,
/******/ 														originalError: err
/******/ 													});
/******/ 												}
/******/ 												if (!options.ignoreErrored) {
/******/ 													reportError(err2);
/******/ 													reportError(err);
/******/ 												}
/******/ 											}
/******/ 										} else {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// Load self accepted modules
/******/ 					for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 						var item = outdatedSelfAcceptedModules[o];
/******/ 						var moduleId = item.module;
/******/ 						try {
/******/ 							item.require(moduleId);
/******/ 						} catch (err) {
/******/ 							if (typeof item.errorHandler === "function") {
/******/ 								try {
/******/ 									item.errorHandler(err, {
/******/ 										moduleId: moduleId,
/******/ 										module: __webpack_require__.c[moduleId]
/******/ 									});
/******/ 								} catch (err2) {
/******/ 									if (options.onErrored) {
/******/ 										options.onErrored({
/******/ 											type: "self-accept-error-handler-errored",
/******/ 											moduleId: moduleId,
/******/ 											error: err2,
/******/ 											originalError: err
/******/ 										});
/******/ 									}
/******/ 									if (!options.ignoreErrored) {
/******/ 										reportError(err2);
/******/ 										reportError(err);
/******/ 									}
/******/ 								}
/******/ 							} else {
/******/ 								if (options.onErrored) {
/******/ 									options.onErrored({
/******/ 										type: "self-accept-errored",
/******/ 										moduleId: moduleId,
/******/ 										error: err
/******/ 									});
/******/ 								}
/******/ 								if (!options.ignoreErrored) {
/******/ 									reportError(err);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					return outdatedModules;
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 		__webpack_require__.hmrI.jsonp = function (moduleId, applyHandlers) {
/******/ 			if (!currentUpdate) {
/******/ 				currentUpdate = {};
/******/ 				currentUpdateRuntime = [];
/******/ 				currentUpdateRemovedChunks = [];
/******/ 				applyHandlers.push(applyHandler);
/******/ 			}
/******/ 			if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 			}
/******/ 		};
/******/ 		__webpack_require__.hmrC.jsonp = function (
/******/ 			chunkIds,
/******/ 			removedChunks,
/******/ 			removedModules,
/******/ 			promises,
/******/ 			applyHandlers,
/******/ 			updatedModulesList
/******/ 		) {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			currentUpdateChunks = {};
/******/ 			currentUpdateRemovedChunks = removedChunks;
/******/ 			currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 				obj[key] = false;
/******/ 				return obj;
/******/ 			}, {});
/******/ 			currentUpdateRuntime = [];
/******/ 			chunkIds.forEach(function (chunkId) {
/******/ 				if (
/******/ 					__webpack_require__.o(installedChunks, chunkId) &&
/******/ 					installedChunks[chunkId] !== undefined
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				} else {
/******/ 					currentUpdateChunks[chunkId] = false;
/******/ 				}
/******/ 			});
/******/ 			if (__webpack_require__.f) {
/******/ 				__webpack_require__.f.jsonpHmr = function (chunkId, promises) {
/******/ 					if (
/******/ 						currentUpdateChunks &&
/******/ 						__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 						!currentUpdateChunks[chunkId]
/******/ 					) {
/******/ 						promises.push(loadUpdateChunk(chunkId));
/******/ 						currentUpdateChunks[chunkId] = true;
/******/ 					}
/******/ 				};
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.hmrM = () => {
/******/ 			if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
/******/ 			return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
/******/ 				if(response.status === 404) return; // no update available
/******/ 				if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
/******/ 				return response.json();
/******/ 			});
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBZ0Q7QUFDUDtBQUNPO0FBQ0E7QUFDUTtBQUNKO0FBQ2pCO0FBRW5DLFNBQVNPLElBQUlBLENBQUE7RUFDWCxNQUFNQyxFQUFFLEdBQUcsSUFBSU4seURBQU8sRUFBRTtFQUV4QixNQUFNTyxTQUFTLEdBQUdMLHFFQUFXLENBQUM7SUFDNUJNLE9BQU8sRUFBRUwsNkRBQVMsQ0FBQ00sZUFBZSxFQUFFO0lBQ3BDQyxTQUFTLEVBQUU7TUFDVEMsUUFBUUEsQ0FBQ0MsSUFBSTtRQUNYQyxLQUFLLENBQUNDLElBQUksQ0FBQ0MsU0FBUyxDQUFDSCxJQUFJLENBQUMsQ0FBQztNQUM3QixDQUFDO01BQ0RJLFdBQVdBLENBQUNDLElBQUk7UUFDZEMsVUFBVSxDQUFDLE1BQUs7VUFDZEQsSUFBSSxFQUFFO1VBQ047VUFDQUUsSUFBSSxDQUFDQyxNQUFNLENBQUVDLENBQUMsSUFBS0EsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDVjs7R0FFSCxDQUFDO0VBQ0YsTUFBTUYsSUFBSSxHQUFHYixFQUFFLENBQUNnQixZQUFZLENBQUNmLFNBQVMsQ0FBQztFQUV2Q0QsRUFBRSxDQUFDaUIsWUFBWSxDQUFDLE1BQUs7SUFDbkJwQiw2REFBUyxDQUFDcUIsSUFBSSxDQUFDTCxJQUFJLENBQUNNLEdBQUcsRUFBRSxDQUFDO0VBQzVCLENBQUMsQ0FBQztFQUVGMUIsc0RBQUssQ0FBQzJCLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLFNBQVMsQ0FBRSxFQUFFN0IsNkRBQVcsQ0FBQ1EsRUFBRSxFQUFFO0lBQUVhO0VBQUksQ0FBRSxDQUFDLENBQUM7RUFDcEVwQixzREFBSyxDQUFDMkIsUUFBUSxDQUFDQyxhQUFhLENBQUMsVUFBVSxDQUFFLEVBQUUxQiw2REFBVyxDQUFDSyxFQUFFLEVBQUU7SUFBRWE7RUFBSSxDQUFFLENBQUMsQ0FBQztFQUVyRXBCLHNEQUFLLENBQ0gyQixRQUFRLENBQUNDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBRSxFQUM1Q3ZCLDRDQUFFLENBQUN3QixHQUFHLENBQUMsTUFBTSxDQUFDLENBQUNDLE9BQU8sQ0FBQ3ZCLEVBQUUsRUFBRSxNQUN6QixDQUFDYSxJQUFJLENBQUNNLEdBQUcsRUFBRSxDQUFDSyxpQkFBaUIsR0FBRyxDQUFDLEVBQUVDLFFBQVEsRUFBRSxDQUM5QyxDQUNGO0VBQ0RoQyxzREFBSyxDQUNIMkIsUUFBUSxDQUFDQyxhQUFhLENBQUMsa0JBQWtCLENBQUUsRUFDM0N2Qiw0Q0FBRSxDQUFDd0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDQyxPQUFPLENBQUN2QixFQUFFLEVBQUUsTUFBTWEsSUFBSSxDQUFDTSxHQUFHLEVBQUUsQ0FBQ08sTUFBTSxDQUFDQyxNQUFNLENBQUNGLFFBQVEsRUFBRSxDQUFDLENBQ3RFO0FBQ0g7QUFFQTFCLElBQUksRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9DMkM7QUFDRDtBQUNMO0FBQ3FCO0FBQ3ZCO0FBRW5DLFNBQVVILFdBQVdBLENBQUNzQyxPQU0zQjtFQUNDLE1BQU1yQixJQUFJLEdBQUcsSUFBSWUsdUNBQUksQ0FBQ00sT0FBTyxDQUFDOUIsU0FBUyxDQUFDO0VBRXhDLElBQUk4QixPQUFPLENBQUNoQyxPQUFPLEVBQUU7SUFDbkJMLGtEQUFTLENBQUNLLE9BQU8sQ0FBQ1csSUFBSSxDQUFDO0dBQ3hCLE1BQU07SUFDTG9CLG9EQUFVLENBQUNFLGVBQWUsQ0FBQ0gsNERBQWtCLENBQUMsQ0FBQ0ksT0FBTyxDQUFFQyxJQUFJLElBQUk7TUFDOUQsTUFBTUMsVUFBVSxHQUFHLElBQUlQLG1EQUFVLEVBQUU7TUFDbkMsTUFBTVEsWUFBWSxHQUFHLElBQUlULHdEQUFZLENBQUNRLFVBQVUsQ0FBQztNQUNqRCxNQUFNRSxpQkFBaUIsR0FBR0QsWUFBWSxDQUFDRSxTQUFTLENBQUNKLElBQUksQ0FBQztNQUV0RCxNQUFNSyxLQUFLLEdBQUcsSUFBSWIsd0NBQUssQ0FBQ2hCLElBQUksRUFBRXdCLElBQUksRUFBRUcsaUJBQWlCLENBQUM7TUFDdEQzQixJQUFJLENBQUM4QixRQUFRLENBQUNELEtBQUssQ0FBQztJQUN0QixDQUFDLENBQUM7O0VBRUosT0FBTzdCLElBQUk7QUFDYjs7Ozs7Ozs7Ozs7Ozs7O0FDNUJxQztBQUVyQyxNQUFNK0IsR0FBRyxHQUFHLGtCQUFrQjtBQWF4QixNQUFPL0MsU0FBUztFQUNwQmdELFlBQUEsR0FBZTtFQUVmLE9BQU8xQyxlQUFlQSxDQUFBO0lBQ3BCLElBQUk7TUFDRixNQUFNMkMsVUFBVSxHQUFHdEMsSUFBSSxDQUFDdUMsS0FBSyxDQUFDQyxZQUFZLENBQUNDLE9BQU8sQ0FBQ0wsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO01BQzlELE9BQ0UsT0FBT0UsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEtBQUssUUFBUSxJQUNuREksT0FBTyxDQUFDLHVCQUF1QixDQUFDO0tBRW5DLENBQUMsT0FBT0MsQ0FBQyxFQUFFO01BQ1YsT0FBTyxLQUFLOztFQUVoQjtFQUVBLE9BQU9qQyxJQUFJQSxDQUFDTCxJQUFVO0lBQ3BCLE1BQU11QyxTQUFTLEdBQWM7TUFDM0I1QixpQkFBaUIsRUFBRVgsSUFBSSxDQUFDVyxpQkFBaUI7TUFDekNFLE1BQU0sRUFBRWIsSUFBSSxDQUFDYSxNQUFNLENBQUMyQixHQUFHLENBQUVDLENBQUMsS0FBTTtRQUM5QmpCLElBQUksRUFBRWlCLENBQUMsQ0FBQ2pCLElBQUk7UUFDWmtCLGFBQWEsRUFBRUQsQ0FBQyxDQUFDQyxhQUFhO1FBQzlCQyxhQUFhLEVBQUVDLEtBQUssQ0FBQ0MsSUFBSSxDQUFDSixDQUFDLENBQUNFLGFBQWEsQ0FBQ0csTUFBTSxFQUFFLENBQUM7UUFDbkRDLFNBQVMsRUFBRU4sQ0FBQyxDQUFDTSxTQUFTO1FBQ3RCcEIsaUJBQWlCLEVBQUVjLENBQUMsQ0FBQ2Q7T0FDdEIsQ0FBQztLQUNIO0lBQ0RRLFlBQVksQ0FBQ2EsT0FBTyxDQUFDakIsR0FBRyxFQUFFcEMsSUFBSSxDQUFDQyxTQUFTLENBQUMyQyxTQUFTLENBQUMsQ0FBQztFQUN0RDtFQUNBO0VBQ0EsT0FBT2xELE9BQU9BLENBQUNXLElBQVU7SUFDdkIsTUFBTXVDLFNBQVMsR0FBYzVDLElBQUksQ0FBQ3VDLEtBQUssQ0FBQ0MsWUFBWSxDQUFDQyxPQUFPLENBQUNMLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN4RSxLQUFLLE1BQU1rQixVQUFVLElBQUlWLFNBQVMsQ0FBQzFCLE1BQU0sRUFBRTtNQUN6QyxNQUFNcUMsUUFBUSxHQUFHLElBQUlsQyx3Q0FBSyxDQUN4QmhCLElBQUksRUFDSmlELFVBQVUsQ0FBQ3pCLElBQUksRUFDZnlCLFVBQVUsQ0FBQ3RCLGlCQUFpQixFQUM1QnNCLFVBQVUsQ0FBQ1AsYUFBYSxDQUN6QjtNQUNETyxVQUFVLENBQUNOLGFBQWEsQ0FBQ3BCLE9BQU8sQ0FBRTRCLEtBQUssSUFDckNELFFBQVEsQ0FBQ1AsYUFBYSxDQUFDUyxHQUFHLENBQUNELEtBQUssQ0FBQyxDQUNsQztNQUNERCxRQUFRLENBQUNILFNBQVMsR0FBR0UsVUFBVSxDQUFDRixTQUFTO01BQ3pDL0MsSUFBSSxDQUFDOEIsUUFBUSxDQUFDb0IsUUFBUSxDQUFDOztJQUV6QmxELElBQUksQ0FBQ1csaUJBQWlCLEdBQUc0QixTQUFTLENBQUM1QixpQkFBaUI7SUFDcEQsSUFBSVgsSUFBSSxDQUFDcUQsWUFBWSxFQUFFLENBQUNOLFNBQVMsRUFBRTtNQUNqQy9DLElBQUksQ0FBQ3NELFNBQVMsRUFBRTs7RUFFcEI7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvREYsTUFBTUMsZ0JBQWdCLEdBQUcsQ0FBQztBQUVwQixNQUFPdkMsS0FBSztFQU1OaEIsSUFBQTtFQUNEd0IsSUFBQTtFQUNBRyxpQkFBQTtFQUNBZSxhQUFBO0VBUkRjLFNBQVMsR0FBR0QsZ0JBQWdCO0VBQzdCWixhQUFhLEdBQUcsSUFBSWMsR0FBRyxFQUFVO0VBQ2pDVixTQUFTLEdBQUcsS0FBSztFQUV4QmYsWUFDVWhDLElBQVUsRUFDWHdCLElBQVksRUFDWkcsaUJBQTJCLEVBQ1Y7SUFBQSxJQUFqQmUsYUFBQSxHQUFBZ0IsU0FBQSxDQUFBNUMsTUFBQSxRQUFBNEMsU0FBQSxRQUFBQyxTQUFBLEdBQUFELFNBQUEsTUFBZ0IsQ0FBQztJQUhoQixLQUFBMUQsSUFBSSxHQUFKQSxJQUFJO0lBQ0wsS0FBQXdCLElBQUksR0FBSkEsSUFBSTtJQUNKLEtBQUFHLGlCQUFpQixHQUFqQkEsaUJBQWlCO0lBQ2pCLEtBQUFlLGFBQWEsR0FBYkEsYUFBYTtFQUNuQjtFQUVIa0Isb0JBQW9CQSxDQUFBO0lBQ2xCLE9BQU8sSUFBSSxDQUFDakMsaUJBQWlCLENBQzFCYSxHQUFHLENBQUMsQ0FBQ3FCLE1BQU0sRUFBRVYsS0FBSyxNQUFNO01BQUVVLE1BQU07TUFBRVY7SUFBSyxDQUFFLENBQUMsQ0FBQyxDQUMzQ1csTUFBTSxDQUFDQyxJQUFBO01BQUEsSUFBQztRQUFFWjtNQUFLLENBQUUsR0FBQVksSUFBQTtNQUFBLE9BQUssQ0FBQyxJQUFJLENBQUNwQixhQUFhLENBQUNxQixHQUFHLENBQUNiLEtBQUssQ0FBQztJQUFBLEVBQUM7RUFDMUQ7RUFDQWMsS0FBS0EsQ0FBQ0MsaUJBQXlCO0lBQzdCLElBQUksSUFBSSxDQUFDbkIsU0FBUyxFQUFFO01BQ2xCOztJQUVGLE1BQU1vQixhQUFhLEdBQUcsSUFBSSxDQUFDeEMsaUJBQWlCLENBQUN1QyxpQkFBaUIsQ0FBQztJQUMvRCxNQUFNRSxhQUFhLEdBQUcsSUFBSSxDQUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQ21CLGFBQWEsQ0FBQzBCLElBQUksQ0FBQztJQUN4RCxNQUFNQyxZQUFZLEdBQUdILGFBQWEsS0FBS0MsYUFBYTtJQUNwRCxJQUFJRSxZQUFZLEVBQUU7TUFDaEIsSUFBSSxDQUFDQyxZQUFZLENBQUNMLGlCQUFpQixDQUFDO0tBQ3JDLE1BQU07TUFDTCxJQUFJLENBQUNNLGNBQWMsRUFBRTs7SUFFdkIsT0FBT0YsWUFBWTtFQUNyQjtFQUVRQyxZQUFZQSxDQUFDTCxpQkFBeUI7SUFDNUMsSUFBSSxDQUFDdkIsYUFBYSxDQUFDUyxHQUFHLENBQUNjLGlCQUFpQixDQUFDO0lBQ3pDLElBQUksSUFBSSxDQUFDdkIsYUFBYSxDQUFDMEIsSUFBSSxJQUFJLElBQUksQ0FBQzdDLElBQUksQ0FBQ1YsTUFBTSxFQUFFO01BQy9DLElBQUksQ0FBQ2QsSUFBSSxDQUFDc0QsU0FBUyxFQUFFOztFQUV6QjtFQUNRa0IsY0FBY0EsQ0FBQTtJQUNwQixJQUFJLENBQUM5QixhQUFhLElBQUksQ0FBQztJQUN2QixJQUFJLElBQUksQ0FBQ0EsYUFBYSxJQUFJLElBQUksQ0FBQ2MsU0FBUyxFQUFFO01BQ3hDLElBQUksQ0FBQ1QsU0FBUyxHQUFHLElBQUk7TUFDckIsSUFBSSxDQUFDL0MsSUFBSSxDQUFDeUUsU0FBUyxFQUFFOztFQUV6Qjs7QUFRSSxNQUFPMUQsSUFBSTtFQUlMeEIsU0FBQTtFQUlEb0IsaUJBQUE7RUFQRkUsTUFBTSxHQUFZLEVBQUU7RUFFM0JtQixZQUNVekMsU0FHUCxFQUMyQjtJQUFBLElBQXJCb0IsaUJBQUEsR0FBQStDLFNBQUEsQ0FBQTVDLE1BQUEsUUFBQTRDLFNBQUEsUUFBQUMsU0FBQSxHQUFBRCxTQUFBLE1BQW9CLENBQUM7SUFKcEIsS0FBQW5FLFNBQVMsR0FBVEEsU0FBUztJQUlWLEtBQUFvQixpQkFBaUIsR0FBakJBLGlCQUFpQjtFQUN2QjtFQUNILElBQUkrRCxTQUFTQSxDQUFBO0lBQ1gsTUFBTUMsYUFBYSxHQUFHLElBQUksQ0FBQzlELE1BQU0sQ0FBQ2lELE1BQU0sQ0FBRXJCLENBQUMsSUFBS0EsQ0FBQyxDQUFDQyxhQUFhLEtBQUssQ0FBQyxDQUFDO0lBQ3RFLE1BQU1rQyxXQUFXLEdBQUcsSUFBSSxDQUFDL0QsTUFBTSxDQUFDZ0UsTUFBTSxDQUFDLENBQUNDLEdBQUcsRUFBRXJDLENBQUMsS0FBSTtNQUNoRCxPQUFPcUMsR0FBRyxHQUFHckMsQ0FBQyxDQUFDQyxhQUFhO0lBQzlCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDTCxNQUFNcUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDbEUsTUFBTSxDQUNuQ2lELE1BQU0sQ0FBRXJCLENBQUMsSUFBS0EsQ0FBQyxDQUFDQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQ2xDc0MsSUFBSSxDQUFDLENBQUNDLENBQUMsRUFBRUMsQ0FBQyxLQUFLQSxDQUFDLENBQUN4QyxhQUFhLEdBQUd1QyxDQUFDLENBQUN2QyxhQUFhLENBQUM7SUFDcEQsTUFBTXlDLFNBQVMsR0FBR0osa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUV2RCxJQUFJLElBQUksRUFBRTtJQUVuRCxPQUFPO01BQ0xtRCxhQUFhLEVBQUVBLGFBQWEsQ0FBQzdELE1BQU07TUFDbkM4RCxXQUFXO01BQ1hPO0tBQ0Q7RUFDSDtFQUVBckQsUUFBUUEsQ0FBQ0QsS0FBWTtJQUNuQixJQUFJLENBQUNoQixNQUFNLENBQUN1RSxJQUFJLENBQUN2RCxLQUFLLENBQUM7RUFDekI7RUFDQXdCLFlBQVlBLENBQUE7SUFDVixPQUFPLElBQUksQ0FBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUNGLGlCQUFpQixDQUFDO0VBQzVDO0VBQ0FzRCxLQUFLQSxDQUFDQyxpQkFBeUI7SUFDN0IsT0FBTyxJQUFJLENBQUNiLFlBQVksRUFBRSxFQUFFWSxLQUFLLENBQUNDLGlCQUFpQixDQUFDO0VBQ3REO0VBQ0FPLFNBQVNBLENBQUE7SUFDUCxJQUFJLENBQUNsRixTQUFTLENBQUNNLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQ3lELFNBQVMsRUFBRSxDQUFDO0VBQ3BEO0VBQ0FBLFNBQVNBLENBQUE7SUFDUCxNQUFNQSxTQUFTLEdBQUcsSUFBSSxDQUFDM0MsaUJBQWlCLEdBQUcsQ0FBQztJQUM1QyxJQUFJMkMsU0FBUyxJQUFJLElBQUksQ0FBQ3pDLE1BQU0sQ0FBQ0MsTUFBTSxFQUFFO01BQ25DLElBQUksQ0FBQ3ZCLFNBQVMsQ0FBQ0MsUUFBUSxDQUFDLElBQUksQ0FBQ2tGLFNBQVMsQ0FBQztLQUN4QyxNQUFNO01BQ0wsSUFBSSxDQUFDL0QsaUJBQWlCLEdBQUcyQyxTQUFTOztFQUV0Qzs7Ozs7Ozs7Ozs7Ozs7O0FDbEdJLE1BQU9yQyxZQUFZO0VBQ0hRLFVBQUE7RUFBcEJPLFlBQW9CUCxVQUFzQjtJQUF0QixLQUFBQSxVQUFVLEdBQVZBLFVBQVU7RUFBZTtFQUU3Q0csU0FBU0EsQ0FBQ0osSUFBWTtJQUNwQixNQUFNNkQsT0FBTyxHQUFHN0QsSUFBSSxDQUFDOEQsS0FBSyxDQUFDLEVBQUUsQ0FBQztJQUM5QixNQUFNM0MsYUFBYSxHQUFHLElBQUljLEdBQUcsRUFBRTtJQUUvQixPQUFPNEIsT0FBTyxDQUFDN0MsR0FBRyxDQUFDLE1BQUs7TUFDdEIsTUFBTStDLFFBQVEsR0FBR0YsT0FBTyxDQUNyQjdDLEdBQUcsQ0FBQyxDQUFDZ0QsSUFBSSxFQUFFckMsS0FBSyxNQUFNO1FBQUVxQyxJQUFJO1FBQUVyQztNQUFLLENBQUUsQ0FBQyxDQUFDLENBQ3ZDVyxNQUFNLENBQUNDLElBQUE7UUFBQSxJQUFDO1VBQUVaO1FBQUssQ0FBRSxHQUFBWSxJQUFBO1FBQUEsT0FBSyxDQUFDcEIsYUFBYSxDQUFDcUIsR0FBRyxDQUFDYixLQUFLLENBQUM7TUFBQSxFQUFDO01BQ25ELE1BQU07UUFBRXFDLElBQUk7UUFBRXJDO01BQUssQ0FBRSxHQUFHLElBQUksQ0FBQzFCLFVBQVUsQ0FBQ2dFLElBQUksQ0FBQ0YsUUFBUSxDQUFDO01BQ3RENUMsYUFBYSxDQUFDUyxHQUFHLENBQUNELEtBQUssQ0FBQztNQUN4QixPQUFPcUMsSUFBSTtJQUNiLENBQUMsQ0FBQztFQUNKOzs7Ozs7Ozs7Ozs7Ozs7QUNqQkksTUFBT3RFLFVBQVU7RUFDckJ1RSxJQUFJQSxDQUFJQyxVQUFlO0lBQ3JCLE1BQU12QyxLQUFLLEdBQUd3QyxJQUFJLENBQUNDLEtBQUssQ0FBQ0QsSUFBSSxDQUFDRSxNQUFNLEVBQUUsR0FBR0gsVUFBVSxDQUFDNUUsTUFBTSxDQUFDO0lBQzNELE9BQU80RSxVQUFVLENBQUN2QyxLQUFLLENBQUM7RUFDMUI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0p3QztBQUVuQyxNQUFNMkMsYUFBYSxHQUFHLENBQzNCLE9BQU8sRUFDUCxVQUFVLEVBQ1YsU0FBUyxFQUNULE1BQU0sRUFDTixhQUFhLEVBQ2IsTUFBTSxFQUNOLFNBQVMsRUFDVCxLQUFLLEVBQ0wsUUFBUSxFQUNSLFFBQVEsRUFDUixVQUFVLENBQ1g7QUFDTSxNQUFNM0Usa0JBQWtCLEdBQUcsQ0FBQztBQUU3QixNQUFPQyxVQUFVO0VBQ0RLLFVBQUE7RUFBZ0NzRSxLQUFBO0VBQXBEL0QsWUFBb0JQLFVBQXNCLEVBQVVzRSxLQUFlO0lBQS9DLEtBQUF0RSxVQUFVLEdBQVZBLFVBQVU7SUFBc0IsS0FBQXNFLEtBQUssR0FBTEEsS0FBSztFQUFhO0VBRXRFQyxjQUFjQSxDQUFDQyxNQUFjO0lBQzNCLE1BQU10RCxhQUFhLEdBQUcsSUFBSWMsR0FBRyxFQUFFO0lBQy9CLE1BQU15QyxXQUFXLEdBQUcsRUFBRTtJQUN0QixLQUFLLE1BQU01RCxDQUFDLElBQUlNLEtBQUssQ0FBQ3FELE1BQU0sQ0FBQyxDQUFDRSxJQUFJLEVBQUUsRUFBRTtNQUNwQyxNQUFNWixRQUFRLEdBQUcsSUFBSSxDQUFDUSxLQUFLLENBQ3hCdkQsR0FBRyxDQUFDLENBQUNnRCxJQUFJLEVBQUVyQyxLQUFLLE1BQU07UUFBRXFDLElBQUk7UUFBRXJDO01BQUssQ0FBRSxDQUFDLENBQUMsQ0FDdkNXLE1BQU0sQ0FBQ0MsSUFBQTtRQUFBLElBQUM7VUFBRVo7UUFBSyxDQUFFLEdBQUFZLElBQUE7UUFBQSxPQUFLLENBQUNwQixhQUFhLENBQUNxQixHQUFHLENBQUNiLEtBQUssQ0FBQztNQUFBLEVBQUM7TUFDbkQsTUFBTTtRQUFFQSxLQUFLO1FBQUVxQztNQUFJLENBQUUsR0FBRyxJQUFJLENBQUMvRCxVQUFVLENBQUNnRSxJQUFJLENBQUNGLFFBQVEsQ0FBQztNQUN0RDVDLGFBQWEsQ0FBQ1MsR0FBRyxDQUFDRCxLQUFLLENBQUM7TUFDeEIrQyxXQUFXLENBQUNkLElBQUksQ0FBQ0ksSUFBSSxDQUFDOztJQUV4QixPQUFPVSxXQUFXO0VBQ3BCO0VBRUEsT0FBTzVFLGVBQWVBLENBQUMyRSxNQUFjO0lBQ25DLE1BQU14RSxVQUFVLEdBQUcsSUFBSVAsbURBQVUsRUFBRTtJQUNuQyxNQUFNa0YsVUFBVSxHQUFHLElBQUloRixVQUFVLENBQUNLLFVBQVUsRUFBRXFFLGFBQWEsQ0FBQztJQUM1RCxNQUFNTyxjQUFjLEdBQUdELFVBQVUsQ0FBQ0osY0FBYyxDQUFDQyxNQUFNLENBQUM7SUFDeEQsT0FBT0ksY0FBYztFQUN2Qjs7Ozs7Ozs7Ozs7Ozs7O0FDcENJLFNBQVVDLGVBQWVBLENBQUlDLEVBQWlDO0VBQ2xFLE9BQU9BLEVBQUU7QUFDWDs7Ozs7Ozs7Ozs7Ozs7QUNJTSxNQUFPdEgsRUFBRTtFQUNjdUgsTUFBQTtFQUEzQnhFLFlBQTJCd0UsTUFBbUI7SUFBbkIsS0FBQUEsTUFBTSxHQUFOQSxNQUFNO0VBQWdCO0VBQ2pELE9BQU8vRixHQUFHQSxDQUFxQmdHLE9BQVU7SUFDdkMsTUFBTUMsRUFBRSxHQUFHbkcsUUFBUSxDQUFDb0csYUFBYSxDQUFDRixPQUFPLENBQUM7SUFDMUMsT0FBTyxJQUFJeEgsRUFBRSxDQUFDeUgsRUFBRSxDQUFDO0VBQ25CO0VBQ0E7RUFDQUUsSUFBSUEsQ0FBQ0MsUUFBZ0IsRUFBRUMsU0FBaUI7SUFDdEMsSUFBSSxDQUFDTixNQUFNLENBQUNPLFlBQVksQ0FBQ0YsUUFBUSxFQUFFQyxTQUFTLENBQUM7SUFFN0MsT0FBTyxJQUFJO0VBQ2I7RUFDQTtFQUNBRSxPQUFPQSxDQUFDN0gsRUFBVyxFQUFFMEgsUUFBZ0IsRUFBRUMsU0FBaUM7SUFDdEUzSCxFQUFFLENBQUNpQixZQUFZLENBQUMsTUFBSztNQUNuQixJQUFJLENBQUNvRyxNQUFNLENBQUNTLGVBQWUsQ0FBQ0osUUFBUSxDQUFDO01BQ3JDLE1BQU1LLEtBQUssR0FBR0osU0FBUyxFQUFFO01BQ3pCLElBQUksT0FBT0ksS0FBSyxLQUFLLFNBQVMsRUFBRTtRQUM5QixJQUFJQSxLQUFLLEVBQUU7VUFDVCxJQUFJLENBQUNWLE1BQU0sQ0FBQ08sWUFBWSxDQUFDRixRQUFRLEVBQUUsTUFBTSxDQUFDO1NBQzNDLE1BQU07VUFDTCxJQUFJLENBQUNMLE1BQU0sQ0FBQ1MsZUFBZSxDQUFDSixRQUFRLENBQUM7O09BRXhDLE1BQU07UUFDTCxJQUFJLENBQUNMLE1BQU0sQ0FBQ08sWUFBWSxDQUFDRixRQUFRLEVBQUVLLEtBQUssQ0FBQzs7SUFFN0MsQ0FBQyxDQUFDO0lBRUYsT0FBTyxJQUFJO0VBQ2I7RUFDQTtFQUNBQyxFQUFFQSxDQUFxQkMsU0FBWSxFQUFFQyxFQUFtQjtJQUN0RCxJQUFJLENBQUNiLE1BQU0sQ0FBQ2MsZ0JBQWdCLENBQUNGLFNBQVMsRUFBRUMsRUFBRSxDQUFDO0lBQzNDLE9BQU8sSUFBSTtFQUNiO0VBQ0E7RUFDQUUsSUFBSUEsQ0FBQzlILElBQVk7SUFDZixNQUFNK0gsSUFBSSxHQUFHakgsUUFBUSxDQUFDa0gsY0FBYyxDQUFDaEksSUFBSSxDQUFDO0lBQzFDLElBQUksQ0FBQytHLE1BQU0sQ0FBQ2tCLFdBQVcsQ0FBQ0YsSUFBSSxDQUFDO0lBQzdCLE9BQU8sSUFBSTtFQUNiO0VBQ0E7RUFDQTlHLE9BQU9BLENBQUN2QixFQUFXLEVBQUV3SSxDQUFlO0lBQ2xDLE1BQU1ILElBQUksR0FBR2pILFFBQVEsQ0FBQ2tILGNBQWMsQ0FBQyxFQUFFLENBQUM7SUFDeEMsSUFBSSxDQUFDakIsTUFBTSxDQUFDa0IsV0FBVyxDQUFDRixJQUFJLENBQUM7SUFFN0JySSxFQUFFLENBQUNpQixZQUFZLENBQUMsTUFBSztNQUNuQm9ILElBQUksQ0FBQ0ksV0FBVyxHQUFHRCxDQUFDLEVBQUU7SUFDeEIsQ0FBQyxDQUFDO0lBRUYsT0FBTyxJQUFJO0VBQ2I7RUFDQTtFQUNBRSxLQUFLQSxDQUFDQSxLQUFTO0lBQ2IsSUFBSSxDQUFDckIsTUFBTSxDQUFDa0IsV0FBVyxDQUFDRyxLQUFLLENBQUNyQixNQUFNLENBQUM7SUFDckMsT0FBTyxJQUFJO0VBQ2I7RUFDQTtFQUNBc0IsSUFBSUEsQ0FBSUMsU0FBc0IsRUFBRUMsTUFBdUI7SUFDckQsS0FBSyxNQUFNeEMsSUFBSSxJQUFJdUMsU0FBUyxFQUFFO01BQzVCLE1BQU1yQixFQUFFLEdBQUdzQixNQUFNLENBQUN4QyxJQUFJLENBQUM7TUFDdkIsSUFBSSxDQUFDZ0IsTUFBTSxDQUFDa0IsV0FBVyxDQUFDaEIsRUFBRSxDQUFDRixNQUFNLENBQUM7O0lBR3BDLE9BQU8sSUFBSTtFQUNiO0VBQ0E7RUFDQXlCLE9BQU9BLENBQ0w5SSxFQUFXLEVBQ1g0SSxTQUE0QixFQUM1QkMsTUFBc0M7SUFFdEMsTUFBTUUsU0FBUyxHQUFtQixFQUFFO0lBQ3BDLE1BQU1DLE9BQU8sR0FBRzVILFFBQVEsQ0FBQzZILGFBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEQsSUFBSSxDQUFDNUIsTUFBTSxDQUFDa0IsV0FBVyxDQUFDUyxPQUFPLENBQUM7SUFFaENoSixFQUFFLENBQUNpQixZQUFZLENBQUMsTUFBSztNQUNuQixLQUFLLE1BQU1pSSxRQUFRLElBQUlILFNBQVMsRUFBRTtRQUNoQ0csUUFBUSxFQUFFOztNQUVaLElBQUlsRixLQUFLLEdBQUcsQ0FBQztNQUNiLEtBQUssTUFBTXFDLElBQUksSUFBSXVDLFNBQVMsRUFBRSxFQUFFO1FBQzlCLE1BQU1yQixFQUFFLEdBQUdzQixNQUFNLENBQUN4QyxJQUFJLEVBQUVyQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUNxRCxNQUFNLENBQUM4QixZQUFZLENBQUM1QixFQUFFLENBQUNGLE1BQU0sRUFBRTJCLE9BQU8sQ0FBQztRQUM1Q0QsU0FBUyxDQUFDOUMsSUFBSSxDQUFDLE1BQU1zQixFQUFFLENBQUNGLE1BQU0sQ0FBQytCLE1BQU0sRUFBRSxDQUFDOztJQUU1QyxDQUFDLENBQUM7SUFFRixPQUFPLElBQUk7RUFDYjs7Ozs7Ozs7Ozs7Ozs7O0FDaEdJLFNBQVUzSixLQUFLQSxDQUFDNEosSUFBaUIsRUFBRTlCLEVBQU07RUFDN0M4QixJQUFJLENBQUNDLGVBQWUsQ0FBQy9CLEVBQUUsQ0FBQ0YsTUFBTSxDQUFDO0FBQ2pDOzs7Ozs7Ozs7Ozs7Ozs7QUNEQTs7OztBQUlNLE1BQU9rQyxNQUFNO0VBQ0d2SixFQUFBO0VBQXFCd0osRUFBQTtFQUF6QzNHLFlBQW9CN0MsRUFBVyxFQUFVd0osRUFBWTtJQUFqQyxLQUFBeEosRUFBRSxHQUFGQSxFQUFFO0lBQW1CLEtBQUF3SixFQUFFLEdBQUZBLEVBQUU7RUFBYTtFQUN4RHJJLEdBQUdBLENBQUE7SUFDRCxJQUFJLElBQUksQ0FBQ25CLEVBQUUsQ0FBQ3lKLGVBQWUsRUFBRTtNQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDekosRUFBRSxDQUFDMEosVUFBVSxDQUFDN0UsR0FBRyxDQUFDLElBQUksQ0FBQzJFLEVBQUUsQ0FBQyxFQUFFO1FBQ3BDLElBQUksQ0FBQ3hKLEVBQUUsQ0FBQzBKLFVBQVUsQ0FBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQ0gsRUFBRSxFQUFFLElBQUlsRixHQUFHLEVBQUUsQ0FBQzs7TUFFNUMsSUFBSSxDQUFDdEUsRUFBRSxDQUFDMEosVUFBVSxDQUFDdkksR0FBRyxDQUFDLElBQUksQ0FBQ3FJLEVBQUUsQ0FBQyxFQUFFdkYsR0FBRyxDQUFDLElBQUksQ0FBQ2pFLEVBQUUsQ0FBQ3lKLGVBQWUsQ0FBQzs7SUFFL0QsT0FBTyxJQUFJLENBQUN6SixFQUFFLENBQUM0SixZQUFZLENBQUN6SSxHQUFHLENBQUMsSUFBSSxDQUFDcUksRUFBRSxDQUFDO0VBQzFDO0VBQ0FHLEdBQUdBLENBQUM1QixLQUFRO0lBQ1YsSUFBSSxDQUFDL0gsRUFBRSxDQUFDNEosWUFBWSxDQUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDSCxFQUFFLEVBQUV6QixLQUFLLENBQUM7SUFFeEMsTUFBTThCLE1BQU0sR0FBRyxJQUFJLENBQUM3SixFQUFFLENBQUMwSixVQUFVLENBQUN2SSxHQUFHLENBQUMsSUFBSSxDQUFDcUksRUFBRSxDQUFDO0lBQzlDLElBQUlLLE1BQU0sRUFBRTtNQUNWLEtBQUssTUFBTUMsS0FBSyxJQUFJRCxNQUFNLEVBQUU7UUFDMUIsSUFBSSxDQUFDN0osRUFBRSxDQUFDK0osU0FBUyxDQUFDRCxLQUFLLENBQUM7OztJQUk1QixPQUFPL0IsS0FBSztFQUNkO0VBQ0FqSCxNQUFNQSxDQUFDc0csRUFBZTtJQUNwQixNQUFNVyxLQUFLLEdBQUdYLEVBQUUsQ0FBQyxJQUFJLENBQUNwSCxFQUFFLENBQUM0SixZQUFZLENBQUN6SSxHQUFHLENBQUMsSUFBSSxDQUFDcUksRUFBRSxDQUFDLENBQUM7SUFDbkQsSUFBSSxDQUFDRyxHQUFHLENBQUM1QixLQUFLLENBQUM7SUFDZixPQUFPQSxLQUFLO0VBQ2Q7O0FBR0Y7OztBQUdNLE1BQU9ySSxPQUFPO0VBQ2xCa0ssWUFBWSxHQUFHLElBQUlJLEdBQUcsRUFBaUI7RUFDdkNQLGVBQWU7RUFDZkMsVUFBVSxHQUFHLElBQUlNLEdBQUcsRUFBMkI7RUFDL0NDLE9BQU8sR0FBRyxJQUFJRCxHQUFHLEVBQXdCO0VBRXpDbkgsWUFBQSxHQUFlO0VBQ2Y3QixZQUFZQSxDQUFJK0csS0FBUTtJQUN0QixNQUFNbUMsUUFBUSxHQUFHQyxNQUFNLEVBQUU7SUFDekIsSUFBSSxDQUFDUCxZQUFZLENBQUNELEdBQUcsQ0FBQ08sUUFBUSxFQUFFbkMsS0FBSyxDQUFDO0lBQ3RDLE9BQU8sSUFBSXdCLE1BQU0sQ0FBQyxJQUFJLEVBQUVXLFFBQVEsQ0FBQztFQUNuQztFQUNBakosWUFBWUEsQ0FBQ21KLE1BQWtCO0lBQzdCLE1BQU1DLFFBQVEsR0FBR0YsTUFBTSxFQUFFO0lBQ3pCLElBQUksQ0FBQ0YsT0FBTyxDQUFDTixHQUFHLENBQUNVLFFBQVEsRUFBRUQsTUFBTSxDQUFDO0lBRWxDLElBQUksQ0FBQ0wsU0FBUyxDQUFDTSxRQUFRLENBQUM7RUFDMUI7RUFDQU4sU0FBU0EsQ0FBQ00sUUFBa0I7SUFDMUIsTUFBTUMsWUFBWSxHQUFHLElBQUksQ0FBQ2IsZUFBZTtJQUN6QyxJQUFJLENBQUNBLGVBQWUsR0FBR1ksUUFBUTtJQUMvQixJQUFJLENBQUNKLE9BQU8sQ0FBQzlJLEdBQUcsQ0FBQ2tKLFFBQVEsQ0FBQyxHQUFFLENBQUU7SUFDOUIsSUFBSSxDQUFDWixlQUFlLEdBQUdhLFlBQVk7RUFDckM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlEc0Q7QUFDcEI7QUFFSztBQU1sQyxNQUFNOUssV0FBVyxHQUFHMkgsb0VBQWUsQ0FBQyxDQUFDbkgsRUFBRSxFQUFBNEUsSUFBQSxLQUFnQztFQUFBLElBQTlCO0lBQUUvRDtFQUFJLENBQW9CLEdBQUErRCxJQUFBO0VBQ3hFLE1BQU1sQyxLQUFLLEdBQUdBLENBQUEsS0FBTTdCLElBQUksQ0FBQ00sR0FBRyxFQUFFLENBQUMrQyxZQUFZLEVBQUU7RUFDN0MsT0FBT3BFLDRDQUFFLENBQUN3QixHQUFHLENBQUMsS0FBSyxDQUFDLENBQ2pCbUcsSUFBSSxDQUFDLE9BQU8sRUFBRSwrQkFBK0IsQ0FBQyxDQUM5Q0EsSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FDM0JxQixPQUFPLENBQ045SSxFQUFFLEVBQ0YsTUFBSztJQUNILE1BQU1zRCxDQUFDLEdBQUdaLEtBQUssRUFBRTtJQUNqQixJQUFJLENBQUNZLENBQUMsRUFBRTtNQUNOLE9BQU8sRUFBRTs7SUFFWCxJQUFJQSxDQUFDLENBQUNNLFNBQVMsRUFBRTtNQUNmLE9BQU9OLENBQUMsQ0FBQ2pCLElBQUksQ0FBQzhELEtBQUssQ0FBQyxFQUFFLENBQUM7O0lBRXpCLE9BQU83QyxDQUFDLENBQUNqQixJQUFJLENBQUNtSSxLQUFLLENBQUMsQ0FBQyxFQUFFbEgsQ0FBQyxDQUFDRSxhQUFhLENBQUMwQixJQUFJLENBQUMsQ0FBQ2lCLEtBQUssQ0FBQyxFQUFFLENBQUM7RUFDeEQsQ0FBQyxFQUNBekIsTUFBTSxJQUFJO0lBQ1QsT0FBTzZGLHNEQUFTLENBQUN2SyxFQUFFLEVBQUU7TUFDbkIwRSxNQUFNO01BQ04rRixTQUFTLEVBQUVBLENBQUEsS0FBTSxDQUFDLENBQUMvSCxLQUFLLEVBQUUsRUFBRWtCLFNBQVM7TUFDckMwQyxJQUFJLEVBQUVBLENBQUEsS0FBSyxDQUFFO0tBQ2QsQ0FBQztFQUNKLENBQUMsQ0FDRjtBQUNMLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ25Dc0Q7QUFDcEI7QUFPN0IsTUFBTWlFLFNBQVMsR0FBR3BELG9FQUFlLENBQUMsQ0FBQ25ILEVBQUUsRUFBRTBLLEtBQXFCLEtBQUk7RUFDckUsT0FBTzVLLDRDQUFFLENBQUN3QixHQUFHLENBQUMsUUFBUSxDQUFDLENBQ3BCMEcsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNMEMsS0FBSyxDQUFDcEUsSUFBSSxHQUFFLENBQUUsQ0FBQyxDQUNqQ21CLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQ3RCSSxPQUFPLENBQUM3SCxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQ3BCMEssS0FBSyxDQUFDRCxTQUFTLEdBQUUsQ0FBRSxHQUFHLGdCQUFnQixHQUFHLGlCQUFpQixDQUMzRCxDQUNBaEQsSUFBSSxDQUFDLE9BQU8sRUFBRSw2QkFBNkIsQ0FBQyxDQUM1Q1csSUFBSSxDQUFDc0MsS0FBSyxDQUFDaEcsTUFBTSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQnNEO0FBQ3BCO0FBRUs7QUFLbEMsTUFBTS9FLFdBQVcsR0FBR3dILG9FQUFlLENBQUMsQ0FBQ25ILEVBQUUsRUFBQTRFLElBQUEsS0FBZ0M7RUFBQSxJQUE5QjtJQUFFL0Q7RUFBSSxDQUFvQixHQUFBK0QsSUFBQTtFQUN4RStGLE1BQU0sQ0FBQ3hDLGdCQUFnQixDQUFDLFNBQVMsRUFBR3lDLENBQUMsSUFBSTtJQUN2QyxNQUFNQyxJQUFJLEdBQUdELENBQUMsQ0FBQ0UsSUFBSSxDQUFDTixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUNPLFdBQVcsRUFBRTtJQUMxQyxNQUFNQyxtQkFBbUIsR0FBR0MsY0FBYyxDQUFDOUosR0FBRyxFQUFFO0lBQ2hELE1BQU11QixLQUFLLEdBQUc3QixJQUFJLENBQUNNLEdBQUcsRUFBRSxDQUFDK0MsWUFBWSxFQUFFO0lBQ3ZDLE1BQU1nSCxLQUFLLEdBQUd4SSxLQUFLLENBQUMrQixvQkFBb0IsRUFBRSxDQUFDMEcsSUFBSSxDQUFDQyxLQUFBLElBQXNCO01BQUEsSUFBckI7UUFBRTFHLE1BQU07UUFBRVY7TUFBSyxDQUFFLEdBQUFvSCxLQUFBO01BQ2hFLE1BQU1DLFVBQVUsR0FBRyxDQUFDTCxtQkFBbUIsQ0FBQ25HLEdBQUcsQ0FBQ2IsS0FBSyxDQUFDO01BQ2xELE9BQU9xSCxVQUFVLElBQUlSLElBQUksS0FBS25HLE1BQU07SUFDdEMsQ0FBQyxDQUFDO0lBQ0YsSUFBSXdHLEtBQUssRUFBRTtNQUNUNUUsSUFBSSxDQUFDNEUsS0FBSyxDQUFDbEgsS0FBSyxDQUFDOztFQUVyQixDQUFDLENBQUM7RUFFRixTQUFTc0MsSUFBSUEsQ0FBQ3RDLEtBQWE7SUFDekIsTUFBTXNILE9BQU8sR0FBR3pLLElBQUksQ0FBQ00sR0FBRyxFQUFFLENBQUMyRCxLQUFLLENBQUNkLEtBQUssQ0FBQztJQUN2Q25ELElBQUksQ0FBQzhJLEdBQUcsQ0FBQzlJLElBQUksQ0FBQ00sR0FBRyxFQUFFLENBQUM7SUFFcEIsSUFBSSxDQUFDbUssT0FBTyxFQUFFO01BQ1pDLG1CQUFtQixDQUFDdkgsS0FBSyxDQUFDOztFQUU5QjtFQUVBLE1BQU1pSCxjQUFjLEdBQUdqTCxFQUFFLENBQUNnQixZQUFZLENBQUMsSUFBSXNELEdBQUcsRUFBVSxDQUFDO0VBQ3pELFNBQVNpSCxtQkFBbUJBLENBQUN2SCxLQUFhO0lBQ3hDaUgsY0FBYyxDQUFDbkssTUFBTSxDQUFFMEssRUFBRSxJQUFJO01BQzNCQSxFQUFFLENBQUN2SCxHQUFHLENBQUNELEtBQUssQ0FBQztNQUNiLE9BQU93SCxFQUFFO0lBQ1gsQ0FBQyxDQUFDO0lBQ0Y1SyxVQUFVLENBQUMsTUFBSztNQUNkcUssY0FBYyxDQUFDbkssTUFBTSxDQUFFMEssRUFBRSxJQUFJO1FBQzNCQSxFQUFFLENBQUNDLE1BQU0sQ0FBQ3pILEtBQUssQ0FBQztRQUNoQixPQUFPd0gsRUFBRTtNQUNYLENBQUMsQ0FBQztJQUNKLENBQUMsRUFBRSxHQUFHLENBQUM7RUFDVDtFQUVBLE9BQU8xTCw0Q0FBRSxDQUFDd0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUNqQm1HLElBQUksQ0FBQyxPQUFPLEVBQUUsK0JBQStCLENBQUMsQ0FDOUNBLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQzNCcUIsT0FBTyxDQUNOOUksRUFBRSxFQUNGLE1BQU1hLElBQUksQ0FBQ00sR0FBRyxFQUFFLENBQUMrQyxZQUFZLEVBQUUsRUFBRU8sb0JBQW9CLEVBQUUsSUFBSSxFQUFFLEVBQzdEaUgsS0FBQTtJQUFBLElBQUM7TUFBRWhILE1BQU07TUFBRVY7SUFBSyxDQUFFLEdBQUEwSCxLQUFBO0lBQUEsT0FDaEJuQixzREFBUyxDQUFDdkssRUFBRSxFQUFFO01BQ1owRSxNQUFNO01BQ04rRixTQUFTLEVBQUVBLENBQUEsS0FBTVEsY0FBYyxDQUFDOUosR0FBRyxFQUFFLENBQUMwRCxHQUFHLENBQUNiLEtBQUssQ0FBQztNQUNoRHNDLElBQUksRUFBRUEsQ0FBQSxLQUFNQSxJQUFJLENBQUN0QyxLQUFLO0tBQ3ZCLENBQUM7RUFBQSxFQUNMO0FBQ0wsQ0FBQyxDQUFDOzs7Ozs7VUMzREY7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7VUFDQSxzQkFBc0I7VUFDdEIsb0RBQW9ELHVCQUF1QjtVQUMzRTtVQUNBO1VBQ0EsR0FBRztVQUNIO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7Ozs7O1dDeENBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NKQTs7Ozs7V0NBQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHVCQUF1Qiw0QkFBNEI7V0FDbkQ7V0FDQTtXQUNBO1dBQ0EsaUJBQWlCLG9CQUFvQjtXQUNyQztXQUNBLG1HQUFtRyxZQUFZO1dBQy9HO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsbUVBQW1FLGlDQUFpQztXQUNwRztXQUNBO1dBQ0E7V0FDQTs7Ozs7V0N6Q0E7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOztXQUVBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLENBQUM7O1dBRUQ7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxJQUFJO1dBQ0o7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxJQUFJO1dBQ0o7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsMkJBQTJCO1dBQzNCLDRCQUE0QjtXQUM1QiwyQkFBMkI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRzs7V0FFSDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxvQkFBb0IsZ0JBQWdCO1dBQ3BDO1dBQ0E7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBO1dBQ0Esb0JBQW9CLGdCQUFnQjtXQUNwQztXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNO1dBQ047V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU07V0FDTjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7O1dBRUg7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBO1dBQ0EsR0FBRzs7V0FFSDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOztXQUVBLGlCQUFpQixxQ0FBcUM7V0FDdEQ7O1dBRUE7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxvQkFBb0IsaUJBQWlCO1dBQ3JDO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0gsRUFBRTtXQUNGOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNO1dBQ047V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLFFBQVE7V0FDUjtXQUNBO1dBQ0EsUUFBUTtXQUNSO1dBQ0EsTUFBTTtXQUNOLEtBQUs7V0FDTCxJQUFJO1dBQ0osR0FBRztXQUNIOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBOztXQUVBO1dBQ0E7O1dBRUE7O1dBRUE7V0FDQTtXQUNBLEVBQUU7V0FDRjs7V0FFQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7O1dBRUE7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIOztXQUVBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBLEVBQUU7O1dBRUY7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esb0JBQW9CLG9CQUFvQjtXQUN4QztXQUNBO1dBQ0E7V0FDQTtXQUNBLEVBQUU7O1dBRUY7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLElBQUk7V0FDSjs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBLElBQUk7V0FDSjs7V0FFQTtXQUNBO1dBQ0EsR0FBRztXQUNILEVBQUU7V0FDRjs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxJQUFJO1dBQ0osR0FBRztXQUNIO1dBQ0E7V0FDQTtXQUNBOzs7OztXQ3JZQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NsQkE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxtQkFBbUIsMkJBQTJCO1dBQzlDO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBLGtCQUFrQixjQUFjO1dBQ2hDO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQSxjQUFjLE1BQU07V0FDcEI7V0FDQTtXQUNBO1dBQ0EsS0FBSztXQUNMO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxjQUFjLGFBQWE7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQSxpQkFBaUIsNEJBQTRCO1dBQzdDO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxJQUFJO1dBQ0o7V0FDQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLElBQUk7V0FDSjs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7V0FDQTtXQUNBLGdCQUFnQiw0QkFBNEI7V0FDNUM7V0FDQTtXQUNBOztXQUVBO1dBQ0E7O1dBRUE7V0FDQTs7V0FFQTtXQUNBOztXQUVBO1dBQ0EsZ0JBQWdCLDRCQUE0QjtXQUM1QztXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxrQkFBa0IsdUNBQXVDO1dBQ3pEO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0EsbUJBQW1CLGlDQUFpQztXQUNwRDtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esc0JBQXNCLHVDQUF1QztXQUM3RDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxzQkFBc0Isc0JBQXNCO1dBQzVDO1dBQ0E7V0FDQSxTQUFTO1dBQ1Q7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLFdBQVc7V0FDWCxXQUFXO1dBQ1g7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxZQUFZO1dBQ1o7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsVUFBVTtXQUNWO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLFdBQVc7V0FDWDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBLG1CQUFtQix3Q0FBd0M7V0FDM0Q7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNO1dBQ047V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLFFBQVE7V0FDUixRQUFRO1dBQ1I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsU0FBUztXQUNUO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE9BQU87V0FDUDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsUUFBUTtXQUNSO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFLElBQUk7V0FDTjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsSUFBSTtXQUNKO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0Esc0NBQXNDO1dBQ3RDO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7O1dBRUE7O1dBRUE7Ozs7O1VFOWZBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL2xvZ2ljL2dhbWUvZ2FtZS1mYWN0b3J5LnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvbG9naWMvZ2FtZS9nYW1lLXN0b3JlLnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvbG9naWMvZ2FtZS9nYW1lLnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvbG9naWMvbGV0dGVyLXBpY2tlci50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL2xvZ2ljL3JhbmRvbWl6ZXIudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9sb2dpYy93b3JkLXBpY2tlci50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudC50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL3JlbmRlcmVyL2VsLnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvcmVuZGVyZXIvbW91bnQudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9yZW5kZXJlci9yZWFjdGl2aXR5LnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvdWkvYW5zd2VyLXBhbmVsLnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvdWkvbGV0dGVyLWJ0bi50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL3VpL2xldHRlci1wYW5lbC50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL2dldCBqYXZhc2NyaXB0IHVwZGF0ZSBjaHVuayBmaWxlbmFtZSIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9nZXQgdXBkYXRlIG1hbmlmZXN0IGZpbGVuYW1lIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL2dldEZ1bGxIYXNoIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvbG9hZCBzY3JpcHQiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL2hvdCBtb2R1bGUgcmVwbGFjZW1lbnQiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBbnN3ZXJQYW5lbCB9IGZyb20gXCIuL3VpL2Fuc3dlci1wYW5lbFwiO1xuaW1wb3J0IHsgbW91bnQgfSBmcm9tIFwiLi9yZW5kZXJlci9tb3VudFwiO1xuaW1wb3J0IHsgUnVudGltZSB9IGZyb20gXCIuL3JlbmRlcmVyL3JlYWN0aXZpdHlcIjtcbmltcG9ydCB7IExldHRlclBhbmVsIH0gZnJvbSBcIi4vdWkvbGV0dGVyLXBhbmVsXCI7XG5pbXBvcnQgeyBnYW1lRmFjdG9yeSB9IGZyb20gXCIuL2xvZ2ljL2dhbWUvZ2FtZS1mYWN0b3J5XCI7XG5pbXBvcnQgeyBHYW1lU3RvcmUgfSBmcm9tIFwiLi9sb2dpYy9nYW1lL2dhbWUtc3RvcmVcIjtcbmltcG9ydCB7IEVsIH0gZnJvbSBcIi4vcmVuZGVyZXIvZWxcIjtcblxuZnVuY3Rpb24gbWFpbigpIHtcbiAgY29uc3QgY3ggPSBuZXcgUnVudGltZSgpO1xuXG4gIGNvbnN0IGdhbWVJbm5lciA9IGdhbWVGYWN0b3J5KHtcbiAgICByZXN0b3JlOiBHYW1lU3RvcmUuY2hlY2tTYXZlQW5kQXNrKCksXG4gICAgbGlzdGVuZXJzOiB7XG4gICAgICBvbkZpbmlzaChkYXRhKSB7XG4gICAgICAgIGFsZXJ0KEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgIH0sXG4gICAgICBvblN1cnJlbmRlcihuZXh0KSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAvLyB0cmlnZ2VyIHVwZGF0ZSwgc2luY2UgR2FtZSBkb2Vzbid0IGtub3cgYW55dGhpbmcgYWJvdXQgcmVhY3Rpdml0eVxuICAgICAgICAgIGdhbWUudXBkYXRlKChnKSA9PiBnKTtcbiAgICAgICAgfSwgMjAwMCk7XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBnYW1lID0gY3guY3JlYXRlU2lnbmFsKGdhbWVJbm5lcik7XG5cbiAgY3guY3JlYXRlRWZmZWN0KCgpID0+IHtcbiAgICBHYW1lU3RvcmUuc2F2ZShnYW1lLmdldCgpKTtcbiAgfSk7XG5cbiAgbW91bnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhbnN3ZXJcIikhLCBBbnN3ZXJQYW5lbChjeCwgeyBnYW1lIH0pKTtcbiAgbW91bnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNsZXR0ZXJzXCIpISwgTGV0dGVyUGFuZWwoY3gsIHsgZ2FtZSB9KSk7XG5cbiAgbW91bnQoXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjdXJyZW50X3F1ZXN0aW9uXCIpISxcbiAgICBFbC5uZXcoXCJzcGFuXCIpLnRleHREeW4oY3gsICgpID0+XG4gICAgICAoZ2FtZS5nZXQoKS5jdXJyZW50Um91bmRJbmRleCArIDEpLnRvU3RyaW5nKClcbiAgICApXG4gICk7XG4gIG1vdW50KFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdG90YWxfcXVlc3Rpb25zXCIpISxcbiAgICBFbC5uZXcoXCJzcGFuXCIpLnRleHREeW4oY3gsICgpID0+IGdhbWUuZ2V0KCkucm91bmRzLmxlbmd0aC50b1N0cmluZygpKVxuICApO1xufVxuXG5tYWluKCk7XG4iLCJpbXBvcnQgeyBGaW5pc2hEYXRhLCBHYW1lLCBSb3VuZCB9IGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCB7IExldHRlclBpY2tlciB9IGZyb20gXCIuLi9sZXR0ZXItcGlja2VyXCI7XG5pbXBvcnQgeyBSYW5kb21pemVyIH0gZnJvbSBcIi4uL3JhbmRvbWl6ZXJcIjtcbmltcG9ydCB7IE1BWF9XT1JEU19JTl9RVUVVRSwgV29yZFBpY2tlciB9IGZyb20gXCIuLi93b3JkLXBpY2tlclwiO1xuaW1wb3J0IHsgR2FtZVN0b3JlIH0gZnJvbSBcIi4vZ2FtZS1zdG9yZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2FtZUZhY3Rvcnkob3B0aW9uczoge1xuICByZXN0b3JlOiBib29sZWFuO1xuICBsaXN0ZW5lcnM6IHtcbiAgICBvblN1cnJlbmRlcjogKG5leHQ6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG4gICAgb25GaW5pc2g6IChkYXRhOiBGaW5pc2hEYXRhKSA9PiB2b2lkO1xuICB9O1xufSk6IEdhbWUge1xuICBjb25zdCBnYW1lID0gbmV3IEdhbWUob3B0aW9ucy5saXN0ZW5lcnMpO1xuXG4gIGlmIChvcHRpb25zLnJlc3RvcmUpIHtcbiAgICBHYW1lU3RvcmUucmVzdG9yZShnYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBXb3JkUGlja2VyLnBpY2tSYW5kb21Xb3JkcyhNQVhfV09SRFNfSU5fUVVFVUUpLmZvckVhY2goKHdvcmQpID0+IHtcbiAgICAgIGNvbnN0IHJhbmRvbWl6ZXIgPSBuZXcgUmFuZG9taXplcigpO1xuICAgICAgY29uc3QgbGV0dGVyUGlja2VyID0gbmV3IExldHRlclBpY2tlcihyYW5kb21pemVyKTtcbiAgICAgIGNvbnN0IHJhbmRvbVdvcmRMZXR0ZXJzID0gbGV0dGVyUGlja2VyLnJhbmRvbWl6ZSh3b3JkKTtcblxuICAgICAgY29uc3Qgcm91bmQgPSBuZXcgUm91bmQoZ2FtZSwgd29yZCwgcmFuZG9tV29yZExldHRlcnMpO1xuICAgICAgZ2FtZS5hZGRSb3VuZChyb3VuZCk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGdhbWU7XG59XG4iLCJpbXBvcnQgeyBHYW1lLCBSb3VuZCB9IGZyb20gXCIuL2dhbWVcIjtcblxuY29uc3QgS0VZID0gXCJnYW1lc3RhdGUtbnVtZmluXCI7XG5cbmludGVyZmFjZSBHYW1lU3RhdGUge1xuICBjdXJyZW50Um91bmRJbmRleDogbnVtYmVyO1xuICByb3VuZHM6IHtcbiAgICB3b3JkOiBzdHJpbmc7XG4gICAgY3VycmVudEVycm9yczogbnVtYmVyO1xuICAgIHBpY2tlZEluZGV4ZXM6IG51bWJlcltdO1xuICAgIGFiYW5kb25lZDogYm9vbGVhbjtcbiAgICByYW5kb21Xb3JkTGV0dGVyczogc3RyaW5nW107XG4gIH1bXTtcbn1cblxuZXhwb3J0IGNsYXNzIEdhbWVTdG9yZSB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBzdGF0aWMgY2hlY2tTYXZlQW5kQXNrKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShLRVkpID8/IFwiXCIpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdHlwZW9mIHBhcnNlZERhdGFbXCJjdXJyZW50Um91bmRJbmRleFwiXSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICBjb25maXJtKFwiUmVzdG9yZSBsYXN0IHNlc3Npb24/XCIpXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgc2F2ZShnYW1lOiBHYW1lKSB7XG4gICAgY29uc3QgZ2FtZVN0YXRlOiBHYW1lU3RhdGUgPSB7XG4gICAgICBjdXJyZW50Um91bmRJbmRleDogZ2FtZS5jdXJyZW50Um91bmRJbmRleCxcbiAgICAgIHJvdW5kczogZ2FtZS5yb3VuZHMubWFwKChyKSA9PiAoe1xuICAgICAgICB3b3JkOiByLndvcmQsXG4gICAgICAgIGN1cnJlbnRFcnJvcnM6IHIuY3VycmVudEVycm9ycyxcbiAgICAgICAgcGlja2VkSW5kZXhlczogQXJyYXkuZnJvbShyLnBpY2tlZEluZGV4ZXMudmFsdWVzKCkpLFxuICAgICAgICBhYmFuZG9uZWQ6IHIuYWJhbmRvbmVkLFxuICAgICAgICByYW5kb21Xb3JkTGV0dGVyczogci5yYW5kb21Xb3JkTGV0dGVycyxcbiAgICAgIH0pKSxcbiAgICB9O1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEtFWSwgSlNPTi5zdHJpbmdpZnkoZ2FtZVN0YXRlKSk7XG4gIH1cbiAgLyoqIE11dGF0ZSBnYW1lIHN0YXRlICovXG4gIHN0YXRpYyByZXN0b3JlKGdhbWU6IEdhbWUpIHtcbiAgICBjb25zdCBnYW1lU3RhdGU6IEdhbWVTdGF0ZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oS0VZKSA/PyBcIlwiKTtcbiAgICBmb3IgKGNvbnN0IHNhdmVkUm91bmQgb2YgZ2FtZVN0YXRlLnJvdW5kcykge1xuICAgICAgY29uc3QgbmV3Um91bmQgPSBuZXcgUm91bmQoXG4gICAgICAgIGdhbWUsXG4gICAgICAgIHNhdmVkUm91bmQud29yZCxcbiAgICAgICAgc2F2ZWRSb3VuZC5yYW5kb21Xb3JkTGV0dGVycyxcbiAgICAgICAgc2F2ZWRSb3VuZC5jdXJyZW50RXJyb3JzXG4gICAgICApO1xuICAgICAgc2F2ZWRSb3VuZC5waWNrZWRJbmRleGVzLmZvckVhY2goKGluZGV4KSA9PlxuICAgICAgICBuZXdSb3VuZC5waWNrZWRJbmRleGVzLmFkZChpbmRleClcbiAgICAgICk7XG4gICAgICBuZXdSb3VuZC5hYmFuZG9uZWQgPSBzYXZlZFJvdW5kLmFiYW5kb25lZDtcbiAgICAgIGdhbWUuYWRkUm91bmQobmV3Um91bmQpO1xuICAgIH1cbiAgICBnYW1lLmN1cnJlbnRSb3VuZEluZGV4ID0gZ2FtZVN0YXRlLmN1cnJlbnRSb3VuZEluZGV4O1xuICAgIGlmIChnYW1lLmN1cnJlbnRSb3VuZCgpLmFiYW5kb25lZCkge1xuICAgICAgZ2FtZS5uZXh0Um91bmQoKTtcbiAgICB9XG4gIH1cbn1cbiIsImNvbnN0IE1BWF9ST1VORF9FUlJPUlMgPSAzO1xuXG5leHBvcnQgY2xhc3MgUm91bmQge1xuICBwcml2YXRlIG1heEVycm9ycyA9IE1BWF9ST1VORF9FUlJPUlM7XG4gIHB1YmxpYyBwaWNrZWRJbmRleGVzID0gbmV3IFNldDxudW1iZXI+KCk7XG4gIHB1YmxpYyBhYmFuZG9uZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGdhbWU6IEdhbWUsXG4gICAgcHVibGljIHdvcmQ6IHN0cmluZyxcbiAgICBwdWJsaWMgcmFuZG9tV29yZExldHRlcnM6IHN0cmluZ1tdLFxuICAgIHB1YmxpYyBjdXJyZW50RXJyb3JzID0gMFxuICApIHt9XG5cbiAgdmlzaWJsZVJhbmRvbUxldHRlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucmFuZG9tV29yZExldHRlcnNcbiAgICAgIC5tYXAoKGxldHRlciwgaW5kZXgpID0+ICh7IGxldHRlciwgaW5kZXggfSkpXG4gICAgICAuZmlsdGVyKCh7IGluZGV4IH0pID0+ICF0aGlzLnBpY2tlZEluZGV4ZXMuaGFzKGluZGV4KSk7XG4gIH1cbiAgZ3Vlc3MocmFuZG9tTGV0dGVySW5kZXg6IG51bWJlcikge1xuICAgIGlmICh0aGlzLmFiYW5kb25lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBndWVzc2VkTGV0dGVyID0gdGhpcy5yYW5kb21Xb3JkTGV0dGVyc1tyYW5kb21MZXR0ZXJJbmRleF07XG4gICAgY29uc3QgY3VycmVudExldHRlciA9IHRoaXMud29yZFt0aGlzLnBpY2tlZEluZGV4ZXMuc2l6ZV07XG4gICAgY29uc3QgZ3Vlc3NlZFJpZ2h0ID0gZ3Vlc3NlZExldHRlciA9PT0gY3VycmVudExldHRlcjtcbiAgICBpZiAoZ3Vlc3NlZFJpZ2h0KSB7XG4gICAgICB0aGlzLmFjY2VwdExldHRlcihyYW5kb21MZXR0ZXJJbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudHJpZ2dlck1pc3Rha2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIGd1ZXNzZWRSaWdodDtcbiAgfVxuXG4gIHByaXZhdGUgYWNjZXB0TGV0dGVyKHJhbmRvbUxldHRlckluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnBpY2tlZEluZGV4ZXMuYWRkKHJhbmRvbUxldHRlckluZGV4KTtcbiAgICBpZiAodGhpcy5waWNrZWRJbmRleGVzLnNpemUgPj0gdGhpcy53b3JkLmxlbmd0aCkge1xuICAgICAgdGhpcy5nYW1lLm5leHRSb3VuZCgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIHRyaWdnZXJNaXN0YWtlKCkge1xuICAgIHRoaXMuY3VycmVudEVycm9ycyArPSAxO1xuICAgIGlmICh0aGlzLmN1cnJlbnRFcnJvcnMgPj0gdGhpcy5tYXhFcnJvcnMpIHtcbiAgICAgIHRoaXMuYWJhbmRvbmVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuZ2FtZS5zdXJyZW5kZXIoKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaW5pc2hEYXRhIHtcbiAgY29ycmVjdFJvdW5kczogbnVtYmVyO1xuICBlcnJvckFtb3VudDogbnVtYmVyO1xuICB3b3JzdFdvcmQ6IHN0cmluZztcbn1cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgcHVibGljIHJvdW5kczogUm91bmRbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbGlzdGVuZXJzOiB7XG4gICAgICBvblN1cnJlbmRlcjogKG5leHQ6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG4gICAgICBvbkZpbmlzaDogKGRhdGE6IEZpbmlzaERhdGEpID0+IHZvaWQ7XG4gICAgfSxcbiAgICBwdWJsaWMgY3VycmVudFJvdW5kSW5kZXggPSAwXG4gICkge31cbiAgZ2V0IGdhbWVTdGF0cygpOiBGaW5pc2hEYXRhIHtcbiAgICBjb25zdCBjb3JyZWN0Um91bmRzID0gdGhpcy5yb3VuZHMuZmlsdGVyKChyKSA9PiByLmN1cnJlbnRFcnJvcnMgPT09IDApO1xuICAgIGNvbnN0IGVycm9yQW1vdW50ID0gdGhpcy5yb3VuZHMucmVkdWNlKChzdW0sIHIpID0+IHtcbiAgICAgIHJldHVybiBzdW0gKyByLmN1cnJlbnRFcnJvcnM7XG4gICAgfSwgMCk7XG4gICAgY29uc3Qgc29ydGVkQnlFcnJvcnNEZXNjID0gdGhpcy5yb3VuZHNcbiAgICAgIC5maWx0ZXIoKHIpID0+IHIuY3VycmVudEVycm9ycyA+IDApXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi5jdXJyZW50RXJyb3JzIC0gYS5jdXJyZW50RXJyb3JzKTtcbiAgICBjb25zdCB3b3JzdFdvcmQgPSBzb3J0ZWRCeUVycm9yc0Rlc2NbMF0/LndvcmQgPz8gXCJcIjtcblxuICAgIHJldHVybiB7XG4gICAgICBjb3JyZWN0Um91bmRzOiBjb3JyZWN0Um91bmRzLmxlbmd0aCxcbiAgICAgIGVycm9yQW1vdW50LFxuICAgICAgd29yc3RXb3JkLFxuICAgIH07XG4gIH1cblxuICBhZGRSb3VuZChyb3VuZDogUm91bmQpIHtcbiAgICB0aGlzLnJvdW5kcy5wdXNoKHJvdW5kKTtcbiAgfVxuICBjdXJyZW50Um91bmQoKSB7XG4gICAgcmV0dXJuIHRoaXMucm91bmRzW3RoaXMuY3VycmVudFJvdW5kSW5kZXhdO1xuICB9XG4gIGd1ZXNzKHJhbmRvbUxldHRlckluZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50Um91bmQoKT8uZ3Vlc3MocmFuZG9tTGV0dGVySW5kZXgpO1xuICB9XG4gIHN1cnJlbmRlcigpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5vblN1cnJlbmRlcigoKSA9PiB0aGlzLm5leHRSb3VuZCgpKTtcbiAgfVxuICBuZXh0Um91bmQoKSB7XG4gICAgY29uc3QgbmV4dFJvdW5kID0gdGhpcy5jdXJyZW50Um91bmRJbmRleCArIDE7XG4gICAgaWYgKG5leHRSb3VuZCA+PSB0aGlzLnJvdW5kcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzLm9uRmluaXNoKHRoaXMuZ2FtZVN0YXRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50Um91bmRJbmRleCA9IG5leHRSb3VuZDtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFJhbmRvbWl6ZXIgfSBmcm9tIFwiLi9yYW5kb21pemVyXCI7XG5cbmV4cG9ydCBjbGFzcyBMZXR0ZXJQaWNrZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJhbmRvbWl6ZXI6IFJhbmRvbWl6ZXIpIHt9XG5cbiAgcmFuZG9taXplKHdvcmQ6IHN0cmluZykge1xuICAgIGNvbnN0IGxldHRlcnMgPSB3b3JkLnNwbGl0KFwiXCIpO1xuICAgIGNvbnN0IHBpY2tlZEluZGV4ZXMgPSBuZXcgU2V0KCk7XG5cbiAgICByZXR1cm4gbGV0dGVycy5tYXAoKCkgPT4ge1xuICAgICAgY29uc3QgZnJlc2hTZXQgPSBsZXR0ZXJzXG4gICAgICAgIC5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoeyBpdGVtLCBpbmRleCB9KSlcbiAgICAgICAgLmZpbHRlcigoeyBpbmRleCB9KSA9PiAhcGlja2VkSW5kZXhlcy5oYXMoaW5kZXgpKTtcbiAgICAgIGNvbnN0IHsgaXRlbSwgaW5kZXggfSA9IHRoaXMucmFuZG9taXplci5waWNrKGZyZXNoU2V0KTtcbiAgICAgIHBpY2tlZEluZGV4ZXMuYWRkKGluZGV4KTtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUmFuZG9taXplciB7XG4gIHBpY2s8VD4oY29sbGVjdGlvbjogVFtdKSB7XG4gICAgY29uc3QgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjb2xsZWN0aW9uLmxlbmd0aCk7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb25baW5kZXhdO1xuICB9XG59XG4iLCJpbXBvcnQgeyBSYW5kb21pemVyIH0gZnJvbSBcIi4vcmFuZG9taXplclwiO1xuXG5leHBvcnQgY29uc3QgV09SRF9WQVJJQU5UUyA9IFtcbiAgXCJhcHBsZVwiLFxuICBcImZ1bmN0aW9uXCIsXG4gIFwidGltZW91dFwiLFxuICBcInRhc2tcIixcbiAgXCJhcHBsaWNhdGlvblwiLFxuICBcImRhdGFcIixcbiAgXCJ0cmFnZWR5XCIsXG4gIFwic3VuXCIsXG4gIFwic3ltYm9sXCIsXG4gIFwiYnV0dG9uXCIsXG4gIFwic29mdHdhcmVcIixcbl07XG5leHBvcnQgY29uc3QgTUFYX1dPUkRTX0lOX1FVRVVFID0gNjtcblxuZXhwb3J0IGNsYXNzIFdvcmRQaWNrZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJhbmRvbWl6ZXI6IFJhbmRvbWl6ZXIsIHByaXZhdGUgd29yZHM6IHN0cmluZ1tdKSB7fVxuXG4gIGdldFJhbmRvbVdvcmRzKGFtb3VudDogbnVtYmVyKSB7XG4gICAgY29uc3QgcGlja2VkSW5kZXhlcyA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBjaG9zZW5Xb3JkcyA9IFtdO1xuICAgIGZvciAoY29uc3QgXyBvZiBBcnJheShhbW91bnQpLmtleXMoKSkge1xuICAgICAgY29uc3QgZnJlc2hTZXQgPSB0aGlzLndvcmRzXG4gICAgICAgIC5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoeyBpdGVtLCBpbmRleCB9KSlcbiAgICAgICAgLmZpbHRlcigoeyBpbmRleCB9KSA9PiAhcGlja2VkSW5kZXhlcy5oYXMoaW5kZXgpKTtcbiAgICAgIGNvbnN0IHsgaW5kZXgsIGl0ZW0gfSA9IHRoaXMucmFuZG9taXplci5waWNrKGZyZXNoU2V0KTtcbiAgICAgIHBpY2tlZEluZGV4ZXMuYWRkKGluZGV4KTtcbiAgICAgIGNob3NlbldvcmRzLnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiBjaG9zZW5Xb3JkcztcbiAgfVxuXG4gIHN0YXRpYyBwaWNrUmFuZG9tV29yZHMoYW1vdW50OiBudW1iZXIpIHtcbiAgICBjb25zdCByYW5kb21pemVyID0gbmV3IFJhbmRvbWl6ZXIoKTtcbiAgICBjb25zdCB3b3JkUGlja2VyID0gbmV3IFdvcmRQaWNrZXIocmFuZG9taXplciwgV09SRF9WQVJJQU5UUyk7XG4gICAgY29uc3Qgd29yZENvbGxlY3Rpb24gPSB3b3JkUGlja2VyLmdldFJhbmRvbVdvcmRzKGFtb3VudCk7XG4gICAgcmV0dXJuIHdvcmRDb2xsZWN0aW9uO1xuICB9XG59XG4iLCJpbXBvcnQgeyBFbCB9IGZyb20gXCIuL2VsXCI7XG5pbXBvcnQgeyBSdW50aW1lIH0gZnJvbSBcIi4vcmVhY3Rpdml0eVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50PFQ+KGZuOiAoY3g6IFJ1bnRpbWUsIHByb3BzOiBUKSA9PiBFbCkge1xuICByZXR1cm4gZm47XG59XG4iLCJpbXBvcnQgeyBSdW50aW1lIH0gZnJvbSBcIi4vcmVhY3Rpdml0eVwiO1xuXG5leHBvcnQgdHlwZSBFTSA9IEhUTUxFbGVtZW50RXZlbnRNYXA7XG5leHBvcnQgdHlwZSBUTSA9IEhUTUxFbGVtZW50VGFnTmFtZU1hcDtcblxuaW50ZXJmYWNlIEV2ZW50SGFuZGxlcjxFdmVudE5hbWUgZXh0ZW5kcyBrZXlvZiBFTT4ge1xuICAoZXZlbnQ6IEVNW0V2ZW50TmFtZV0pOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgRWwge1xuICBwcml2YXRlIGNvbnN0cnVjdG9yKHB1YmxpYyBodG1sRWw6IEhUTUxFbGVtZW50KSB7fVxuICBzdGF0aWMgbmV3PFQgZXh0ZW5kcyBrZXlvZiBUTT4odGFnTmFtZTogVCkge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgICByZXR1cm4gbmV3IEVsKGVsKTtcbiAgfVxuICAvKiogU3RhdGljIGF0dHJpYnV0ZSBiaW5kICovXG4gIGF0dHIoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmh0bWxFbC5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKiogUmVhY3RpdmUgYXR0cmlidXRlIGJpbmQgKi9cbiAgYXR0ckR5bihjeDogUnVudGltZSwgYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlOiAoKSA9PiBzdHJpbmcgfCBib29sZWFuKSB7XG4gICAgY3guY3JlYXRlRWZmZWN0KCgpID0+IHtcbiAgICAgIHRoaXMuaHRtbEVsLnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICBjb25zdCB2YWx1ZSA9IGF0dHJWYWx1ZSgpO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgdGhpcy5odG1sRWwuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBcInRydWVcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5odG1sRWwucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5odG1sRWwuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKiogYWRkRXZlbnRMaXN0ZW5lciAqL1xuICBvbjxUIGV4dGVuZHMga2V5b2YgRU0+KGV2ZW50TmFtZTogVCwgY2I6IEV2ZW50SGFuZGxlcjxUPikge1xuICAgIHRoaXMuaHRtbEVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqIFN0YXRpYyByZW5kZXIgZm9yIHRleHQgKi9cbiAgdGV4dChkYXRhOiBzdHJpbmcpIHtcbiAgICBjb25zdCBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSk7XG4gICAgdGhpcy5odG1sRWwuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqIFJlYWN0aXZlIHJlbmRlciBmb3IgdGV4dCAqL1xuICB0ZXh0RHluKGN4OiBSdW50aW1lLCBmOiAoKSA9PiBzdHJpbmcpIHtcbiAgICBjb25zdCBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIik7XG4gICAgdGhpcy5odG1sRWwuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICBjeC5jcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgICAgbm9kZS50ZXh0Q29udGVudCA9IGYoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKiBSZW5kZXIgZm9yIGNoaWxkIGNvbXBvbmVudCAqL1xuICBjaGlsZChjaGlsZDogRWwpIHtcbiAgICB0aGlzLmh0bWxFbC5hcHBlbmRDaGlsZChjaGlsZC5odG1sRWwpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKiBTdGF0aWMgcmVuZGVyIGZvciBpdGVyYXRvcnMgKi9cbiAgaXRlcjxUPihpdGVtc0l0ZXI6IEl0ZXJhYmxlPFQ+LCBtYXBwZXI6IChpdGVtOiBUKSA9PiBFbCk6IEVsIHtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXNJdGVyKSB7XG4gICAgICBjb25zdCBlbCA9IG1hcHBlcihpdGVtKTtcbiAgICAgIHRoaXMuaHRtbEVsLmFwcGVuZENoaWxkKGVsLmh0bWxFbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqIFJlYWN0aXZlIHJlbmRlciBmb3IgaXRlcmF0b3JzICovXG4gIGl0ZXJEeW48VD4oXG4gICAgY3g6IFJ1bnRpbWUsXG4gICAgaXRlbXNJdGVyOiAoKSA9PiBJdGVyYWJsZTxUPixcbiAgICBtYXBwZXI6IChpdGVtOiBULCBpbmRleDogbnVtYmVyKSA9PiBFbFxuICApOiBFbCB7XG4gICAgY29uc3QgZGlzcG9zZXJzOiAoKCkgPT4gdm9pZClbXSA9IFtdO1xuICAgIGNvbnN0IGl0ZXJFbmQgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KFwiaXRlciBlbmRcIik7XG4gICAgdGhpcy5odG1sRWwuYXBwZW5kQ2hpbGQoaXRlckVuZCk7XG5cbiAgICBjeC5jcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBkaXNwb3NlciBvZiBkaXNwb3NlcnMpIHtcbiAgICAgICAgZGlzcG9zZXIoKTtcbiAgICAgIH1cbiAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXNJdGVyKCkpIHtcbiAgICAgICAgY29uc3QgZWwgPSBtYXBwZXIoaXRlbSwgaW5kZXgrKyk7XG4gICAgICAgIHRoaXMuaHRtbEVsLmluc2VydEJlZm9yZShlbC5odG1sRWwsIGl0ZXJFbmQpO1xuICAgICAgICBkaXNwb3NlcnMucHVzaCgoKSA9PiBlbC5odG1sRWwucmVtb3ZlKCkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiIsImltcG9ydCB7IEVsIH0gZnJvbSBcIi4vZWxcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIG1vdW50KHJvb3Q6IEhUTUxFbGVtZW50LCBlbDogRWwpIHtcbiAgcm9vdC5yZXBsYWNlQ2hpbGRyZW4oZWwuaHRtbEVsKTtcbn1cbiIsInR5cGUgU2lnbmFsSUQgPSBTeW1ib2w7XG50eXBlIEVmZmVjdElEID0gU3ltYm9sO1xuXG4vKipcbiAqIFNpZ25hbCB0aGF0IGFsbG93cyB0byBzdWJzY3JpYmUgaW5zaWRlIGVmZmVjdHMgb24gXCJnZXRcIlxuICogYW5kIG5vdGlmeSBzdWJzY3JpYmVycyBvbiBcInNldFwiXG4gKi9cbmV4cG9ydCBjbGFzcyBTaWduYWw8VD4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGN4OiBSdW50aW1lLCBwcml2YXRlIGlkOiBTaWduYWxJRCkge31cbiAgZ2V0KCk6IFQge1xuICAgIGlmICh0aGlzLmN4LnJ1bm5pbmdFZmZlY3RJZCkge1xuICAgICAgaWYgKCF0aGlzLmN4LnNpZ25hbFN1YnMuaGFzKHRoaXMuaWQpKSB7XG4gICAgICAgIHRoaXMuY3guc2lnbmFsU3Vicy5zZXQodGhpcy5pZCwgbmV3IFNldCgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3guc2lnbmFsU3Vicy5nZXQodGhpcy5pZCk/LmFkZCh0aGlzLmN4LnJ1bm5pbmdFZmZlY3RJZCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmN4LnNpZ25hbFZhbHVlcy5nZXQodGhpcy5pZCk7XG4gIH1cbiAgc2V0KHZhbHVlOiBUKSB7XG4gICAgdGhpcy5jeC5zaWduYWxWYWx1ZXMuc2V0KHRoaXMuaWQsIHZhbHVlKTtcblxuICAgIGNvbnN0IHN1YklkcyA9IHRoaXMuY3guc2lnbmFsU3Vicy5nZXQodGhpcy5pZCk7XG4gICAgaWYgKHN1Yklkcykge1xuICAgICAgZm9yIChjb25zdCBzdWJJZCBvZiBzdWJJZHMpIHtcbiAgICAgICAgdGhpcy5jeC5ydW5FZmZlY3Qoc3ViSWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICB1cGRhdGUoZm46ICh2OiBUKSA9PiBUKSB7XG4gICAgY29uc3QgdmFsdWUgPSBmbih0aGlzLmN4LnNpZ25hbFZhbHVlcy5nZXQodGhpcy5pZCkpO1xuICAgIHRoaXMuc2V0KHZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBcIkFyZW5hIGFsbG9jYXRvclwiIGZvciByZWFjdGl2ZSB2YWx1ZXMgYW5kIHN1YnNjcmliZXJzXG4gKi9cbmV4cG9ydCBjbGFzcyBSdW50aW1lIHtcbiAgc2lnbmFsVmFsdWVzID0gbmV3IE1hcDxTaWduYWxJRCwgYW55PigpO1xuICBydW5uaW5nRWZmZWN0SWQ/OiBFZmZlY3RJRDtcbiAgc2lnbmFsU3VicyA9IG5ldyBNYXA8U2lnbmFsSUQsIFNldDxFZmZlY3RJRD4+KCk7XG4gIGVmZmVjdHMgPSBuZXcgTWFwPEVmZmVjdElELCAoKSA9PiB2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cbiAgY3JlYXRlU2lnbmFsPFQ+KHZhbHVlOiBUKTogU2lnbmFsPFQ+IHtcbiAgICBjb25zdCBzaWduYWxJZCA9IFN5bWJvbCgpO1xuICAgIHRoaXMuc2lnbmFsVmFsdWVzLnNldChzaWduYWxJZCwgdmFsdWUpO1xuICAgIHJldHVybiBuZXcgU2lnbmFsKHRoaXMsIHNpZ25hbElkKTtcbiAgfVxuICBjcmVhdGVFZmZlY3QoZWZmZWN0OiAoKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgZWZmZWN0SWQgPSBTeW1ib2woKTtcbiAgICB0aGlzLmVmZmVjdHMuc2V0KGVmZmVjdElkLCBlZmZlY3QpO1xuXG4gICAgdGhpcy5ydW5FZmZlY3QoZWZmZWN0SWQpO1xuICB9XG4gIHJ1bkVmZmVjdChlZmZlY3RJZDogRWZmZWN0SUQpIHtcbiAgICBjb25zdCBwcmV2RWZmZWN0SWQgPSB0aGlzLnJ1bm5pbmdFZmZlY3RJZDtcbiAgICB0aGlzLnJ1bm5pbmdFZmZlY3RJZCA9IGVmZmVjdElkO1xuICAgIHRoaXMuZWZmZWN0cy5nZXQoZWZmZWN0SWQpPy4oKTtcbiAgICB0aGlzLnJ1bm5pbmdFZmZlY3RJZCA9IHByZXZFZmZlY3RJZDtcbiAgfVxufVxuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gXCIuLi9sb2dpYy9nYW1lL2dhbWVcIjtcbmltcG9ydCB7IGNyZWF0ZUNvbXBvbmVudCB9IGZyb20gXCIuLi9yZW5kZXJlci9jb21wb25lbnRcIjtcbmltcG9ydCB7IEVsIH0gZnJvbSBcIi4uL3JlbmRlcmVyL2VsXCI7XG5pbXBvcnQgeyBTaWduYWwgfSBmcm9tIFwiLi4vcmVuZGVyZXIvcmVhY3Rpdml0eVwiO1xuaW1wb3J0IHsgTGV0dGVyQnRuIH0gZnJvbSBcIi4vbGV0dGVyLWJ0blwiO1xuXG5pbnRlcmZhY2UgQW5zd2VyUGFuZWxQcm9wcyB7XG4gIGdhbWU6IFNpZ25hbDxHYW1lPjtcbn1cblxuZXhwb3J0IGNvbnN0IEFuc3dlclBhbmVsID0gY3JlYXRlQ29tcG9uZW50KChjeCwgeyBnYW1lIH06IEFuc3dlclBhbmVsUHJvcHMpID0+IHtcbiAgY29uc3Qgcm91bmQgPSAoKSA9PiBnYW1lLmdldCgpLmN1cnJlbnRSb3VuZCgpO1xuICByZXR1cm4gRWwubmV3KFwiZGl2XCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImQtZmxleCBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyXCIpXG4gICAgLmF0dHIoXCJzdHlsZVwiLCBcImdhcDogMC41ZW1cIilcbiAgICAuaXRlckR5bihcbiAgICAgIGN4LFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCByID0gcm91bmQoKTtcbiAgICAgICAgaWYgKCFyKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmFiYW5kb25lZCkge1xuICAgICAgICAgIHJldHVybiByLndvcmQuc3BsaXQoXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHIud29yZC5zbGljZSgwLCByLnBpY2tlZEluZGV4ZXMuc2l6ZSkuc3BsaXQoXCJcIik7XG4gICAgICB9LFxuICAgICAgKGxldHRlcikgPT4ge1xuICAgICAgICByZXR1cm4gTGV0dGVyQnRuKGN4LCB7XG4gICAgICAgICAgbGV0dGVyLFxuICAgICAgICAgIGlzSW52YWxpZDogKCkgPT4gISFyb3VuZCgpPy5hYmFuZG9uZWQsXG4gICAgICAgICAgcGljazogKCkgPT4ge30sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG59KTtcbiIsImltcG9ydCB7IGNyZWF0ZUNvbXBvbmVudCB9IGZyb20gXCIuLi9yZW5kZXJlci9jb21wb25lbnRcIjtcbmltcG9ydCB7IEVsIH0gZnJvbSBcIi4uL3JlbmRlcmVyL2VsXCI7XG5cbmludGVyZmFjZSBMZXR0ZXJCdG5Qcm9wcyB7XG4gIHBpY2s/OiAoKSA9PiB2b2lkO1xuICBpc0ludmFsaWQ/OiAoKSA9PiBib29sZWFuO1xuICBsZXR0ZXI6IHN0cmluZztcbn1cbmV4cG9ydCBjb25zdCBMZXR0ZXJCdG4gPSBjcmVhdGVDb21wb25lbnQoKGN4LCBwcm9wczogTGV0dGVyQnRuUHJvcHMpID0+IHtcbiAgcmV0dXJuIEVsLm5ldyhcImJ1dHRvblwiKVxuICAgIC5vbihcImNsaWNrXCIsICgpID0+IHByb3BzLnBpY2s/LigpKVxuICAgIC5hdHRyKFwidHlwZVwiLCBcImJ1dHRvblwiKVxuICAgIC5hdHRyRHluKGN4LCBcImNsYXNzXCIsICgpID0+XG4gICAgICBwcm9wcy5pc0ludmFsaWQ/LigpID8gYGJ0biBidG4tZGFuZ2VyYCA6IGBidG4gYnRuLXByaW1hcnlgXG4gICAgKVxuICAgIC5hdHRyKFwic3R5bGVcIiwgXCJ3aWR0aDogMi41ZW07IGhlaWdodDogMi41ZW1cIilcbiAgICAudGV4dChwcm9wcy5sZXR0ZXIpO1xufSk7XG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSBcIi4uL2xvZ2ljL2dhbWUvZ2FtZVwiO1xuaW1wb3J0IHsgY3JlYXRlQ29tcG9uZW50IH0gZnJvbSBcIi4uL3JlbmRlcmVyL2NvbXBvbmVudFwiO1xuaW1wb3J0IHsgRWwgfSBmcm9tIFwiLi4vcmVuZGVyZXIvZWxcIjtcbmltcG9ydCB7IFNpZ25hbCB9IGZyb20gXCIuLi9yZW5kZXJlci9yZWFjdGl2aXR5XCI7XG5pbXBvcnQgeyBMZXR0ZXJCdG4gfSBmcm9tIFwiLi9sZXR0ZXItYnRuXCI7XG5cbmludGVyZmFjZSBMZXR0ZXJQYW5lbFByb3BzIHtcbiAgZ2FtZTogU2lnbmFsPEdhbWU+O1xufVxuZXhwb3J0IGNvbnN0IExldHRlclBhbmVsID0gY3JlYXRlQ29tcG9uZW50KChjeCwgeyBnYW1lIH06IExldHRlclBhbmVsUHJvcHMpID0+IHtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB7XG4gICAgY29uc3QgY2hhciA9IGUuY29kZS5zbGljZSgzKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IGludmFsaWRJbmRleGVzSW5uZXIgPSBpbnZhbGlkSW5kZXhlcy5nZXQoKTtcbiAgICBjb25zdCByb3VuZCA9IGdhbWUuZ2V0KCkuY3VycmVudFJvdW5kKCk7XG4gICAgY29uc3QgZm91bmQgPSByb3VuZC52aXNpYmxlUmFuZG9tTGV0dGVycygpLmZpbmQoKHsgbGV0dGVyLCBpbmRleCB9KSA9PiB7XG4gICAgICBjb25zdCBub3RJbnZhbGlkID0gIWludmFsaWRJbmRleGVzSW5uZXIuaGFzKGluZGV4KTtcbiAgICAgIHJldHVybiBub3RJbnZhbGlkICYmIGNoYXIgPT09IGxldHRlcjtcbiAgICB9KTtcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIHBpY2soZm91bmQuaW5kZXgpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gcGljayhpbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgaXNWYWxpZCA9IGdhbWUuZ2V0KCkuZ3Vlc3MoaW5kZXgpO1xuICAgIGdhbWUuc2V0KGdhbWUuZ2V0KCkpO1xuXG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICB0cmlnZ2VySW52YWxpZEluZGV4KGluZGV4KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBpbnZhbGlkSW5kZXhlcyA9IGN4LmNyZWF0ZVNpZ25hbChuZXcgU2V0PG51bWJlcj4oKSk7XG4gIGZ1bmN0aW9uIHRyaWdnZXJJbnZhbGlkSW5kZXgoaW5kZXg6IG51bWJlcikge1xuICAgIGludmFsaWRJbmRleGVzLnVwZGF0ZSgoaWkpID0+IHtcbiAgICAgIGlpLmFkZChpbmRleCk7XG4gICAgICByZXR1cm4gaWk7XG4gICAgfSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpbnZhbGlkSW5kZXhlcy51cGRhdGUoKGlpKSA9PiB7XG4gICAgICAgIGlpLmRlbGV0ZShpbmRleCk7XG4gICAgICAgIHJldHVybiBpaTtcbiAgICAgIH0pO1xuICAgIH0sIDIwMCk7XG4gIH1cblxuICByZXR1cm4gRWwubmV3KFwiZGl2XCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImQtZmxleCBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyXCIpXG4gICAgLmF0dHIoXCJzdHlsZVwiLCBcImdhcDogMC41ZW1cIilcbiAgICAuaXRlckR5bihcbiAgICAgIGN4LFxuICAgICAgKCkgPT4gZ2FtZS5nZXQoKS5jdXJyZW50Um91bmQoKT8udmlzaWJsZVJhbmRvbUxldHRlcnMoKSA/PyBbXSxcbiAgICAgICh7IGxldHRlciwgaW5kZXggfSkgPT5cbiAgICAgICAgTGV0dGVyQnRuKGN4LCB7XG4gICAgICAgICAgbGV0dGVyLFxuICAgICAgICAgIGlzSW52YWxpZDogKCkgPT4gaW52YWxpZEluZGV4ZXMuZ2V0KCkuaGFzKGluZGV4KSxcbiAgICAgICAgICBwaWNrOiAoKSA9PiBwaWNrKGluZGV4KSxcbiAgICAgICAgfSlcbiAgICApO1xufSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGNhY2hlZE1vZHVsZS5lcnJvciAhPT0gdW5kZWZpbmVkKSB0aHJvdyBjYWNoZWRNb2R1bGUuZXJyb3I7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdHRyeSB7XG5cdFx0dmFyIGV4ZWNPcHRpb25zID0geyBpZDogbW9kdWxlSWQsIG1vZHVsZTogbW9kdWxlLCBmYWN0b3J5OiBfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXSwgcmVxdWlyZTogX193ZWJwYWNrX3JlcXVpcmVfXyB9O1xuXHRcdF9fd2VicGFja19yZXF1aXJlX18uaS5mb3JFYWNoKGZ1bmN0aW9uKGhhbmRsZXIpIHsgaGFuZGxlcihleGVjT3B0aW9ucyk7IH0pO1xuXHRcdG1vZHVsZSA9IGV4ZWNPcHRpb25zLm1vZHVsZTtcblx0XHRleGVjT3B0aW9ucy5mYWN0b3J5LmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIGV4ZWNPcHRpb25zLnJlcXVpcmUpO1xuXHR9IGNhdGNoKGUpIHtcblx0XHRtb2R1bGUuZXJyb3IgPSBlO1xuXHRcdHRocm93IGU7XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4vLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuX193ZWJwYWNrX3JlcXVpcmVfXy5jID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fO1xuXG4vLyBleHBvc2UgdGhlIG1vZHVsZSBleGVjdXRpb24gaW50ZXJjZXB0b3Jcbl9fd2VicGFja19yZXF1aXJlX18uaSA9IFtdO1xuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCIvLyBUaGlzIGZ1bmN0aW9uIGFsbG93IHRvIHJlZmVyZW5jZSBhbGwgY2h1bmtzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmh1ID0gKGNodW5rSWQpID0+IHtcblx0Ly8gcmV0dXJuIHVybCBmb3IgZmlsZW5hbWVzIGJhc2VkIG9uIHRlbXBsYXRlXG5cdHJldHVybiBcIlwiICsgY2h1bmtJZCArIFwiLlwiICsgX193ZWJwYWNrX3JlcXVpcmVfXy5oKCkgKyBcIi5ob3QtdXBkYXRlLmpzXCI7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uaG1yRiA9ICgpID0+IChcIm1haW4uXCIgKyBfX3dlYnBhY2tfcmVxdWlyZV9fLmgoKSArIFwiLmhvdC11cGRhdGUuanNvblwiKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmggPSAoKSA9PiAoXCI4MTEyYThiMjhkYjFlZjFkNmJlMlwiKSIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsInZhciBpblByb2dyZXNzID0ge307XG52YXIgZGF0YVdlYnBhY2tQcmVmaXggPSBcImZ1bmRyYWlzZXVwLXRlc3Q6XCI7XG4vLyBsb2FkU2NyaXB0IGZ1bmN0aW9uIHRvIGxvYWQgYSBzY3JpcHQgdmlhIHNjcmlwdCB0YWdcbl9fd2VicGFja19yZXF1aXJlX18ubCA9ICh1cmwsIGRvbmUsIGtleSwgY2h1bmtJZCkgPT4ge1xuXHRpZihpblByb2dyZXNzW3VybF0pIHsgaW5Qcm9ncmVzc1t1cmxdLnB1c2goZG9uZSk7IHJldHVybjsgfVxuXHR2YXIgc2NyaXB0LCBuZWVkQXR0YWNoO1xuXHRpZihrZXkgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHNjcmlwdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzID0gc2NyaXB0c1tpXTtcblx0XHRcdGlmKHMuZ2V0QXR0cmlidXRlKFwic3JjXCIpID09IHVybCB8fCBzLmdldEF0dHJpYnV0ZShcImRhdGEtd2VicGFja1wiKSA9PSBkYXRhV2VicGFja1ByZWZpeCArIGtleSkgeyBzY3JpcHQgPSBzOyBicmVhazsgfVxuXHRcdH1cblx0fVxuXHRpZighc2NyaXB0KSB7XG5cdFx0bmVlZEF0dGFjaCA9IHRydWU7XG5cdFx0c2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cblx0XHRzY3JpcHQuY2hhcnNldCA9ICd1dGYtOCc7XG5cdFx0c2NyaXB0LnRpbWVvdXQgPSAxMjA7XG5cdFx0aWYgKF9fd2VicGFja19yZXF1aXJlX18ubmMpIHtcblx0XHRcdHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBfX3dlYnBhY2tfcmVxdWlyZV9fLm5jKTtcblx0XHR9XG5cdFx0c2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtd2VicGFja1wiLCBkYXRhV2VicGFja1ByZWZpeCArIGtleSk7XG5cblx0XHRzY3JpcHQuc3JjID0gdXJsO1xuXHR9XG5cdGluUHJvZ3Jlc3NbdXJsXSA9IFtkb25lXTtcblx0dmFyIG9uU2NyaXB0Q29tcGxldGUgPSAocHJldiwgZXZlbnQpID0+IHtcblx0XHQvLyBhdm9pZCBtZW0gbGVha3MgaW4gSUUuXG5cdFx0c2NyaXB0Lm9uZXJyb3IgPSBzY3JpcHQub25sb2FkID0gbnVsbDtcblx0XHRjbGVhclRpbWVvdXQodGltZW91dCk7XG5cdFx0dmFyIGRvbmVGbnMgPSBpblByb2dyZXNzW3VybF07XG5cdFx0ZGVsZXRlIGluUHJvZ3Jlc3NbdXJsXTtcblx0XHRzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuXHRcdGRvbmVGbnMgJiYgZG9uZUZucy5mb3JFYWNoKChmbikgPT4gKGZuKGV2ZW50KSkpO1xuXHRcdGlmKHByZXYpIHJldHVybiBwcmV2KGV2ZW50KTtcblx0fVxuXHR2YXIgdGltZW91dCA9IHNldFRpbWVvdXQob25TY3JpcHRDb21wbGV0ZS5iaW5kKG51bGwsIHVuZGVmaW5lZCwgeyB0eXBlOiAndGltZW91dCcsIHRhcmdldDogc2NyaXB0IH0pLCAxMjAwMDApO1xuXHRzY3JpcHQub25lcnJvciA9IG9uU2NyaXB0Q29tcGxldGUuYmluZChudWxsLCBzY3JpcHQub25lcnJvcik7XG5cdHNjcmlwdC5vbmxvYWQgPSBvblNjcmlwdENvbXBsZXRlLmJpbmQobnVsbCwgc2NyaXB0Lm9ubG9hZCk7XG5cdG5lZWRBdHRhY2ggJiYgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xufTsiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJ2YXIgY3VycmVudE1vZHVsZURhdGEgPSB7fTtcbnZhciBpbnN0YWxsZWRNb2R1bGVzID0gX193ZWJwYWNrX3JlcXVpcmVfXy5jO1xuXG4vLyBtb2R1bGUgYW5kIHJlcXVpcmUgY3JlYXRpb25cbnZhciBjdXJyZW50Q2hpbGRNb2R1bGU7XG52YXIgY3VycmVudFBhcmVudHMgPSBbXTtcblxuLy8gc3RhdHVzXG52YXIgcmVnaXN0ZXJlZFN0YXR1c0hhbmRsZXJzID0gW107XG52YXIgY3VycmVudFN0YXR1cyA9IFwiaWRsZVwiO1xuXG4vLyB3aGlsZSBkb3dubG9hZGluZ1xudmFyIGJsb2NraW5nUHJvbWlzZXMgPSAwO1xudmFyIGJsb2NraW5nUHJvbWlzZXNXYWl0aW5nID0gW107XG5cbi8vIFRoZSB1cGRhdGUgaW5mb1xudmFyIGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzO1xudmFyIHF1ZXVlZEludmFsaWRhdGVkTW9kdWxlcztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmhtckQgPSBjdXJyZW50TW9kdWxlRGF0YTtcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5pLnB1c2goZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0dmFyIG1vZHVsZSA9IG9wdGlvbnMubW9kdWxlO1xuXHR2YXIgcmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUob3B0aW9ucy5yZXF1aXJlLCBvcHRpb25zLmlkKTtcblx0bW9kdWxlLmhvdCA9IGNyZWF0ZU1vZHVsZUhvdE9iamVjdChvcHRpb25zLmlkLCBtb2R1bGUpO1xuXHRtb2R1bGUucGFyZW50cyA9IGN1cnJlbnRQYXJlbnRzO1xuXHRtb2R1bGUuY2hpbGRyZW4gPSBbXTtcblx0Y3VycmVudFBhcmVudHMgPSBbXTtcblx0b3B0aW9ucy5yZXF1aXJlID0gcmVxdWlyZTtcbn0pO1xuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmhtckMgPSB7fTtcbl9fd2VicGFja19yZXF1aXJlX18uaG1ySSA9IHt9O1xuXG5mdW5jdGlvbiBjcmVhdGVSZXF1aXJlKHJlcXVpcmUsIG1vZHVsZUlkKSB7XG5cdHZhciBtZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xuXHRpZiAoIW1lKSByZXR1cm4gcmVxdWlyZTtcblx0dmFyIGZuID0gZnVuY3Rpb24gKHJlcXVlc3QpIHtcblx0XHRpZiAobWUuaG90LmFjdGl2ZSkge1xuXHRcdFx0aWYgKGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0pIHtcblx0XHRcdFx0dmFyIHBhcmVudHMgPSBpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdLnBhcmVudHM7XG5cdFx0XHRcdGlmIChwYXJlbnRzLmluZGV4T2YobW9kdWxlSWQpID09PSAtMSkge1xuXHRcdFx0XHRcdHBhcmVudHMucHVzaChtb2R1bGVJZCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN1cnJlbnRQYXJlbnRzID0gW21vZHVsZUlkXTtcblx0XHRcdFx0Y3VycmVudENoaWxkTW9kdWxlID0gcmVxdWVzdDtcblx0XHRcdH1cblx0XHRcdGlmIChtZS5jaGlsZHJlbi5pbmRleE9mKHJlcXVlc3QpID09PSAtMSkge1xuXHRcdFx0XHRtZS5jaGlsZHJlbi5wdXNoKHJlcXVlc3QpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdFwiW0hNUl0gdW5leHBlY3RlZCByZXF1aXJlKFwiICtcblx0XHRcdFx0XHRyZXF1ZXN0ICtcblx0XHRcdFx0XHRcIikgZnJvbSBkaXNwb3NlZCBtb2R1bGUgXCIgK1xuXHRcdFx0XHRcdG1vZHVsZUlkXG5cdFx0XHQpO1xuXHRcdFx0Y3VycmVudFBhcmVudHMgPSBbXTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlcXVpcmUocmVxdWVzdCk7XG5cdH07XG5cdHZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiAobmFtZSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiByZXF1aXJlW25hbWVdO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJlcXVpcmVbbmFtZV0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXHRmb3IgKHZhciBuYW1lIGluIHJlcXVpcmUpIHtcblx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJlcXVpcmUsIG5hbWUpICYmIG5hbWUgIT09IFwiZVwiKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIG5hbWUsIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvcihuYW1lKSk7XG5cdFx0fVxuXHR9XG5cdGZuLmUgPSBmdW5jdGlvbiAoY2h1bmtJZCkge1xuXHRcdHJldHVybiB0cmFja0Jsb2NraW5nUHJvbWlzZShyZXF1aXJlLmUoY2h1bmtJZCkpO1xuXHR9O1xuXHRyZXR1cm4gZm47XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1vZHVsZUhvdE9iamVjdChtb2R1bGVJZCwgbWUpIHtcblx0dmFyIF9tYWluID0gY3VycmVudENoaWxkTW9kdWxlICE9PSBtb2R1bGVJZDtcblx0dmFyIGhvdCA9IHtcblx0XHQvLyBwcml2YXRlIHN0dWZmXG5cdFx0X2FjY2VwdGVkRGVwZW5kZW5jaWVzOiB7fSxcblx0XHRfYWNjZXB0ZWRFcnJvckhhbmRsZXJzOiB7fSxcblx0XHRfZGVjbGluZWREZXBlbmRlbmNpZXM6IHt9LFxuXHRcdF9zZWxmQWNjZXB0ZWQ6IGZhbHNlLFxuXHRcdF9zZWxmRGVjbGluZWQ6IGZhbHNlLFxuXHRcdF9zZWxmSW52YWxpZGF0ZWQ6IGZhbHNlLFxuXHRcdF9kaXNwb3NlSGFuZGxlcnM6IFtdLFxuXHRcdF9tYWluOiBfbWFpbixcblx0XHRfcmVxdWlyZVNlbGY6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGN1cnJlbnRQYXJlbnRzID0gbWUucGFyZW50cy5zbGljZSgpO1xuXHRcdFx0Y3VycmVudENoaWxkTW9kdWxlID0gX21haW4gPyB1bmRlZmluZWQgOiBtb2R1bGVJZDtcblx0XHRcdF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpO1xuXHRcdH0sXG5cblx0XHQvLyBNb2R1bGUgQVBJXG5cdFx0YWN0aXZlOiB0cnVlLFxuXHRcdGFjY2VwdDogZnVuY3Rpb24gKGRlcCwgY2FsbGJhY2ssIGVycm9ySGFuZGxlcikge1xuXHRcdFx0aWYgKGRlcCA9PT0gdW5kZWZpbmVkKSBob3QuX3NlbGZBY2NlcHRlZCA9IHRydWU7XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgZGVwID09PSBcImZ1bmN0aW9uXCIpIGhvdC5fc2VsZkFjY2VwdGVkID0gZGVwO1xuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIiAmJiBkZXAgIT09IG51bGwpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZXAubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcFtpXV0gPSBjYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fTtcblx0XHRcdFx0XHRob3QuX2FjY2VwdGVkRXJyb3JIYW5kbGVyc1tkZXBbaV1dID0gZXJyb3JIYW5kbGVyO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcF0gPSBjYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fTtcblx0XHRcdFx0aG90Ll9hY2NlcHRlZEVycm9ySGFuZGxlcnNbZGVwXSA9IGVycm9ySGFuZGxlcjtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGRlY2xpbmU6IGZ1bmN0aW9uIChkZXApIHtcblx0XHRcdGlmIChkZXAgPT09IHVuZGVmaW5lZCkgaG90Ll9zZWxmRGVjbGluZWQgPSB0cnVlO1xuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIiAmJiBkZXAgIT09IG51bGwpXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKVxuXHRcdFx0XHRcdGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwW2ldXSA9IHRydWU7XG5cdFx0XHRlbHNlIGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwXSA9IHRydWU7XG5cdFx0fSxcblx0XHRkaXNwb3NlOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xuXHRcdH0sXG5cdFx0YWRkRGlzcG9zZUhhbmRsZXI6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXHRcdFx0aG90Ll9kaXNwb3NlSGFuZGxlcnMucHVzaChjYWxsYmFjayk7XG5cdFx0fSxcblx0XHRyZW1vdmVEaXNwb3NlSGFuZGxlcjogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgaWR4ID0gaG90Ll9kaXNwb3NlSGFuZGxlcnMuaW5kZXhPZihjYWxsYmFjayk7XG5cdFx0XHRpZiAoaWR4ID49IDApIGhvdC5fZGlzcG9zZUhhbmRsZXJzLnNwbGljZShpZHgsIDEpO1xuXHRcdH0sXG5cdFx0aW52YWxpZGF0ZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhpcy5fc2VsZkludmFsaWRhdGVkID0gdHJ1ZTtcblx0XHRcdHN3aXRjaCAoY3VycmVudFN0YXR1cykge1xuXHRcdFx0XHRjYXNlIFwiaWRsZVwiOlxuXHRcdFx0XHRcdGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzID0gW107XG5cdFx0XHRcdFx0T2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5obXJJKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uaG1ySVtrZXldKFxuXHRcdFx0XHRcdFx0XHRtb2R1bGVJZCxcblx0XHRcdFx0XHRcdFx0Y3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnNcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0c2V0U3RhdHVzKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJyZWFkeVwiOlxuXHRcdFx0XHRcdE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uaG1ySSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmhtcklba2V5XShcblx0XHRcdFx0XHRcdFx0bW9kdWxlSWQsXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwicHJlcGFyZVwiOlxuXHRcdFx0XHRjYXNlIFwiY2hlY2tcIjpcblx0XHRcdFx0Y2FzZSBcImRpc3Bvc2VcIjpcblx0XHRcdFx0Y2FzZSBcImFwcGx5XCI6XG5cdFx0XHRcdFx0KHF1ZXVlZEludmFsaWRhdGVkTW9kdWxlcyA9IHF1ZXVlZEludmFsaWRhdGVkTW9kdWxlcyB8fCBbXSkucHVzaChcblx0XHRcdFx0XHRcdG1vZHVsZUlkXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyBpZ25vcmUgcmVxdWVzdHMgaW4gZXJyb3Igc3RhdGVzXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vIE1hbmFnZW1lbnQgQVBJXG5cdFx0Y2hlY2s6IGhvdENoZWNrLFxuXHRcdGFwcGx5OiBob3RBcHBseSxcblx0XHRzdGF0dXM6IGZ1bmN0aW9uIChsKSB7XG5cdFx0XHRpZiAoIWwpIHJldHVybiBjdXJyZW50U3RhdHVzO1xuXHRcdFx0cmVnaXN0ZXJlZFN0YXR1c0hhbmRsZXJzLnB1c2gobCk7XG5cdFx0fSxcblx0XHRhZGRTdGF0dXNIYW5kbGVyOiBmdW5jdGlvbiAobCkge1xuXHRcdFx0cmVnaXN0ZXJlZFN0YXR1c0hhbmRsZXJzLnB1c2gobCk7XG5cdFx0fSxcblx0XHRyZW1vdmVTdGF0dXNIYW5kbGVyOiBmdW5jdGlvbiAobCkge1xuXHRcdFx0dmFyIGlkeCA9IHJlZ2lzdGVyZWRTdGF0dXNIYW5kbGVycy5pbmRleE9mKGwpO1xuXHRcdFx0aWYgKGlkeCA+PSAwKSByZWdpc3RlcmVkU3RhdHVzSGFuZGxlcnMuc3BsaWNlKGlkeCwgMSk7XG5cdFx0fSxcblxuXHRcdC8vaW5oZXJpdCBmcm9tIHByZXZpb3VzIGRpc3Bvc2UgY2FsbFxuXHRcdGRhdGE6IGN1cnJlbnRNb2R1bGVEYXRhW21vZHVsZUlkXVxuXHR9O1xuXHRjdXJyZW50Q2hpbGRNb2R1bGUgPSB1bmRlZmluZWQ7XG5cdHJldHVybiBob3Q7XG59XG5cbmZ1bmN0aW9uIHNldFN0YXR1cyhuZXdTdGF0dXMpIHtcblx0Y3VycmVudFN0YXR1cyA9IG5ld1N0YXR1cztcblx0dmFyIHJlc3VsdHMgPSBbXTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHJlZ2lzdGVyZWRTdGF0dXNIYW5kbGVycy5sZW5ndGg7IGkrKylcblx0XHRyZXN1bHRzW2ldID0gcmVnaXN0ZXJlZFN0YXR1c0hhbmRsZXJzW2ldLmNhbGwobnVsbCwgbmV3U3RhdHVzKTtcblxuXHRyZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cyk7XG59XG5cbmZ1bmN0aW9uIHVuYmxvY2soKSB7XG5cdGlmICgtLWJsb2NraW5nUHJvbWlzZXMgPT09IDApIHtcblx0XHRzZXRTdGF0dXMoXCJyZWFkeVwiKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChibG9ja2luZ1Byb21pc2VzID09PSAwKSB7XG5cdFx0XHRcdHZhciBsaXN0ID0gYmxvY2tpbmdQcm9taXNlc1dhaXRpbmc7XG5cdFx0XHRcdGJsb2NraW5nUHJvbWlzZXNXYWl0aW5nID0gW107XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGxpc3RbaV0oKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHRyYWNrQmxvY2tpbmdQcm9taXNlKHByb21pc2UpIHtcblx0c3dpdGNoIChjdXJyZW50U3RhdHVzKSB7XG5cdFx0Y2FzZSBcInJlYWR5XCI6XG5cdFx0XHRzZXRTdGF0dXMoXCJwcmVwYXJlXCIpO1xuXHRcdC8qIGZhbGx0aHJvdWdoICovXG5cdFx0Y2FzZSBcInByZXBhcmVcIjpcblx0XHRcdGJsb2NraW5nUHJvbWlzZXMrKztcblx0XHRcdHByb21pc2UudGhlbih1bmJsb2NrLCB1bmJsb2NrKTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0fVxufVxuXG5mdW5jdGlvbiB3YWl0Rm9yQmxvY2tpbmdQcm9taXNlcyhmbikge1xuXHRpZiAoYmxvY2tpbmdQcm9taXNlcyA9PT0gMCkgcmV0dXJuIGZuKCk7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdGJsb2NraW5nUHJvbWlzZXNXYWl0aW5nLnB1c2goZnVuY3Rpb24gKCkge1xuXHRcdFx0cmVzb2x2ZShmbigpKTtcblx0XHR9KTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhvdENoZWNrKGFwcGx5T25VcGRhdGUpIHtcblx0aWYgKGN1cnJlbnRTdGF0dXMgIT09IFwiaWRsZVwiKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiY2hlY2soKSBpcyBvbmx5IGFsbG93ZWQgaW4gaWRsZSBzdGF0dXNcIik7XG5cdH1cblx0cmV0dXJuIHNldFN0YXR1cyhcImNoZWNrXCIpXG5cdFx0LnRoZW4oX193ZWJwYWNrX3JlcXVpcmVfXy5obXJNKVxuXHRcdC50aGVuKGZ1bmN0aW9uICh1cGRhdGUpIHtcblx0XHRcdGlmICghdXBkYXRlKSB7XG5cdFx0XHRcdHJldHVybiBzZXRTdGF0dXMoYXBwbHlJbnZhbGlkYXRlZE1vZHVsZXMoKSA/IFwicmVhZHlcIiA6IFwiaWRsZVwiKS50aGVuKFxuXHRcdFx0XHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHNldFN0YXR1cyhcInByZXBhcmVcIikudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciB1cGRhdGVkTW9kdWxlcyA9IFtdO1xuXHRcdFx0XHRjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVycyA9IFtdO1xuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmFsbChcblx0XHRcdFx0XHRPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLmhtckMpLnJlZHVjZShmdW5jdGlvbiAoXG5cdFx0XHRcdFx0XHRwcm9taXNlcyxcblx0XHRcdFx0XHRcdGtleVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5obXJDW2tleV0oXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZS5jLFxuXHRcdFx0XHRcdFx0XHR1cGRhdGUucixcblx0XHRcdFx0XHRcdFx0dXBkYXRlLm0sXG5cdFx0XHRcdFx0XHRcdHByb21pc2VzLFxuXHRcdFx0XHRcdFx0XHRjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVycyxcblx0XHRcdFx0XHRcdFx0dXBkYXRlZE1vZHVsZXNcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcHJvbWlzZXM7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRbXSlcblx0XHRcdFx0KS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXR1cm4gd2FpdEZvckJsb2NraW5nUHJvbWlzZXMoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKGFwcGx5T25VcGRhdGUpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGludGVybmFsQXBwbHkoYXBwbHlPblVwZGF0ZSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gc2V0U3RhdHVzKFwicmVhZHlcIikudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHVwZGF0ZWRNb2R1bGVzO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcbn1cblxuZnVuY3Rpb24gaG90QXBwbHkob3B0aW9ucykge1xuXHRpZiAoY3VycmVudFN0YXR1cyAhPT0gXCJyZWFkeVwiKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcImFwcGx5KCkgaXMgb25seSBhbGxvd2VkIGluIHJlYWR5IHN0YXR1cyAoc3RhdGU6IFwiICtcblx0XHRcdFx0XHRjdXJyZW50U3RhdHVzICtcblx0XHRcdFx0XHRcIilcIlxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gaW50ZXJuYWxBcHBseShvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gaW50ZXJuYWxBcHBseShvcHRpb25zKSB7XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdGFwcGx5SW52YWxpZGF0ZWRNb2R1bGVzKCk7XG5cblx0dmFyIHJlc3VsdHMgPSBjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVycy5tYXAoZnVuY3Rpb24gKGhhbmRsZXIpIHtcblx0XHRyZXR1cm4gaGFuZGxlcihvcHRpb25zKTtcblx0fSk7XG5cdGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzID0gdW5kZWZpbmVkO1xuXG5cdHZhciBlcnJvcnMgPSByZXN1bHRzXG5cdFx0Lm1hcChmdW5jdGlvbiAocikge1xuXHRcdFx0cmV0dXJuIHIuZXJyb3I7XG5cdFx0fSlcblx0XHQuZmlsdGVyKEJvb2xlYW4pO1xuXG5cdGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuXHRcdHJldHVybiBzZXRTdGF0dXMoXCJhYm9ydFwiKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdHRocm93IGVycm9yc1swXTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIE5vdyBpbiBcImRpc3Bvc2VcIiBwaGFzZVxuXHR2YXIgZGlzcG9zZVByb21pc2UgPSBzZXRTdGF0dXMoXCJkaXNwb3NlXCIpO1xuXG5cdHJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbiAocmVzdWx0KSB7XG5cdFx0aWYgKHJlc3VsdC5kaXNwb3NlKSByZXN1bHQuZGlzcG9zZSgpO1xuXHR9KTtcblxuXHQvLyBOb3cgaW4gXCJhcHBseVwiIHBoYXNlXG5cdHZhciBhcHBseVByb21pc2UgPSBzZXRTdGF0dXMoXCJhcHBseVwiKTtcblxuXHR2YXIgZXJyb3I7XG5cdHZhciByZXBvcnRFcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcblx0XHRpZiAoIWVycm9yKSBlcnJvciA9IGVycjtcblx0fTtcblxuXHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW107XG5cdHJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbiAocmVzdWx0KSB7XG5cdFx0aWYgKHJlc3VsdC5hcHBseSkge1xuXHRcdFx0dmFyIG1vZHVsZXMgPSByZXN1bHQuYXBwbHkocmVwb3J0RXJyb3IpO1xuXHRcdFx0aWYgKG1vZHVsZXMpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0b3V0ZGF0ZWRNb2R1bGVzLnB1c2gobW9kdWxlc1tpXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBQcm9taXNlLmFsbChbZGlzcG9zZVByb21pc2UsIGFwcGx5UHJvbWlzZV0pLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdC8vIGhhbmRsZSBlcnJvcnMgaW4gYWNjZXB0IGhhbmRsZXJzIGFuZCBzZWxmIGFjY2VwdGVkIG1vZHVsZSBsb2FkXG5cdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRyZXR1cm4gc2V0U3RhdHVzKFwiZmFpbFwiKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAocXVldWVkSW52YWxpZGF0ZWRNb2R1bGVzKSB7XG5cdFx0XHRyZXR1cm4gaW50ZXJuYWxBcHBseShvcHRpb25zKS50aGVuKGZ1bmN0aW9uIChsaXN0KSB7XG5cdFx0XHRcdG91dGRhdGVkTW9kdWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChtb2R1bGVJZCkge1xuXHRcdFx0XHRcdGlmIChsaXN0LmluZGV4T2YobW9kdWxlSWQpIDwgMCkgbGlzdC5wdXNoKG1vZHVsZUlkKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBsaXN0O1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNldFN0YXR1cyhcImlkbGVcIikudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gb3V0ZGF0ZWRNb2R1bGVzO1xuXHRcdH0pO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlJbnZhbGlkYXRlZE1vZHVsZXMoKSB7XG5cdGlmIChxdWV1ZWRJbnZhbGlkYXRlZE1vZHVsZXMpIHtcblx0XHRpZiAoIWN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzKSBjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVycyA9IFtdO1xuXHRcdE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uaG1ySSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRxdWV1ZWRJbnZhbGlkYXRlZE1vZHVsZXMuZm9yRWFjaChmdW5jdGlvbiAobW9kdWxlSWQpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5obXJJW2tleV0oXG5cdFx0XHRcdFx0bW9kdWxlSWQsXG5cdFx0XHRcdFx0Y3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnNcblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHF1ZXVlZEludmFsaWRhdGVkTW9kdWxlcyA9IHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufSIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYztcblx0aWYgKCFzY3JpcHRVcmwpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGlmKHNjcmlwdHMubGVuZ3RoKSB7XG5cdFx0XHR2YXIgaSA9IHNjcmlwdHMubGVuZ3RoIC0gMTtcblx0XHRcdHdoaWxlIChpID4gLTEgJiYgIXNjcmlwdFVybCkgc2NyaXB0VXJsID0gc2NyaXB0c1tpLS1dLnNyYztcblx0XHR9XG5cdH1cbn1cbi8vIFdoZW4gc3VwcG9ydGluZyBicm93c2VycyB3aGVyZSBhbiBhdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIHlvdSBtdXN0IHNwZWNpZnkgYW4gb3V0cHV0LnB1YmxpY1BhdGggbWFudWFsbHkgdmlhIGNvbmZpZ3VyYXRpb25cbi8vIG9yIHBhc3MgYW4gZW1wdHkgc3RyaW5nIChcIlwiKSBhbmQgc2V0IHRoZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB2YXJpYWJsZSBmcm9tIHlvdXIgY29kZSB0byB1c2UgeW91ciBvd24gbG9naWMuXG5pZiAoIXNjcmlwdFVybCkgdGhyb3cgbmV3IEVycm9yKFwiQXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXJcIik7XG5zY3JpcHRVcmwgPSBzY3JpcHRVcmwucmVwbGFjZSgvIy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcPy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcL1teXFwvXSskLywgXCIvXCIpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gc2NyaXB0VXJsOyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0gX193ZWJwYWNrX3JlcXVpcmVfXy5obXJTX2pzb25wID0gX193ZWJwYWNrX3JlcXVpcmVfXy5obXJTX2pzb25wIHx8IHtcblx0XCJtYWluXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG52YXIgY3VycmVudFVwZGF0ZWRNb2R1bGVzTGlzdDtcbnZhciB3YWl0aW5nVXBkYXRlUmVzb2x2ZXMgPSB7fTtcbmZ1bmN0aW9uIGxvYWRVcGRhdGVDaHVuayhjaHVua0lkLCB1cGRhdGVkTW9kdWxlc0xpc3QpIHtcblx0Y3VycmVudFVwZGF0ZWRNb2R1bGVzTGlzdCA9IHVwZGF0ZWRNb2R1bGVzTGlzdDtcblx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHR3YWl0aW5nVXBkYXRlUmVzb2x2ZXNbY2h1bmtJZF0gPSByZXNvbHZlO1xuXHRcdC8vIHN0YXJ0IHVwZGF0ZSBjaHVuayBsb2FkaW5nXG5cdFx0dmFyIHVybCA9IF9fd2VicGFja19yZXF1aXJlX18ucCArIF9fd2VicGFja19yZXF1aXJlX18uaHUoY2h1bmtJZCk7XG5cdFx0Ly8gY3JlYXRlIGVycm9yIGJlZm9yZSBzdGFjayB1bndvdW5kIHRvIGdldCB1c2VmdWwgc3RhY2t0cmFjZSBsYXRlclxuXHRcdHZhciBlcnJvciA9IG5ldyBFcnJvcigpO1xuXHRcdHZhciBsb2FkaW5nRW5kZWQgPSAoZXZlbnQpID0+IHtcblx0XHRcdGlmKHdhaXRpbmdVcGRhdGVSZXNvbHZlc1tjaHVua0lkXSkge1xuXHRcdFx0XHR3YWl0aW5nVXBkYXRlUmVzb2x2ZXNbY2h1bmtJZF0gPSB1bmRlZmluZWRcblx0XHRcdFx0dmFyIGVycm9yVHlwZSA9IGV2ZW50ICYmIChldmVudC50eXBlID09PSAnbG9hZCcgPyAnbWlzc2luZycgOiBldmVudC50eXBlKTtcblx0XHRcdFx0dmFyIHJlYWxTcmMgPSBldmVudCAmJiBldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0LnNyYztcblx0XHRcdFx0ZXJyb3IubWVzc2FnZSA9ICdMb2FkaW5nIGhvdCB1cGRhdGUgY2h1bmsgJyArIGNodW5rSWQgKyAnIGZhaWxlZC5cXG4oJyArIGVycm9yVHlwZSArICc6ICcgKyByZWFsU3JjICsgJyknO1xuXHRcdFx0XHRlcnJvci5uYW1lID0gJ0NodW5rTG9hZEVycm9yJztcblx0XHRcdFx0ZXJyb3IudHlwZSA9IGVycm9yVHlwZTtcblx0XHRcdFx0ZXJyb3IucmVxdWVzdCA9IHJlYWxTcmM7XG5cdFx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmwodXJsLCBsb2FkaW5nRW5kZWQpO1xuXHR9KTtcbn1cblxuc2VsZltcIndlYnBhY2tIb3RVcGRhdGVmdW5kcmFpc2V1cF90ZXN0XCJdID0gKGNodW5rSWQsIG1vcmVNb2R1bGVzLCBydW50aW1lKSA9PiB7XG5cdGZvcih2YXIgbW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0Y3VycmVudFVwZGF0ZVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHRpZihjdXJyZW50VXBkYXRlZE1vZHVsZXNMaXN0KSBjdXJyZW50VXBkYXRlZE1vZHVsZXNMaXN0LnB1c2gobW9kdWxlSWQpO1xuXHRcdH1cblx0fVxuXHRpZihydW50aW1lKSBjdXJyZW50VXBkYXRlUnVudGltZS5wdXNoKHJ1bnRpbWUpO1xuXHRpZih3YWl0aW5nVXBkYXRlUmVzb2x2ZXNbY2h1bmtJZF0pIHtcblx0XHR3YWl0aW5nVXBkYXRlUmVzb2x2ZXNbY2h1bmtJZF0oKTtcblx0XHR3YWl0aW5nVXBkYXRlUmVzb2x2ZXNbY2h1bmtJZF0gPSB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbnZhciBjdXJyZW50VXBkYXRlQ2h1bmtzO1xudmFyIGN1cnJlbnRVcGRhdGU7XG52YXIgY3VycmVudFVwZGF0ZVJlbW92ZWRDaHVua3M7XG52YXIgY3VycmVudFVwZGF0ZVJ1bnRpbWU7XG5mdW5jdGlvbiBhcHBseUhhbmRsZXIob3B0aW9ucykge1xuXHRpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5mKSBkZWxldGUgX193ZWJwYWNrX3JlcXVpcmVfXy5mLmpzb25wSG1yO1xuXHRjdXJyZW50VXBkYXRlQ2h1bmtzID0gdW5kZWZpbmVkO1xuXHRmdW5jdGlvbiBnZXRBZmZlY3RlZE1vZHVsZUVmZmVjdHModXBkYXRlTW9kdWxlSWQpIHtcblx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW3VwZGF0ZU1vZHVsZUlkXTtcblx0XHR2YXIgb3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSB7fTtcblxuXHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5tYXAoZnVuY3Rpb24gKGlkKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRjaGFpbjogW2lkXSxcblx0XHRcdFx0aWQ6IGlkXG5cdFx0XHR9O1xuXHRcdH0pO1xuXHRcdHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XG5cdFx0XHR2YXIgcXVldWVJdGVtID0gcXVldWUucG9wKCk7XG5cdFx0XHR2YXIgbW9kdWxlSWQgPSBxdWV1ZUl0ZW0uaWQ7XG5cdFx0XHR2YXIgY2hhaW4gPSBxdWV1ZUl0ZW0uY2hhaW47XG5cdFx0XHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX3JlcXVpcmVfXy5jW21vZHVsZUlkXTtcblx0XHRcdGlmIChcblx0XHRcdFx0IW1vZHVsZSB8fFxuXHRcdFx0XHQobW9kdWxlLmhvdC5fc2VsZkFjY2VwdGVkICYmICFtb2R1bGUuaG90Ll9zZWxmSW52YWxpZGF0ZWQpXG5cdFx0XHQpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0aWYgKG1vZHVsZS5ob3QuX3NlbGZEZWNsaW5lZCkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHR5cGU6IFwic2VsZi1kZWNsaW5lZFwiLFxuXHRcdFx0XHRcdGNoYWluOiBjaGFpbixcblx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWRcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdGlmIChtb2R1bGUuaG90Ll9tYWluKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dHlwZTogXCJ1bmFjY2VwdGVkXCIsXG5cdFx0XHRcdFx0Y2hhaW46IGNoYWluLFxuXHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZFxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtb2R1bGUucGFyZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFyZW50SWQgPSBtb2R1bGUucGFyZW50c1tpXTtcblx0XHRcdFx0dmFyIHBhcmVudCA9IF9fd2VicGFja19yZXF1aXJlX18uY1twYXJlbnRJZF07XG5cdFx0XHRcdGlmICghcGFyZW50KSBjb250aW51ZTtcblx0XHRcdFx0aWYgKHBhcmVudC5ob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSkge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImRlY2xpbmVkXCIsXG5cdFx0XHRcdFx0XHRjaGFpbjogY2hhaW4uY29uY2F0KFtwYXJlbnRJZF0pLFxuXHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxuXHRcdFx0XHRcdFx0cGFyZW50SWQ6IHBhcmVudElkXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob3V0ZGF0ZWRNb2R1bGVzLmluZGV4T2YocGFyZW50SWQpICE9PSAtMSkgY29udGludWU7XG5cdFx0XHRcdGlmIChwYXJlbnQuaG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcblx0XHRcdFx0XHRpZiAoIW91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSlcblx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSA9IFtdO1xuXHRcdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSwgW21vZHVsZUlkXSk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZGVsZXRlIG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXTtcblx0XHRcdFx0b3V0ZGF0ZWRNb2R1bGVzLnB1c2gocGFyZW50SWQpO1xuXHRcdFx0XHRxdWV1ZS5wdXNoKHtcblx0XHRcdFx0XHRjaGFpbjogY2hhaW4uY29uY2F0KFtwYXJlbnRJZF0pLFxuXHRcdFx0XHRcdGlkOiBwYXJlbnRJZFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogXCJhY2NlcHRlZFwiLFxuXHRcdFx0bW9kdWxlSWQ6IHVwZGF0ZU1vZHVsZUlkLFxuXHRcdFx0b3V0ZGF0ZWRNb2R1bGVzOiBvdXRkYXRlZE1vZHVsZXMsXG5cdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llczogb3V0ZGF0ZWREZXBlbmRlbmNpZXNcblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gYWRkQWxsVG9TZXQoYSwgYikge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYi5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGl0ZW0gPSBiW2ldO1xuXHRcdFx0aWYgKGEuaW5kZXhPZihpdGVtKSA9PT0gLTEpIGEucHVzaChpdGVtKTtcblx0XHR9XG5cdH1cblxuXHQvLyBhdCBiZWdpbiBhbGwgdXBkYXRlcyBtb2R1bGVzIGFyZSBvdXRkYXRlZFxuXHQvLyB0aGUgXCJvdXRkYXRlZFwiIHN0YXR1cyBjYW4gcHJvcGFnYXRlIHRvIHBhcmVudHMgaWYgdGhleSBkb24ndCBhY2NlcHQgdGhlIGNoaWxkcmVuXG5cdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xuXHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW107XG5cdHZhciBhcHBsaWVkVXBkYXRlID0ge307XG5cblx0dmFyIHdhcm5VbmV4cGVjdGVkUmVxdWlyZSA9IGZ1bmN0aW9uIHdhcm5VbmV4cGVjdGVkUmVxdWlyZShtb2R1bGUpIHtcblx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcIltITVJdIHVuZXhwZWN0ZWQgcmVxdWlyZShcIiArIG1vZHVsZS5pZCArIFwiKSB0byBkaXNwb3NlZCBtb2R1bGVcIlxuXHRcdCk7XG5cdH07XG5cblx0Zm9yICh2YXIgbW9kdWxlSWQgaW4gY3VycmVudFVwZGF0ZSkge1xuXHRcdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm8oY3VycmVudFVwZGF0ZSwgbW9kdWxlSWQpKSB7XG5cdFx0XHR2YXIgbmV3TW9kdWxlRmFjdG9yeSA9IGN1cnJlbnRVcGRhdGVbbW9kdWxlSWRdO1xuXHRcdFx0LyoqIEB0eXBlIHtUT0RPfSAqL1xuXHRcdFx0dmFyIHJlc3VsdDtcblx0XHRcdGlmIChuZXdNb2R1bGVGYWN0b3J5KSB7XG5cdFx0XHRcdHJlc3VsdCA9IGdldEFmZmVjdGVkTW9kdWxlRWZmZWN0cyhtb2R1bGVJZCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQgPSB7XG5cdFx0XHRcdFx0dHlwZTogXCJkaXNwb3NlZFwiLFxuXHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZFxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0LyoqIEB0eXBlIHtFcnJvcnxmYWxzZX0gKi9cblx0XHRcdHZhciBhYm9ydEVycm9yID0gZmFsc2U7XG5cdFx0XHR2YXIgZG9BcHBseSA9IGZhbHNlO1xuXHRcdFx0dmFyIGRvRGlzcG9zZSA9IGZhbHNlO1xuXHRcdFx0dmFyIGNoYWluSW5mbyA9IFwiXCI7XG5cdFx0XHRpZiAocmVzdWx0LmNoYWluKSB7XG5cdFx0XHRcdGNoYWluSW5mbyA9IFwiXFxuVXBkYXRlIHByb3BhZ2F0aW9uOiBcIiArIHJlc3VsdC5jaGFpbi5qb2luKFwiIC0+IFwiKTtcblx0XHRcdH1cblx0XHRcdHN3aXRjaCAocmVzdWx0LnR5cGUpIHtcblx0XHRcdFx0Y2FzZSBcInNlbGYtZGVjbGluZWRcIjpcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkRlY2xpbmVkKSBvcHRpb25zLm9uRGVjbGluZWQocmVzdWx0KTtcblx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlRGVjbGluZWQpXG5cdFx0XHRcdFx0XHRhYm9ydEVycm9yID0gbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0XHRcIkFib3J0ZWQgYmVjYXVzZSBvZiBzZWxmIGRlY2xpbmU6IFwiICtcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHQubW9kdWxlSWQgK1xuXHRcdFx0XHRcdFx0XHRcdGNoYWluSW5mb1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImRlY2xpbmVkXCI6XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMub25EZWNsaW5lZCkgb3B0aW9ucy5vbkRlY2xpbmVkKHJlc3VsdCk7XG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zLmlnbm9yZURlY2xpbmVkKVxuXHRcdFx0XHRcdFx0YWJvcnRFcnJvciA9IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdFx0XCJBYm9ydGVkIGJlY2F1c2Ugb2YgZGVjbGluZWQgZGVwZW5kZW5jeTogXCIgK1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdC5tb2R1bGVJZCArXG5cdFx0XHRcdFx0XHRcdFx0XCIgaW4gXCIgK1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdC5wYXJlbnRJZCArXG5cdFx0XHRcdFx0XHRcdFx0Y2hhaW5JbmZvXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwidW5hY2NlcHRlZFwiOlxuXHRcdFx0XHRcdGlmIChvcHRpb25zLm9uVW5hY2NlcHRlZCkgb3B0aW9ucy5vblVuYWNjZXB0ZWQocmVzdWx0KTtcblx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlVW5hY2NlcHRlZClcblx0XHRcdFx0XHRcdGFib3J0RXJyb3IgPSBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XHRcdFwiQWJvcnRlZCBiZWNhdXNlIFwiICsgbW9kdWxlSWQgKyBcIiBpcyBub3QgYWNjZXB0ZWRcIiArIGNoYWluSW5mb1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImFjY2VwdGVkXCI6XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMub25BY2NlcHRlZCkgb3B0aW9ucy5vbkFjY2VwdGVkKHJlc3VsdCk7XG5cdFx0XHRcdFx0ZG9BcHBseSA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJkaXNwb3NlZFwiOlxuXHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRGlzcG9zZWQpIG9wdGlvbnMub25EaXNwb3NlZChyZXN1bHQpO1xuXHRcdFx0XHRcdGRvRGlzcG9zZSA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leGNlcHRpb24gdHlwZSBcIiArIHJlc3VsdC50eXBlKTtcblx0XHRcdH1cblx0XHRcdGlmIChhYm9ydEVycm9yKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0ZXJyb3I6IGFib3J0RXJyb3Jcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdGlmIChkb0FwcGx5KSB7XG5cdFx0XHRcdGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdID0gbmV3TW9kdWxlRmFjdG9yeTtcblx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWRNb2R1bGVzLCByZXN1bHQub3V0ZGF0ZWRNb2R1bGVzKTtcblx0XHRcdFx0Zm9yIChtb2R1bGVJZCBpbiByZXN1bHQub3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcblx0XHRcdFx0XHRpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5vKHJlc3VsdC5vdXRkYXRlZERlcGVuZGVuY2llcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdFx0XHRpZiAoIW91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSlcblx0XHRcdFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdID0gW107XG5cdFx0XHRcdFx0XHRhZGRBbGxUb1NldChcblx0XHRcdFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdLFxuXHRcdFx0XHRcdFx0XHRyZXN1bHQub3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGRvRGlzcG9zZSkge1xuXHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZE1vZHVsZXMsIFtyZXN1bHQubW9kdWxlSWRdKTtcblx0XHRcdFx0YXBwbGllZFVwZGF0ZVttb2R1bGVJZF0gPSB3YXJuVW5leHBlY3RlZFJlcXVpcmU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGN1cnJlbnRVcGRhdGUgPSB1bmRlZmluZWQ7XG5cblx0Ly8gU3RvcmUgc2VsZiBhY2NlcHRlZCBvdXRkYXRlZCBtb2R1bGVzIHRvIHJlcXVpcmUgdGhlbSBsYXRlciBieSB0aGUgbW9kdWxlIHN5c3RlbVxuXHR2YXIgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzID0gW107XG5cdGZvciAodmFyIGogPSAwOyBqIDwgb3V0ZGF0ZWRNb2R1bGVzLmxlbmd0aDsgaisrKSB7XG5cdFx0dmFyIG91dGRhdGVkTW9kdWxlSWQgPSBvdXRkYXRlZE1vZHVsZXNbal07XG5cdFx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19yZXF1aXJlX18uY1tvdXRkYXRlZE1vZHVsZUlkXTtcblx0XHRpZiAoXG5cdFx0XHRtb2R1bGUgJiZcblx0XHRcdChtb2R1bGUuaG90Ll9zZWxmQWNjZXB0ZWQgfHwgbW9kdWxlLmhvdC5fbWFpbikgJiZcblx0XHRcdC8vIHJlbW92ZWQgc2VsZi1hY2NlcHRlZCBtb2R1bGVzIHNob3VsZCBub3QgYmUgcmVxdWlyZWRcblx0XHRcdGFwcGxpZWRVcGRhdGVbb3V0ZGF0ZWRNb2R1bGVJZF0gIT09IHdhcm5VbmV4cGVjdGVkUmVxdWlyZSAmJlxuXHRcdFx0Ly8gd2hlbiBjYWxsZWQgaW52YWxpZGF0ZSBzZWxmLWFjY2VwdGluZyBpcyBub3QgcG9zc2libGVcblx0XHRcdCFtb2R1bGUuaG90Ll9zZWxmSW52YWxpZGF0ZWRcblx0XHQpIHtcblx0XHRcdG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcy5wdXNoKHtcblx0XHRcdFx0bW9kdWxlOiBvdXRkYXRlZE1vZHVsZUlkLFxuXHRcdFx0XHRyZXF1aXJlOiBtb2R1bGUuaG90Ll9yZXF1aXJlU2VsZixcblx0XHRcdFx0ZXJyb3JIYW5kbGVyOiBtb2R1bGUuaG90Ll9zZWxmQWNjZXB0ZWRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHZhciBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcztcblxuXHRyZXR1cm4ge1xuXHRcdGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGN1cnJlbnRVcGRhdGVSZW1vdmVkQ2h1bmtzLmZvckVhY2goZnVuY3Rpb24gKGNodW5rSWQpIHtcblx0XHRcdFx0ZGVsZXRlIGluc3RhbGxlZENodW5rc1tjaHVua0lkXTtcblx0XHRcdH0pO1xuXHRcdFx0Y3VycmVudFVwZGF0ZVJlbW92ZWRDaHVua3MgPSB1bmRlZmluZWQ7XG5cblx0XHRcdHZhciBpZHg7XG5cdFx0XHR2YXIgcXVldWUgPSBvdXRkYXRlZE1vZHVsZXMuc2xpY2UoKTtcblx0XHRcdHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHZhciBtb2R1bGVJZCA9IHF1ZXVlLnBvcCgpO1xuXHRcdFx0XHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX3JlcXVpcmVfXy5jW21vZHVsZUlkXTtcblx0XHRcdFx0aWYgKCFtb2R1bGUpIGNvbnRpbnVlO1xuXG5cdFx0XHRcdHZhciBkYXRhID0ge307XG5cblx0XHRcdFx0Ly8gQ2FsbCBkaXNwb3NlIGhhbmRsZXJzXG5cdFx0XHRcdHZhciBkaXNwb3NlSGFuZGxlcnMgPSBtb2R1bGUuaG90Ll9kaXNwb3NlSGFuZGxlcnM7XG5cdFx0XHRcdGZvciAoaiA9IDA7IGogPCBkaXNwb3NlSGFuZGxlcnMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRkaXNwb3NlSGFuZGxlcnNbal0uY2FsbChudWxsLCBkYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmhtckRbbW9kdWxlSWRdID0gZGF0YTtcblxuXHRcdFx0XHQvLyBkaXNhYmxlIG1vZHVsZSAodGhpcyBkaXNhYmxlcyByZXF1aXJlcyBmcm9tIHRoaXMgbW9kdWxlKVxuXHRcdFx0XHRtb2R1bGUuaG90LmFjdGl2ZSA9IGZhbHNlO1xuXG5cdFx0XHRcdC8vIHJlbW92ZSBtb2R1bGUgZnJvbSBjYWNoZVxuXHRcdFx0XHRkZWxldGUgX193ZWJwYWNrX3JlcXVpcmVfXy5jW21vZHVsZUlkXTtcblxuXHRcdFx0XHQvLyB3aGVuIGRpc3Bvc2luZyB0aGVyZSBpcyBubyBuZWVkIHRvIGNhbGwgZGlzcG9zZSBoYW5kbGVyXG5cdFx0XHRcdGRlbGV0ZSBvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF07XG5cblx0XHRcdFx0Ly8gcmVtb3ZlIFwicGFyZW50c1wiIHJlZmVyZW5jZXMgZnJvbSBhbGwgY2hpbGRyZW5cblx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IG1vZHVsZS5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdHZhciBjaGlsZCA9IF9fd2VicGFja19yZXF1aXJlX18uY1ttb2R1bGUuY2hpbGRyZW5bal1dO1xuXHRcdFx0XHRcdGlmICghY2hpbGQpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdGlkeCA9IGNoaWxkLnBhcmVudHMuaW5kZXhPZihtb2R1bGVJZCk7XG5cdFx0XHRcdFx0aWYgKGlkeCA+PSAwKSB7XG5cdFx0XHRcdFx0XHRjaGlsZC5wYXJlbnRzLnNwbGljZShpZHgsIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyByZW1vdmUgb3V0ZGF0ZWQgZGVwZW5kZW5jeSBmcm9tIG1vZHVsZSBjaGlsZHJlblxuXHRcdFx0dmFyIGRlcGVuZGVuY3k7XG5cdFx0XHRmb3IgKHZhciBvdXRkYXRlZE1vZHVsZUlkIGluIG91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XG5cdFx0XHRcdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm8ob3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG91dGRhdGVkTW9kdWxlSWQpKSB7XG5cdFx0XHRcdFx0bW9kdWxlID0gX193ZWJwYWNrX3JlcXVpcmVfXy5jW291dGRhdGVkTW9kdWxlSWRdO1xuXHRcdFx0XHRcdGlmIChtb2R1bGUpIHtcblx0XHRcdFx0XHRcdG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzID1cblx0XHRcdFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXNbb3V0ZGF0ZWRNb2R1bGVJZF07XG5cdFx0XHRcdFx0XHRmb3IgKGogPSAwOyBqIDwgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdFx0ZGVwZW5kZW5jeSA9IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzW2pdO1xuXHRcdFx0XHRcdFx0XHRpZHggPSBtb2R1bGUuY2hpbGRyZW4uaW5kZXhPZihkZXBlbmRlbmN5KTtcblx0XHRcdFx0XHRcdFx0aWYgKGlkeCA+PSAwKSBtb2R1bGUuY2hpbGRyZW4uc3BsaWNlKGlkeCwgMSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKHJlcG9ydEVycm9yKSB7XG5cdFx0XHQvLyBpbnNlcnQgbmV3IGNvZGVcblx0XHRcdGZvciAodmFyIHVwZGF0ZU1vZHVsZUlkIGluIGFwcGxpZWRVcGRhdGUpIHtcblx0XHRcdFx0aWYgKF9fd2VicGFja19yZXF1aXJlX18ubyhhcHBsaWVkVXBkYXRlLCB1cGRhdGVNb2R1bGVJZCkpIHtcblx0XHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bdXBkYXRlTW9kdWxlSWRdID0gYXBwbGllZFVwZGF0ZVt1cGRhdGVNb2R1bGVJZF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gcnVuIG5ldyBydW50aW1lIG1vZHVsZXNcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY3VycmVudFVwZGF0ZVJ1bnRpbWUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y3VycmVudFVwZGF0ZVJ1bnRpbWVbaV0oX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNhbGwgYWNjZXB0IGhhbmRsZXJzXG5cdFx0XHRmb3IgKHZhciBvdXRkYXRlZE1vZHVsZUlkIGluIG91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XG5cdFx0XHRcdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm8ob3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG91dGRhdGVkTW9kdWxlSWQpKSB7XG5cdFx0XHRcdFx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19yZXF1aXJlX18uY1tvdXRkYXRlZE1vZHVsZUlkXTtcblx0XHRcdFx0XHRpZiAobW9kdWxlKSB7XG5cdFx0XHRcdFx0XHRtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyA9XG5cdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW291dGRhdGVkTW9kdWxlSWRdO1xuXHRcdFx0XHRcdFx0dmFyIGNhbGxiYWNrcyA9IFtdO1xuXHRcdFx0XHRcdFx0dmFyIGVycm9ySGFuZGxlcnMgPSBbXTtcblx0XHRcdFx0XHRcdHZhciBkZXBlbmRlbmNpZXNGb3JDYWxsYmFja3MgPSBbXTtcblx0XHRcdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdFx0dmFyIGRlcGVuZGVuY3kgPSBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tqXTtcblx0XHRcdFx0XHRcdFx0dmFyIGFjY2VwdENhbGxiYWNrID1cblx0XHRcdFx0XHRcdFx0XHRtb2R1bGUuaG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBlbmRlbmN5XTtcblx0XHRcdFx0XHRcdFx0dmFyIGVycm9ySGFuZGxlciA9XG5cdFx0XHRcdFx0XHRcdFx0bW9kdWxlLmhvdC5fYWNjZXB0ZWRFcnJvckhhbmRsZXJzW2RlcGVuZGVuY3ldO1xuXHRcdFx0XHRcdFx0XHRpZiAoYWNjZXB0Q2FsbGJhY2spIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoY2FsbGJhY2tzLmluZGV4T2YoYWNjZXB0Q2FsbGJhY2spICE9PSAtMSkgY29udGludWU7XG5cdFx0XHRcdFx0XHRcdFx0Y2FsbGJhY2tzLnB1c2goYWNjZXB0Q2FsbGJhY2spO1xuXHRcdFx0XHRcdFx0XHRcdGVycm9ySGFuZGxlcnMucHVzaChlcnJvckhhbmRsZXIpO1xuXHRcdFx0XHRcdFx0XHRcdGRlcGVuZGVuY2llc0ZvckNhbGxiYWNrcy5wdXNoKGRlcGVuZGVuY3kpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBrID0gMDsgayA8IGNhbGxiYWNrcy5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdGNhbGxiYWNrc1trXS5jYWxsKG51bGwsIG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzKTtcblx0XHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBlcnJvckhhbmRsZXJzW2tdID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGVycm9ySGFuZGxlcnNba10oZXJyLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG91dGRhdGVkTW9kdWxlSWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVwZW5kZW5jeUlkOiBkZXBlbmRlbmNpZXNGb3JDYWxsYmFja3Nba11cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIyKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRXJyb3JlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25FcnJvcmVkKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwiYWNjZXB0LWVycm9yLWhhbmRsZXItZXJyb3JlZFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG91dGRhdGVkTW9kdWxlSWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZXBlbmRlbmN5SWQ6IGRlcGVuZGVuY2llc0ZvckNhbGxiYWNrc1trXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnIyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b3JpZ2luYWxFcnJvcjogZXJyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFvcHRpb25zLmlnbm9yZUVycm9yZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXBvcnRFcnJvcihlcnIyKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXBvcnRFcnJvcihlcnIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRXJyb3JlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRXJyb3JlZCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJhY2NlcHQtZXJyb3JlZFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBvdXRkYXRlZE1vZHVsZUlkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlcGVuZGVuY3lJZDogZGVwZW5kZW5jaWVzRm9yQ2FsbGJhY2tzW2tdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlRXJyb3JlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXBvcnRFcnJvcihlcnIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBMb2FkIHNlbGYgYWNjZXB0ZWQgbW9kdWxlc1xuXHRcdFx0Zm9yICh2YXIgbyA9IDA7IG8gPCBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMubGVuZ3RoOyBvKyspIHtcblx0XHRcdFx0dmFyIGl0ZW0gPSBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXNbb107XG5cdFx0XHRcdHZhciBtb2R1bGVJZCA9IGl0ZW0ubW9kdWxlO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGl0ZW0ucmVxdWlyZShtb2R1bGVJZCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgaXRlbS5lcnJvckhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0aXRlbS5lcnJvckhhbmRsZXIoZXJyLCB7XG5cdFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxuXHRcdFx0XHRcdFx0XHRcdG1vZHVsZTogX193ZWJwYWNrX3JlcXVpcmVfXy5jW21vZHVsZUlkXVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycjIpIHtcblx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMub25FcnJvcmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xuXHRcdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJzZWxmLWFjY2VwdC1lcnJvci1oYW5kbGVyLWVycm9yZWRcIixcblx0XHRcdFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZCxcblx0XHRcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnIyLFxuXHRcdFx0XHRcdFx0XHRcdFx0b3JpZ2luYWxFcnJvcjogZXJyXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKCFvcHRpb25zLmlnbm9yZUVycm9yZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXBvcnRFcnJvcihlcnIyKTtcblx0XHRcdFx0XHRcdFx0XHRyZXBvcnRFcnJvcihlcnIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRXJyb3JlZCkge1xuXHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRXJyb3JlZCh7XG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJzZWxmLWFjY2VwdC1lcnJvcmVkXCIsXG5cdFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxuXHRcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnJcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlRXJyb3JlZCkge1xuXHRcdFx0XHRcdFx0XHRyZXBvcnRFcnJvcihlcnIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gb3V0ZGF0ZWRNb2R1bGVzO1xuXHRcdH1cblx0fTtcbn1cbl9fd2VicGFja19yZXF1aXJlX18uaG1ySS5qc29ucCA9IGZ1bmN0aW9uIChtb2R1bGVJZCwgYXBwbHlIYW5kbGVycykge1xuXHRpZiAoIWN1cnJlbnRVcGRhdGUpIHtcblx0XHRjdXJyZW50VXBkYXRlID0ge307XG5cdFx0Y3VycmVudFVwZGF0ZVJ1bnRpbWUgPSBbXTtcblx0XHRjdXJyZW50VXBkYXRlUmVtb3ZlZENodW5rcyA9IFtdO1xuXHRcdGFwcGx5SGFuZGxlcnMucHVzaChhcHBseUhhbmRsZXIpO1xuXHR9XG5cdGlmICghX193ZWJwYWNrX3JlcXVpcmVfXy5vKGN1cnJlbnRVcGRhdGUsIG1vZHVsZUlkKSkge1xuXHRcdGN1cnJlbnRVcGRhdGVbbW9kdWxlSWRdID0gX193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXTtcblx0fVxufTtcbl9fd2VicGFja19yZXF1aXJlX18uaG1yQy5qc29ucCA9IGZ1bmN0aW9uIChcblx0Y2h1bmtJZHMsXG5cdHJlbW92ZWRDaHVua3MsXG5cdHJlbW92ZWRNb2R1bGVzLFxuXHRwcm9taXNlcyxcblx0YXBwbHlIYW5kbGVycyxcblx0dXBkYXRlZE1vZHVsZXNMaXN0XG4pIHtcblx0YXBwbHlIYW5kbGVycy5wdXNoKGFwcGx5SGFuZGxlcik7XG5cdGN1cnJlbnRVcGRhdGVDaHVua3MgPSB7fTtcblx0Y3VycmVudFVwZGF0ZVJlbW92ZWRDaHVua3MgPSByZW1vdmVkQ2h1bmtzO1xuXHRjdXJyZW50VXBkYXRlID0gcmVtb3ZlZE1vZHVsZXMucmVkdWNlKGZ1bmN0aW9uIChvYmosIGtleSkge1xuXHRcdG9ialtrZXldID0gZmFsc2U7XG5cdFx0cmV0dXJuIG9iajtcblx0fSwge30pO1xuXHRjdXJyZW50VXBkYXRlUnVudGltZSA9IFtdO1xuXHRjaHVua0lkcy5mb3JFYWNoKGZ1bmN0aW9uIChjaHVua0lkKSB7XG5cdFx0aWYgKFxuXHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiZcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSAhPT0gdW5kZWZpbmVkXG5cdFx0KSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKGxvYWRVcGRhdGVDaHVuayhjaHVua0lkLCB1cGRhdGVkTW9kdWxlc0xpc3QpKTtcblx0XHRcdGN1cnJlbnRVcGRhdGVDaHVua3NbY2h1bmtJZF0gPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjdXJyZW50VXBkYXRlQ2h1bmtzW2NodW5rSWRdID0gZmFsc2U7XG5cdFx0fVxuXHR9KTtcblx0aWYgKF9fd2VicGFja19yZXF1aXJlX18uZikge1xuXHRcdF9fd2VicGFja19yZXF1aXJlX18uZi5qc29ucEhtciA9IGZ1bmN0aW9uIChjaHVua0lkLCBwcm9taXNlcykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRjdXJyZW50VXBkYXRlQ2h1bmtzICYmXG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubyhjdXJyZW50VXBkYXRlQ2h1bmtzLCBjaHVua0lkKSAmJlxuXHRcdFx0XHQhY3VycmVudFVwZGF0ZUNodW5rc1tjaHVua0lkXVxuXHRcdFx0KSB7XG5cdFx0XHRcdHByb21pc2VzLnB1c2gobG9hZFVwZGF0ZUNodW5rKGNodW5rSWQpKTtcblx0XHRcdFx0Y3VycmVudFVwZGF0ZUNodW5rc1tjaHVua0lkXSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxufTtcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5obXJNID0gKCkgPT4ge1xuXHRpZiAodHlwZW9mIGZldGNoID09PSBcInVuZGVmaW5lZFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJObyBicm93c2VyIHN1cHBvcnQ6IG5lZWQgZmV0Y2ggQVBJXCIpO1xuXHRyZXR1cm4gZmV0Y2goX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgX193ZWJwYWNrX3JlcXVpcmVfXy5obXJGKCkpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0aWYocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHJldHVybjsgLy8gbm8gdXBkYXRlIGF2YWlsYWJsZVxuXHRcdGlmKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGZldGNoIHVwZGF0ZSBtYW5pZmVzdCBcIiArIHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuXHRcdHJldHVybiByZXNwb25zZS5qc29uKCk7XG5cdH0pO1xufTtcblxuLy8gbm8gb24gY2h1bmtzIGxvYWRlZFxuXG4vLyBubyBqc29ucCBmdW5jdGlvbiIsIiIsIi8vIG1vZHVsZSBjYWNoZSBhcmUgdXNlZCBzbyBlbnRyeSBpbmxpbmluZyBpcyBkaXNhYmxlZFxuLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6WyJBbnN3ZXJQYW5lbCIsIm1vdW50IiwiUnVudGltZSIsIkxldHRlclBhbmVsIiwiZ2FtZUZhY3RvcnkiLCJHYW1lU3RvcmUiLCJFbCIsIm1haW4iLCJjeCIsImdhbWVJbm5lciIsInJlc3RvcmUiLCJjaGVja1NhdmVBbmRBc2siLCJsaXN0ZW5lcnMiLCJvbkZpbmlzaCIsImRhdGEiLCJhbGVydCIsIkpTT04iLCJzdHJpbmdpZnkiLCJvblN1cnJlbmRlciIsIm5leHQiLCJzZXRUaW1lb3V0IiwiZ2FtZSIsInVwZGF0ZSIsImciLCJjcmVhdGVTaWduYWwiLCJjcmVhdGVFZmZlY3QiLCJzYXZlIiwiZ2V0IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwibmV3IiwidGV4dER5biIsImN1cnJlbnRSb3VuZEluZGV4IiwidG9TdHJpbmciLCJyb3VuZHMiLCJsZW5ndGgiLCJHYW1lIiwiUm91bmQiLCJMZXR0ZXJQaWNrZXIiLCJSYW5kb21pemVyIiwiTUFYX1dPUkRTX0lOX1FVRVVFIiwiV29yZFBpY2tlciIsIm9wdGlvbnMiLCJwaWNrUmFuZG9tV29yZHMiLCJmb3JFYWNoIiwid29yZCIsInJhbmRvbWl6ZXIiLCJsZXR0ZXJQaWNrZXIiLCJyYW5kb21Xb3JkTGV0dGVycyIsInJhbmRvbWl6ZSIsInJvdW5kIiwiYWRkUm91bmQiLCJLRVkiLCJjb25zdHJ1Y3RvciIsInBhcnNlZERhdGEiLCJwYXJzZSIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJjb25maXJtIiwiXyIsImdhbWVTdGF0ZSIsIm1hcCIsInIiLCJjdXJyZW50RXJyb3JzIiwicGlja2VkSW5kZXhlcyIsIkFycmF5IiwiZnJvbSIsInZhbHVlcyIsImFiYW5kb25lZCIsInNldEl0ZW0iLCJzYXZlZFJvdW5kIiwibmV3Um91bmQiLCJpbmRleCIsImFkZCIsImN1cnJlbnRSb3VuZCIsIm5leHRSb3VuZCIsIk1BWF9ST1VORF9FUlJPUlMiLCJtYXhFcnJvcnMiLCJTZXQiLCJhcmd1bWVudHMiLCJ1bmRlZmluZWQiLCJ2aXNpYmxlUmFuZG9tTGV0dGVycyIsImxldHRlciIsImZpbHRlciIsIl9yZWYiLCJoYXMiLCJndWVzcyIsInJhbmRvbUxldHRlckluZGV4IiwiZ3Vlc3NlZExldHRlciIsImN1cnJlbnRMZXR0ZXIiLCJzaXplIiwiZ3Vlc3NlZFJpZ2h0IiwiYWNjZXB0TGV0dGVyIiwidHJpZ2dlck1pc3Rha2UiLCJzdXJyZW5kZXIiLCJnYW1lU3RhdHMiLCJjb3JyZWN0Um91bmRzIiwiZXJyb3JBbW91bnQiLCJyZWR1Y2UiLCJzdW0iLCJzb3J0ZWRCeUVycm9yc0Rlc2MiLCJzb3J0IiwiYSIsImIiLCJ3b3JzdFdvcmQiLCJwdXNoIiwibGV0dGVycyIsInNwbGl0IiwiZnJlc2hTZXQiLCJpdGVtIiwicGljayIsImNvbGxlY3Rpb24iLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJXT1JEX1ZBUklBTlRTIiwid29yZHMiLCJnZXRSYW5kb21Xb3JkcyIsImFtb3VudCIsImNob3NlbldvcmRzIiwia2V5cyIsIndvcmRQaWNrZXIiLCJ3b3JkQ29sbGVjdGlvbiIsImNyZWF0ZUNvbXBvbmVudCIsImZuIiwiaHRtbEVsIiwidGFnTmFtZSIsImVsIiwiY3JlYXRlRWxlbWVudCIsImF0dHIiLCJhdHRyTmFtZSIsImF0dHJWYWx1ZSIsInNldEF0dHJpYnV0ZSIsImF0dHJEeW4iLCJyZW1vdmVBdHRyaWJ1dGUiLCJ2YWx1ZSIsIm9uIiwiZXZlbnROYW1lIiwiY2IiLCJhZGRFdmVudExpc3RlbmVyIiwidGV4dCIsIm5vZGUiLCJjcmVhdGVUZXh0Tm9kZSIsImFwcGVuZENoaWxkIiwiZiIsInRleHRDb250ZW50IiwiY2hpbGQiLCJpdGVyIiwiaXRlbXNJdGVyIiwibWFwcGVyIiwiaXRlckR5biIsImRpc3Bvc2VycyIsIml0ZXJFbmQiLCJjcmVhdGVDb21tZW50IiwiZGlzcG9zZXIiLCJpbnNlcnRCZWZvcmUiLCJyZW1vdmUiLCJyb290IiwicmVwbGFjZUNoaWxkcmVuIiwiU2lnbmFsIiwiaWQiLCJydW5uaW5nRWZmZWN0SWQiLCJzaWduYWxTdWJzIiwic2V0Iiwic2lnbmFsVmFsdWVzIiwic3ViSWRzIiwic3ViSWQiLCJydW5FZmZlY3QiLCJNYXAiLCJlZmZlY3RzIiwic2lnbmFsSWQiLCJTeW1ib2wiLCJlZmZlY3QiLCJlZmZlY3RJZCIsInByZXZFZmZlY3RJZCIsIkxldHRlckJ0biIsInNsaWNlIiwiaXNJbnZhbGlkIiwicHJvcHMiLCJ3aW5kb3ciLCJlIiwiY2hhciIsImNvZGUiLCJ0b0xvd2VyQ2FzZSIsImludmFsaWRJbmRleGVzSW5uZXIiLCJpbnZhbGlkSW5kZXhlcyIsImZvdW5kIiwiZmluZCIsIl9yZWYyIiwibm90SW52YWxpZCIsImlzVmFsaWQiLCJ0cmlnZ2VySW52YWxpZEluZGV4IiwiaWkiLCJkZWxldGUiLCJfcmVmMyJdLCJzb3VyY2VSb290IjoiIn0=