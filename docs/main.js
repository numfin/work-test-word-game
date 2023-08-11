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
  (0,_renderer_mount__WEBPACK_IMPORTED_MODULE_1__.mount)(document.querySelector("#current_question"), _renderer_el__WEBPACK_IMPORTED_MODULE_6__.El.new("span").textDyn(cx, () => (game.get().currentRoundIndex + 1).toString()));
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
        surrender: r.surrender,
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
      newRound.surrender = savedRound.surrender;
      game.addRound(newRound);
    }
    game.currentRoundIndex = gameState.currentRoundIndex;
    if (game.currentRound().surrender) {
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
  surrender = false;
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
    if (this.surrender) {
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
      this.surrender = true;
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
  get info() {
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
      this.listeners.onFinish(this.info);
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
    if (r.surrender) {
      return r.word.split("");
    }
    return r.word.slice(0, r.pickedIndexes.size).split("");
  }, letter => {
    return (0,_letter_btn__WEBPACK_IMPORTED_MODULE_2__.LetterBtn)(cx, {
      letter,
      isInvalid: () => !!round()?.surrender,
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
/******/ 		__webpack_require__.h = () => ("0a56424a555e8090bd8f")
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEVBQUU7V0FDRjs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLG1CQUFtQiwyQkFBMkI7V0FDOUM7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0Esa0JBQWtCLGNBQWM7V0FDaEM7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBLGNBQWMsTUFBTTtXQUNwQjtXQUNBO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGNBQWMsYUFBYTtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FD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c3JjL2luZGV4LnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvbG9naWMvZ2FtZS9nYW1lLWZhY3RvcnkudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9sb2dpYy9nYW1lL2dhbWUtc3RvcmUudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9sb2dpYy9nYW1lL2dhbWUudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9sb2dpYy9sZXR0ZXItcGlja2VyLnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvbG9naWMvcmFuZG9taXplci50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL2xvZ2ljL3dvcmQtcGlja2VyLnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50LnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvcmVuZGVyZXIvZWwudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9yZW5kZXJlci9tb3VudC50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL3JlbmRlcmVyL3JlYWN0aXZpdHkudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy91aS9hbnN3ZXItcGFuZWwudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy91aS9sZXR0ZXItYnRuLnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvdWkvbGV0dGVyLXBhbmVsLnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvZ2V0IGphdmFzY3JpcHQgdXBkYXRlIGNodW5rIGZpbGVuYW1lIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL2dldCB1cGRhdGUgbWFuaWZlc3QgZmlsZW5hbWUiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvZ2V0RnVsbEhhc2giLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9sb2FkIHNjcmlwdCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvaG90IG1vZHVsZSByZXBsYWNlbWVudCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFuc3dlclBhbmVsIH0gZnJvbSBcIi4vdWkvYW5zd2VyLXBhbmVsXCI7XG5pbXBvcnQgeyBtb3VudCB9IGZyb20gXCIuL3JlbmRlcmVyL21vdW50XCI7XG5pbXBvcnQgeyBSdW50aW1lIH0gZnJvbSBcIi4vcmVuZGVyZXIvcmVhY3Rpdml0eVwiO1xuaW1wb3J0IHsgTGV0dGVyUGFuZWwgfSBmcm9tIFwiLi91aS9sZXR0ZXItcGFuZWxcIjtcbmltcG9ydCB7IGdhbWVGYWN0b3J5IH0gZnJvbSBcIi4vbG9naWMvZ2FtZS9nYW1lLWZhY3RvcnlcIjtcbmltcG9ydCB7IEdhbWVTdG9yZSB9IGZyb20gXCIuL2xvZ2ljL2dhbWUvZ2FtZS1zdG9yZVwiO1xuaW1wb3J0IHsgRWwgfSBmcm9tIFwiLi9yZW5kZXJlci9lbFwiO1xuXG5mdW5jdGlvbiBtYWluKCkge1xuICBjb25zdCBjeCA9IG5ldyBSdW50aW1lKCk7XG5cbiAgY29uc3QgZ2FtZUlubmVyID0gZ2FtZUZhY3Rvcnkoe1xuICAgIHJlc3RvcmU6IEdhbWVTdG9yZS5jaGVja1NhdmVBbmRBc2soKSxcbiAgICBsaXN0ZW5lcnM6IHtcbiAgICAgIG9uRmluaXNoKGRhdGEpIHtcbiAgICAgICAgYWxlcnQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgfSxcbiAgICAgIG9uU3VycmVuZGVyKG5leHQpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgIC8vIHRyaWdnZXIgdXBkYXRlLCBzaW5jZSBHYW1lIGRvZXNuJ3Qga25vdyBhbnl0aGluZyBhYm91dCByZWFjdGl2aXR5XG4gICAgICAgICAgZ2FtZS51cGRhdGUoKGcpID0+IGcpO1xuICAgICAgICB9LCAyMDAwKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGdhbWUgPSBjeC5jcmVhdGVTaWduYWwoZ2FtZUlubmVyKTtcblxuICBjeC5jcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgIEdhbWVTdG9yZS5zYXZlKGdhbWUuZ2V0KCkpO1xuICB9KTtcblxuICBtb3VudChcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2N1cnJlbnRfcXVlc3Rpb25cIikhLFxuICAgIEVsLm5ldyhcInNwYW5cIikudGV4dER5bihjeCwgKCkgPT5cbiAgICAgIChnYW1lLmdldCgpLmN1cnJlbnRSb3VuZEluZGV4ICsgMSkudG9TdHJpbmcoKVxuICAgIClcbiAgKTtcblxuICBtb3VudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Fuc3dlclwiKSEsIEFuc3dlclBhbmVsKGN4LCB7IGdhbWUgfSkpO1xuICBtb3VudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2xldHRlcnNcIikhLCBMZXR0ZXJQYW5lbChjeCwgeyBnYW1lIH0pKTtcblxuICBtb3VudChcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2N1cnJlbnRfcXVlc3Rpb25cIikhLFxuICAgIEVsLm5ldyhcInNwYW5cIikudGV4dER5bihjeCwgKCkgPT5cbiAgICAgIChnYW1lLmdldCgpLmN1cnJlbnRSb3VuZEluZGV4ICsgMSkudG9TdHJpbmcoKVxuICAgIClcbiAgKTtcbiAgbW91bnQoXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0b3RhbF9xdWVzdGlvbnNcIikhLFxuICAgIEVsLm5ldyhcInNwYW5cIikudGV4dER5bihjeCwgKCkgPT4gZ2FtZS5nZXQoKS5yb3VuZHMubGVuZ3RoLnRvU3RyaW5nKCkpXG4gICk7XG59XG5cbm1haW4oKTtcbiIsImltcG9ydCB7IEZpbmlzaERhdGEsIEdhbWUsIFJvdW5kIH0gZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgTGV0dGVyUGlja2VyIH0gZnJvbSBcIi4uL2xldHRlci1waWNrZXJcIjtcbmltcG9ydCB7IFJhbmRvbWl6ZXIgfSBmcm9tIFwiLi4vcmFuZG9taXplclwiO1xuaW1wb3J0IHsgTUFYX1dPUkRTX0lOX1FVRVVFLCBXb3JkUGlja2VyIH0gZnJvbSBcIi4uL3dvcmQtcGlja2VyXCI7XG5pbXBvcnQgeyBHYW1lU3RvcmUgfSBmcm9tIFwiLi9nYW1lLXN0b3JlXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnYW1lRmFjdG9yeShvcHRpb25zOiB7XG4gIHJlc3RvcmU6IGJvb2xlYW47XG4gIGxpc3RlbmVyczoge1xuICAgIG9uU3VycmVuZGVyOiAobmV4dDogKCkgPT4gdm9pZCkgPT4gdm9pZDtcbiAgICBvbkZpbmlzaDogKGRhdGE6IEZpbmlzaERhdGEpID0+IHZvaWQ7XG4gIH07XG59KTogR2FtZSB7XG4gIGNvbnN0IGdhbWUgPSBuZXcgR2FtZShvcHRpb25zLmxpc3RlbmVycyk7XG5cbiAgaWYgKG9wdGlvbnMucmVzdG9yZSkge1xuICAgIEdhbWVTdG9yZS5yZXN0b3JlKGdhbWUpO1xuICB9IGVsc2Uge1xuICAgIFdvcmRQaWNrZXIucGlja1JhbmRvbVdvcmRzKE1BWF9XT1JEU19JTl9RVUVVRSkuZm9yRWFjaCgod29yZCkgPT4ge1xuICAgICAgY29uc3QgcmFuZG9taXplciA9IG5ldyBSYW5kb21pemVyKCk7XG4gICAgICBjb25zdCBsZXR0ZXJQaWNrZXIgPSBuZXcgTGV0dGVyUGlja2VyKHJhbmRvbWl6ZXIpO1xuICAgICAgY29uc3QgcmFuZG9tV29yZExldHRlcnMgPSBsZXR0ZXJQaWNrZXIucmFuZG9taXplKHdvcmQpO1xuXG4gICAgICBjb25zdCByb3VuZCA9IG5ldyBSb3VuZChnYW1lLCB3b3JkLCByYW5kb21Xb3JkTGV0dGVycyk7XG4gICAgICBnYW1lLmFkZFJvdW5kKHJvdW5kKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZ2FtZTtcbn1cbiIsImltcG9ydCB7IEdhbWUsIFJvdW5kIH0gZnJvbSBcIi4vZ2FtZVwiO1xuXG5jb25zdCBLRVkgPSBcImdhbWVzdGF0ZS1udW1maW5cIjtcblxuaW50ZXJmYWNlIEdhbWVTdGF0ZSB7XG4gIGN1cnJlbnRSb3VuZEluZGV4OiBudW1iZXI7XG4gIHJvdW5kczoge1xuICAgIHdvcmQ6IHN0cmluZztcbiAgICBjdXJyZW50RXJyb3JzOiBudW1iZXI7XG4gICAgcGlja2VkSW5kZXhlczogbnVtYmVyW107XG4gICAgc3VycmVuZGVyOiBib29sZWFuO1xuICAgIHJhbmRvbVdvcmRMZXR0ZXJzOiBzdHJpbmdbXTtcbiAgfVtdO1xufVxuXG5leHBvcnQgY2xhc3MgR2FtZVN0b3JlIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIHN0YXRpYyBjaGVja1NhdmVBbmRBc2soKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKEtFWSkgPz8gXCJcIik7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0eXBlb2YgcGFyc2VkRGF0YVtcImN1cnJlbnRSb3VuZEluZGV4XCJdID09PSBcIm51bWJlclwiICYmXG4gICAgICAgIGNvbmZpcm0oXCJSZXN0b3JlIGxhc3Qgc2Vzc2lvbj9cIilcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBzYXZlKGdhbWU6IEdhbWUpIHtcbiAgICBjb25zdCBnYW1lU3RhdGUgPSB7XG4gICAgICBjdXJyZW50Um91bmRJbmRleDogZ2FtZS5jdXJyZW50Um91bmRJbmRleCxcbiAgICAgIHJvdW5kczogZ2FtZS5yb3VuZHMubWFwKChyKSA9PiAoe1xuICAgICAgICB3b3JkOiByLndvcmQsXG4gICAgICAgIGN1cnJlbnRFcnJvcnM6IHIuY3VycmVudEVycm9ycyxcbiAgICAgICAgcGlja2VkSW5kZXhlczogQXJyYXkuZnJvbShyLnBpY2tlZEluZGV4ZXMudmFsdWVzKCkpLFxuICAgICAgICBzdXJyZW5kZXI6IHIuc3VycmVuZGVyLFxuICAgICAgICByYW5kb21Xb3JkTGV0dGVyczogci5yYW5kb21Xb3JkTGV0dGVycyxcbiAgICAgIH0pKSxcbiAgICB9O1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEtFWSwgSlNPTi5zdHJpbmdpZnkoZ2FtZVN0YXRlKSk7XG4gIH1cbiAgLyoqIE11dGF0ZSBnYW1lIHN0YXRlICovXG4gIHN0YXRpYyByZXN0b3JlKGdhbWU6IEdhbWUpIHtcbiAgICBjb25zdCBnYW1lU3RhdGU6IEdhbWVTdGF0ZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oS0VZKSA/PyBcIlwiKTtcbiAgICBmb3IgKGNvbnN0IHNhdmVkUm91bmQgb2YgZ2FtZVN0YXRlLnJvdW5kcykge1xuICAgICAgY29uc3QgbmV3Um91bmQgPSBuZXcgUm91bmQoXG4gICAgICAgIGdhbWUsXG4gICAgICAgIHNhdmVkUm91bmQud29yZCxcbiAgICAgICAgc2F2ZWRSb3VuZC5yYW5kb21Xb3JkTGV0dGVycyxcbiAgICAgICAgc2F2ZWRSb3VuZC5jdXJyZW50RXJyb3JzXG4gICAgICApO1xuICAgICAgc2F2ZWRSb3VuZC5waWNrZWRJbmRleGVzLmZvckVhY2goKGluZGV4KSA9PlxuICAgICAgICBuZXdSb3VuZC5waWNrZWRJbmRleGVzLmFkZChpbmRleClcbiAgICAgICk7XG4gICAgICBuZXdSb3VuZC5zdXJyZW5kZXIgPSBzYXZlZFJvdW5kLnN1cnJlbmRlcjtcbiAgICAgIGdhbWUuYWRkUm91bmQobmV3Um91bmQpO1xuICAgIH1cbiAgICBnYW1lLmN1cnJlbnRSb3VuZEluZGV4ID0gZ2FtZVN0YXRlLmN1cnJlbnRSb3VuZEluZGV4O1xuICAgIGlmIChnYW1lLmN1cnJlbnRSb3VuZCgpLnN1cnJlbmRlcikge1xuICAgICAgZ2FtZS5uZXh0Um91bmQoKTtcbiAgICB9XG4gIH1cbn1cbiIsImNvbnN0IE1BWF9ST1VORF9FUlJPUlMgPSAzO1xuXG5leHBvcnQgY2xhc3MgUm91bmQge1xuICBwcml2YXRlIG1heEVycm9ycyA9IE1BWF9ST1VORF9FUlJPUlM7XG4gIHB1YmxpYyBwaWNrZWRJbmRleGVzID0gbmV3IFNldDxudW1iZXI+KCk7XG4gIHB1YmxpYyBzdXJyZW5kZXIgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGdhbWU6IEdhbWUsXG4gICAgcHVibGljIHdvcmQ6IHN0cmluZyxcbiAgICBwdWJsaWMgcmFuZG9tV29yZExldHRlcnM6IHN0cmluZ1tdLFxuICAgIHB1YmxpYyBjdXJyZW50RXJyb3JzID0gMFxuICApIHt9XG5cbiAgdmlzaWJsZVJhbmRvbUxldHRlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucmFuZG9tV29yZExldHRlcnNcbiAgICAgIC5tYXAoKGxldHRlciwgaW5kZXgpID0+ICh7IGxldHRlciwgaW5kZXggfSkpXG4gICAgICAuZmlsdGVyKCh7IGluZGV4IH0pID0+ICF0aGlzLnBpY2tlZEluZGV4ZXMuaGFzKGluZGV4KSk7XG4gIH1cbiAgZ3Vlc3MocmFuZG9tTGV0dGVySW5kZXg6IG51bWJlcikge1xuICAgIGlmICh0aGlzLnN1cnJlbmRlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBndWVzc2VkTGV0dGVyID0gdGhpcy5yYW5kb21Xb3JkTGV0dGVyc1tyYW5kb21MZXR0ZXJJbmRleF07XG4gICAgY29uc3QgY3VycmVudExldHRlciA9IHRoaXMud29yZFt0aGlzLnBpY2tlZEluZGV4ZXMuc2l6ZV07XG4gICAgY29uc3QgZ3Vlc3NlZFJpZ2h0ID0gZ3Vlc3NlZExldHRlciA9PT0gY3VycmVudExldHRlcjtcbiAgICBpZiAoZ3Vlc3NlZFJpZ2h0KSB7XG4gICAgICB0aGlzLmFjY2VwdExldHRlcihyYW5kb21MZXR0ZXJJbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudHJpZ2dlck1pc3Rha2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIGd1ZXNzZWRSaWdodDtcbiAgfVxuXG4gIHByaXZhdGUgYWNjZXB0TGV0dGVyKHJhbmRvbUxldHRlckluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnBpY2tlZEluZGV4ZXMuYWRkKHJhbmRvbUxldHRlckluZGV4KTtcbiAgICBpZiAodGhpcy5waWNrZWRJbmRleGVzLnNpemUgPj0gdGhpcy53b3JkLmxlbmd0aCkge1xuICAgICAgdGhpcy5nYW1lLm5leHRSb3VuZCgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIHRyaWdnZXJNaXN0YWtlKCkge1xuICAgIHRoaXMuY3VycmVudEVycm9ycyArPSAxO1xuICAgIGlmICh0aGlzLmN1cnJlbnRFcnJvcnMgPj0gdGhpcy5tYXhFcnJvcnMpIHtcbiAgICAgIHRoaXMuc3VycmVuZGVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuZ2FtZS5zdXJyZW5kZXIoKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaW5pc2hEYXRhIHtcbiAgY29ycmVjdFJvdW5kczogbnVtYmVyO1xuICBlcnJvckFtb3VudDogbnVtYmVyO1xuICB3b3JzdFdvcmQ6IHN0cmluZztcbn1cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgcHVibGljIHJvdW5kczogUm91bmRbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbGlzdGVuZXJzOiB7XG4gICAgICBvblN1cnJlbmRlcjogKG5leHQ6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG4gICAgICBvbkZpbmlzaDogKGRhdGE6IEZpbmlzaERhdGEpID0+IHZvaWQ7XG4gICAgfSxcbiAgICBwdWJsaWMgY3VycmVudFJvdW5kSW5kZXggPSAwXG4gICkge31cbiAgZ2V0IGluZm8oKTogRmluaXNoRGF0YSB7XG4gICAgY29uc3QgY29ycmVjdFJvdW5kcyA9IHRoaXMucm91bmRzLmZpbHRlcigocikgPT4gci5jdXJyZW50RXJyb3JzID09PSAwKTtcbiAgICBjb25zdCBlcnJvckFtb3VudCA9IHRoaXMucm91bmRzLnJlZHVjZSgoc3VtLCByKSA9PiB7XG4gICAgICByZXR1cm4gc3VtICsgci5jdXJyZW50RXJyb3JzO1xuICAgIH0sIDApO1xuICAgIGNvbnN0IHNvcnRlZEJ5RXJyb3JzRGVzYyA9IHRoaXMucm91bmRzXG4gICAgICAuZmlsdGVyKChyKSA9PiByLmN1cnJlbnRFcnJvcnMgPiAwKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuY3VycmVudEVycm9ycyAtIGEuY3VycmVudEVycm9ycyk7XG4gICAgY29uc3Qgd29yc3RXb3JkID0gc29ydGVkQnlFcnJvcnNEZXNjWzBdPy53b3JkID8/IFwiXCI7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29ycmVjdFJvdW5kczogY29ycmVjdFJvdW5kcy5sZW5ndGgsXG4gICAgICBlcnJvckFtb3VudCxcbiAgICAgIHdvcnN0V29yZCxcbiAgICB9O1xuICB9XG5cbiAgYWRkUm91bmQocm91bmQ6IFJvdW5kKSB7XG4gICAgdGhpcy5yb3VuZHMucHVzaChyb3VuZCk7XG4gIH1cbiAgY3VycmVudFJvdW5kKCkge1xuICAgIHJldHVybiB0aGlzLnJvdW5kc1t0aGlzLmN1cnJlbnRSb3VuZEluZGV4XTtcbiAgfVxuICBndWVzcyhyYW5kb21MZXR0ZXJJbmRleDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFJvdW5kKCk/Lmd1ZXNzKHJhbmRvbUxldHRlckluZGV4KTtcbiAgfVxuICBzdXJyZW5kZXIoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMub25TdXJyZW5kZXIoKCkgPT4gdGhpcy5uZXh0Um91bmQoKSk7XG4gIH1cbiAgbmV4dFJvdW5kKCkge1xuICAgIGNvbnN0IG5leHRSb3VuZCA9IHRoaXMuY3VycmVudFJvdW5kSW5kZXggKyAxO1xuICAgIGlmIChuZXh0Um91bmQgPj0gdGhpcy5yb3VuZHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmxpc3RlbmVycy5vbkZpbmlzaCh0aGlzLmluZm8pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnRSb3VuZEluZGV4ID0gbmV4dFJvdW5kO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgUmFuZG9taXplciB9IGZyb20gXCIuL3JhbmRvbWl6ZXJcIjtcblxuZXhwb3J0IGNsYXNzIExldHRlclBpY2tlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmFuZG9taXplcjogUmFuZG9taXplcikge31cblxuICByYW5kb21pemUod29yZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGV0dGVycyA9IHdvcmQuc3BsaXQoXCJcIik7XG4gICAgY29uc3QgcGlja2VkSW5kZXhlcyA9IG5ldyBTZXQoKTtcblxuICAgIHJldHVybiBsZXR0ZXJzLm1hcCgoKSA9PiB7XG4gICAgICBjb25zdCBmcmVzaFNldCA9IGxldHRlcnNcbiAgICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+ICh7IGl0ZW0sIGluZGV4IH0pKVxuICAgICAgICAuZmlsdGVyKCh7IGluZGV4IH0pID0+ICFwaWNrZWRJbmRleGVzLmhhcyhpbmRleCkpO1xuICAgICAgY29uc3QgeyBpdGVtLCBpbmRleCB9ID0gdGhpcy5yYW5kb21pemVyLnBpY2soZnJlc2hTZXQpO1xuICAgICAgcGlja2VkSW5kZXhlcy5hZGQoaW5kZXgpO1xuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSk7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBSYW5kb21pemVyIHtcbiAgcGljazxUPihjb2xsZWN0aW9uOiBUW10pIHtcbiAgICBjb25zdCBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvbGxlY3Rpb24ubGVuZ3RoKTtcbiAgICByZXR1cm4gY29sbGVjdGlvbltpbmRleF07XG4gIH1cbn1cbiIsImltcG9ydCB7IFJhbmRvbWl6ZXIgfSBmcm9tIFwiLi9yYW5kb21pemVyXCI7XG5cbmV4cG9ydCBjb25zdCBXT1JEX1ZBUklBTlRTID0gW1xuICBcImFwcGxlXCIsXG4gIFwiZnVuY3Rpb25cIixcbiAgXCJ0aW1lb3V0XCIsXG4gIFwidGFza1wiLFxuICBcImFwcGxpY2F0aW9uXCIsXG4gIFwiZGF0YVwiLFxuICBcInRyYWdlZHlcIixcbiAgXCJzdW5cIixcbiAgXCJzeW1ib2xcIixcbiAgXCJidXR0b25cIixcbiAgXCJzb2Z0d2FyZVwiLFxuXTtcbmV4cG9ydCBjb25zdCBNQVhfV09SRFNfSU5fUVVFVUUgPSA2O1xuXG5leHBvcnQgY2xhc3MgV29yZFBpY2tlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmFuZG9taXplcjogUmFuZG9taXplciwgcHJpdmF0ZSB3b3Jkczogc3RyaW5nW10pIHt9XG5cbiAgZ2V0UmFuZG9tV29yZHMoYW1vdW50OiBudW1iZXIpIHtcbiAgICBjb25zdCBwaWNrZWRJbmRleGVzID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IGNob3NlbldvcmRzID0gW107XG4gICAgZm9yIChjb25zdCBfIG9mIEFycmF5KGFtb3VudCkua2V5cygpKSB7XG4gICAgICBjb25zdCBmcmVzaFNldCA9IHRoaXMud29yZHNcbiAgICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+ICh7IGl0ZW0sIGluZGV4IH0pKVxuICAgICAgICAuZmlsdGVyKCh7IGluZGV4IH0pID0+ICFwaWNrZWRJbmRleGVzLmhhcyhpbmRleCkpO1xuICAgICAgY29uc3QgeyBpbmRleCwgaXRlbSB9ID0gdGhpcy5yYW5kb21pemVyLnBpY2soZnJlc2hTZXQpO1xuICAgICAgcGlja2VkSW5kZXhlcy5hZGQoaW5kZXgpO1xuICAgICAgY2hvc2VuV29yZHMucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGNob3NlbldvcmRzO1xuICB9XG5cbiAgc3RhdGljIHBpY2tSYW5kb21Xb3JkcyhhbW91bnQ6IG51bWJlcikge1xuICAgIGNvbnN0IHJhbmRvbWl6ZXIgPSBuZXcgUmFuZG9taXplcigpO1xuICAgIGNvbnN0IHdvcmRQaWNrZXIgPSBuZXcgV29yZFBpY2tlcihyYW5kb21pemVyLCBXT1JEX1ZBUklBTlRTKTtcbiAgICBjb25zdCB3b3JkQ29sbGVjdGlvbiA9IHdvcmRQaWNrZXIuZ2V0UmFuZG9tV29yZHMoYW1vdW50KTtcbiAgICByZXR1cm4gd29yZENvbGxlY3Rpb247XG4gIH1cbn1cbiIsImltcG9ydCB7IEVsIH0gZnJvbSBcIi4vZWxcIjtcbmltcG9ydCB7IFJ1bnRpbWUgfSBmcm9tIFwiLi9yZWFjdGl2aXR5XCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnQ8VD4oZm46IChjeDogUnVudGltZSwgcHJvcHM6IFQpID0+IEVsKSB7XG4gIHJldHVybiBmbjtcbn1cbiIsImltcG9ydCB7IFJ1bnRpbWUgfSBmcm9tIFwiLi9yZWFjdGl2aXR5XCI7XG5cbmV4cG9ydCB0eXBlIEVNID0gSFRNTEVsZW1lbnRFdmVudE1hcDtcbmV4cG9ydCB0eXBlIFRNID0gSFRNTEVsZW1lbnRUYWdOYW1lTWFwO1xuXG5pbnRlcmZhY2UgRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEVNPiB7XG4gIChldmVudDogRU1bRXZlbnROYW1lXSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBFbCB7XG4gIHByaXZhdGUgY29uc3RydWN0b3IocHVibGljIGh0bWxFbDogSFRNTEVsZW1lbnQpIHt9XG4gIHN0YXRpYyBuZXc8VCBleHRlbmRzIGtleW9mIFRNPih0YWdOYW1lOiBUKSB7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICAgIHJldHVybiBuZXcgRWwoZWwpO1xuICB9XG4gIC8qKiBTdGF0aWMgYXR0cmlidXRlIGJpbmQgKi9cbiAgYXR0cihhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuaHRtbEVsLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0clZhbHVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKiBSZWFjdGl2ZSBhdHRyaWJ1dGUgYmluZCAqL1xuICBhdHRyRHluKGN4OiBSdW50aW1lLCBhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6ICgpID0+IHN0cmluZyB8IGJvb2xlYW4pIHtcbiAgICBjeC5jcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgICAgdGhpcy5odG1sRWwucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gYXR0clZhbHVlKCk7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICB0aGlzLmh0bWxFbC5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIFwidHJ1ZVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmh0bWxFbC5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmh0bWxFbC5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKiBhZGRFdmVudExpc3RlbmVyICovXG4gIG9uPFQgZXh0ZW5kcyBrZXlvZiBFTT4oZXZlbnROYW1lOiBULCBjYjogRXZlbnRIYW5kbGVyPFQ+KSB7XG4gICAgdGhpcy5odG1sRWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNiKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKiogU3RhdGljIHJlbmRlciBmb3IgdGV4dCAqL1xuICB0ZXh0KGRhdGE6IHN0cmluZykge1xuICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKTtcbiAgICB0aGlzLmh0bWxFbC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKiogUmVhY3RpdmUgcmVuZGVyIGZvciB0ZXh0ICovXG4gIHRleHREeW4oY3g6IFJ1bnRpbWUsIGY6ICgpID0+IHN0cmluZykge1xuICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtcbiAgICB0aGlzLmh0bWxFbC5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgIGN4LmNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgICBub2RlLnRleHRDb250ZW50ID0gZigpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqIFJlbmRlciBmb3IgY2hpbGQgY29tcG9uZW50ICovXG4gIGNoaWxkKGNoaWxkOiBFbCkge1xuICAgIHRoaXMuaHRtbEVsLmFwcGVuZENoaWxkKGNoaWxkLmh0bWxFbCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqIFN0YXRpYyByZW5kZXIgZm9yIGl0ZXJhdG9ycyAqL1xuICBpdGVyPFQ+KGl0ZW1zSXRlcjogSXRlcmFibGU8VD4sIG1hcHBlcjogKGl0ZW06IFQpID0+IEVsKTogRWwge1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtc0l0ZXIpIHtcbiAgICAgIGNvbnN0IGVsID0gbWFwcGVyKGl0ZW0pO1xuICAgICAgdGhpcy5odG1sRWwuYXBwZW5kQ2hpbGQoZWwuaHRtbEVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKiogUmVhY3RpdmUgcmVuZGVyIGZvciBpdGVyYXRvcnMgKi9cbiAgaXRlckR5bjxUPihcbiAgICBjeDogUnVudGltZSxcbiAgICBpdGVtc0l0ZXI6ICgpID0+IEl0ZXJhYmxlPFQ+LFxuICAgIG1hcHBlcjogKGl0ZW06IFQsIGluZGV4OiBudW1iZXIpID0+IEVsXG4gICk6IEVsIHtcbiAgICBjb25zdCBkaXNwb3NlcnM6ICgoKSA9PiB2b2lkKVtdID0gW107XG4gICAgY29uc3QgaXRlckVuZCA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoXCJpdGVyIGVuZFwiKTtcbiAgICB0aGlzLmh0bWxFbC5hcHBlbmRDaGlsZChpdGVyRW5kKTtcblxuICAgIGN4LmNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGRpc3Bvc2VyIG9mIGRpc3Bvc2Vycykge1xuICAgICAgICBkaXNwb3NlcigpO1xuICAgICAgfVxuICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtc0l0ZXIoKSkge1xuICAgICAgICBjb25zdCBlbCA9IG1hcHBlcihpdGVtLCBpbmRleCsrKTtcbiAgICAgICAgdGhpcy5odG1sRWwuaW5zZXJ0QmVmb3JlKGVsLmh0bWxFbCwgaXRlckVuZCk7XG4gICAgICAgIGRpc3Bvc2Vycy5wdXNoKCgpID0+IGVsLmh0bWxFbC5yZW1vdmUoKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiaW1wb3J0IHsgRWwgfSBmcm9tIFwiLi9lbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gbW91bnQocm9vdDogSFRNTEVsZW1lbnQsIGVsOiBFbCkge1xuICByb290LnJlcGxhY2VDaGlsZHJlbihlbC5odG1sRWwpO1xufVxuIiwidHlwZSBTaWduYWxJRCA9IFN5bWJvbDtcbnR5cGUgRWZmZWN0SUQgPSBTeW1ib2w7XG5cbi8qKlxuICogU2lnbmFsIHRoYXQgYWxsb3dzIHRvIHN1YnNjcmliZSBpbnNpZGUgZWZmZWN0cyBvbiBcImdldFwiXG4gKiBhbmQgbm90aWZ5IHN1YnNjcmliZXJzIG9uIFwic2V0XCJcbiAqL1xuZXhwb3J0IGNsYXNzIFNpZ25hbDxUPiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY3g6IFJ1bnRpbWUsIHByaXZhdGUgaWQ6IFNpZ25hbElEKSB7fVxuICBnZXQoKTogVCB7XG4gICAgaWYgKHRoaXMuY3gucnVubmluZ0VmZmVjdElkKSB7XG4gICAgICBpZiAoIXRoaXMuY3guc2lnbmFsU3Vicy5oYXModGhpcy5pZCkpIHtcbiAgICAgICAgdGhpcy5jeC5zaWduYWxTdWJzLnNldCh0aGlzLmlkLCBuZXcgU2V0KCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5jeC5zaWduYWxTdWJzLmdldCh0aGlzLmlkKT8uYWRkKHRoaXMuY3gucnVubmluZ0VmZmVjdElkKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3guc2lnbmFsVmFsdWVzLmdldCh0aGlzLmlkKTtcbiAgfVxuICBzZXQodmFsdWU6IFQpIHtcbiAgICB0aGlzLmN4LnNpZ25hbFZhbHVlcy5zZXQodGhpcy5pZCwgdmFsdWUpO1xuXG4gICAgY29uc3Qgc3ViSWRzID0gdGhpcy5jeC5zaWduYWxTdWJzLmdldCh0aGlzLmlkKTtcbiAgICBpZiAoc3ViSWRzKSB7XG4gICAgICBmb3IgKGNvbnN0IHN1YklkIG9mIHN1Yklkcykge1xuICAgICAgICB0aGlzLmN4LnJ1bkVmZmVjdChzdWJJZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHVwZGF0ZShmbjogKHY6IFQpID0+IFQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGZuKHRoaXMuY3guc2lnbmFsVmFsdWVzLmdldCh0aGlzLmlkKSk7XG4gICAgdGhpcy5zZXQodmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIFwiQXJlbmEgYWxsb2NhdG9yXCIgZm9yIHJlYWN0aXZlIHZhbHVlcyBhbmQgc3Vic2NyaWJlcnNcbiAqL1xuZXhwb3J0IGNsYXNzIFJ1bnRpbWUge1xuICBzaWduYWxWYWx1ZXMgPSBuZXcgTWFwPFNpZ25hbElELCBhbnk+KCk7XG4gIHJ1bm5pbmdFZmZlY3RJZD86IEVmZmVjdElEO1xuICBzaWduYWxTdWJzID0gbmV3IE1hcDxTaWduYWxJRCwgU2V0PEVmZmVjdElEPj4oKTtcbiAgZWZmZWN0cyA9IG5ldyBNYXA8RWZmZWN0SUQsICgpID0+IHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuICBjcmVhdGVTaWduYWw8VD4odmFsdWU6IFQpOiBTaWduYWw8VD4ge1xuICAgIGNvbnN0IHNpZ25hbElkID0gU3ltYm9sKCk7XG4gICAgdGhpcy5zaWduYWxWYWx1ZXMuc2V0KHNpZ25hbElkLCB2YWx1ZSk7XG4gICAgcmV0dXJuIG5ldyBTaWduYWwodGhpcywgc2lnbmFsSWQpO1xuICB9XG4gIGNyZWF0ZUVmZmVjdChlZmZlY3Q6ICgpID0+IHZvaWQpIHtcbiAgICBjb25zdCBlZmZlY3RJZCA9IFN5bWJvbCgpO1xuICAgIHRoaXMuZWZmZWN0cy5zZXQoZWZmZWN0SWQsIGVmZmVjdCk7XG5cbiAgICB0aGlzLnJ1bkVmZmVjdChlZmZlY3RJZCk7XG4gIH1cbiAgcnVuRWZmZWN0KGVmZmVjdElkOiBFZmZlY3RJRCkge1xuICAgIGNvbnN0IHByZXZFZmZlY3RJZCA9IHRoaXMucnVubmluZ0VmZmVjdElkO1xuICAgIHRoaXMucnVubmluZ0VmZmVjdElkID0gZWZmZWN0SWQ7XG4gICAgdGhpcy5lZmZlY3RzLmdldChlZmZlY3RJZCk/LigpO1xuICAgIHRoaXMucnVubmluZ0VmZmVjdElkID0gcHJldkVmZmVjdElkO1xuICB9XG59XG4iLCJpbXBvcnQgeyBHYW1lIH0gZnJvbSBcIi4uL2xvZ2ljL2dhbWUvZ2FtZVwiO1xuaW1wb3J0IHsgY3JlYXRlQ29tcG9uZW50IH0gZnJvbSBcIi4uL3JlbmRlcmVyL2NvbXBvbmVudFwiO1xuaW1wb3J0IHsgRWwgfSBmcm9tIFwiLi4vcmVuZGVyZXIvZWxcIjtcbmltcG9ydCB7IFNpZ25hbCB9IGZyb20gXCIuLi9yZW5kZXJlci9yZWFjdGl2aXR5XCI7XG5pbXBvcnQgeyBMZXR0ZXJCdG4gfSBmcm9tIFwiLi9sZXR0ZXItYnRuXCI7XG5cbmludGVyZmFjZSBBbnN3ZXJQYW5lbFByb3BzIHtcbiAgZ2FtZTogU2lnbmFsPEdhbWU+O1xufVxuXG5leHBvcnQgY29uc3QgQW5zd2VyUGFuZWwgPSBjcmVhdGVDb21wb25lbnQoKGN4LCB7IGdhbWUgfTogQW5zd2VyUGFuZWxQcm9wcykgPT4ge1xuICBjb25zdCByb3VuZCA9ICgpID0+IGdhbWUuZ2V0KCkuY3VycmVudFJvdW5kKCk7XG4gIHJldHVybiBFbC5uZXcoXCJkaXZcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwiZC1mbGV4IGp1c3RpZnktY29udGVudC1jZW50ZXJcIilcbiAgICAuYXR0cihcInN0eWxlXCIsIFwiZ2FwOiAwLjVlbVwiKVxuICAgIC5pdGVyRHluKFxuICAgICAgY3gsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHIgPSByb3VuZCgpO1xuICAgICAgICBpZiAoIXIpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHIuc3VycmVuZGVyKSB7XG4gICAgICAgICAgcmV0dXJuIHIud29yZC5zcGxpdChcIlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gci53b3JkLnNsaWNlKDAsIHIucGlja2VkSW5kZXhlcy5zaXplKS5zcGxpdChcIlwiKTtcbiAgICAgIH0sXG4gICAgICAobGV0dGVyKSA9PiB7XG4gICAgICAgIHJldHVybiBMZXR0ZXJCdG4oY3gsIHtcbiAgICAgICAgICBsZXR0ZXIsXG4gICAgICAgICAgaXNJbnZhbGlkOiAoKSA9PiAhIXJvdW5kKCk/LnN1cnJlbmRlcixcbiAgICAgICAgICBwaWNrOiAoKSA9PiB7fSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbn0pO1xuIiwiaW1wb3J0IHsgY3JlYXRlQ29tcG9uZW50IH0gZnJvbSBcIi4uL3JlbmRlcmVyL2NvbXBvbmVudFwiO1xuaW1wb3J0IHsgRWwgfSBmcm9tIFwiLi4vcmVuZGVyZXIvZWxcIjtcblxuaW50ZXJmYWNlIExldHRlckJ0blByb3BzIHtcbiAgcGljaz86ICgpID0+IHZvaWQ7XG4gIGlzSW52YWxpZD86ICgpID0+IGJvb2xlYW47XG4gIGxldHRlcjogc3RyaW5nO1xufVxuZXhwb3J0IGNvbnN0IExldHRlckJ0biA9IGNyZWF0ZUNvbXBvbmVudCgoY3gsIHByb3BzOiBMZXR0ZXJCdG5Qcm9wcykgPT4ge1xuICByZXR1cm4gRWwubmV3KFwiYnV0dG9uXCIpXG4gICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4gcHJvcHMucGljaz8uKCkpXG4gICAgLmF0dHIoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpXG4gICAgLmF0dHJEeW4oY3gsIFwiY2xhc3NcIiwgKCkgPT5cbiAgICAgIHByb3BzLmlzSW52YWxpZD8uKCkgPyBgYnRuIGJ0bi1kYW5nZXJgIDogYGJ0biBidG4tcHJpbWFyeWBcbiAgICApXG4gICAgLmF0dHIoXCJzdHlsZVwiLCBcIndpZHRoOiAyLjVlbTsgaGVpZ2h0OiAyLjVlbVwiKVxuICAgIC50ZXh0KHByb3BzLmxldHRlcik7XG59KTtcbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tIFwiLi4vbG9naWMvZ2FtZS9nYW1lXCI7XG5pbXBvcnQgeyBjcmVhdGVDb21wb25lbnQgfSBmcm9tIFwiLi4vcmVuZGVyZXIvY29tcG9uZW50XCI7XG5pbXBvcnQgeyBFbCB9IGZyb20gXCIuLi9yZW5kZXJlci9lbFwiO1xuaW1wb3J0IHsgU2lnbmFsIH0gZnJvbSBcIi4uL3JlbmRlcmVyL3JlYWN0aXZpdHlcIjtcbmltcG9ydCB7IExldHRlckJ0biB9IGZyb20gXCIuL2xldHRlci1idG5cIjtcblxuaW50ZXJmYWNlIExldHRlclBhbmVsUHJvcHMge1xuICBnYW1lOiBTaWduYWw8R2FtZT47XG59XG5leHBvcnQgY29uc3QgTGV0dGVyUGFuZWwgPSBjcmVhdGVDb21wb25lbnQoKGN4LCB7IGdhbWUgfTogTGV0dGVyUGFuZWxQcm9wcykgPT4ge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHtcbiAgICBjb25zdCBjaGFyID0gZS5jb2RlLnNsaWNlKDMpLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgaW52YWxpZEluZGV4ZXNJbm5lciA9IGludmFsaWRJbmRleGVzLmdldCgpO1xuICAgIGNvbnN0IHJvdW5kID0gZ2FtZS5nZXQoKS5jdXJyZW50Um91bmQoKTtcbiAgICBjb25zdCBmb3VuZCA9IHJvdW5kLnZpc2libGVSYW5kb21MZXR0ZXJzKCkuZmluZCgoeyBsZXR0ZXIsIGluZGV4IH0pID0+IHtcbiAgICAgIGNvbnN0IG5vdEludmFsaWQgPSAhaW52YWxpZEluZGV4ZXNJbm5lci5oYXMoaW5kZXgpO1xuICAgICAgcmV0dXJuIG5vdEludmFsaWQgJiYgY2hhciA9PT0gbGV0dGVyO1xuICAgIH0pO1xuICAgIGlmIChmb3VuZCkge1xuICAgICAgcGljayhmb3VuZC5pbmRleCk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBwaWNrKGluZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCBpc1ZhbGlkID0gZ2FtZS5nZXQoKS5ndWVzcyhpbmRleCk7XG4gICAgZ2FtZS5zZXQoZ2FtZS5nZXQoKSk7XG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHRyaWdnZXJJbnZhbGlkSW5kZXgoaW5kZXgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGludmFsaWRJbmRleGVzID0gY3guY3JlYXRlU2lnbmFsKG5ldyBTZXQ8bnVtYmVyPigpKTtcbiAgZnVuY3Rpb24gdHJpZ2dlckludmFsaWRJbmRleChpbmRleDogbnVtYmVyKSB7XG4gICAgaW52YWxpZEluZGV4ZXMudXBkYXRlKChpaSkgPT4ge1xuICAgICAgaWkuYWRkKGluZGV4KTtcbiAgICAgIHJldHVybiBpaTtcbiAgICB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGludmFsaWRJbmRleGVzLnVwZGF0ZSgoaWkpID0+IHtcbiAgICAgICAgaWkuZGVsZXRlKGluZGV4KTtcbiAgICAgICAgcmV0dXJuIGlpO1xuICAgICAgfSk7XG4gICAgfSwgMjAwKTtcbiAgfVxuXG4gIHJldHVybiBFbC5uZXcoXCJkaXZcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwiZC1mbGV4IGp1c3RpZnktY29udGVudC1jZW50ZXJcIilcbiAgICAuYXR0cihcInN0eWxlXCIsIFwiZ2FwOiAwLjVlbVwiKVxuICAgIC5pdGVyRHluKFxuICAgICAgY3gsXG4gICAgICAoKSA9PiBnYW1lLmdldCgpLmN1cnJlbnRSb3VuZCgpPy52aXNpYmxlUmFuZG9tTGV0dGVycygpID8/IFtdLFxuICAgICAgKHsgbGV0dGVyLCBpbmRleCB9KSA9PlxuICAgICAgICBMZXR0ZXJCdG4oY3gsIHtcbiAgICAgICAgICBsZXR0ZXIsXG4gICAgICAgICAgaXNJbnZhbGlkOiAoKSA9PiBpbnZhbGlkSW5kZXhlcy5nZXQoKS5oYXMoaW5kZXgpLFxuICAgICAgICAgIHBpY2s6ICgpID0+IHBpY2soaW5kZXgpLFxuICAgICAgICB9KVxuICAgICk7XG59KTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAoY2FjaGVkTW9kdWxlLmVycm9yICE9PSB1bmRlZmluZWQpIHRocm93IGNhY2hlZE1vZHVsZS5lcnJvcjtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0dHJ5IHtcblx0XHR2YXIgZXhlY09wdGlvbnMgPSB7IGlkOiBtb2R1bGVJZCwgbW9kdWxlOiBtb2R1bGUsIGZhY3Rvcnk6IF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLCByZXF1aXJlOiBfX3dlYnBhY2tfcmVxdWlyZV9fIH07XG5cdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pLmZvckVhY2goZnVuY3Rpb24oaGFuZGxlcikgeyBoYW5kbGVyKGV4ZWNPcHRpb25zKTsgfSk7XG5cdFx0bW9kdWxlID0gZXhlY09wdGlvbnMubW9kdWxlO1xuXHRcdGV4ZWNPcHRpb25zLmZhY3RvcnkuY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgZXhlY09wdGlvbnMucmVxdWlyZSk7XG5cdH0gY2F0Y2goZSkge1xuXHRcdG1vZHVsZS5lcnJvciA9IGU7XG5cdFx0dGhyb3cgZTtcblx0fVxuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX187XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlIGV4ZWN1dGlvbiBpbnRlcmNlcHRvclxuX193ZWJwYWNrX3JlcXVpcmVfXy5pID0gW107XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIi8vIFRoaXMgZnVuY3Rpb24gYWxsb3cgdG8gcmVmZXJlbmNlIGFsbCBjaHVua3Ncbl9fd2VicGFja19yZXF1aXJlX18uaHUgPSAoY2h1bmtJZCkgPT4ge1xuXHQvLyByZXR1cm4gdXJsIGZvciBmaWxlbmFtZXMgYmFzZWQgb24gdGVtcGxhdGVcblx0cmV0dXJuIFwiXCIgKyBjaHVua0lkICsgXCIuXCIgKyBfX3dlYnBhY2tfcmVxdWlyZV9fLmgoKSArIFwiLmhvdC11cGRhdGUuanNcIjtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5obXJGID0gKCkgPT4gKFwibWFpbi5cIiArIF9fd2VicGFja19yZXF1aXJlX18uaCgpICsgXCIuaG90LXVwZGF0ZS5qc29uXCIpOyIsIl9fd2VicGFja19yZXF1aXJlX18uaCA9ICgpID0+IChcIjBhNTY0MjRhNTU1ZTgwOTBiZDhmXCIpIiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwidmFyIGluUHJvZ3Jlc3MgPSB7fTtcbnZhciBkYXRhV2VicGFja1ByZWZpeCA9IFwiZnVuZHJhaXNldXAtdGVzdDpcIjtcbi8vIGxvYWRTY3JpcHQgZnVuY3Rpb24gdG8gbG9hZCBhIHNjcmlwdCB2aWEgc2NyaXB0IHRhZ1xuX193ZWJwYWNrX3JlcXVpcmVfXy5sID0gKHVybCwgZG9uZSwga2V5LCBjaHVua0lkKSA9PiB7XG5cdGlmKGluUHJvZ3Jlc3NbdXJsXSkgeyBpblByb2dyZXNzW3VybF0ucHVzaChkb25lKTsgcmV0dXJuOyB9XG5cdHZhciBzY3JpcHQsIG5lZWRBdHRhY2g7XG5cdGlmKGtleSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgc2NyaXB0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHMgPSBzY3JpcHRzW2ldO1xuXHRcdFx0aWYocy5nZXRBdHRyaWJ1dGUoXCJzcmNcIikgPT0gdXJsIHx8IHMuZ2V0QXR0cmlidXRlKFwiZGF0YS13ZWJwYWNrXCIpID09IGRhdGFXZWJwYWNrUHJlZml4ICsga2V5KSB7IHNjcmlwdCA9IHM7IGJyZWFrOyB9XG5cdFx0fVxuXHR9XG5cdGlmKCFzY3JpcHQpIHtcblx0XHRuZWVkQXR0YWNoID0gdHJ1ZTtcblx0XHRzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblxuXHRcdHNjcmlwdC5jaGFyc2V0ID0gJ3V0Zi04Jztcblx0XHRzY3JpcHQudGltZW91dCA9IDEyMDtcblx0XHRpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5uYykge1xuXHRcdFx0c2NyaXB0LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIF9fd2VicGFja19yZXF1aXJlX18ubmMpO1xuXHRcdH1cblx0XHRzY3JpcHQuc2V0QXR0cmlidXRlKFwiZGF0YS13ZWJwYWNrXCIsIGRhdGFXZWJwYWNrUHJlZml4ICsga2V5KTtcblxuXHRcdHNjcmlwdC5zcmMgPSB1cmw7XG5cdH1cblx0aW5Qcm9ncmVzc1t1cmxdID0gW2RvbmVdO1xuXHR2YXIgb25TY3JpcHRDb21wbGV0ZSA9IChwcmV2LCBldmVudCkgPT4ge1xuXHRcdC8vIGF2b2lkIG1lbSBsZWFrcyBpbiBJRS5cblx0XHRzY3JpcHQub25lcnJvciA9IHNjcmlwdC5vbmxvYWQgPSBudWxsO1xuXHRcdGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblx0XHR2YXIgZG9uZUZucyA9IGluUHJvZ3Jlc3NbdXJsXTtcblx0XHRkZWxldGUgaW5Qcm9ncmVzc1t1cmxdO1xuXHRcdHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG5cdFx0ZG9uZUZucyAmJiBkb25lRm5zLmZvckVhY2goKGZuKSA9PiAoZm4oZXZlbnQpKSk7XG5cdFx0aWYocHJldikgcmV0dXJuIHByZXYoZXZlbnQpO1xuXHR9XG5cdHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChvblNjcmlwdENvbXBsZXRlLmJpbmQobnVsbCwgdW5kZWZpbmVkLCB7IHR5cGU6ICd0aW1lb3V0JywgdGFyZ2V0OiBzY3JpcHQgfSksIDEyMDAwMCk7XG5cdHNjcmlwdC5vbmVycm9yID0gb25TY3JpcHRDb21wbGV0ZS5iaW5kKG51bGwsIHNjcmlwdC5vbmVycm9yKTtcblx0c2NyaXB0Lm9ubG9hZCA9IG9uU2NyaXB0Q29tcGxldGUuYmluZChudWxsLCBzY3JpcHQub25sb2FkKTtcblx0bmVlZEF0dGFjaCAmJiBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG59OyIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBjdXJyZW50TW9kdWxlRGF0YSA9IHt9O1xudmFyIGluc3RhbGxlZE1vZHVsZXMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmM7XG5cbi8vIG1vZHVsZSBhbmQgcmVxdWlyZSBjcmVhdGlvblxudmFyIGN1cnJlbnRDaGlsZE1vZHVsZTtcbnZhciBjdXJyZW50UGFyZW50cyA9IFtdO1xuXG4vLyBzdGF0dXNcbnZhciByZWdpc3RlcmVkU3RhdHVzSGFuZGxlcnMgPSBbXTtcbnZhciBjdXJyZW50U3RhdHVzID0gXCJpZGxlXCI7XG5cbi8vIHdoaWxlIGRvd25sb2FkaW5nXG52YXIgYmxvY2tpbmdQcm9taXNlcyA9IDA7XG52YXIgYmxvY2tpbmdQcm9taXNlc1dhaXRpbmcgPSBbXTtcblxuLy8gVGhlIHVwZGF0ZSBpbmZvXG52YXIgY3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnM7XG52YXIgcXVldWVkSW52YWxpZGF0ZWRNb2R1bGVzO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbl9fd2VicGFja19yZXF1aXJlX18uaG1yRCA9IGN1cnJlbnRNb2R1bGVEYXRhO1xuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmkucHVzaChmdW5jdGlvbiAob3B0aW9ucykge1xuXHR2YXIgbW9kdWxlID0gb3B0aW9ucy5tb2R1bGU7XG5cdHZhciByZXF1aXJlID0gY3JlYXRlUmVxdWlyZShvcHRpb25zLnJlcXVpcmUsIG9wdGlvbnMuaWQpO1xuXHRtb2R1bGUuaG90ID0gY3JlYXRlTW9kdWxlSG90T2JqZWN0KG9wdGlvbnMuaWQsIG1vZHVsZSk7XG5cdG1vZHVsZS5wYXJlbnRzID0gY3VycmVudFBhcmVudHM7XG5cdG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xuXHRjdXJyZW50UGFyZW50cyA9IFtdO1xuXHRvcHRpb25zLnJlcXVpcmUgPSByZXF1aXJlO1xufSk7XG5cbl9fd2VicGFja19yZXF1aXJlX18uaG1yQyA9IHt9O1xuX193ZWJwYWNrX3JlcXVpcmVfXy5obXJJID0ge307XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlcXVpcmUocmVxdWlyZSwgbW9kdWxlSWQpIHtcblx0dmFyIG1lID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XG5cdGlmICghbWUpIHJldHVybiByZXF1aXJlO1xuXHR2YXIgZm4gPSBmdW5jdGlvbiAocmVxdWVzdCkge1xuXHRcdGlmIChtZS5ob3QuYWN0aXZlKSB7XG5cdFx0XHRpZiAoaW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XSkge1xuXHRcdFx0XHR2YXIgcGFyZW50cyA9IGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0ucGFyZW50cztcblx0XHRcdFx0aWYgKHBhcmVudHMuaW5kZXhPZihtb2R1bGVJZCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0cGFyZW50cy5wdXNoKG1vZHVsZUlkKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3VycmVudFBhcmVudHMgPSBbbW9kdWxlSWRdO1xuXHRcdFx0XHRjdXJyZW50Q2hpbGRNb2R1bGUgPSByZXF1ZXN0O1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1lLmNoaWxkcmVuLmluZGV4T2YocmVxdWVzdCkgPT09IC0xKSB7XG5cdFx0XHRcdG1lLmNoaWxkcmVuLnB1c2gocmVxdWVzdCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0XCJbSE1SXSB1bmV4cGVjdGVkIHJlcXVpcmUoXCIgK1xuXHRcdFx0XHRcdHJlcXVlc3QgK1xuXHRcdFx0XHRcdFwiKSBmcm9tIGRpc3Bvc2VkIG1vZHVsZSBcIiArXG5cdFx0XHRcdFx0bW9kdWxlSWRcblx0XHRcdCk7XG5cdFx0XHRjdXJyZW50UGFyZW50cyA9IFtdO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVxdWlyZShyZXF1ZXN0KTtcblx0fTtcblx0dmFyIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIHJlcXVpcmVbbmFtZV07XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0cmVxdWlyZVtuYW1lXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH07XG5cdH07XG5cdGZvciAodmFyIG5hbWUgaW4gcmVxdWlyZSkge1xuXHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVxdWlyZSwgbmFtZSkgJiYgbmFtZSAhPT0gXCJlXCIpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmbiwgbmFtZSwgY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKG5hbWUpKTtcblx0XHR9XG5cdH1cblx0Zm4uZSA9IGZ1bmN0aW9uIChjaHVua0lkKSB7XG5cdFx0cmV0dXJuIHRyYWNrQmxvY2tpbmdQcm9taXNlKHJlcXVpcmUuZShjaHVua0lkKSk7XG5cdH07XG5cdHJldHVybiBmbjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTW9kdWxlSG90T2JqZWN0KG1vZHVsZUlkLCBtZSkge1xuXHR2YXIgX21haW4gPSBjdXJyZW50Q2hpbGRNb2R1bGUgIT09IG1vZHVsZUlkO1xuXHR2YXIgaG90ID0ge1xuXHRcdC8vIHByaXZhdGUgc3R1ZmZcblx0XHRfYWNjZXB0ZWREZXBlbmRlbmNpZXM6IHt9LFxuXHRcdF9hY2NlcHRlZEVycm9ySGFuZGxlcnM6IHt9LFxuXHRcdF9kZWNsaW5lZERlcGVuZGVuY2llczoge30sXG5cdFx0X3NlbGZBY2NlcHRlZDogZmFsc2UsXG5cdFx0X3NlbGZEZWNsaW5lZDogZmFsc2UsXG5cdFx0X3NlbGZJbnZhbGlkYXRlZDogZmFsc2UsXG5cdFx0X2Rpc3Bvc2VIYW5kbGVyczogW10sXG5cdFx0X21haW46IF9tYWluLFxuXHRcdF9yZXF1aXJlU2VsZjogZnVuY3Rpb24gKCkge1xuXHRcdFx0Y3VycmVudFBhcmVudHMgPSBtZS5wYXJlbnRzLnNsaWNlKCk7XG5cdFx0XHRjdXJyZW50Q2hpbGRNb2R1bGUgPSBfbWFpbiA/IHVuZGVmaW5lZCA6IG1vZHVsZUlkO1xuXHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCk7XG5cdFx0fSxcblxuXHRcdC8vIE1vZHVsZSBBUElcblx0XHRhY3RpdmU6IHRydWUsXG5cdFx0YWNjZXB0OiBmdW5jdGlvbiAoZGVwLCBjYWxsYmFjaywgZXJyb3JIYW5kbGVyKSB7XG5cdFx0XHRpZiAoZGVwID09PSB1bmRlZmluZWQpIGhvdC5fc2VsZkFjY2VwdGVkID0gdHJ1ZTtcblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBkZXAgPT09IFwiZnVuY3Rpb25cIikgaG90Ll9zZWxmQWNjZXB0ZWQgPSBkZXA7XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgZGVwID09PSBcIm9iamVjdFwiICYmIGRlcCAhPT0gbnVsbCkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwW2ldXSA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuXHRcdFx0XHRcdGhvdC5fYWNjZXB0ZWRFcnJvckhhbmRsZXJzW2RlcFtpXV0gPSBlcnJvckhhbmRsZXI7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwXSA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuXHRcdFx0XHRob3QuX2FjY2VwdGVkRXJyb3JIYW5kbGVyc1tkZXBdID0gZXJyb3JIYW5kbGVyO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZGVjbGluZTogZnVuY3Rpb24gKGRlcCkge1xuXHRcdFx0aWYgKGRlcCA9PT0gdW5kZWZpbmVkKSBob3QuX3NlbGZEZWNsaW5lZCA9IHRydWU7XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgZGVwID09PSBcIm9iamVjdFwiICYmIGRlcCAhPT0gbnVsbClcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZXAubGVuZ3RoOyBpKyspXG5cdFx0XHRcdFx0aG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1tkZXBbaV1dID0gdHJ1ZTtcblx0XHRcdGVsc2UgaG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1tkZXBdID0gdHJ1ZTtcblx0XHR9LFxuXHRcdGRpc3Bvc2U6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXHRcdFx0aG90Ll9kaXNwb3NlSGFuZGxlcnMucHVzaChjYWxsYmFjayk7XG5cdFx0fSxcblx0XHRhZGREaXNwb3NlSGFuZGxlcjogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cdFx0XHRob3QuX2Rpc3Bvc2VIYW5kbGVycy5wdXNoKGNhbGxiYWNrKTtcblx0XHR9LFxuXHRcdHJlbW92ZURpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblx0XHRcdHZhciBpZHggPSBob3QuX2Rpc3Bvc2VIYW5kbGVycy5pbmRleE9mKGNhbGxiYWNrKTtcblx0XHRcdGlmIChpZHggPj0gMCkgaG90Ll9kaXNwb3NlSGFuZGxlcnMuc3BsaWNlKGlkeCwgMSk7XG5cdFx0fSxcblx0XHRpbnZhbGlkYXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGlzLl9zZWxmSW52YWxpZGF0ZWQgPSB0cnVlO1xuXHRcdFx0c3dpdGNoIChjdXJyZW50U3RhdHVzKSB7XG5cdFx0XHRcdGNhc2UgXCJpZGxlXCI6XG5cdFx0XHRcdFx0Y3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnMgPSBbXTtcblx0XHRcdFx0XHRPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLmhtckkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5obXJJW2tleV0oXG5cdFx0XHRcdFx0XHRcdG1vZHVsZUlkLFxuXHRcdFx0XHRcdFx0XHRjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVyc1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRzZXRTdGF0dXMoXCJyZWFkeVwiKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInJlYWR5XCI6XG5cdFx0XHRcdFx0T2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5obXJJKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uaG1ySVtrZXldKFxuXHRcdFx0XHRcdFx0XHRtb2R1bGVJZCxcblx0XHRcdFx0XHRcdFx0Y3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnNcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJwcmVwYXJlXCI6XG5cdFx0XHRcdGNhc2UgXCJjaGVja1wiOlxuXHRcdFx0XHRjYXNlIFwiZGlzcG9zZVwiOlxuXHRcdFx0XHRjYXNlIFwiYXBwbHlcIjpcblx0XHRcdFx0XHQocXVldWVkSW52YWxpZGF0ZWRNb2R1bGVzID0gcXVldWVkSW52YWxpZGF0ZWRNb2R1bGVzIHx8IFtdKS5wdXNoKFxuXHRcdFx0XHRcdFx0bW9kdWxlSWRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8vIGlnbm9yZSByZXF1ZXN0cyBpbiBlcnJvciBzdGF0ZXNcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8gTWFuYWdlbWVudCBBUElcblx0XHRjaGVjazogaG90Q2hlY2ssXG5cdFx0YXBwbHk6IGhvdEFwcGx5LFxuXHRcdHN0YXR1czogZnVuY3Rpb24gKGwpIHtcblx0XHRcdGlmICghbCkgcmV0dXJuIGN1cnJlbnRTdGF0dXM7XG5cdFx0XHRyZWdpc3RlcmVkU3RhdHVzSGFuZGxlcnMucHVzaChsKTtcblx0XHR9LFxuXHRcdGFkZFN0YXR1c0hhbmRsZXI6IGZ1bmN0aW9uIChsKSB7XG5cdFx0XHRyZWdpc3RlcmVkU3RhdHVzSGFuZGxlcnMucHVzaChsKTtcblx0XHR9LFxuXHRcdHJlbW92ZVN0YXR1c0hhbmRsZXI6IGZ1bmN0aW9uIChsKSB7XG5cdFx0XHR2YXIgaWR4ID0gcmVnaXN0ZXJlZFN0YXR1c0hhbmRsZXJzLmluZGV4T2YobCk7XG5cdFx0XHRpZiAoaWR4ID49IDApIHJlZ2lzdGVyZWRTdGF0dXNIYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcblx0XHR9LFxuXG5cdFx0Ly9pbmhlcml0IGZyb20gcHJldmlvdXMgZGlzcG9zZSBjYWxsXG5cdFx0ZGF0YTogY3VycmVudE1vZHVsZURhdGFbbW9kdWxlSWRdXG5cdH07XG5cdGN1cnJlbnRDaGlsZE1vZHVsZSA9IHVuZGVmaW5lZDtcblx0cmV0dXJuIGhvdDtcbn1cblxuZnVuY3Rpb24gc2V0U3RhdHVzKG5ld1N0YXR1cykge1xuXHRjdXJyZW50U3RhdHVzID0gbmV3U3RhdHVzO1xuXHR2YXIgcmVzdWx0cyA9IFtdO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcmVnaXN0ZXJlZFN0YXR1c0hhbmRsZXJzLmxlbmd0aDsgaSsrKVxuXHRcdHJlc3VsdHNbaV0gPSByZWdpc3RlcmVkU3RhdHVzSGFuZGxlcnNbaV0uY2FsbChudWxsLCBuZXdTdGF0dXMpO1xuXG5cdHJldHVybiBQcm9taXNlLmFsbChyZXN1bHRzKTtcbn1cblxuZnVuY3Rpb24gdW5ibG9jaygpIHtcblx0aWYgKC0tYmxvY2tpbmdQcm9taXNlcyA9PT0gMCkge1xuXHRcdHNldFN0YXR1cyhcInJlYWR5XCIpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKGJsb2NraW5nUHJvbWlzZXMgPT09IDApIHtcblx0XHRcdFx0dmFyIGxpc3QgPSBibG9ja2luZ1Byb21pc2VzV2FpdGluZztcblx0XHRcdFx0YmxvY2tpbmdQcm9taXNlc1dhaXRpbmcgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGlzdFtpXSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdHJhY2tCbG9ja2luZ1Byb21pc2UocHJvbWlzZSkge1xuXHRzd2l0Y2ggKGN1cnJlbnRTdGF0dXMpIHtcblx0XHRjYXNlIFwicmVhZHlcIjpcblx0XHRcdHNldFN0YXR1cyhcInByZXBhcmVcIik7XG5cdFx0LyogZmFsbHRocm91Z2ggKi9cblx0XHRjYXNlIFwicHJlcGFyZVwiOlxuXHRcdFx0YmxvY2tpbmdQcm9taXNlcysrO1xuXHRcdFx0cHJvbWlzZS50aGVuKHVuYmxvY2ssIHVuYmxvY2spO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3JCbG9ja2luZ1Byb21pc2VzKGZuKSB7XG5cdGlmIChibG9ja2luZ1Byb21pc2VzID09PSAwKSByZXR1cm4gZm4oKTtcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0YmxvY2tpbmdQcm9taXNlc1dhaXRpbmcucHVzaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXNvbHZlKGZuKCkpO1xuXHRcdH0pO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gaG90Q2hlY2soYXBwbHlPblVwZGF0ZSkge1xuXHRpZiAoY3VycmVudFN0YXR1cyAhPT0gXCJpZGxlXCIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJjaGVjaygpIGlzIG9ubHkgYWxsb3dlZCBpbiBpZGxlIHN0YXR1c1wiKTtcblx0fVxuXHRyZXR1cm4gc2V0U3RhdHVzKFwiY2hlY2tcIilcblx0XHQudGhlbihfX3dlYnBhY2tfcmVxdWlyZV9fLmhtck0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHVwZGF0ZSkge1xuXHRcdFx0aWYgKCF1cGRhdGUpIHtcblx0XHRcdFx0cmV0dXJuIHNldFN0YXR1cyhhcHBseUludmFsaWRhdGVkTW9kdWxlcygpID8gXCJyZWFkeVwiIDogXCJpZGxlXCIpLnRoZW4oXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gc2V0U3RhdHVzKFwicHJlcGFyZVwiKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dmFyIHVwZGF0ZWRNb2R1bGVzID0gW107XG5cdFx0XHRcdGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzID0gW107XG5cblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uaG1yQykucmVkdWNlKGZ1bmN0aW9uIChcblx0XHRcdFx0XHRcdHByb21pc2VzLFxuXHRcdFx0XHRcdFx0a2V5XG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmhtckNba2V5XShcblx0XHRcdFx0XHRcdFx0dXBkYXRlLmMsXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZS5yLFxuXHRcdFx0XHRcdFx0XHR1cGRhdGUubSxcblx0XHRcdFx0XHRcdFx0cHJvbWlzZXMsXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzLFxuXHRcdFx0XHRcdFx0XHR1cGRhdGVkTW9kdWxlc1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHJldHVybiBwcm9taXNlcztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFtdKVxuXHRcdFx0XHQpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiB3YWl0Rm9yQmxvY2tpbmdQcm9taXNlcyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoYXBwbHlPblVwZGF0ZSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gaW50ZXJuYWxBcHBseShhcHBseU9uVXBkYXRlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZXRTdGF0dXMoXCJyZWFkeVwiKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdXBkYXRlZE1vZHVsZXM7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xufVxuXG5mdW5jdGlvbiBob3RBcHBseShvcHRpb25zKSB7XG5cdGlmIChjdXJyZW50U3RhdHVzICE9PSBcInJlYWR5XCIpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFwiYXBwbHkoKSBpcyBvbmx5IGFsbG93ZWQgaW4gcmVhZHkgc3RhdHVzIChzdGF0ZTogXCIgK1xuXHRcdFx0XHRcdGN1cnJlbnRTdGF0dXMgK1xuXHRcdFx0XHRcdFwiKVwiXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBpbnRlcm5hbEFwcGx5KG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBpbnRlcm5hbEFwcGx5KG9wdGlvbnMpIHtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0YXBwbHlJbnZhbGlkYXRlZE1vZHVsZXMoKTtcblxuXHR2YXIgcmVzdWx0cyA9IGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzLm1hcChmdW5jdGlvbiAoaGFuZGxlcikge1xuXHRcdHJldHVybiBoYW5kbGVyKG9wdGlvbnMpO1xuXHR9KTtcblx0Y3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnMgPSB1bmRlZmluZWQ7XG5cblx0dmFyIGVycm9ycyA9IHJlc3VsdHNcblx0XHQubWFwKGZ1bmN0aW9uIChyKSB7XG5cdFx0XHRyZXR1cm4gci5lcnJvcjtcblx0XHR9KVxuXHRcdC5maWx0ZXIoQm9vbGVhbik7XG5cblx0aWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG5cdFx0cmV0dXJuIHNldFN0YXR1cyhcImFib3J0XCIpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhyb3cgZXJyb3JzWzBdO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gTm93IGluIFwiZGlzcG9zZVwiIHBoYXNlXG5cdHZhciBkaXNwb3NlUHJvbWlzZSA9IHNldFN0YXR1cyhcImRpc3Bvc2VcIik7XG5cblx0cmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uIChyZXN1bHQpIHtcblx0XHRpZiAocmVzdWx0LmRpc3Bvc2UpIHJlc3VsdC5kaXNwb3NlKCk7XG5cdH0pO1xuXG5cdC8vIE5vdyBpbiBcImFwcGx5XCIgcGhhc2Vcblx0dmFyIGFwcGx5UHJvbWlzZSA9IHNldFN0YXR1cyhcImFwcGx5XCIpO1xuXG5cdHZhciBlcnJvcjtcblx0dmFyIHJlcG9ydEVycm9yID0gZnVuY3Rpb24gKGVycikge1xuXHRcdGlmICghZXJyb3IpIGVycm9yID0gZXJyO1xuXHR9O1xuXG5cdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbXTtcblx0cmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uIChyZXN1bHQpIHtcblx0XHRpZiAocmVzdWx0LmFwcGx5KSB7XG5cdFx0XHR2YXIgbW9kdWxlcyA9IHJlc3VsdC5hcHBseShyZXBvcnRFcnJvcik7XG5cdFx0XHRpZiAobW9kdWxlcykge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1vZHVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaChtb2R1bGVzW2ldKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIFByb21pc2UuYWxsKFtkaXNwb3NlUHJvbWlzZSwgYXBwbHlQcm9taXNlXSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gaGFuZGxlIGVycm9ycyBpbiBhY2NlcHQgaGFuZGxlcnMgYW5kIHNlbGYgYWNjZXB0ZWQgbW9kdWxlIGxvYWRcblx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdHJldHVybiBzZXRTdGF0dXMoXCJmYWlsXCIpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmIChxdWV1ZWRJbnZhbGlkYXRlZE1vZHVsZXMpIHtcblx0XHRcdHJldHVybiBpbnRlcm5hbEFwcGx5KG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKGxpc3QpIHtcblx0XHRcdFx0b3V0ZGF0ZWRNb2R1bGVzLmZvckVhY2goZnVuY3Rpb24gKG1vZHVsZUlkKSB7XG5cdFx0XHRcdFx0aWYgKGxpc3QuaW5kZXhPZihtb2R1bGVJZCkgPCAwKSBsaXN0LnB1c2gobW9kdWxlSWQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIGxpc3Q7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc2V0U3RhdHVzKFwiaWRsZVwiKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBvdXRkYXRlZE1vZHVsZXM7XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBhcHBseUludmFsaWRhdGVkTW9kdWxlcygpIHtcblx0aWYgKHF1ZXVlZEludmFsaWRhdGVkTW9kdWxlcykge1xuXHRcdGlmICghY3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnMpIGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzID0gW107XG5cdFx0T2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5obXJJKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHF1ZXVlZEludmFsaWRhdGVkTW9kdWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChtb2R1bGVJZCkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmhtcklba2V5XShcblx0XHRcdFx0XHRtb2R1bGVJZCxcblx0XHRcdFx0XHRjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVyc1xuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0cXVldWVkSW52YWxpZGF0ZWRNb2R1bGVzID0gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjO1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHtcblx0XHRcdHZhciBpID0gc2NyaXB0cy5sZW5ndGggLSAxO1xuXHRcdFx0d2hpbGUgKGkgPiAtMSAmJiAhc2NyaXB0VXJsKSBzY3JpcHRVcmwgPSBzY3JpcHRzW2ktLV0uc3JjO1xuXHRcdH1cblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmhtclNfanNvbnAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmhtclNfanNvbnAgfHwge1xuXHRcIm1haW5cIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbnZhciBjdXJyZW50VXBkYXRlZE1vZHVsZXNMaXN0O1xudmFyIHdhaXRpbmdVcGRhdGVSZXNvbHZlcyA9IHt9O1xuZnVuY3Rpb24gbG9hZFVwZGF0ZUNodW5rKGNodW5rSWQsIHVwZGF0ZWRNb2R1bGVzTGlzdCkge1xuXHRjdXJyZW50VXBkYXRlZE1vZHVsZXNMaXN0ID0gdXBkYXRlZE1vZHVsZXNMaXN0O1xuXHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdHdhaXRpbmdVcGRhdGVSZXNvbHZlc1tjaHVua0lkXSA9IHJlc29sdmU7XG5cdFx0Ly8gc3RhcnQgdXBkYXRlIGNodW5rIGxvYWRpbmdcblx0XHR2YXIgdXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgX193ZWJwYWNrX3JlcXVpcmVfXy5odShjaHVua0lkKTtcblx0XHQvLyBjcmVhdGUgZXJyb3IgYmVmb3JlIHN0YWNrIHVud291bmQgdG8gZ2V0IHVzZWZ1bCBzdGFja3RyYWNlIGxhdGVyXG5cdFx0dmFyIGVycm9yID0gbmV3IEVycm9yKCk7XG5cdFx0dmFyIGxvYWRpbmdFbmRlZCA9IChldmVudCkgPT4ge1xuXHRcdFx0aWYod2FpdGluZ1VwZGF0ZVJlc29sdmVzW2NodW5rSWRdKSB7XG5cdFx0XHRcdHdhaXRpbmdVcGRhdGVSZXNvbHZlc1tjaHVua0lkXSA9IHVuZGVmaW5lZFxuXHRcdFx0XHR2YXIgZXJyb3JUeXBlID0gZXZlbnQgJiYgKGV2ZW50LnR5cGUgPT09ICdsb2FkJyA/ICdtaXNzaW5nJyA6IGV2ZW50LnR5cGUpO1xuXHRcdFx0XHR2YXIgcmVhbFNyYyA9IGV2ZW50ICYmIGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQuc3JjO1xuXHRcdFx0XHRlcnJvci5tZXNzYWdlID0gJ0xvYWRpbmcgaG90IHVwZGF0ZSBjaHVuayAnICsgY2h1bmtJZCArICcgZmFpbGVkLlxcbignICsgZXJyb3JUeXBlICsgJzogJyArIHJlYWxTcmMgKyAnKSc7XG5cdFx0XHRcdGVycm9yLm5hbWUgPSAnQ2h1bmtMb2FkRXJyb3InO1xuXHRcdFx0XHRlcnJvci50eXBlID0gZXJyb3JUeXBlO1xuXHRcdFx0XHRlcnJvci5yZXF1ZXN0ID0gcmVhbFNyYztcblx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdF9fd2VicGFja19yZXF1aXJlX18ubCh1cmwsIGxvYWRpbmdFbmRlZCk7XG5cdH0pO1xufVxuXG5zZWxmW1wid2VicGFja0hvdFVwZGF0ZWZ1bmRyYWlzZXVwX3Rlc3RcIl0gPSAoY2h1bmtJZCwgbW9yZU1vZHVsZXMsIHJ1bnRpbWUpID0+IHtcblx0Zm9yKHZhciBtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRjdXJyZW50VXBkYXRlW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdGlmKGN1cnJlbnRVcGRhdGVkTW9kdWxlc0xpc3QpIGN1cnJlbnRVcGRhdGVkTW9kdWxlc0xpc3QucHVzaChtb2R1bGVJZCk7XG5cdFx0fVxuXHR9XG5cdGlmKHJ1bnRpbWUpIGN1cnJlbnRVcGRhdGVSdW50aW1lLnB1c2gocnVudGltZSk7XG5cdGlmKHdhaXRpbmdVcGRhdGVSZXNvbHZlc1tjaHVua0lkXSkge1xuXHRcdHdhaXRpbmdVcGRhdGVSZXNvbHZlc1tjaHVua0lkXSgpO1xuXHRcdHdhaXRpbmdVcGRhdGVSZXNvbHZlc1tjaHVua0lkXSA9IHVuZGVmaW5lZDtcblx0fVxufTtcblxudmFyIGN1cnJlbnRVcGRhdGVDaHVua3M7XG52YXIgY3VycmVudFVwZGF0ZTtcbnZhciBjdXJyZW50VXBkYXRlUmVtb3ZlZENodW5rcztcbnZhciBjdXJyZW50VXBkYXRlUnVudGltZTtcbmZ1bmN0aW9uIGFwcGx5SGFuZGxlcihvcHRpb25zKSB7XG5cdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmYpIGRlbGV0ZSBfX3dlYnBhY2tfcmVxdWlyZV9fLmYuanNvbnBIbXI7XG5cdGN1cnJlbnRVcGRhdGVDaHVua3MgPSB1bmRlZmluZWQ7XG5cdGZ1bmN0aW9uIGdldEFmZmVjdGVkTW9kdWxlRWZmZWN0cyh1cGRhdGVNb2R1bGVJZCkge1xuXHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbdXBkYXRlTW9kdWxlSWRdO1xuXHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xuXG5cdFx0dmFyIHF1ZXVlID0gb3V0ZGF0ZWRNb2R1bGVzLm1hcChmdW5jdGlvbiAoaWQpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGNoYWluOiBbaWRdLFxuXHRcdFx0XHRpZDogaWRcblx0XHRcdH07XG5cdFx0fSk7XG5cdFx0d2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdHZhciBxdWV1ZUl0ZW0gPSBxdWV1ZS5wb3AoKTtcblx0XHRcdHZhciBtb2R1bGVJZCA9IHF1ZXVlSXRlbS5pZDtcblx0XHRcdHZhciBjaGFpbiA9IHF1ZXVlSXRlbS5jaGFpbjtcblx0XHRcdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmNbbW9kdWxlSWRdO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQhbW9kdWxlIHx8XG5cdFx0XHRcdChtb2R1bGUuaG90Ll9zZWxmQWNjZXB0ZWQgJiYgIW1vZHVsZS5ob3QuX3NlbGZJbnZhbGlkYXRlZClcblx0XHRcdClcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRpZiAobW9kdWxlLmhvdC5fc2VsZkRlY2xpbmVkKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dHlwZTogXCJzZWxmLWRlY2xpbmVkXCIsXG5cdFx0XHRcdFx0Y2hhaW46IGNoYWluLFxuXHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZFxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKG1vZHVsZS5ob3QuX21haW4pIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR0eXBlOiBcInVuYWNjZXB0ZWRcIixcblx0XHRcdFx0XHRjaGFpbjogY2hhaW4sXG5cdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1vZHVsZS5wYXJlbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwYXJlbnRJZCA9IG1vZHVsZS5wYXJlbnRzW2ldO1xuXHRcdFx0XHR2YXIgcGFyZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5jW3BhcmVudElkXTtcblx0XHRcdFx0aWYgKCFwYXJlbnQpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAocGFyZW50LmhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiZGVjbGluZWRcIixcblx0XHRcdFx0XHRcdGNoYWluOiBjaGFpbi5jb25jYXQoW3BhcmVudElkXSksXG5cdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXG5cdFx0XHRcdFx0XHRwYXJlbnRJZDogcGFyZW50SWRcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvdXRkYXRlZE1vZHVsZXMuaW5kZXhPZihwYXJlbnRJZCkgIT09IC0xKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKHBhcmVudC5ob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSkge1xuXHRcdFx0XHRcdGlmICghb3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdKVxuXHRcdFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdID0gW107XG5cdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdLCBbbW9kdWxlSWRdKTtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRkZWxldGUgb3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdO1xuXHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaChwYXJlbnRJZCk7XG5cdFx0XHRcdHF1ZXVlLnB1c2goe1xuXHRcdFx0XHRcdGNoYWluOiBjaGFpbi5jb25jYXQoW3BhcmVudElkXSksXG5cdFx0XHRcdFx0aWQ6IHBhcmVudElkXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR0eXBlOiBcImFjY2VwdGVkXCIsXG5cdFx0XHRtb2R1bGVJZDogdXBkYXRlTW9kdWxlSWQsXG5cdFx0XHRvdXRkYXRlZE1vZHVsZXM6IG91dGRhdGVkTW9kdWxlcyxcblx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzOiBvdXRkYXRlZERlcGVuZGVuY2llc1xuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBhZGRBbGxUb1NldChhLCBiKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IGJbaV07XG5cdFx0XHRpZiAoYS5pbmRleE9mKGl0ZW0pID09PSAtMSkgYS5wdXNoKGl0ZW0pO1xuXHRcdH1cblx0fVxuXG5cdC8vIGF0IGJlZ2luIGFsbCB1cGRhdGVzIG1vZHVsZXMgYXJlIG91dGRhdGVkXG5cdC8vIHRoZSBcIm91dGRhdGVkXCIgc3RhdHVzIGNhbiBwcm9wYWdhdGUgdG8gcGFyZW50cyBpZiB0aGV5IGRvbid0IGFjY2VwdCB0aGUgY2hpbGRyZW5cblx0dmFyIG91dGRhdGVkRGVwZW5kZW5jaWVzID0ge307XG5cdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbXTtcblx0dmFyIGFwcGxpZWRVcGRhdGUgPSB7fTtcblxuXHR2YXIgd2FyblVuZXhwZWN0ZWRSZXF1aXJlID0gZnVuY3Rpb24gd2FyblVuZXhwZWN0ZWRSZXF1aXJlKG1vZHVsZSkge1xuXHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFwiW0hNUl0gdW5leHBlY3RlZCByZXF1aXJlKFwiICsgbW9kdWxlLmlkICsgXCIpIHRvIGRpc3Bvc2VkIG1vZHVsZVwiXG5cdFx0KTtcblx0fTtcblxuXHRmb3IgKHZhciBtb2R1bGVJZCBpbiBjdXJyZW50VXBkYXRlKSB7XG5cdFx0aWYgKF9fd2VicGFja19yZXF1aXJlX18ubyhjdXJyZW50VXBkYXRlLCBtb2R1bGVJZCkpIHtcblx0XHRcdHZhciBuZXdNb2R1bGVGYWN0b3J5ID0gY3VycmVudFVwZGF0ZVttb2R1bGVJZF07XG5cdFx0XHQvKiogQHR5cGUge1RPRE99ICovXG5cdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0aWYgKG5ld01vZHVsZUZhY3RvcnkpIHtcblx0XHRcdFx0cmVzdWx0ID0gZ2V0QWZmZWN0ZWRNb2R1bGVFZmZlY3RzKG1vZHVsZUlkKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlc3VsdCA9IHtcblx0XHRcdFx0XHR0eXBlOiBcImRpc3Bvc2VkXCIsXG5cdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHQvKiogQHR5cGUge0Vycm9yfGZhbHNlfSAqL1xuXHRcdFx0dmFyIGFib3J0RXJyb3IgPSBmYWxzZTtcblx0XHRcdHZhciBkb0FwcGx5ID0gZmFsc2U7XG5cdFx0XHR2YXIgZG9EaXNwb3NlID0gZmFsc2U7XG5cdFx0XHR2YXIgY2hhaW5JbmZvID0gXCJcIjtcblx0XHRcdGlmIChyZXN1bHQuY2hhaW4pIHtcblx0XHRcdFx0Y2hhaW5JbmZvID0gXCJcXG5VcGRhdGUgcHJvcGFnYXRpb246IFwiICsgcmVzdWx0LmNoYWluLmpvaW4oXCIgLT4gXCIpO1xuXHRcdFx0fVxuXHRcdFx0c3dpdGNoIChyZXN1bHQudHlwZSkge1xuXHRcdFx0XHRjYXNlIFwic2VsZi1kZWNsaW5lZFwiOlxuXHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRGVjbGluZWQpIG9wdGlvbnMub25EZWNsaW5lZChyZXN1bHQpO1xuXHRcdFx0XHRcdGlmICghb3B0aW9ucy5pZ25vcmVEZWNsaW5lZClcblx0XHRcdFx0XHRcdGFib3J0RXJyb3IgPSBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XHRcdFwiQWJvcnRlZCBiZWNhdXNlIG9mIHNlbGYgZGVjbGluZTogXCIgK1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdC5tb2R1bGVJZCArXG5cdFx0XHRcdFx0XHRcdFx0Y2hhaW5JbmZvXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiZGVjbGluZWRcIjpcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkRlY2xpbmVkKSBvcHRpb25zLm9uRGVjbGluZWQocmVzdWx0KTtcblx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlRGVjbGluZWQpXG5cdFx0XHRcdFx0XHRhYm9ydEVycm9yID0gbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0XHRcIkFib3J0ZWQgYmVjYXVzZSBvZiBkZWNsaW5lZCBkZXBlbmRlbmN5OiBcIiArXG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0Lm1vZHVsZUlkICtcblx0XHRcdFx0XHRcdFx0XHRcIiBpbiBcIiArXG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0LnBhcmVudElkICtcblx0XHRcdFx0XHRcdFx0XHRjaGFpbkluZm9cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJ1bmFjY2VwdGVkXCI6XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMub25VbmFjY2VwdGVkKSBvcHRpb25zLm9uVW5hY2NlcHRlZChyZXN1bHQpO1xuXHRcdFx0XHRcdGlmICghb3B0aW9ucy5pZ25vcmVVbmFjY2VwdGVkKVxuXHRcdFx0XHRcdFx0YWJvcnRFcnJvciA9IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdFx0XCJBYm9ydGVkIGJlY2F1c2UgXCIgKyBtb2R1bGVJZCArIFwiIGlzIG5vdCBhY2NlcHRlZFwiICsgY2hhaW5JbmZvXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiYWNjZXB0ZWRcIjpcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkFjY2VwdGVkKSBvcHRpb25zLm9uQWNjZXB0ZWQocmVzdWx0KTtcblx0XHRcdFx0XHRkb0FwcGx5ID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImRpc3Bvc2VkXCI6XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMub25EaXNwb3NlZCkgb3B0aW9ucy5vbkRpc3Bvc2VkKHJlc3VsdCk7XG5cdFx0XHRcdFx0ZG9EaXNwb3NlID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmV4Y2VwdGlvbiB0eXBlIFwiICsgcmVzdWx0LnR5cGUpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGFib3J0RXJyb3IpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRlcnJvcjogYWJvcnRFcnJvclxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKGRvQXBwbHkpIHtcblx0XHRcdFx0YXBwbGllZFVwZGF0ZVttb2R1bGVJZF0gPSBuZXdNb2R1bGVGYWN0b3J5O1xuXHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZE1vZHVsZXMsIHJlc3VsdC5vdXRkYXRlZE1vZHVsZXMpO1xuXHRcdFx0XHRmb3IgKG1vZHVsZUlkIGluIHJlc3VsdC5vdXRkYXRlZERlcGVuZGVuY2llcykge1xuXHRcdFx0XHRcdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm8ocmVzdWx0Lm91dGRhdGVkRGVwZW5kZW5jaWVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0XHRcdGlmICghb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKVxuXHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0gPSBbXTtcblx0XHRcdFx0XHRcdGFkZEFsbFRvU2V0KFxuXHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0sXG5cdFx0XHRcdFx0XHRcdHJlc3VsdC5vdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF1cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoZG9EaXNwb3NlKSB7XG5cdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkTW9kdWxlcywgW3Jlc3VsdC5tb2R1bGVJZF0pO1xuXHRcdFx0XHRhcHBsaWVkVXBkYXRlW21vZHVsZUlkXSA9IHdhcm5VbmV4cGVjdGVkUmVxdWlyZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Y3VycmVudFVwZGF0ZSA9IHVuZGVmaW5lZDtcblxuXHQvLyBTdG9yZSBzZWxmIGFjY2VwdGVkIG91dGRhdGVkIG1vZHVsZXMgdG8gcmVxdWlyZSB0aGVtIGxhdGVyIGJ5IHRoZSBtb2R1bGUgc3lzdGVtXG5cdHZhciBvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMgPSBbXTtcblx0Zm9yICh2YXIgaiA9IDA7IGogPCBvdXRkYXRlZE1vZHVsZXMubGVuZ3RoOyBqKyspIHtcblx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVJZCA9IG91dGRhdGVkTW9kdWxlc1tqXTtcblx0XHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX3JlcXVpcmVfXy5jW291dGRhdGVkTW9kdWxlSWRdO1xuXHRcdGlmIChcblx0XHRcdG1vZHVsZSAmJlxuXHRcdFx0KG1vZHVsZS5ob3QuX3NlbGZBY2NlcHRlZCB8fCBtb2R1bGUuaG90Ll9tYWluKSAmJlxuXHRcdFx0Ly8gcmVtb3ZlZCBzZWxmLWFjY2VwdGVkIG1vZHVsZXMgc2hvdWxkIG5vdCBiZSByZXF1aXJlZFxuXHRcdFx0YXBwbGllZFVwZGF0ZVtvdXRkYXRlZE1vZHVsZUlkXSAhPT0gd2FyblVuZXhwZWN0ZWRSZXF1aXJlICYmXG5cdFx0XHQvLyB3aGVuIGNhbGxlZCBpbnZhbGlkYXRlIHNlbGYtYWNjZXB0aW5nIGlzIG5vdCBwb3NzaWJsZVxuXHRcdFx0IW1vZHVsZS5ob3QuX3NlbGZJbnZhbGlkYXRlZFxuXHRcdCkge1xuXHRcdFx0b3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzLnB1c2goe1xuXHRcdFx0XHRtb2R1bGU6IG91dGRhdGVkTW9kdWxlSWQsXG5cdFx0XHRcdHJlcXVpcmU6IG1vZHVsZS5ob3QuX3JlcXVpcmVTZWxmLFxuXHRcdFx0XHRlcnJvckhhbmRsZXI6IG1vZHVsZS5ob3QuX3NlbGZBY2NlcHRlZFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzO1xuXG5cdHJldHVybiB7XG5cdFx0ZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0Y3VycmVudFVwZGF0ZVJlbW92ZWRDaHVua3MuZm9yRWFjaChmdW5jdGlvbiAoY2h1bmtJZCkge1xuXHRcdFx0XHRkZWxldGUgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdO1xuXHRcdFx0fSk7XG5cdFx0XHRjdXJyZW50VXBkYXRlUmVtb3ZlZENodW5rcyA9IHVuZGVmaW5lZDtcblxuXHRcdFx0dmFyIGlkeDtcblx0XHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5zbGljZSgpO1xuXHRcdFx0d2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dmFyIG1vZHVsZUlkID0gcXVldWUucG9wKCk7XG5cdFx0XHRcdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmNbbW9kdWxlSWRdO1xuXHRcdFx0XHRpZiAoIW1vZHVsZSkgY29udGludWU7XG5cblx0XHRcdFx0dmFyIGRhdGEgPSB7fTtcblxuXHRcdFx0XHQvLyBDYWxsIGRpc3Bvc2UgaGFuZGxlcnNcblx0XHRcdFx0dmFyIGRpc3Bvc2VIYW5kbGVycyA9IG1vZHVsZS5ob3QuX2Rpc3Bvc2VIYW5kbGVycztcblx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IGRpc3Bvc2VIYW5kbGVycy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdGRpc3Bvc2VIYW5kbGVyc1tqXS5jYWxsKG51bGwsIGRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uaG1yRFttb2R1bGVJZF0gPSBkYXRhO1xuXG5cdFx0XHRcdC8vIGRpc2FibGUgbW9kdWxlICh0aGlzIGRpc2FibGVzIHJlcXVpcmVzIGZyb20gdGhpcyBtb2R1bGUpXG5cdFx0XHRcdG1vZHVsZS5ob3QuYWN0aXZlID0gZmFsc2U7XG5cblx0XHRcdFx0Ly8gcmVtb3ZlIG1vZHVsZSBmcm9tIGNhY2hlXG5cdFx0XHRcdGRlbGV0ZSBfX3dlYnBhY2tfcmVxdWlyZV9fLmNbbW9kdWxlSWRdO1xuXG5cdFx0XHRcdC8vIHdoZW4gZGlzcG9zaW5nIHRoZXJlIGlzIG5vIG5lZWQgdG8gY2FsbCBkaXNwb3NlIGhhbmRsZXJcblx0XHRcdFx0ZGVsZXRlIG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXTtcblxuXHRcdFx0XHQvLyByZW1vdmUgXCJwYXJlbnRzXCIgcmVmZXJlbmNlcyBmcm9tIGFsbCBjaGlsZHJlblxuXHRcdFx0XHRmb3IgKGogPSAwOyBqIDwgbW9kdWxlLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0dmFyIGNoaWxkID0gX193ZWJwYWNrX3JlcXVpcmVfXy5jW21vZHVsZS5jaGlsZHJlbltqXV07XG5cdFx0XHRcdFx0aWYgKCFjaGlsZCkgY29udGludWU7XG5cdFx0XHRcdFx0aWR4ID0gY2hpbGQucGFyZW50cy5pbmRleE9mKG1vZHVsZUlkKTtcblx0XHRcdFx0XHRpZiAoaWR4ID49IDApIHtcblx0XHRcdFx0XHRcdGNoaWxkLnBhcmVudHMuc3BsaWNlKGlkeCwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJlbW92ZSBvdXRkYXRlZCBkZXBlbmRlbmN5IGZyb20gbW9kdWxlIGNoaWxkcmVuXG5cdFx0XHR2YXIgZGVwZW5kZW5jeTtcblx0XHRcdGZvciAodmFyIG91dGRhdGVkTW9kdWxlSWQgaW4gb3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcblx0XHRcdFx0aWYgKF9fd2VicGFja19yZXF1aXJlX18ubyhvdXRkYXRlZERlcGVuZGVuY2llcywgb3V0ZGF0ZWRNb2R1bGVJZCkpIHtcblx0XHRcdFx0XHRtb2R1bGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmNbb3V0ZGF0ZWRNb2R1bGVJZF07XG5cdFx0XHRcdFx0aWYgKG1vZHVsZSkge1xuXHRcdFx0XHRcdFx0bW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMgPVxuXHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1tvdXRkYXRlZE1vZHVsZUlkXTtcblx0XHRcdFx0XHRcdGZvciAoaiA9IDA7IGogPCBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRkZXBlbmRlbmN5ID0gbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXNbal07XG5cdFx0XHRcdFx0XHRcdGlkeCA9IG1vZHVsZS5jaGlsZHJlbi5pbmRleE9mKGRlcGVuZGVuY3kpO1xuXHRcdFx0XHRcdFx0XHRpZiAoaWR4ID49IDApIG1vZHVsZS5jaGlsZHJlbi5zcGxpY2UoaWR4LCAxKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAocmVwb3J0RXJyb3IpIHtcblx0XHRcdC8vIGluc2VydCBuZXcgY29kZVxuXHRcdFx0Zm9yICh2YXIgdXBkYXRlTW9kdWxlSWQgaW4gYXBwbGllZFVwZGF0ZSkge1xuXHRcdFx0XHRpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGFwcGxpZWRVcGRhdGUsIHVwZGF0ZU1vZHVsZUlkKSkge1xuXHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVt1cGRhdGVNb2R1bGVJZF0gPSBhcHBsaWVkVXBkYXRlW3VwZGF0ZU1vZHVsZUlkXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBydW4gbmV3IHJ1bnRpbWUgbW9kdWxlc1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjdXJyZW50VXBkYXRlUnVudGltZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjdXJyZW50VXBkYXRlUnVudGltZVtpXShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gY2FsbCBhY2NlcHQgaGFuZGxlcnNcblx0XHRcdGZvciAodmFyIG91dGRhdGVkTW9kdWxlSWQgaW4gb3V0ZGF0ZWREZXBlbmRlbmNpZXMpIHtcblx0XHRcdFx0aWYgKF9fd2VicGFja19yZXF1aXJlX18ubyhvdXRkYXRlZERlcGVuZGVuY2llcywgb3V0ZGF0ZWRNb2R1bGVJZCkpIHtcblx0XHRcdFx0XHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX3JlcXVpcmVfXy5jW291dGRhdGVkTW9kdWxlSWRdO1xuXHRcdFx0XHRcdGlmIChtb2R1bGUpIHtcblx0XHRcdFx0XHRcdG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzID1cblx0XHRcdFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXNbb3V0ZGF0ZWRNb2R1bGVJZF07XG5cdFx0XHRcdFx0XHR2YXIgY2FsbGJhY2tzID0gW107XG5cdFx0XHRcdFx0XHR2YXIgZXJyb3JIYW5kbGVycyA9IFtdO1xuXHRcdFx0XHRcdFx0dmFyIGRlcGVuZGVuY2llc0ZvckNhbGxiYWNrcyA9IFtdO1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHR2YXIgZGVwZW5kZW5jeSA9IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzW2pdO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWNjZXB0Q2FsbGJhY2sgPVxuXHRcdFx0XHRcdFx0XHRcdG1vZHVsZS5ob3QuX2FjY2VwdGVkRGVwZW5kZW5jaWVzW2RlcGVuZGVuY3ldO1xuXHRcdFx0XHRcdFx0XHR2YXIgZXJyb3JIYW5kbGVyID1cblx0XHRcdFx0XHRcdFx0XHRtb2R1bGUuaG90Ll9hY2NlcHRlZEVycm9ySGFuZGxlcnNbZGVwZW5kZW5jeV07XG5cdFx0XHRcdFx0XHRcdGlmIChhY2NlcHRDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChjYWxsYmFja3MuaW5kZXhPZihhY2NlcHRDYWxsYmFjaykgIT09IC0xKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRjYWxsYmFja3MucHVzaChhY2NlcHRDYWxsYmFjayk7XG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3JIYW5kbGVycy5wdXNoKGVycm9ySGFuZGxlcik7XG5cdFx0XHRcdFx0XHRcdFx0ZGVwZW5kZW5jaWVzRm9yQ2FsbGJhY2tzLnB1c2goZGVwZW5kZW5jeSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGZvciAodmFyIGsgPSAwOyBrIDwgY2FsbGJhY2tzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FsbGJhY2tzW2tdLmNhbGwobnVsbCwgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMpO1xuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIGVycm9ySGFuZGxlcnNba10gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3JIYW5kbGVyc1trXShlcnIsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogb3V0ZGF0ZWRNb2R1bGVJZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZXBlbmRlbmN5SWQ6IGRlcGVuZGVuY2llc0ZvckNhbGxiYWNrc1trXVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycjIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMub25FcnJvcmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJhY2NlcHQtZXJyb3ItaGFuZGxlci1lcnJvcmVkXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogb3V0ZGF0ZWRNb2R1bGVJZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlcGVuZGVuY3lJZDogZGVwZW5kZW5jaWVzRm9yQ2FsbGJhY2tzW2tdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3I6IGVycjIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvcmlnaW5hbEVycm9yOiBlcnJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlRXJyb3JlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJlcG9ydEVycm9yKGVycjIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJlcG9ydEVycm9yKGVycik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMub25FcnJvcmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25FcnJvcmVkKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0eXBlOiBcImFjY2VwdC1lcnJvcmVkXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG91dGRhdGVkTW9kdWxlSWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVwZW5kZW5jeUlkOiBkZXBlbmRlbmNpZXNGb3JDYWxsYmFja3Nba10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3I6IGVyclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghb3B0aW9ucy5pZ25vcmVFcnJvcmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlcG9ydEVycm9yKGVycik7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIExvYWQgc2VsZiBhY2NlcHRlZCBtb2R1bGVzXG5cdFx0XHRmb3IgKHZhciBvID0gMDsgbyA8IG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcy5sZW5ndGg7IG8rKykge1xuXHRcdFx0XHR2YXIgaXRlbSA9IG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlc1tvXTtcblx0XHRcdFx0dmFyIG1vZHVsZUlkID0gaXRlbS5tb2R1bGU7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0aXRlbS5yZXF1aXJlKG1vZHVsZUlkKTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBpdGVtLmVycm9ySGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRpdGVtLmVycm9ySGFuZGxlcihlcnIsIHtcblx0XHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXG5cdFx0XHRcdFx0XHRcdFx0bW9kdWxlOiBfX3dlYnBhY2tfcmVxdWlyZV9fLmNbbW9kdWxlSWRdXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyMikge1xuXHRcdFx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkVycm9yZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRXJyb3JlZCh7XG5cdFx0XHRcdFx0XHRcdFx0XHR0eXBlOiBcInNlbGYtYWNjZXB0LWVycm9yLWhhbmRsZXItZXJyb3JlZFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3I6IGVycjIsXG5cdFx0XHRcdFx0XHRcdFx0XHRvcmlnaW5hbEVycm9yOiBlcnJcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoIW9wdGlvbnMuaWdub3JlRXJyb3JlZCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlcG9ydEVycm9yKGVycjIpO1xuXHRcdFx0XHRcdFx0XHRcdHJlcG9ydEVycm9yKGVycik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMub25FcnJvcmVkKSB7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMub25FcnJvcmVkKHtcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiBcInNlbGYtYWNjZXB0LWVycm9yZWRcIixcblx0XHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3I6IGVyclxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmICghb3B0aW9ucy5pZ25vcmVFcnJvcmVkKSB7XG5cdFx0XHRcdFx0XHRcdHJlcG9ydEVycm9yKGVycik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBvdXRkYXRlZE1vZHVsZXM7XG5cdFx0fVxuXHR9O1xufVxuX193ZWJwYWNrX3JlcXVpcmVfXy5obXJJLmpzb25wID0gZnVuY3Rpb24gKG1vZHVsZUlkLCBhcHBseUhhbmRsZXJzKSB7XG5cdGlmICghY3VycmVudFVwZGF0ZSkge1xuXHRcdGN1cnJlbnRVcGRhdGUgPSB7fTtcblx0XHRjdXJyZW50VXBkYXRlUnVudGltZSA9IFtdO1xuXHRcdGN1cnJlbnRVcGRhdGVSZW1vdmVkQ2h1bmtzID0gW107XG5cdFx0YXBwbHlIYW5kbGVycy5wdXNoKGFwcGx5SGFuZGxlcik7XG5cdH1cblx0aWYgKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oY3VycmVudFVwZGF0ZSwgbW9kdWxlSWQpKSB7XG5cdFx0Y3VycmVudFVwZGF0ZVttb2R1bGVJZF0gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdO1xuXHR9XG59O1xuX193ZWJwYWNrX3JlcXVpcmVfXy5obXJDLmpzb25wID0gZnVuY3Rpb24gKFxuXHRjaHVua0lkcyxcblx0cmVtb3ZlZENodW5rcyxcblx0cmVtb3ZlZE1vZHVsZXMsXG5cdHByb21pc2VzLFxuXHRhcHBseUhhbmRsZXJzLFxuXHR1cGRhdGVkTW9kdWxlc0xpc3Rcbikge1xuXHRhcHBseUhhbmRsZXJzLnB1c2goYXBwbHlIYW5kbGVyKTtcblx0Y3VycmVudFVwZGF0ZUNodW5rcyA9IHt9O1xuXHRjdXJyZW50VXBkYXRlUmVtb3ZlZENodW5rcyA9IHJlbW92ZWRDaHVua3M7XG5cdGN1cnJlbnRVcGRhdGUgPSByZW1vdmVkTW9kdWxlcy5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwga2V5KSB7XG5cdFx0b2JqW2tleV0gPSBmYWxzZTtcblx0XHRyZXR1cm4gb2JqO1xuXHR9LCB7fSk7XG5cdGN1cnJlbnRVcGRhdGVSdW50aW1lID0gW107XG5cdGNodW5rSWRzLmZvckVhY2goZnVuY3Rpb24gKGNodW5rSWQpIHtcblx0XHRpZiAoXG5cdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJlxuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdICE9PSB1bmRlZmluZWRcblx0XHQpIHtcblx0XHRcdHByb21pc2VzLnB1c2gobG9hZFVwZGF0ZUNodW5rKGNodW5rSWQsIHVwZGF0ZWRNb2R1bGVzTGlzdCkpO1xuXHRcdFx0Y3VycmVudFVwZGF0ZUNodW5rc1tjaHVua0lkXSA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGN1cnJlbnRVcGRhdGVDaHVua3NbY2h1bmtJZF0gPSBmYWxzZTtcblx0XHR9XG5cdH0pO1xuXHRpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5mKSB7XG5cdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5mLmpzb25wSG1yID0gZnVuY3Rpb24gKGNodW5rSWQsIHByb21pc2VzKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGN1cnJlbnRVcGRhdGVDaHVua3MgJiZcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vKGN1cnJlbnRVcGRhdGVDaHVua3MsIGNodW5rSWQpICYmXG5cdFx0XHRcdCFjdXJyZW50VXBkYXRlQ2h1bmtzW2NodW5rSWRdXG5cdFx0XHQpIHtcblx0XHRcdFx0cHJvbWlzZXMucHVzaChsb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCkpO1xuXHRcdFx0XHRjdXJyZW50VXBkYXRlQ2h1bmtzW2NodW5rSWRdID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG59O1xuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmhtck0gPSAoKSA9PiB7XG5cdGlmICh0eXBlb2YgZmV0Y2ggPT09IFwidW5kZWZpbmVkXCIpIHRocm93IG5ldyBFcnJvcihcIk5vIGJyb3dzZXIgc3VwcG9ydDogbmVlZCBmZXRjaCBBUElcIik7XG5cdHJldHVybiBmZXRjaChfX3dlYnBhY2tfcmVxdWlyZV9fLnAgKyBfX3dlYnBhY2tfcmVxdWlyZV9fLmhtckYoKSkudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRpZihyZXNwb25zZS5zdGF0dXMgPT09IDQwNCkgcmV0dXJuOyAvLyBubyB1cGRhdGUgYXZhaWxhYmxlXG5cdFx0aWYoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlIG1hbmlmZXN0IFwiICsgcmVzcG9uc2Uuc3RhdHVzVGV4dCk7XG5cdFx0cmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcblx0fSk7XG59O1xuXG4vLyBubyBvbiBjaHVua3MgbG9hZGVkXG5cbi8vIG5vIGpzb25wIGZ1bmN0aW9uIiwiIiwiLy8gbW9kdWxlIGNhY2hlIGFyZSB1c2VkIHNvIGVudHJ5IGlubGluaW5nIGlzIGRpc2FibGVkXG4vLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbIkFuc3dlclBhbmVsIiwibW91bnQiLCJSdW50aW1lIiwiTGV0dGVyUGFuZWwiLCJnYW1lRmFjdG9yeSIsIkdhbWVTdG9yZSIsIkVsIiwibWFpbiIsImN4IiwiZ2FtZUlubmVyIiwicmVzdG9yZSIsImNoZWNrU2F2ZUFuZEFzayIsImxpc3RlbmVycyIsIm9uRmluaXNoIiwiZGF0YSIsImFsZXJ0IiwiSlNPTiIsInN0cmluZ2lmeSIsIm9uU3VycmVuZGVyIiwibmV4dCIsInNldFRpbWVvdXQiLCJnYW1lIiwidXBkYXRlIiwiZyIsImNyZWF0ZVNpZ25hbCIsImNyZWF0ZUVmZmVjdCIsInNhdmUiLCJnZXQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJuZXciLCJ0ZXh0RHluIiwiY3VycmVudFJvdW5kSW5kZXgiLCJ0b1N0cmluZyIsInJvdW5kcyIsImxlbmd0aCIsIkdhbWUiLCJSb3VuZCIsIkxldHRlclBpY2tlciIsIlJhbmRvbWl6ZXIiLCJNQVhfV09SRFNfSU5fUVVFVUUiLCJXb3JkUGlja2VyIiwib3B0aW9ucyIsInBpY2tSYW5kb21Xb3JkcyIsImZvckVhY2giLCJ3b3JkIiwicmFuZG9taXplciIsImxldHRlclBpY2tlciIsInJhbmRvbVdvcmRMZXR0ZXJzIiwicmFuZG9taXplIiwicm91bmQiLCJhZGRSb3VuZCIsIktFWSIsImNvbnN0cnVjdG9yIiwicGFyc2VkRGF0YSIsInBhcnNlIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImNvbmZpcm0iLCJfIiwiZ2FtZVN0YXRlIiwibWFwIiwiciIsImN1cnJlbnRFcnJvcnMiLCJwaWNrZWRJbmRleGVzIiwiQXJyYXkiLCJmcm9tIiwidmFsdWVzIiwic3VycmVuZGVyIiwic2V0SXRlbSIsInNhdmVkUm91bmQiLCJuZXdSb3VuZCIsImluZGV4IiwiYWRkIiwiY3VycmVudFJvdW5kIiwibmV4dFJvdW5kIiwiTUFYX1JPVU5EX0VSUk9SUyIsIm1heEVycm9ycyIsIlNldCIsImFyZ3VtZW50cyIsInVuZGVmaW5lZCIsInZpc2libGVSYW5kb21MZXR0ZXJzIiwibGV0dGVyIiwiZmlsdGVyIiwiX3JlZiIsImhhcyIsImd1ZXNzIiwicmFuZG9tTGV0dGVySW5kZXgiLCJndWVzc2VkTGV0dGVyIiwiY3VycmVudExldHRlciIsInNpemUiLCJndWVzc2VkUmlnaHQiLCJhY2NlcHRMZXR0ZXIiLCJ0cmlnZ2VyTWlzdGFrZSIsImluZm8iLCJjb3JyZWN0Um91bmRzIiwiZXJyb3JBbW91bnQiLCJyZWR1Y2UiLCJzdW0iLCJzb3J0ZWRCeUVycm9yc0Rlc2MiLCJzb3J0IiwiYSIsImIiLCJ3b3JzdFdvcmQiLCJwdXNoIiwibGV0dGVycyIsInNwbGl0IiwiZnJlc2hTZXQiLCJpdGVtIiwicGljayIsImNvbGxlY3Rpb24iLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJXT1JEX1ZBUklBTlRTIiwid29yZHMiLCJnZXRSYW5kb21Xb3JkcyIsImFtb3VudCIsImNob3NlbldvcmRzIiwia2V5cyIsIndvcmRQaWNrZXIiLCJ3b3JkQ29sbGVjdGlvbiIsImNyZWF0ZUNvbXBvbmVudCIsImZuIiwiaHRtbEVsIiwidGFnTmFtZSIsImVsIiwiY3JlYXRlRWxlbWVudCIsImF0dHIiLCJhdHRyTmFtZSIsImF0dHJWYWx1ZSIsInNldEF0dHJpYnV0ZSIsImF0dHJEeW4iLCJyZW1vdmVBdHRyaWJ1dGUiLCJ2YWx1ZSIsIm9uIiwiZXZlbnROYW1lIiwiY2IiLCJhZGRFdmVudExpc3RlbmVyIiwidGV4dCIsIm5vZGUiLCJjcmVhdGVUZXh0Tm9kZSIsImFwcGVuZENoaWxkIiwiZiIsInRleHRDb250ZW50IiwiY2hpbGQiLCJpdGVyIiwiaXRlbXNJdGVyIiwibWFwcGVyIiwiaXRlckR5biIsImRpc3Bvc2VycyIsIml0ZXJFbmQiLCJjcmVhdGVDb21tZW50IiwiZGlzcG9zZXIiLCJpbnNlcnRCZWZvcmUiLCJyZW1vdmUiLCJyb290IiwicmVwbGFjZUNoaWxkcmVuIiwiU2lnbmFsIiwiaWQiLCJydW5uaW5nRWZmZWN0SWQiLCJzaWduYWxTdWJzIiwic2V0Iiwic2lnbmFsVmFsdWVzIiwic3ViSWRzIiwic3ViSWQiLCJydW5FZmZlY3QiLCJNYXAiLCJlZmZlY3RzIiwic2lnbmFsSWQiLCJTeW1ib2wiLCJlZmZlY3QiLCJlZmZlY3RJZCIsInByZXZFZmZlY3RJZCIsIkxldHRlckJ0biIsInNsaWNlIiwiaXNJbnZhbGlkIiwicHJvcHMiLCJ3aW5kb3ciLCJlIiwiY2hhciIsImNvZGUiLCJ0b0xvd2VyQ2FzZSIsImludmFsaWRJbmRleGVzSW5uZXIiLCJpbnZhbGlkSW5kZXhlcyIsImZvdW5kIiwiZmluZCIsIl9yZWYyIiwibm90SW52YWxpZCIsImlzVmFsaWQiLCJ0cmlnZ2VySW52YWxpZEluZGV4IiwiaWkiLCJkZWxldGUiLCJfcmVmMyJdLCJzb3VyY2VSb290IjoiIn0=