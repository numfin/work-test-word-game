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
  root.appendChild(el.htmlEl);
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
/******/ 		__webpack_require__.h = () => ("a6f44b36bde33d7a51c6")
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLElBQUk7V0FDSjtXQUNBO1dBQ0EsRUFBRTtXQUNGO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBLHNDQUFzQztXQUN0QztXQUNBO1dBQ0EsRUFBRTtXQUNGOztXQUVBOztXQUVBOzs7OztVRTlmQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9sb2dpYy9nYW1lL2dhbWUtZmFjdG9yeS50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL2xvZ2ljL2dhbWUvZ2FtZS1zdG9yZS50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL2xvZ2ljL2dhbWUvZ2FtZS50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL2xvZ2ljL2xldHRlci1waWNrZXIudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9sb2dpYy9yYW5kb21pemVyLnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvbG9naWMvd29yZC1waWNrZXIudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9yZW5kZXJlci9jb21wb25lbnQudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy9yZW5kZXJlci9lbC50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL3JlbmRlcmVyL21vdW50LnRzIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3QvLi9zcmMvcmVuZGVyZXIvcmVhY3Rpdml0eS50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL3VpL2Fuc3dlci1wYW5lbC50cyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0Ly4vc3JjL3VpL2xldHRlci1idG4udHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC8uL3NyYy91aS9sZXR0ZXItcGFuZWwudHMiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9nZXQgamF2YXNjcmlwdCB1cGRhdGUgY2h1bmsgZmlsZW5hbWUiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvZ2V0IHVwZGF0ZSBtYW5pZmVzdCBmaWxlbmFtZSIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9nZXRGdWxsSGFzaCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL2xvYWQgc2NyaXB0Iiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svcnVudGltZS9ob3QgbW9kdWxlIHJlcGxhY2VtZW50Iiwid2VicGFjazovL2Z1bmRyYWlzZXVwLXRlc3Qvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9mdW5kcmFpc2V1cC10ZXN0L3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vZnVuZHJhaXNldXAtdGVzdC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW5zd2VyUGFuZWwgfSBmcm9tIFwiLi91aS9hbnN3ZXItcGFuZWxcIjtcbmltcG9ydCB7IG1vdW50IH0gZnJvbSBcIi4vcmVuZGVyZXIvbW91bnRcIjtcbmltcG9ydCB7IFJ1bnRpbWUgfSBmcm9tIFwiLi9yZW5kZXJlci9yZWFjdGl2aXR5XCI7XG5pbXBvcnQgeyBMZXR0ZXJQYW5lbCB9IGZyb20gXCIuL3VpL2xldHRlci1wYW5lbFwiO1xuaW1wb3J0IHsgZ2FtZUZhY3RvcnkgfSBmcm9tIFwiLi9sb2dpYy9nYW1lL2dhbWUtZmFjdG9yeVwiO1xuaW1wb3J0IHsgR2FtZVN0b3JlIH0gZnJvbSBcIi4vbG9naWMvZ2FtZS9nYW1lLXN0b3JlXCI7XG5cbmZ1bmN0aW9uIG1haW4oKSB7XG4gIGNvbnN0IGN4ID0gbmV3IFJ1bnRpbWUoKTtcblxuICBjb25zdCBnYW1lSW5uZXIgPSBnYW1lRmFjdG9yeSh7XG4gICAgcmVzdG9yZTogR2FtZVN0b3JlLmNoZWNrU2F2ZUFuZEFzaygpLFxuICAgIGxpc3RlbmVyczoge1xuICAgICAgb25GaW5pc2goZGF0YSkge1xuICAgICAgICBhbGVydChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICB9LFxuICAgICAgb25TdXJyZW5kZXIobmV4dCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgLy8gdHJpZ2dlciB1cGRhdGUsIHNpbmNlIEdhbWUgZG9lc24ndCBrbm93IGFueXRoaW5nIGFib3V0IHJlYWN0aXZpdHlcbiAgICAgICAgICBnYW1lLnVwZGF0ZSgoZykgPT4gZyk7XG4gICAgICAgIH0sIDIwMDApO1xuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgY29uc3QgZ2FtZSA9IGN4LmNyZWF0ZVNpZ25hbChnYW1lSW5uZXIpO1xuXG4gIGN4LmNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgR2FtZVN0b3JlLnNhdmUoZ2FtZS5nZXQoKSk7XG4gIH0pO1xuXG4gIG1vdW50KFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYW5zd2VyXCIpISxcbiAgICBBbnN3ZXJQYW5lbChjeCwge1xuICAgICAgZ2FtZSxcbiAgICB9KVxuICApO1xuICBtb3VudChcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2xldHRlcnNcIikhLFxuICAgIExldHRlclBhbmVsKGN4LCB7XG4gICAgICBnYW1lLFxuICAgIH0pXG4gICk7XG59XG5cbm1haW4oKTtcbiIsImltcG9ydCB7IEZpbmlzaERhdGEsIEdhbWUsIFJvdW5kIH0gZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgTGV0dGVyUGlja2VyIH0gZnJvbSBcIi4uL2xldHRlci1waWNrZXJcIjtcbmltcG9ydCB7IFJhbmRvbWl6ZXIgfSBmcm9tIFwiLi4vcmFuZG9taXplclwiO1xuaW1wb3J0IHsgTUFYX1dPUkRTX0lOX1FVRVVFLCBXb3JkUGlja2VyIH0gZnJvbSBcIi4uL3dvcmQtcGlja2VyXCI7XG5pbXBvcnQgeyBHYW1lU3RvcmUgfSBmcm9tIFwiLi9nYW1lLXN0b3JlXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnYW1lRmFjdG9yeShvcHRpb25zOiB7XG4gIHJlc3RvcmU6IGJvb2xlYW47XG4gIGxpc3RlbmVyczoge1xuICAgIG9uU3VycmVuZGVyOiAobmV4dDogKCkgPT4gdm9pZCkgPT4gdm9pZDtcbiAgICBvbkZpbmlzaDogKGRhdGE6IEZpbmlzaERhdGEpID0+IHZvaWQ7XG4gIH07XG59KTogR2FtZSB7XG4gIGNvbnN0IGdhbWUgPSBuZXcgR2FtZShvcHRpb25zLmxpc3RlbmVycyk7XG5cbiAgaWYgKG9wdGlvbnMucmVzdG9yZSkge1xuICAgIEdhbWVTdG9yZS5yZXN0b3JlKGdhbWUpO1xuICB9IGVsc2Uge1xuICAgIFdvcmRQaWNrZXIucGlja1JhbmRvbVdvcmRzKE1BWF9XT1JEU19JTl9RVUVVRSkuZm9yRWFjaCgod29yZCkgPT4ge1xuICAgICAgY29uc3QgcmFuZG9taXplciA9IG5ldyBSYW5kb21pemVyKCk7XG4gICAgICBjb25zdCBsZXR0ZXJQaWNrZXIgPSBuZXcgTGV0dGVyUGlja2VyKHJhbmRvbWl6ZXIpO1xuICAgICAgY29uc3QgcmFuZG9tV29yZExldHRlcnMgPSBsZXR0ZXJQaWNrZXIucmFuZG9taXplKHdvcmQpO1xuXG4gICAgICBjb25zdCByb3VuZCA9IG5ldyBSb3VuZChnYW1lLCB3b3JkLCByYW5kb21Xb3JkTGV0dGVycyk7XG4gICAgICBnYW1lLmFkZFJvdW5kKHJvdW5kKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZ2FtZTtcbn1cbiIsImltcG9ydCB7IEdhbWUsIFJvdW5kIH0gZnJvbSBcIi4vZ2FtZVwiO1xuXG5jb25zdCBLRVkgPSBcImdhbWVzdGF0ZS1udW1maW5cIjtcblxuaW50ZXJmYWNlIEdhbWVTdGF0ZSB7XG4gIGN1cnJlbnRSb3VuZEluZGV4OiBudW1iZXI7XG4gIHJvdW5kczoge1xuICAgIHdvcmQ6IHN0cmluZztcbiAgICBjdXJyZW50RXJyb3JzOiBudW1iZXI7XG4gICAgcGlja2VkSW5kZXhlczogbnVtYmVyW107XG4gICAgc3VycmVuZGVyOiBib29sZWFuO1xuICAgIHJhbmRvbVdvcmRMZXR0ZXJzOiBzdHJpbmdbXTtcbiAgfVtdO1xufVxuXG5leHBvcnQgY2xhc3MgR2FtZVN0b3JlIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIHN0YXRpYyBjaGVja1NhdmVBbmRBc2soKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKEtFWSkgPz8gXCJcIik7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0eXBlb2YgcGFyc2VkRGF0YVtcImN1cnJlbnRSb3VuZEluZGV4XCJdID09PSBcIm51bWJlclwiICYmXG4gICAgICAgIGNvbmZpcm0oXCJSZXN0b3JlIGxhc3Qgc2Vzc2lvbj9cIilcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBzYXZlKGdhbWU6IEdhbWUpIHtcbiAgICBjb25zdCBnYW1lU3RhdGUgPSB7XG4gICAgICBjdXJyZW50Um91bmRJbmRleDogZ2FtZS5jdXJyZW50Um91bmRJbmRleCxcbiAgICAgIHJvdW5kczogZ2FtZS5yb3VuZHMubWFwKChyKSA9PiAoe1xuICAgICAgICB3b3JkOiByLndvcmQsXG4gICAgICAgIGN1cnJlbnRFcnJvcnM6IHIuY3VycmVudEVycm9ycyxcbiAgICAgICAgcGlja2VkSW5kZXhlczogQXJyYXkuZnJvbShyLnBpY2tlZEluZGV4ZXMudmFsdWVzKCkpLFxuICAgICAgICBzdXJyZW5kZXI6IHIuc3VycmVuZGVyLFxuICAgICAgICByYW5kb21Xb3JkTGV0dGVyczogci5yYW5kb21Xb3JkTGV0dGVycyxcbiAgICAgIH0pKSxcbiAgICB9O1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEtFWSwgSlNPTi5zdHJpbmdpZnkoZ2FtZVN0YXRlKSk7XG4gIH1cbiAgLyoqIE11dGF0ZSBnYW1lIHN0YXRlICovXG4gIHN0YXRpYyByZXN0b3JlKGdhbWU6IEdhbWUpIHtcbiAgICBjb25zdCBnYW1lU3RhdGU6IEdhbWVTdGF0ZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oS0VZKSA/PyBcIlwiKTtcbiAgICBmb3IgKGNvbnN0IHNhdmVkUm91bmQgb2YgZ2FtZVN0YXRlLnJvdW5kcykge1xuICAgICAgY29uc3QgbmV3Um91bmQgPSBuZXcgUm91bmQoXG4gICAgICAgIGdhbWUsXG4gICAgICAgIHNhdmVkUm91bmQud29yZCxcbiAgICAgICAgc2F2ZWRSb3VuZC5yYW5kb21Xb3JkTGV0dGVycyxcbiAgICAgICAgc2F2ZWRSb3VuZC5jdXJyZW50RXJyb3JzXG4gICAgICApO1xuICAgICAgc2F2ZWRSb3VuZC5waWNrZWRJbmRleGVzLmZvckVhY2goKGluZGV4KSA9PlxuICAgICAgICBuZXdSb3VuZC5waWNrZWRJbmRleGVzLmFkZChpbmRleClcbiAgICAgICk7XG4gICAgICBuZXdSb3VuZC5zdXJyZW5kZXIgPSBzYXZlZFJvdW5kLnN1cnJlbmRlcjtcbiAgICAgIGdhbWUuYWRkUm91bmQobmV3Um91bmQpO1xuICAgIH1cbiAgICBnYW1lLmN1cnJlbnRSb3VuZEluZGV4ID0gZ2FtZVN0YXRlLmN1cnJlbnRSb3VuZEluZGV4O1xuICAgIGlmIChnYW1lLmN1cnJlbnRSb3VuZCgpLnN1cnJlbmRlcikge1xuICAgICAgZ2FtZS5uZXh0Um91bmQoKTtcbiAgICB9XG4gIH1cbn1cbiIsImNvbnN0IE1BWF9ST1VORF9FUlJPUlMgPSAzO1xuXG5leHBvcnQgY2xhc3MgUm91bmQge1xuICBwcml2YXRlIG1heEVycm9ycyA9IE1BWF9ST1VORF9FUlJPUlM7XG4gIHB1YmxpYyBwaWNrZWRJbmRleGVzID0gbmV3IFNldDxudW1iZXI+KCk7XG4gIHB1YmxpYyBzdXJyZW5kZXIgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGdhbWU6IEdhbWUsXG4gICAgcHVibGljIHdvcmQ6IHN0cmluZyxcbiAgICBwdWJsaWMgcmFuZG9tV29yZExldHRlcnM6IHN0cmluZ1tdLFxuICAgIHB1YmxpYyBjdXJyZW50RXJyb3JzID0gMFxuICApIHt9XG5cbiAgdmlzaWJsZVJhbmRvbUxldHRlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucmFuZG9tV29yZExldHRlcnNcbiAgICAgIC5tYXAoKGxldHRlciwgaW5kZXgpID0+ICh7IGxldHRlciwgaW5kZXggfSkpXG4gICAgICAuZmlsdGVyKCh7IGluZGV4IH0pID0+ICF0aGlzLnBpY2tlZEluZGV4ZXMuaGFzKGluZGV4KSk7XG4gIH1cbiAgZ3Vlc3MocmFuZG9tTGV0dGVySW5kZXg6IG51bWJlcikge1xuICAgIGlmICh0aGlzLnN1cnJlbmRlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBndWVzc2VkTGV0dGVyID0gdGhpcy5yYW5kb21Xb3JkTGV0dGVyc1tyYW5kb21MZXR0ZXJJbmRleF07XG4gICAgY29uc3QgY3VycmVudExldHRlciA9IHRoaXMud29yZFt0aGlzLnBpY2tlZEluZGV4ZXMuc2l6ZV07XG4gICAgY29uc3QgZ3Vlc3NlZFJpZ2h0ID0gZ3Vlc3NlZExldHRlciA9PT0gY3VycmVudExldHRlcjtcbiAgICBpZiAoZ3Vlc3NlZFJpZ2h0KSB7XG4gICAgICB0aGlzLmFjY2VwdExldHRlcihyYW5kb21MZXR0ZXJJbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudHJpZ2dlck1pc3Rha2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIGd1ZXNzZWRSaWdodDtcbiAgfVxuXG4gIHByaXZhdGUgYWNjZXB0TGV0dGVyKHJhbmRvbUxldHRlckluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnBpY2tlZEluZGV4ZXMuYWRkKHJhbmRvbUxldHRlckluZGV4KTtcbiAgICBpZiAodGhpcy5waWNrZWRJbmRleGVzLnNpemUgPj0gdGhpcy53b3JkLmxlbmd0aCkge1xuICAgICAgdGhpcy5nYW1lLm5leHRSb3VuZCgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIHRyaWdnZXJNaXN0YWtlKCkge1xuICAgIHRoaXMuY3VycmVudEVycm9ycyArPSAxO1xuICAgIGlmICh0aGlzLmN1cnJlbnRFcnJvcnMgPj0gdGhpcy5tYXhFcnJvcnMpIHtcbiAgICAgIHRoaXMuc3VycmVuZGVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuZ2FtZS5zdXJyZW5kZXIoKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaW5pc2hEYXRhIHtcbiAgY29ycmVjdFJvdW5kczogbnVtYmVyO1xuICBlcnJvckFtb3VudDogbnVtYmVyO1xuICB3b3JzdFdvcmQ6IHN0cmluZztcbn1cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgcHVibGljIHJvdW5kczogUm91bmRbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbGlzdGVuZXJzOiB7XG4gICAgICBvblN1cnJlbmRlcjogKG5leHQ6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG4gICAgICBvbkZpbmlzaDogKGRhdGE6IEZpbmlzaERhdGEpID0+IHZvaWQ7XG4gICAgfSxcbiAgICBwdWJsaWMgY3VycmVudFJvdW5kSW5kZXggPSAwXG4gICkge31cbiAgZ2V0IGluZm8oKTogRmluaXNoRGF0YSB7XG4gICAgY29uc3QgY29ycmVjdFJvdW5kcyA9IHRoaXMucm91bmRzLmZpbHRlcigocikgPT4gci5jdXJyZW50RXJyb3JzID09PSAwKTtcbiAgICBjb25zdCBlcnJvckFtb3VudCA9IHRoaXMucm91bmRzLnJlZHVjZSgoc3VtLCByKSA9PiB7XG4gICAgICByZXR1cm4gc3VtICsgci5jdXJyZW50RXJyb3JzO1xuICAgIH0sIDApO1xuICAgIGNvbnN0IHNvcnRlZEJ5RXJyb3JzRGVzYyA9IHRoaXMucm91bmRzXG4gICAgICAuZmlsdGVyKChyKSA9PiByLmN1cnJlbnRFcnJvcnMgPiAwKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuY3VycmVudEVycm9ycyAtIGEuY3VycmVudEVycm9ycyk7XG4gICAgY29uc3Qgd29yc3RXb3JkID0gc29ydGVkQnlFcnJvcnNEZXNjWzBdPy53b3JkID8/IFwiXCI7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29ycmVjdFJvdW5kczogY29ycmVjdFJvdW5kcy5sZW5ndGgsXG4gICAgICBlcnJvckFtb3VudCxcbiAgICAgIHdvcnN0V29yZCxcbiAgICB9O1xuICB9XG5cbiAgYWRkUm91bmQocm91bmQ6IFJvdW5kKSB7XG4gICAgdGhpcy5yb3VuZHMucHVzaChyb3VuZCk7XG4gIH1cbiAgY3VycmVudFJvdW5kKCkge1xuICAgIHJldHVybiB0aGlzLnJvdW5kc1t0aGlzLmN1cnJlbnRSb3VuZEluZGV4XTtcbiAgfVxuICBndWVzcyhyYW5kb21MZXR0ZXJJbmRleDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFJvdW5kKCk/Lmd1ZXNzKHJhbmRvbUxldHRlckluZGV4KTtcbiAgfVxuICBzdXJyZW5kZXIoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMub25TdXJyZW5kZXIoKCkgPT4gdGhpcy5uZXh0Um91bmQoKSk7XG4gIH1cbiAgbmV4dFJvdW5kKCkge1xuICAgIGNvbnN0IG5leHRSb3VuZCA9IHRoaXMuY3VycmVudFJvdW5kSW5kZXggKyAxO1xuICAgIGlmIChuZXh0Um91bmQgPj0gdGhpcy5yb3VuZHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmxpc3RlbmVycy5vbkZpbmlzaCh0aGlzLmluZm8pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnRSb3VuZEluZGV4ID0gbmV4dFJvdW5kO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgUmFuZG9taXplciB9IGZyb20gXCIuL3JhbmRvbWl6ZXJcIjtcblxuZXhwb3J0IGNsYXNzIExldHRlclBpY2tlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmFuZG9taXplcjogUmFuZG9taXplcikge31cblxuICByYW5kb21pemUod29yZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGV0dGVycyA9IHdvcmQuc3BsaXQoXCJcIik7XG4gICAgY29uc3QgcGlja2VkSW5kZXhlcyA9IG5ldyBTZXQoKTtcblxuICAgIHJldHVybiBsZXR0ZXJzLm1hcCgoKSA9PiB7XG4gICAgICBjb25zdCBmcmVzaFNldCA9IGxldHRlcnNcbiAgICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+ICh7IGl0ZW0sIGluZGV4IH0pKVxuICAgICAgICAuZmlsdGVyKCh7IGluZGV4IH0pID0+ICFwaWNrZWRJbmRleGVzLmhhcyhpbmRleCkpO1xuICAgICAgY29uc3QgeyBpdGVtLCBpbmRleCB9ID0gdGhpcy5yYW5kb21pemVyLnBpY2soZnJlc2hTZXQpO1xuICAgICAgcGlja2VkSW5kZXhlcy5hZGQoaW5kZXgpO1xuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSk7XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBSYW5kb21pemVyIHtcbiAgcGljazxUPihjb2xsZWN0aW9uOiBUW10pIHtcbiAgICBjb25zdCBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvbGxlY3Rpb24ubGVuZ3RoKTtcbiAgICByZXR1cm4gY29sbGVjdGlvbltpbmRleF07XG4gIH1cbn1cbiIsImltcG9ydCB7IFJhbmRvbWl6ZXIgfSBmcm9tIFwiLi9yYW5kb21pemVyXCI7XG5cbmV4cG9ydCBjb25zdCBXT1JEX1ZBUklBTlRTID0gW1xuICBcImFwcGxlXCIsXG4gIFwiZnVuY3Rpb25cIixcbiAgXCJ0aW1lb3V0XCIsXG4gIFwidGFza1wiLFxuICBcImFwcGxpY2F0aW9uXCIsXG4gIFwiZGF0YVwiLFxuICBcInRyYWdlZHlcIixcbiAgXCJzdW5cIixcbiAgXCJzeW1ib2xcIixcbiAgXCJidXR0b25cIixcbiAgXCJzb2Z0d2FyZVwiLFxuXTtcbmV4cG9ydCBjb25zdCBNQVhfV09SRFNfSU5fUVVFVUUgPSA2O1xuXG5leHBvcnQgY2xhc3MgV29yZFBpY2tlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmFuZG9taXplcjogUmFuZG9taXplciwgcHJpdmF0ZSB3b3Jkczogc3RyaW5nW10pIHt9XG5cbiAgZ2V0UmFuZG9tV29yZHMoYW1vdW50OiBudW1iZXIpIHtcbiAgICBjb25zdCBwaWNrZWRJbmRleGVzID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IGNob3NlbldvcmRzID0gW107XG4gICAgZm9yIChjb25zdCBfIG9mIEFycmF5KGFtb3VudCkua2V5cygpKSB7XG4gICAgICBjb25zdCBmcmVzaFNldCA9IHRoaXMud29yZHNcbiAgICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+ICh7IGl0ZW0sIGluZGV4IH0pKVxuICAgICAgICAuZmlsdGVyKCh7IGluZGV4IH0pID0+ICFwaWNrZWRJbmRleGVzLmhhcyhpbmRleCkpO1xuICAgICAgY29uc3QgeyBpbmRleCwgaXRlbSB9ID0gdGhpcy5yYW5kb21pemVyLnBpY2soZnJlc2hTZXQpO1xuICAgICAgcGlja2VkSW5kZXhlcy5hZGQoaW5kZXgpO1xuICAgICAgY2hvc2VuV29yZHMucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGNob3NlbldvcmRzO1xuICB9XG5cbiAgc3RhdGljIHBpY2tSYW5kb21Xb3JkcyhhbW91bnQ6IG51bWJlcikge1xuICAgIGNvbnN0IHJhbmRvbWl6ZXIgPSBuZXcgUmFuZG9taXplcigpO1xuICAgIGNvbnN0IHdvcmRQaWNrZXIgPSBuZXcgV29yZFBpY2tlcihyYW5kb21pemVyLCBXT1JEX1ZBUklBTlRTKTtcbiAgICBjb25zdCB3b3JkQ29sbGVjdGlvbiA9IHdvcmRQaWNrZXIuZ2V0UmFuZG9tV29yZHMoYW1vdW50KTtcbiAgICByZXR1cm4gd29yZENvbGxlY3Rpb247XG4gIH1cbn1cbiIsImltcG9ydCB7IEVsIH0gZnJvbSBcIi4vZWxcIjtcbmltcG9ydCB7IFJ1bnRpbWUgfSBmcm9tIFwiLi9yZWFjdGl2aXR5XCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnQ8VD4oZm46IChjeDogUnVudGltZSwgcHJvcHM6IFQpID0+IEVsKSB7XG4gIHJldHVybiBmbjtcbn1cbiIsImltcG9ydCB7IFJ1bnRpbWUgfSBmcm9tIFwiLi9yZWFjdGl2aXR5XCI7XG5cbmV4cG9ydCB0eXBlIEVNID0gSFRNTEVsZW1lbnRFdmVudE1hcDtcbmV4cG9ydCB0eXBlIFRNID0gSFRNTEVsZW1lbnRUYWdOYW1lTWFwO1xuXG5pbnRlcmZhY2UgRXZlbnRIYW5kbGVyPEV2ZW50TmFtZSBleHRlbmRzIGtleW9mIEVNPiB7XG4gIChldmVudDogRU1bRXZlbnROYW1lXSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBFbCB7XG4gIHByaXZhdGUgY29uc3RydWN0b3IocHVibGljIGh0bWxFbDogSFRNTEVsZW1lbnQpIHt9XG4gIHN0YXRpYyBuZXc8VCBleHRlbmRzIGtleW9mIFRNPih0YWdOYW1lOiBUKSB7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICAgIHJldHVybiBuZXcgRWwoZWwpO1xuICB9XG4gIC8qKiBTdGF0aWMgYXR0cmlidXRlIGJpbmQgKi9cbiAgYXR0cihhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuaHRtbEVsLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0clZhbHVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKiBSZWFjdGl2ZSBhdHRyaWJ1dGUgYmluZCAqL1xuICBhdHRyRHluKGN4OiBSdW50aW1lLCBhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6ICgpID0+IHN0cmluZyB8IGJvb2xlYW4pIHtcbiAgICBjeC5jcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgICAgdGhpcy5odG1sRWwucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gYXR0clZhbHVlKCk7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICB0aGlzLmh0bWxFbC5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIFwidHJ1ZVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmh0bWxFbC5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmh0bWxFbC5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIC8qKiBhZGRFdmVudExpc3RlbmVyICovXG4gIG9uPFQgZXh0ZW5kcyBrZXlvZiBFTT4oZXZlbnROYW1lOiBULCBjYjogRXZlbnRIYW5kbGVyPFQ+KSB7XG4gICAgdGhpcy5odG1sRWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNiKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKiogU3RhdGljIHJlbmRlciBmb3IgdGV4dCAqL1xuICB0ZXh0KGRhdGE6IHN0cmluZykge1xuICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKTtcbiAgICB0aGlzLmh0bWxFbC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKiogUmVhY3RpdmUgcmVuZGVyIGZvciB0ZXh0ICovXG4gIHRleHREeW4oY3g6IFJ1bnRpbWUsIGY6ICgpID0+IHN0cmluZykge1xuICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtcbiAgICB0aGlzLmh0bWxFbC5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgIGN4LmNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgICBub2RlLnRleHRDb250ZW50ID0gZigpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqIFJlbmRlciBmb3IgY2hpbGQgY29tcG9uZW50ICovXG4gIGNoaWxkKGNoaWxkOiBFbCkge1xuICAgIHRoaXMuaHRtbEVsLmFwcGVuZENoaWxkKGNoaWxkLmh0bWxFbCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLyoqIFN0YXRpYyByZW5kZXIgZm9yIGl0ZXJhdG9ycyAqL1xuICBpdGVyPFQ+KGl0ZW1zSXRlcjogSXRlcmFibGU8VD4sIG1hcHBlcjogKGl0ZW06IFQpID0+IEVsKTogRWwge1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtc0l0ZXIpIHtcbiAgICAgIGNvbnN0IGVsID0gbWFwcGVyKGl0ZW0pO1xuICAgICAgdGhpcy5odG1sRWwuYXBwZW5kQ2hpbGQoZWwuaHRtbEVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKiogUmVhY3RpdmUgcmVuZGVyIGZvciBpdGVyYXRvcnMgKi9cbiAgaXRlckR5bjxUPihcbiAgICBjeDogUnVudGltZSxcbiAgICBpdGVtc0l0ZXI6ICgpID0+IEl0ZXJhYmxlPFQ+LFxuICAgIG1hcHBlcjogKGl0ZW06IFQsIGluZGV4OiBudW1iZXIpID0+IEVsXG4gICk6IEVsIHtcbiAgICBjb25zdCBkaXNwb3NlcnM6ICgoKSA9PiB2b2lkKVtdID0gW107XG4gICAgY29uc3QgaXRlckVuZCA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoXCJpdGVyIGVuZFwiKTtcbiAgICB0aGlzLmh0bWxFbC5hcHBlbmRDaGlsZChpdGVyRW5kKTtcblxuICAgIGN4LmNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGRpc3Bvc2VyIG9mIGRpc3Bvc2Vycykge1xuICAgICAgICBkaXNwb3NlcigpO1xuICAgICAgfVxuICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtc0l0ZXIoKSkge1xuICAgICAgICBjb25zdCBlbCA9IG1hcHBlcihpdGVtLCBpbmRleCsrKTtcbiAgICAgICAgdGhpcy5odG1sRWwuaW5zZXJ0QmVmb3JlKGVsLmh0bWxFbCwgaXRlckVuZCk7XG4gICAgICAgIGRpc3Bvc2Vycy5wdXNoKCgpID0+IGVsLmh0bWxFbC5yZW1vdmUoKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiaW1wb3J0IHsgRWwgfSBmcm9tIFwiLi9lbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gbW91bnQocm9vdDogSFRNTEVsZW1lbnQsIGVsOiBFbCkge1xuICByb290LmFwcGVuZENoaWxkKGVsLmh0bWxFbCk7XG59XG4iLCJ0eXBlIFNpZ25hbElEID0gU3ltYm9sO1xudHlwZSBFZmZlY3RJRCA9IFN5bWJvbDtcblxuLyoqXG4gKiBTaWduYWwgdGhhdCBhbGxvd3MgdG8gc3Vic2NyaWJlIGluc2lkZSBlZmZlY3RzIG9uIFwiZ2V0XCJcbiAqIGFuZCBub3RpZnkgc3Vic2NyaWJlcnMgb24gXCJzZXRcIlxuICovXG5leHBvcnQgY2xhc3MgU2lnbmFsPFQ+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjeDogUnVudGltZSwgcHJpdmF0ZSBpZDogU2lnbmFsSUQpIHt9XG4gIGdldCgpOiBUIHtcbiAgICBpZiAodGhpcy5jeC5ydW5uaW5nRWZmZWN0SWQpIHtcbiAgICAgIGlmICghdGhpcy5jeC5zaWduYWxTdWJzLmhhcyh0aGlzLmlkKSkge1xuICAgICAgICB0aGlzLmN4LnNpZ25hbFN1YnMuc2V0KHRoaXMuaWQsIG5ldyBTZXQoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLmN4LnNpZ25hbFN1YnMuZ2V0KHRoaXMuaWQpPy5hZGQodGhpcy5jeC5ydW5uaW5nRWZmZWN0SWQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jeC5zaWduYWxWYWx1ZXMuZ2V0KHRoaXMuaWQpO1xuICB9XG4gIHNldCh2YWx1ZTogVCkge1xuICAgIHRoaXMuY3guc2lnbmFsVmFsdWVzLnNldCh0aGlzLmlkLCB2YWx1ZSk7XG5cbiAgICBjb25zdCBzdWJJZHMgPSB0aGlzLmN4LnNpZ25hbFN1YnMuZ2V0KHRoaXMuaWQpO1xuICAgIGlmIChzdWJJZHMpIHtcbiAgICAgIGZvciAoY29uc3Qgc3ViSWQgb2Ygc3ViSWRzKSB7XG4gICAgICAgIHRoaXMuY3gucnVuRWZmZWN0KHN1YklkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgdXBkYXRlKGZuOiAodjogVCkgPT4gVCkge1xuICAgIGNvbnN0IHZhbHVlID0gZm4odGhpcy5jeC5zaWduYWxWYWx1ZXMuZ2V0KHRoaXMuaWQpKTtcbiAgICB0aGlzLnNldCh2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogXCJBcmVuYSBhbGxvY2F0b3JcIiBmb3IgcmVhY3RpdmUgdmFsdWVzIGFuZCBzdWJzY3JpYmVyc1xuICovXG5leHBvcnQgY2xhc3MgUnVudGltZSB7XG4gIHNpZ25hbFZhbHVlcyA9IG5ldyBNYXA8U2lnbmFsSUQsIGFueT4oKTtcbiAgcnVubmluZ0VmZmVjdElkPzogRWZmZWN0SUQ7XG4gIHNpZ25hbFN1YnMgPSBuZXcgTWFwPFNpZ25hbElELCBTZXQ8RWZmZWN0SUQ+PigpO1xuICBlZmZlY3RzID0gbmV3IE1hcDxFZmZlY3RJRCwgKCkgPT4gdm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG4gIGNyZWF0ZVNpZ25hbDxUPih2YWx1ZTogVCk6IFNpZ25hbDxUPiB7XG4gICAgY29uc3Qgc2lnbmFsSWQgPSBTeW1ib2woKTtcbiAgICB0aGlzLnNpZ25hbFZhbHVlcy5zZXQoc2lnbmFsSWQsIHZhbHVlKTtcbiAgICByZXR1cm4gbmV3IFNpZ25hbCh0aGlzLCBzaWduYWxJZCk7XG4gIH1cbiAgY3JlYXRlRWZmZWN0KGVmZmVjdDogKCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IGVmZmVjdElkID0gU3ltYm9sKCk7XG4gICAgdGhpcy5lZmZlY3RzLnNldChlZmZlY3RJZCwgZWZmZWN0KTtcblxuICAgIHRoaXMucnVuRWZmZWN0KGVmZmVjdElkKTtcbiAgfVxuICBydW5FZmZlY3QoZWZmZWN0SWQ6IEVmZmVjdElEKSB7XG4gICAgY29uc3QgcHJldkVmZmVjdElkID0gdGhpcy5ydW5uaW5nRWZmZWN0SWQ7XG4gICAgdGhpcy5ydW5uaW5nRWZmZWN0SWQgPSBlZmZlY3RJZDtcbiAgICB0aGlzLmVmZmVjdHMuZ2V0KGVmZmVjdElkKT8uKCk7XG4gICAgdGhpcy5ydW5uaW5nRWZmZWN0SWQgPSBwcmV2RWZmZWN0SWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IEdhbWUgfSBmcm9tIFwiLi4vbG9naWMvZ2FtZS9nYW1lXCI7XG5pbXBvcnQgeyBjcmVhdGVDb21wb25lbnQgfSBmcm9tIFwiLi4vcmVuZGVyZXIvY29tcG9uZW50XCI7XG5pbXBvcnQgeyBFbCB9IGZyb20gXCIuLi9yZW5kZXJlci9lbFwiO1xuaW1wb3J0IHsgU2lnbmFsIH0gZnJvbSBcIi4uL3JlbmRlcmVyL3JlYWN0aXZpdHlcIjtcbmltcG9ydCB7IExldHRlckJ0biB9IGZyb20gXCIuL2xldHRlci1idG5cIjtcblxuaW50ZXJmYWNlIEFuc3dlclBhbmVsUHJvcHMge1xuICBnYW1lOiBTaWduYWw8R2FtZT47XG59XG5cbmV4cG9ydCBjb25zdCBBbnN3ZXJQYW5lbCA9IGNyZWF0ZUNvbXBvbmVudCgoY3gsIHsgZ2FtZSB9OiBBbnN3ZXJQYW5lbFByb3BzKSA9PiB7XG4gIGNvbnN0IHJvdW5kID0gKCkgPT4gZ2FtZS5nZXQoKS5jdXJyZW50Um91bmQoKTtcbiAgcmV0dXJuIEVsLm5ldyhcImRpdlwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJkLWZsZXgganVzdGlmeS1jb250ZW50LWNlbnRlclwiKVxuICAgIC5hdHRyKFwic3R5bGVcIiwgXCJnYXA6IDAuNWVtXCIpXG4gICAgLml0ZXJEeW4oXG4gICAgICBjeCxcbiAgICAgICgpID0+IHtcbiAgICAgICAgY29uc3QgciA9IHJvdW5kKCk7XG4gICAgICAgIGlmICghcikge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoci5zdXJyZW5kZXIpIHtcbiAgICAgICAgICByZXR1cm4gci53b3JkLnNwbGl0KFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByLndvcmQuc2xpY2UoMCwgci5waWNrZWRJbmRleGVzLnNpemUpLnNwbGl0KFwiXCIpO1xuICAgICAgfSxcbiAgICAgIChsZXR0ZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIExldHRlckJ0bihjeCwge1xuICAgICAgICAgIGxldHRlcixcbiAgICAgICAgICBpc0ludmFsaWQ6ICgpID0+ICEhcm91bmQoKT8uc3VycmVuZGVyLFxuICAgICAgICAgIHBpY2s6ICgpID0+IHt9LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xufSk7XG4iLCJpbXBvcnQgeyBjcmVhdGVDb21wb25lbnQgfSBmcm9tIFwiLi4vcmVuZGVyZXIvY29tcG9uZW50XCI7XG5pbXBvcnQgeyBFbCB9IGZyb20gXCIuLi9yZW5kZXJlci9lbFwiO1xuXG5pbnRlcmZhY2UgTGV0dGVyQnRuUHJvcHMge1xuICBwaWNrPzogKCkgPT4gdm9pZDtcbiAgaXNJbnZhbGlkPzogKCkgPT4gYm9vbGVhbjtcbiAgbGV0dGVyOiBzdHJpbmc7XG59XG5leHBvcnQgY29uc3QgTGV0dGVyQnRuID0gY3JlYXRlQ29tcG9uZW50KChjeCwgcHJvcHM6IExldHRlckJ0blByb3BzKSA9PiB7XG4gIHJldHVybiBFbC5uZXcoXCJidXR0b25cIilcbiAgICAub24oXCJjbGlja1wiLCAoKSA9PiBwcm9wcy5waWNrPy4oKSlcbiAgICAuYXR0cihcInR5cGVcIiwgXCJidXR0b25cIilcbiAgICAuYXR0ckR5bihjeCwgXCJjbGFzc1wiLCAoKSA9PlxuICAgICAgcHJvcHMuaXNJbnZhbGlkPy4oKSA/IGBidG4gYnRuLWRhbmdlcmAgOiBgYnRuIGJ0bi1wcmltYXJ5YFxuICAgIClcbiAgICAuYXR0cihcInN0eWxlXCIsIFwid2lkdGg6IDIuNWVtOyBoZWlnaHQ6IDIuNWVtXCIpXG4gICAgLnRleHQocHJvcHMubGV0dGVyKTtcbn0pO1xuIiwiaW1wb3J0IHsgR2FtZSB9IGZyb20gXCIuLi9sb2dpYy9nYW1lL2dhbWVcIjtcbmltcG9ydCB7IGNyZWF0ZUNvbXBvbmVudCB9IGZyb20gXCIuLi9yZW5kZXJlci9jb21wb25lbnRcIjtcbmltcG9ydCB7IEVsIH0gZnJvbSBcIi4uL3JlbmRlcmVyL2VsXCI7XG5pbXBvcnQgeyBTaWduYWwgfSBmcm9tIFwiLi4vcmVuZGVyZXIvcmVhY3Rpdml0eVwiO1xuaW1wb3J0IHsgTGV0dGVyQnRuIH0gZnJvbSBcIi4vbGV0dGVyLWJ0blwiO1xuXG5pbnRlcmZhY2UgTGV0dGVyUGFuZWxQcm9wcyB7XG4gIGdhbWU6IFNpZ25hbDxHYW1lPjtcbn1cbmV4cG9ydCBjb25zdCBMZXR0ZXJQYW5lbCA9IGNyZWF0ZUNvbXBvbmVudCgoY3gsIHsgZ2FtZSB9OiBMZXR0ZXJQYW5lbFByb3BzKSA9PiB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4ge1xuICAgIGNvbnN0IGNoYXIgPSBlLmNvZGUuc2xpY2UoMykudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBpbnZhbGlkSW5kZXhlc0lubmVyID0gaW52YWxpZEluZGV4ZXMuZ2V0KCk7XG4gICAgY29uc3Qgcm91bmQgPSBnYW1lLmdldCgpLmN1cnJlbnRSb3VuZCgpO1xuICAgIGNvbnN0IGZvdW5kID0gcm91bmQudmlzaWJsZVJhbmRvbUxldHRlcnMoKS5maW5kKCh7IGxldHRlciwgaW5kZXggfSkgPT4ge1xuICAgICAgY29uc3Qgbm90SW52YWxpZCA9ICFpbnZhbGlkSW5kZXhlc0lubmVyLmhhcyhpbmRleCk7XG4gICAgICByZXR1cm4gbm90SW52YWxpZCAmJiBjaGFyID09PSBsZXR0ZXI7XG4gICAgfSk7XG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICBwaWNrKGZvdW5kLmluZGV4KTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHBpY2soaW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IGlzVmFsaWQgPSBnYW1lLmdldCgpLmd1ZXNzKGluZGV4KTtcbiAgICBnYW1lLnNldChnYW1lLmdldCgpKTtcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgdHJpZ2dlckludmFsaWRJbmRleChpbmRleCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaW52YWxpZEluZGV4ZXMgPSBjeC5jcmVhdGVTaWduYWwobmV3IFNldDxudW1iZXI+KCkpO1xuICBmdW5jdGlvbiB0cmlnZ2VySW52YWxpZEluZGV4KGluZGV4OiBudW1iZXIpIHtcbiAgICBpbnZhbGlkSW5kZXhlcy51cGRhdGUoKGlpKSA9PiB7XG4gICAgICBpaS5hZGQoaW5kZXgpO1xuICAgICAgcmV0dXJuIGlpO1xuICAgIH0pO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaW52YWxpZEluZGV4ZXMudXBkYXRlKChpaSkgPT4ge1xuICAgICAgICBpaS5kZWxldGUoaW5kZXgpO1xuICAgICAgICByZXR1cm4gaWk7XG4gICAgICB9KTtcbiAgICB9LCAyMDApO1xuICB9XG5cbiAgcmV0dXJuIEVsLm5ldyhcImRpdlwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJkLWZsZXgganVzdGlmeS1jb250ZW50LWNlbnRlclwiKVxuICAgIC5hdHRyKFwic3R5bGVcIiwgXCJnYXA6IDAuNWVtXCIpXG4gICAgLml0ZXJEeW4oXG4gICAgICBjeCxcbiAgICAgICgpID0+IGdhbWUuZ2V0KCkuY3VycmVudFJvdW5kKCk/LnZpc2libGVSYW5kb21MZXR0ZXJzKCkgPz8gW10sXG4gICAgICAoeyBsZXR0ZXIsIGluZGV4IH0pID0+XG4gICAgICAgIExldHRlckJ0bihjeCwge1xuICAgICAgICAgIGxldHRlcixcbiAgICAgICAgICBpc0ludmFsaWQ6ICgpID0+IGludmFsaWRJbmRleGVzLmdldCgpLmhhcyhpbmRleCksXG4gICAgICAgICAgcGljazogKCkgPT4gcGljayhpbmRleCksXG4gICAgICAgIH0pXG4gICAgKTtcbn0pO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChjYWNoZWRNb2R1bGUuZXJyb3IgIT09IHVuZGVmaW5lZCkgdGhyb3cgY2FjaGVkTW9kdWxlLmVycm9yO1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHR0cnkge1xuXHRcdHZhciBleGVjT3B0aW9ucyA9IHsgaWQ6IG1vZHVsZUlkLCBtb2R1bGU6IG1vZHVsZSwgZmFjdG9yeTogX193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0sIHJlcXVpcmU6IF9fd2VicGFja19yZXF1aXJlX18gfTtcblx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkuZm9yRWFjaChmdW5jdGlvbihoYW5kbGVyKSB7IGhhbmRsZXIoZXhlY09wdGlvbnMpOyB9KTtcblx0XHRtb2R1bGUgPSBleGVjT3B0aW9ucy5tb2R1bGU7XG5cdFx0ZXhlY09wdGlvbnMuZmFjdG9yeS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBleGVjT3B0aW9ucy5yZXF1aXJlKTtcblx0fSBjYXRjaChlKSB7XG5cdFx0bW9kdWxlLmVycm9yID0gZTtcblx0XHR0aHJvdyBlO1xuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuLy8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbl9fd2VicGFja19yZXF1aXJlX18uYyA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfXztcblxuLy8gZXhwb3NlIHRoZSBtb2R1bGUgZXhlY3V0aW9uIGludGVyY2VwdG9yXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBbXTtcblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiLy8gVGhpcyBmdW5jdGlvbiBhbGxvdyB0byByZWZlcmVuY2UgYWxsIGNodW5rc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5odSA9IChjaHVua0lkKSA9PiB7XG5cdC8vIHJldHVybiB1cmwgZm9yIGZpbGVuYW1lcyBiYXNlZCBvbiB0ZW1wbGF0ZVxuXHRyZXR1cm4gXCJcIiArIGNodW5rSWQgKyBcIi5cIiArIF9fd2VicGFja19yZXF1aXJlX18uaCgpICsgXCIuaG90LXVwZGF0ZS5qc1wiO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmhtckYgPSAoKSA9PiAoXCJtYWluLlwiICsgX193ZWJwYWNrX3JlcXVpcmVfXy5oKCkgKyBcIi5ob3QtdXBkYXRlLmpzb25cIik7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5oID0gKCkgPT4gKFwiYTZmNDRiMzZiZGUzM2Q3YTUxYzZcIikiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCJ2YXIgaW5Qcm9ncmVzcyA9IHt9O1xudmFyIGRhdGFXZWJwYWNrUHJlZml4ID0gXCJmdW5kcmFpc2V1cC10ZXN0OlwiO1xuLy8gbG9hZFNjcmlwdCBmdW5jdGlvbiB0byBsb2FkIGEgc2NyaXB0IHZpYSBzY3JpcHQgdGFnXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmwgPSAodXJsLCBkb25lLCBrZXksIGNodW5rSWQpID0+IHtcblx0aWYoaW5Qcm9ncmVzc1t1cmxdKSB7IGluUHJvZ3Jlc3NbdXJsXS5wdXNoKGRvbmUpOyByZXR1cm47IH1cblx0dmFyIHNjcmlwdCwgbmVlZEF0dGFjaDtcblx0aWYoa2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcyA9IHNjcmlwdHNbaV07XG5cdFx0XHRpZihzLmdldEF0dHJpYnV0ZShcInNyY1wiKSA9PSB1cmwgfHwgcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXdlYnBhY2tcIikgPT0gZGF0YVdlYnBhY2tQcmVmaXggKyBrZXkpIHsgc2NyaXB0ID0gczsgYnJlYWs7IH1cblx0XHR9XG5cdH1cblx0aWYoIXNjcmlwdCkge1xuXHRcdG5lZWRBdHRhY2ggPSB0cnVlO1xuXHRcdHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG5cdFx0c2NyaXB0LmNoYXJzZXQgPSAndXRmLTgnO1xuXHRcdHNjcmlwdC50aW1lb3V0ID0gMTIwO1xuXHRcdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm5jKSB7XG5cdFx0XHRzY3JpcHQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgX193ZWJwYWNrX3JlcXVpcmVfXy5uYyk7XG5cdFx0fVxuXHRcdHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXdlYnBhY2tcIiwgZGF0YVdlYnBhY2tQcmVmaXggKyBrZXkpO1xuXG5cdFx0c2NyaXB0LnNyYyA9IHVybDtcblx0fVxuXHRpblByb2dyZXNzW3VybF0gPSBbZG9uZV07XG5cdHZhciBvblNjcmlwdENvbXBsZXRlID0gKHByZXYsIGV2ZW50KSA9PiB7XG5cdFx0Ly8gYXZvaWQgbWVtIGxlYWtzIGluIElFLlxuXHRcdHNjcmlwdC5vbmVycm9yID0gc2NyaXB0Lm9ubG9hZCA9IG51bGw7XG5cdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdHZhciBkb25lRm5zID0gaW5Qcm9ncmVzc1t1cmxdO1xuXHRcdGRlbGV0ZSBpblByb2dyZXNzW3VybF07XG5cdFx0c2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcblx0XHRkb25lRm5zICYmIGRvbmVGbnMuZm9yRWFjaCgoZm4pID0+IChmbihldmVudCkpKTtcblx0XHRpZihwcmV2KSByZXR1cm4gcHJldihldmVudCk7XG5cdH1cblx0dmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KG9uU2NyaXB0Q29tcGxldGUuYmluZChudWxsLCB1bmRlZmluZWQsIHsgdHlwZTogJ3RpbWVvdXQnLCB0YXJnZXQ6IHNjcmlwdCB9KSwgMTIwMDAwKTtcblx0c2NyaXB0Lm9uZXJyb3IgPSBvblNjcmlwdENvbXBsZXRlLmJpbmQobnVsbCwgc2NyaXB0Lm9uZXJyb3IpO1xuXHRzY3JpcHQub25sb2FkID0gb25TY3JpcHRDb21wbGV0ZS5iaW5kKG51bGwsIHNjcmlwdC5vbmxvYWQpO1xuXHRuZWVkQXR0YWNoICYmIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbn07IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIGN1cnJlbnRNb2R1bGVEYXRhID0ge307XG52YXIgaW5zdGFsbGVkTW9kdWxlcyA9IF9fd2VicGFja19yZXF1aXJlX18uYztcblxuLy8gbW9kdWxlIGFuZCByZXF1aXJlIGNyZWF0aW9uXG52YXIgY3VycmVudENoaWxkTW9kdWxlO1xudmFyIGN1cnJlbnRQYXJlbnRzID0gW107XG5cbi8vIHN0YXR1c1xudmFyIHJlZ2lzdGVyZWRTdGF0dXNIYW5kbGVycyA9IFtdO1xudmFyIGN1cnJlbnRTdGF0dXMgPSBcImlkbGVcIjtcblxuLy8gd2hpbGUgZG93bmxvYWRpbmdcbnZhciBibG9ja2luZ1Byb21pc2VzID0gMDtcbnZhciBibG9ja2luZ1Byb21pc2VzV2FpdGluZyA9IFtdO1xuXG4vLyBUaGUgdXBkYXRlIGluZm9cbnZhciBjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVycztcbnZhciBxdWV1ZWRJbnZhbGlkYXRlZE1vZHVsZXM7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5obXJEID0gY3VycmVudE1vZHVsZURhdGE7XG5cbl9fd2VicGFja19yZXF1aXJlX18uaS5wdXNoKGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdHZhciBtb2R1bGUgPSBvcHRpb25zLm1vZHVsZTtcblx0dmFyIHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKG9wdGlvbnMucmVxdWlyZSwgb3B0aW9ucy5pZCk7XG5cdG1vZHVsZS5ob3QgPSBjcmVhdGVNb2R1bGVIb3RPYmplY3Qob3B0aW9ucy5pZCwgbW9kdWxlKTtcblx0bW9kdWxlLnBhcmVudHMgPSBjdXJyZW50UGFyZW50cztcblx0bW9kdWxlLmNoaWxkcmVuID0gW107XG5cdGN1cnJlbnRQYXJlbnRzID0gW107XG5cdG9wdGlvbnMucmVxdWlyZSA9IHJlcXVpcmU7XG59KTtcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5obXJDID0ge307XG5fX3dlYnBhY2tfcmVxdWlyZV9fLmhtckkgPSB7fTtcblxuZnVuY3Rpb24gY3JlYXRlUmVxdWlyZShyZXF1aXJlLCBtb2R1bGVJZCkge1xuXHR2YXIgbWUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcblx0aWYgKCFtZSkgcmV0dXJuIHJlcXVpcmU7XG5cdHZhciBmbiA9IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG5cdFx0aWYgKG1lLmhvdC5hY3RpdmUpIHtcblx0XHRcdGlmIChpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdKSB7XG5cdFx0XHRcdHZhciBwYXJlbnRzID0gaW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XS5wYXJlbnRzO1xuXHRcdFx0XHRpZiAocGFyZW50cy5pbmRleE9mKG1vZHVsZUlkKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRwYXJlbnRzLnB1c2gobW9kdWxlSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XG5cdFx0XHRcdGN1cnJlbnRDaGlsZE1vZHVsZSA9IHJlcXVlc3Q7XG5cdFx0XHR9XG5cdFx0XHRpZiAobWUuY2hpbGRyZW4uaW5kZXhPZihyZXF1ZXN0KSA9PT0gLTEpIHtcblx0XHRcdFx0bWUuY2hpbGRyZW4ucHVzaChyZXF1ZXN0KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHRcIltITVJdIHVuZXhwZWN0ZWQgcmVxdWlyZShcIiArXG5cdFx0XHRcdFx0cmVxdWVzdCArXG5cdFx0XHRcdFx0XCIpIGZyb20gZGlzcG9zZWQgbW9kdWxlIFwiICtcblx0XHRcdFx0XHRtb2R1bGVJZFxuXHRcdFx0KTtcblx0XHRcdGN1cnJlbnRQYXJlbnRzID0gW107XG5cdFx0fVxuXHRcdHJldHVybiByZXF1aXJlKHJlcXVlc3QpO1xuXHR9O1xuXHR2YXIgY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gcmVxdWlyZVtuYW1lXTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXF1aXJlW25hbWVdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblx0Zm9yICh2YXIgbmFtZSBpbiByZXF1aXJlKSB7XG5cdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZXF1aXJlLCBuYW1lKSAmJiBuYW1lICE9PSBcImVcIikge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCBuYW1lLCBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IobmFtZSkpO1xuXHRcdH1cblx0fVxuXHRmbi5lID0gZnVuY3Rpb24gKGNodW5rSWQpIHtcblx0XHRyZXR1cm4gdHJhY2tCbG9ja2luZ1Byb21pc2UocmVxdWlyZS5lKGNodW5rSWQpKTtcblx0fTtcblx0cmV0dXJuIGZuO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNb2R1bGVIb3RPYmplY3QobW9kdWxlSWQsIG1lKSB7XG5cdHZhciBfbWFpbiA9IGN1cnJlbnRDaGlsZE1vZHVsZSAhPT0gbW9kdWxlSWQ7XG5cdHZhciBob3QgPSB7XG5cdFx0Ly8gcHJpdmF0ZSBzdHVmZlxuXHRcdF9hY2NlcHRlZERlcGVuZGVuY2llczoge30sXG5cdFx0X2FjY2VwdGVkRXJyb3JIYW5kbGVyczoge30sXG5cdFx0X2RlY2xpbmVkRGVwZW5kZW5jaWVzOiB7fSxcblx0XHRfc2VsZkFjY2VwdGVkOiBmYWxzZSxcblx0XHRfc2VsZkRlY2xpbmVkOiBmYWxzZSxcblx0XHRfc2VsZkludmFsaWRhdGVkOiBmYWxzZSxcblx0XHRfZGlzcG9zZUhhbmRsZXJzOiBbXSxcblx0XHRfbWFpbjogX21haW4sXG5cdFx0X3JlcXVpcmVTZWxmOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjdXJyZW50UGFyZW50cyA9IG1lLnBhcmVudHMuc2xpY2UoKTtcblx0XHRcdGN1cnJlbnRDaGlsZE1vZHVsZSA9IF9tYWluID8gdW5kZWZpbmVkIDogbW9kdWxlSWQ7XG5cdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKTtcblx0XHR9LFxuXG5cdFx0Ly8gTW9kdWxlIEFQSVxuXHRcdGFjdGl2ZTogdHJ1ZSxcblx0XHRhY2NlcHQ6IGZ1bmN0aW9uIChkZXAsIGNhbGxiYWNrLCBlcnJvckhhbmRsZXIpIHtcblx0XHRcdGlmIChkZXAgPT09IHVuZGVmaW5lZCkgaG90Ll9zZWxmQWNjZXB0ZWQgPSB0cnVlO1xuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIGRlcCA9PT0gXCJmdW5jdGlvblwiKSBob3QuX3NlbGZBY2NlcHRlZCA9IGRlcDtcblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBkZXAgPT09IFwib2JqZWN0XCIgJiYgZGVwICE9PSBudWxsKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBbaV1dID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG5cdFx0XHRcdFx0aG90Ll9hY2NlcHRlZEVycm9ySGFuZGxlcnNbZGVwW2ldXSA9IGVycm9ySGFuZGxlcjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBdID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG5cdFx0XHRcdGhvdC5fYWNjZXB0ZWRFcnJvckhhbmRsZXJzW2RlcF0gPSBlcnJvckhhbmRsZXI7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRkZWNsaW5lOiBmdW5jdGlvbiAoZGVwKSB7XG5cdFx0XHRpZiAoZGVwID09PSB1bmRlZmluZWQpIGhvdC5fc2VsZkRlY2xpbmVkID0gdHJ1ZTtcblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBkZXAgPT09IFwib2JqZWN0XCIgJiYgZGVwICE9PSBudWxsKVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKylcblx0XHRcdFx0XHRob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW2RlcFtpXV0gPSB0cnVlO1xuXHRcdFx0ZWxzZSBob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW2RlcF0gPSB0cnVlO1xuXHRcdH0sXG5cdFx0ZGlzcG9zZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cdFx0XHRob3QuX2Rpc3Bvc2VIYW5kbGVycy5wdXNoKGNhbGxiYWNrKTtcblx0XHR9LFxuXHRcdGFkZERpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xuXHRcdH0sXG5cdFx0cmVtb3ZlRGlzcG9zZUhhbmRsZXI6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXHRcdFx0dmFyIGlkeCA9IGhvdC5fZGlzcG9zZUhhbmRsZXJzLmluZGV4T2YoY2FsbGJhY2spO1xuXHRcdFx0aWYgKGlkeCA+PSAwKSBob3QuX2Rpc3Bvc2VIYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcblx0XHR9LFxuXHRcdGludmFsaWRhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHRoaXMuX3NlbGZJbnZhbGlkYXRlZCA9IHRydWU7XG5cdFx0XHRzd2l0Y2ggKGN1cnJlbnRTdGF0dXMpIHtcblx0XHRcdFx0Y2FzZSBcImlkbGVcIjpcblx0XHRcdFx0XHRjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVycyA9IFtdO1xuXHRcdFx0XHRcdE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uaG1ySSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmhtcklba2V5XShcblx0XHRcdFx0XHRcdFx0bW9kdWxlSWQsXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHNldFN0YXR1cyhcInJlYWR5XCIpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwicmVhZHlcIjpcblx0XHRcdFx0XHRPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLmhtckkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5obXJJW2tleV0oXG5cdFx0XHRcdFx0XHRcdG1vZHVsZUlkLFxuXHRcdFx0XHRcdFx0XHRjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVyc1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInByZXBhcmVcIjpcblx0XHRcdFx0Y2FzZSBcImNoZWNrXCI6XG5cdFx0XHRcdGNhc2UgXCJkaXNwb3NlXCI6XG5cdFx0XHRcdGNhc2UgXCJhcHBseVwiOlxuXHRcdFx0XHRcdChxdWV1ZWRJbnZhbGlkYXRlZE1vZHVsZXMgPSBxdWV1ZWRJbnZhbGlkYXRlZE1vZHVsZXMgfHwgW10pLnB1c2goXG5cdFx0XHRcdFx0XHRtb2R1bGVJZFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gaWdub3JlIHJlcXVlc3RzIGluIGVycm9yIHN0YXRlc1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyBNYW5hZ2VtZW50IEFQSVxuXHRcdGNoZWNrOiBob3RDaGVjayxcblx0XHRhcHBseTogaG90QXBwbHksXG5cdFx0c3RhdHVzOiBmdW5jdGlvbiAobCkge1xuXHRcdFx0aWYgKCFsKSByZXR1cm4gY3VycmVudFN0YXR1cztcblx0XHRcdHJlZ2lzdGVyZWRTdGF0dXNIYW5kbGVycy5wdXNoKGwpO1xuXHRcdH0sXG5cdFx0YWRkU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24gKGwpIHtcblx0XHRcdHJlZ2lzdGVyZWRTdGF0dXNIYW5kbGVycy5wdXNoKGwpO1xuXHRcdH0sXG5cdFx0cmVtb3ZlU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24gKGwpIHtcblx0XHRcdHZhciBpZHggPSByZWdpc3RlcmVkU3RhdHVzSGFuZGxlcnMuaW5kZXhPZihsKTtcblx0XHRcdGlmIChpZHggPj0gMCkgcmVnaXN0ZXJlZFN0YXR1c0hhbmRsZXJzLnNwbGljZShpZHgsIDEpO1xuXHRcdH0sXG5cblx0XHQvL2luaGVyaXQgZnJvbSBwcmV2aW91cyBkaXNwb3NlIGNhbGxcblx0XHRkYXRhOiBjdXJyZW50TW9kdWxlRGF0YVttb2R1bGVJZF1cblx0fTtcblx0Y3VycmVudENoaWxkTW9kdWxlID0gdW5kZWZpbmVkO1xuXHRyZXR1cm4gaG90O1xufVxuXG5mdW5jdGlvbiBzZXRTdGF0dXMobmV3U3RhdHVzKSB7XG5cdGN1cnJlbnRTdGF0dXMgPSBuZXdTdGF0dXM7XG5cdHZhciByZXN1bHRzID0gW107XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZWdpc3RlcmVkU3RhdHVzSGFuZGxlcnMubGVuZ3RoOyBpKyspXG5cdFx0cmVzdWx0c1tpXSA9IHJlZ2lzdGVyZWRTdGF0dXNIYW5kbGVyc1tpXS5jYWxsKG51bGwsIG5ld1N0YXR1cyk7XG5cblx0cmV0dXJuIFByb21pc2UuYWxsKHJlc3VsdHMpO1xufVxuXG5mdW5jdGlvbiB1bmJsb2NrKCkge1xuXHRpZiAoLS1ibG9ja2luZ1Byb21pc2VzID09PSAwKSB7XG5cdFx0c2V0U3RhdHVzKFwicmVhZHlcIikudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoYmxvY2tpbmdQcm9taXNlcyA9PT0gMCkge1xuXHRcdFx0XHR2YXIgbGlzdCA9IGJsb2NraW5nUHJvbWlzZXNXYWl0aW5nO1xuXHRcdFx0XHRibG9ja2luZ1Byb21pc2VzV2FpdGluZyA9IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRsaXN0W2ldKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiB0cmFja0Jsb2NraW5nUHJvbWlzZShwcm9taXNlKSB7XG5cdHN3aXRjaCAoY3VycmVudFN0YXR1cykge1xuXHRcdGNhc2UgXCJyZWFkeVwiOlxuXHRcdFx0c2V0U3RhdHVzKFwicHJlcGFyZVwiKTtcblx0XHQvKiBmYWxsdGhyb3VnaCAqL1xuXHRcdGNhc2UgXCJwcmVwYXJlXCI6XG5cdFx0XHRibG9ja2luZ1Byb21pc2VzKys7XG5cdFx0XHRwcm9taXNlLnRoZW4odW5ibG9jaywgdW5ibG9jayk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdH1cbn1cblxuZnVuY3Rpb24gd2FpdEZvckJsb2NraW5nUHJvbWlzZXMoZm4pIHtcblx0aWYgKGJsb2NraW5nUHJvbWlzZXMgPT09IDApIHJldHVybiBmbigpO1xuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRibG9ja2luZ1Byb21pc2VzV2FpdGluZy5wdXNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJlc29sdmUoZm4oKSk7XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBob3RDaGVjayhhcHBseU9uVXBkYXRlKSB7XG5cdGlmIChjdXJyZW50U3RhdHVzICE9PSBcImlkbGVcIikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImNoZWNrKCkgaXMgb25seSBhbGxvd2VkIGluIGlkbGUgc3RhdHVzXCIpO1xuXHR9XG5cdHJldHVybiBzZXRTdGF0dXMoXCJjaGVja1wiKVxuXHRcdC50aGVuKF9fd2VicGFja19yZXF1aXJlX18uaG1yTSlcblx0XHQudGhlbihmdW5jdGlvbiAodXBkYXRlKSB7XG5cdFx0XHRpZiAoIXVwZGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gc2V0U3RhdHVzKGFwcGx5SW52YWxpZGF0ZWRNb2R1bGVzKCkgPyBcInJlYWR5XCIgOiBcImlkbGVcIikudGhlbihcblx0XHRcdFx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBzZXRTdGF0dXMoXCJwcmVwYXJlXCIpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgdXBkYXRlZE1vZHVsZXMgPSBbXTtcblx0XHRcdFx0Y3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnMgPSBbXTtcblxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoXG5cdFx0XHRcdFx0T2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5obXJDKS5yZWR1Y2UoZnVuY3Rpb24gKFxuXHRcdFx0XHRcdFx0cHJvbWlzZXMsXG5cdFx0XHRcdFx0XHRrZXlcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uaG1yQ1trZXldKFxuXHRcdFx0XHRcdFx0XHR1cGRhdGUuYyxcblx0XHRcdFx0XHRcdFx0dXBkYXRlLnIsXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZS5tLFxuXHRcdFx0XHRcdFx0XHRwcm9taXNlcyxcblx0XHRcdFx0XHRcdFx0Y3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnMsXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZWRNb2R1bGVzXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHByb21pc2VzO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0W10pXG5cdFx0XHRcdCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHdhaXRGb3JCbG9ja2luZ1Byb21pc2VzKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmIChhcHBseU9uVXBkYXRlKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBpbnRlcm5hbEFwcGx5KGFwcGx5T25VcGRhdGUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNldFN0YXR1cyhcInJlYWR5XCIpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB1cGRhdGVkTW9kdWxlcztcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG59XG5cbmZ1bmN0aW9uIGhvdEFwcGx5KG9wdGlvbnMpIHtcblx0aWYgKGN1cnJlbnRTdGF0dXMgIT09IFwicmVhZHlcIikge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XCJhcHBseSgpIGlzIG9ubHkgYWxsb3dlZCBpbiByZWFkeSBzdGF0dXMgKHN0YXRlOiBcIiArXG5cdFx0XHRcdFx0Y3VycmVudFN0YXR1cyArXG5cdFx0XHRcdFx0XCIpXCJcblx0XHRcdCk7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGludGVybmFsQXBwbHkob3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIGludGVybmFsQXBwbHkob3B0aW9ucykge1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRhcHBseUludmFsaWRhdGVkTW9kdWxlcygpO1xuXG5cdHZhciByZXN1bHRzID0gY3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnMubWFwKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG5cdFx0cmV0dXJuIGhhbmRsZXIob3B0aW9ucyk7XG5cdH0pO1xuXHRjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVycyA9IHVuZGVmaW5lZDtcblxuXHR2YXIgZXJyb3JzID0gcmVzdWx0c1xuXHRcdC5tYXAoZnVuY3Rpb24gKHIpIHtcblx0XHRcdHJldHVybiByLmVycm9yO1xuXHRcdH0pXG5cdFx0LmZpbHRlcihCb29sZWFuKTtcblxuXHRpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcblx0XHRyZXR1cm4gc2V0U3RhdHVzKFwiYWJvcnRcIikudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aHJvdyBlcnJvcnNbMF07XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBOb3cgaW4gXCJkaXNwb3NlXCIgcGhhc2Vcblx0dmFyIGRpc3Bvc2VQcm9taXNlID0gc2V0U3RhdHVzKFwiZGlzcG9zZVwiKTtcblxuXHRyZXN1bHRzLmZvckVhY2goZnVuY3Rpb24gKHJlc3VsdCkge1xuXHRcdGlmIChyZXN1bHQuZGlzcG9zZSkgcmVzdWx0LmRpc3Bvc2UoKTtcblx0fSk7XG5cblx0Ly8gTm93IGluIFwiYXBwbHlcIiBwaGFzZVxuXHR2YXIgYXBwbHlQcm9taXNlID0gc2V0U3RhdHVzKFwiYXBwbHlcIik7XG5cblx0dmFyIGVycm9yO1xuXHR2YXIgcmVwb3J0RXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0aWYgKCFlcnJvcikgZXJyb3IgPSBlcnI7XG5cdH07XG5cblx0dmFyIG91dGRhdGVkTW9kdWxlcyA9IFtdO1xuXHRyZXN1bHRzLmZvckVhY2goZnVuY3Rpb24gKHJlc3VsdCkge1xuXHRcdGlmIChyZXN1bHQuYXBwbHkpIHtcblx0XHRcdHZhciBtb2R1bGVzID0gcmVzdWx0LmFwcGx5KHJlcG9ydEVycm9yKTtcblx0XHRcdGlmIChtb2R1bGVzKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdG91dGRhdGVkTW9kdWxlcy5wdXNoKG1vZHVsZXNbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gUHJvbWlzZS5hbGwoW2Rpc3Bvc2VQcm9taXNlLCBhcHBseVByb21pc2VdKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHQvLyBoYW5kbGUgZXJyb3JzIGluIGFjY2VwdCBoYW5kbGVycyBhbmQgc2VsZiBhY2NlcHRlZCBtb2R1bGUgbG9hZFxuXHRcdGlmIChlcnJvcikge1xuXHRcdFx0cmV0dXJuIHNldFN0YXR1cyhcImZhaWxcIikudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKHF1ZXVlZEludmFsaWRhdGVkTW9kdWxlcykge1xuXHRcdFx0cmV0dXJuIGludGVybmFsQXBwbHkob3B0aW9ucykudGhlbihmdW5jdGlvbiAobGlzdCkge1xuXHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMuZm9yRWFjaChmdW5jdGlvbiAobW9kdWxlSWQpIHtcblx0XHRcdFx0XHRpZiAobGlzdC5pbmRleE9mKG1vZHVsZUlkKSA8IDApIGxpc3QucHVzaChtb2R1bGVJZCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gbGlzdDtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBzZXRTdGF0dXMoXCJpZGxlXCIpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIG91dGRhdGVkTW9kdWxlcztcblx0XHR9KTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5SW52YWxpZGF0ZWRNb2R1bGVzKCkge1xuXHRpZiAocXVldWVkSW52YWxpZGF0ZWRNb2R1bGVzKSB7XG5cdFx0aWYgKCFjdXJyZW50VXBkYXRlQXBwbHlIYW5kbGVycykgY3VycmVudFVwZGF0ZUFwcGx5SGFuZGxlcnMgPSBbXTtcblx0XHRPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLmhtckkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cXVldWVkSW52YWxpZGF0ZWRNb2R1bGVzLmZvckVhY2goZnVuY3Rpb24gKG1vZHVsZUlkKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18uaG1ySVtrZXldKFxuXHRcdFx0XHRcdG1vZHVsZUlkLFxuXHRcdFx0XHRcdGN1cnJlbnRVcGRhdGVBcHBseUhhbmRsZXJzXG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRxdWV1ZWRJbnZhbGlkYXRlZE1vZHVsZXMgPSB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn0iLCJ2YXIgc2NyaXB0VXJsO1xuaWYgKF9fd2VicGFja19yZXF1aXJlX18uZy5pbXBvcnRTY3JpcHRzKSBzY3JpcHRVcmwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcubG9jYXRpb24gKyBcIlwiO1xudmFyIGRvY3VtZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmRvY3VtZW50O1xuaWYgKCFzY3JpcHRVcmwgJiYgZG9jdW1lbnQpIHtcblx0aWYgKGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpXG5cdFx0c2NyaXB0VXJsID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmM7XG5cdGlmICghc2NyaXB0VXJsKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRpZihzY3JpcHRzLmxlbmd0aCkge1xuXHRcdFx0dmFyIGkgPSBzY3JpcHRzLmxlbmd0aCAtIDE7XG5cdFx0XHR3aGlsZSAoaSA+IC0xICYmICFzY3JpcHRVcmwpIHNjcmlwdFVybCA9IHNjcmlwdHNbaS0tXS5zcmM7XG5cdFx0fVxuXHR9XG59XG4vLyBXaGVuIHN1cHBvcnRpbmcgYnJvd3NlcnMgd2hlcmUgYW4gYXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCB5b3UgbXVzdCBzcGVjaWZ5IGFuIG91dHB1dC5wdWJsaWNQYXRoIG1hbnVhbGx5IHZpYSBjb25maWd1cmF0aW9uXG4vLyBvciBwYXNzIGFuIGVtcHR5IHN0cmluZyAoXCJcIikgYW5kIHNldCB0aGUgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gdmFyaWFibGUgZnJvbSB5b3VyIGNvZGUgdG8gdXNlIHlvdXIgb3duIGxvZ2ljLlxuaWYgKCFzY3JpcHRVcmwpIHRocm93IG5ldyBFcnJvcihcIkF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyXCIpO1xuc2NyaXB0VXJsID0gc2NyaXB0VXJsLnJlcGxhY2UoLyMuKiQvLCBcIlwiKS5yZXBsYWNlKC9cXD8uKiQvLCBcIlwiKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sIFwiL1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18ucCA9IHNjcmlwdFVybDsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IF9fd2VicGFja19yZXF1aXJlX18uaG1yU19qc29ucCA9IF9fd2VicGFja19yZXF1aXJlX18uaG1yU19qc29ucCB8fCB7XG5cdFwibWFpblwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxudmFyIGN1cnJlbnRVcGRhdGVkTW9kdWxlc0xpc3Q7XG52YXIgd2FpdGluZ1VwZGF0ZVJlc29sdmVzID0ge307XG5mdW5jdGlvbiBsb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCwgdXBkYXRlZE1vZHVsZXNMaXN0KSB7XG5cdGN1cnJlbnRVcGRhdGVkTW9kdWxlc0xpc3QgPSB1cGRhdGVkTW9kdWxlc0xpc3Q7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0d2FpdGluZ1VwZGF0ZVJlc29sdmVzW2NodW5rSWRdID0gcmVzb2x2ZTtcblx0XHQvLyBzdGFydCB1cGRhdGUgY2h1bmsgbG9hZGluZ1xuXHRcdHZhciB1cmwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgKyBfX3dlYnBhY2tfcmVxdWlyZV9fLmh1KGNodW5rSWQpO1xuXHRcdC8vIGNyZWF0ZSBlcnJvciBiZWZvcmUgc3RhY2sgdW53b3VuZCB0byBnZXQgdXNlZnVsIHN0YWNrdHJhY2UgbGF0ZXJcblx0XHR2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcblx0XHR2YXIgbG9hZGluZ0VuZGVkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRpZih3YWl0aW5nVXBkYXRlUmVzb2x2ZXNbY2h1bmtJZF0pIHtcblx0XHRcdFx0d2FpdGluZ1VwZGF0ZVJlc29sdmVzW2NodW5rSWRdID0gdW5kZWZpbmVkXG5cdFx0XHRcdHZhciBlcnJvclR5cGUgPSBldmVudCAmJiAoZXZlbnQudHlwZSA9PT0gJ2xvYWQnID8gJ21pc3NpbmcnIDogZXZlbnQudHlwZSk7XG5cdFx0XHRcdHZhciByZWFsU3JjID0gZXZlbnQgJiYgZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnRhcmdldC5zcmM7XG5cdFx0XHRcdGVycm9yLm1lc3NhZ2UgPSAnTG9hZGluZyBob3QgdXBkYXRlIGNodW5rICcgKyBjaHVua0lkICsgJyBmYWlsZWQuXFxuKCcgKyBlcnJvclR5cGUgKyAnOiAnICsgcmVhbFNyYyArICcpJztcblx0XHRcdFx0ZXJyb3IubmFtZSA9ICdDaHVua0xvYWRFcnJvcic7XG5cdFx0XHRcdGVycm9yLnR5cGUgPSBlcnJvclR5cGU7XG5cdFx0XHRcdGVycm9yLnJlcXVlc3QgPSByZWFsU3JjO1xuXHRcdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5sKHVybCwgbG9hZGluZ0VuZGVkKTtcblx0fSk7XG59XG5cbnNlbGZbXCJ3ZWJwYWNrSG90VXBkYXRlZnVuZHJhaXNldXBfdGVzdFwiXSA9IChjaHVua0lkLCBtb3JlTW9kdWxlcywgcnVudGltZSkgPT4ge1xuXHRmb3IodmFyIG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdGN1cnJlbnRVcGRhdGVbbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0aWYoY3VycmVudFVwZGF0ZWRNb2R1bGVzTGlzdCkgY3VycmVudFVwZGF0ZWRNb2R1bGVzTGlzdC5wdXNoKG1vZHVsZUlkKTtcblx0XHR9XG5cdH1cblx0aWYocnVudGltZSkgY3VycmVudFVwZGF0ZVJ1bnRpbWUucHVzaChydW50aW1lKTtcblx0aWYod2FpdGluZ1VwZGF0ZVJlc29sdmVzW2NodW5rSWRdKSB7XG5cdFx0d2FpdGluZ1VwZGF0ZVJlc29sdmVzW2NodW5rSWRdKCk7XG5cdFx0d2FpdGluZ1VwZGF0ZVJlc29sdmVzW2NodW5rSWRdID0gdW5kZWZpbmVkO1xuXHR9XG59O1xuXG52YXIgY3VycmVudFVwZGF0ZUNodW5rcztcbnZhciBjdXJyZW50VXBkYXRlO1xudmFyIGN1cnJlbnRVcGRhdGVSZW1vdmVkQ2h1bmtzO1xudmFyIGN1cnJlbnRVcGRhdGVSdW50aW1lO1xuZnVuY3Rpb24gYXBwbHlIYW5kbGVyKG9wdGlvbnMpIHtcblx0aWYgKF9fd2VicGFja19yZXF1aXJlX18uZikgZGVsZXRlIF9fd2VicGFja19yZXF1aXJlX18uZi5qc29ucEhtcjtcblx0Y3VycmVudFVwZGF0ZUNodW5rcyA9IHVuZGVmaW5lZDtcblx0ZnVuY3Rpb24gZ2V0QWZmZWN0ZWRNb2R1bGVFZmZlY3RzKHVwZGF0ZU1vZHVsZUlkKSB7XG5cdFx0dmFyIG91dGRhdGVkTW9kdWxlcyA9IFt1cGRhdGVNb2R1bGVJZF07XG5cdFx0dmFyIG91dGRhdGVkRGVwZW5kZW5jaWVzID0ge307XG5cblx0XHR2YXIgcXVldWUgPSBvdXRkYXRlZE1vZHVsZXMubWFwKGZ1bmN0aW9uIChpZCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Y2hhaW46IFtpZF0sXG5cdFx0XHRcdGlkOiBpZFxuXHRcdFx0fTtcblx0XHR9KTtcblx0XHR3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuXHRcdFx0dmFyIHF1ZXVlSXRlbSA9IHF1ZXVlLnBvcCgpO1xuXHRcdFx0dmFyIG1vZHVsZUlkID0gcXVldWVJdGVtLmlkO1xuXHRcdFx0dmFyIGNoYWluID0gcXVldWVJdGVtLmNoYWluO1xuXHRcdFx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19yZXF1aXJlX18uY1ttb2R1bGVJZF07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdCFtb2R1bGUgfHxcblx0XHRcdFx0KG1vZHVsZS5ob3QuX3NlbGZBY2NlcHRlZCAmJiAhbW9kdWxlLmhvdC5fc2VsZkludmFsaWRhdGVkKVxuXHRcdFx0KVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdGlmIChtb2R1bGUuaG90Ll9zZWxmRGVjbGluZWQpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR0eXBlOiBcInNlbGYtZGVjbGluZWRcIixcblx0XHRcdFx0XHRjaGFpbjogY2hhaW4sXG5cdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRpZiAobW9kdWxlLmhvdC5fbWFpbikge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHR5cGU6IFwidW5hY2NlcHRlZFwiLFxuXHRcdFx0XHRcdGNoYWluOiBjaGFpbixcblx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWRcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbW9kdWxlLnBhcmVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHBhcmVudElkID0gbW9kdWxlLnBhcmVudHNbaV07XG5cdFx0XHRcdHZhciBwYXJlbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmNbcGFyZW50SWRdO1xuXHRcdFx0XHRpZiAoIXBhcmVudCkgY29udGludWU7XG5cdFx0XHRcdGlmIChwYXJlbnQuaG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJkZWNsaW5lZFwiLFxuXHRcdFx0XHRcdFx0Y2hhaW46IGNoYWluLmNvbmNhdChbcGFyZW50SWRdKSxcblx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZCxcblx0XHRcdFx0XHRcdHBhcmVudElkOiBwYXJlbnRJZFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG91dGRhdGVkTW9kdWxlcy5pbmRleE9mKHBhcmVudElkKSAhPT0gLTEpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAocGFyZW50LmhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKSB7XG5cdFx0XHRcdFx0aWYgKCFvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0pXG5cdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0gPSBbXTtcblx0XHRcdFx0XHRhZGRBbGxUb1NldChvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0sIFttb2R1bGVJZF0pO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRlbGV0ZSBvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF07XG5cdFx0XHRcdG91dGRhdGVkTW9kdWxlcy5wdXNoKHBhcmVudElkKTtcblx0XHRcdFx0cXVldWUucHVzaCh7XG5cdFx0XHRcdFx0Y2hhaW46IGNoYWluLmNvbmNhdChbcGFyZW50SWRdKSxcblx0XHRcdFx0XHRpZDogcGFyZW50SWRcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IFwiYWNjZXB0ZWRcIixcblx0XHRcdG1vZHVsZUlkOiB1cGRhdGVNb2R1bGVJZCxcblx0XHRcdG91dGRhdGVkTW9kdWxlczogb3V0ZGF0ZWRNb2R1bGVzLFxuXHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXM6IG91dGRhdGVkRGVwZW5kZW5jaWVzXG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGFkZEFsbFRvU2V0KGEsIGIpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gYltpXTtcblx0XHRcdGlmIChhLmluZGV4T2YoaXRlbSkgPT09IC0xKSBhLnB1c2goaXRlbSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gYXQgYmVnaW4gYWxsIHVwZGF0ZXMgbW9kdWxlcyBhcmUgb3V0ZGF0ZWRcblx0Ly8gdGhlIFwib3V0ZGF0ZWRcIiBzdGF0dXMgY2FuIHByb3BhZ2F0ZSB0byBwYXJlbnRzIGlmIHRoZXkgZG9uJ3QgYWNjZXB0IHRoZSBjaGlsZHJlblxuXHR2YXIgb3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSB7fTtcblx0dmFyIG91dGRhdGVkTW9kdWxlcyA9IFtdO1xuXHR2YXIgYXBwbGllZFVwZGF0ZSA9IHt9O1xuXG5cdHZhciB3YXJuVW5leHBlY3RlZFJlcXVpcmUgPSBmdW5jdGlvbiB3YXJuVW5leHBlY3RlZFJlcXVpcmUobW9kdWxlKSB7XG5cdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XCJbSE1SXSB1bmV4cGVjdGVkIHJlcXVpcmUoXCIgKyBtb2R1bGUuaWQgKyBcIikgdG8gZGlzcG9zZWQgbW9kdWxlXCJcblx0XHQpO1xuXHR9O1xuXG5cdGZvciAodmFyIG1vZHVsZUlkIGluIGN1cnJlbnRVcGRhdGUpIHtcblx0XHRpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGN1cnJlbnRVcGRhdGUsIG1vZHVsZUlkKSkge1xuXHRcdFx0dmFyIG5ld01vZHVsZUZhY3RvcnkgPSBjdXJyZW50VXBkYXRlW21vZHVsZUlkXTtcblx0XHRcdC8qKiBAdHlwZSB7VE9ET30gKi9cblx0XHRcdHZhciByZXN1bHQ7XG5cdFx0XHRpZiAobmV3TW9kdWxlRmFjdG9yeSkge1xuXHRcdFx0XHRyZXN1bHQgPSBnZXRBZmZlY3RlZE1vZHVsZUVmZmVjdHMobW9kdWxlSWQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0ID0ge1xuXHRcdFx0XHRcdHR5cGU6IFwiZGlzcG9zZWRcIixcblx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWRcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdC8qKiBAdHlwZSB7RXJyb3J8ZmFsc2V9ICovXG5cdFx0XHR2YXIgYWJvcnRFcnJvciA9IGZhbHNlO1xuXHRcdFx0dmFyIGRvQXBwbHkgPSBmYWxzZTtcblx0XHRcdHZhciBkb0Rpc3Bvc2UgPSBmYWxzZTtcblx0XHRcdHZhciBjaGFpbkluZm8gPSBcIlwiO1xuXHRcdFx0aWYgKHJlc3VsdC5jaGFpbikge1xuXHRcdFx0XHRjaGFpbkluZm8gPSBcIlxcblVwZGF0ZSBwcm9wYWdhdGlvbjogXCIgKyByZXN1bHQuY2hhaW4uam9pbihcIiAtPiBcIik7XG5cdFx0XHR9XG5cdFx0XHRzd2l0Y2ggKHJlc3VsdC50eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJzZWxmLWRlY2xpbmVkXCI6XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMub25EZWNsaW5lZCkgb3B0aW9ucy5vbkRlY2xpbmVkKHJlc3VsdCk7XG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zLmlnbm9yZURlY2xpbmVkKVxuXHRcdFx0XHRcdFx0YWJvcnRFcnJvciA9IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdFx0XCJBYm9ydGVkIGJlY2F1c2Ugb2Ygc2VsZiBkZWNsaW5lOiBcIiArXG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0Lm1vZHVsZUlkICtcblx0XHRcdFx0XHRcdFx0XHRjaGFpbkluZm9cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJkZWNsaW5lZFwiOlxuXHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRGVjbGluZWQpIG9wdGlvbnMub25EZWNsaW5lZChyZXN1bHQpO1xuXHRcdFx0XHRcdGlmICghb3B0aW9ucy5pZ25vcmVEZWNsaW5lZClcblx0XHRcdFx0XHRcdGFib3J0RXJyb3IgPSBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XHRcdFwiQWJvcnRlZCBiZWNhdXNlIG9mIGRlY2xpbmVkIGRlcGVuZGVuY3k6IFwiICtcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHQubW9kdWxlSWQgK1xuXHRcdFx0XHRcdFx0XHRcdFwiIGluIFwiICtcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHQucGFyZW50SWQgK1xuXHRcdFx0XHRcdFx0XHRcdGNoYWluSW5mb1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInVuYWNjZXB0ZWRcIjpcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5vblVuYWNjZXB0ZWQpIG9wdGlvbnMub25VbmFjY2VwdGVkKHJlc3VsdCk7XG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zLmlnbm9yZVVuYWNjZXB0ZWQpXG5cdFx0XHRcdFx0XHRhYm9ydEVycm9yID0gbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0XHRcIkFib3J0ZWQgYmVjYXVzZSBcIiArIG1vZHVsZUlkICsgXCIgaXMgbm90IGFjY2VwdGVkXCIgKyBjaGFpbkluZm9cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJhY2NlcHRlZFwiOlxuXHRcdFx0XHRcdGlmIChvcHRpb25zLm9uQWNjZXB0ZWQpIG9wdGlvbnMub25BY2NlcHRlZChyZXN1bHQpO1xuXHRcdFx0XHRcdGRvQXBwbHkgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiZGlzcG9zZWRcIjpcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkRpc3Bvc2VkKSBvcHRpb25zLm9uRGlzcG9zZWQocmVzdWx0KTtcblx0XHRcdFx0XHRkb0Rpc3Bvc2UgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhjZXB0aW9uIHR5cGUgXCIgKyByZXN1bHQudHlwZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYWJvcnRFcnJvcikge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGVycm9yOiBhYm9ydEVycm9yXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRpZiAoZG9BcHBseSkge1xuXHRcdFx0XHRhcHBsaWVkVXBkYXRlW21vZHVsZUlkXSA9IG5ld01vZHVsZUZhY3Rvcnk7XG5cdFx0XHRcdGFkZEFsbFRvU2V0KG91dGRhdGVkTW9kdWxlcywgcmVzdWx0Lm91dGRhdGVkTW9kdWxlcyk7XG5cdFx0XHRcdGZvciAobW9kdWxlSWQgaW4gcmVzdWx0Lm91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XG5cdFx0XHRcdFx0aWYgKF9fd2VicGFja19yZXF1aXJlX18ubyhyZXN1bHQub3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRcdFx0aWYgKCFvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pXG5cdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSA9IFtdO1xuXHRcdFx0XHRcdFx0YWRkQWxsVG9TZXQoXG5cdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSxcblx0XHRcdFx0XHRcdFx0cmVzdWx0Lm91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChkb0Rpc3Bvc2UpIHtcblx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWRNb2R1bGVzLCBbcmVzdWx0Lm1vZHVsZUlkXSk7XG5cdFx0XHRcdGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdID0gd2FyblVuZXhwZWN0ZWRSZXF1aXJlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRjdXJyZW50VXBkYXRlID0gdW5kZWZpbmVkO1xuXG5cdC8vIFN0b3JlIHNlbGYgYWNjZXB0ZWQgb3V0ZGF0ZWQgbW9kdWxlcyB0byByZXF1aXJlIHRoZW0gbGF0ZXIgYnkgdGhlIG1vZHVsZSBzeXN0ZW1cblx0dmFyIG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlcyA9IFtdO1xuXHRmb3IgKHZhciBqID0gMDsgaiA8IG91dGRhdGVkTW9kdWxlcy5sZW5ndGg7IGorKykge1xuXHRcdHZhciBvdXRkYXRlZE1vZHVsZUlkID0gb3V0ZGF0ZWRNb2R1bGVzW2pdO1xuXHRcdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmNbb3V0ZGF0ZWRNb2R1bGVJZF07XG5cdFx0aWYgKFxuXHRcdFx0bW9kdWxlICYmXG5cdFx0XHQobW9kdWxlLmhvdC5fc2VsZkFjY2VwdGVkIHx8IG1vZHVsZS5ob3QuX21haW4pICYmXG5cdFx0XHQvLyByZW1vdmVkIHNlbGYtYWNjZXB0ZWQgbW9kdWxlcyBzaG91bGQgbm90IGJlIHJlcXVpcmVkXG5cdFx0XHRhcHBsaWVkVXBkYXRlW291dGRhdGVkTW9kdWxlSWRdICE9PSB3YXJuVW5leHBlY3RlZFJlcXVpcmUgJiZcblx0XHRcdC8vIHdoZW4gY2FsbGVkIGludmFsaWRhdGUgc2VsZi1hY2NlcHRpbmcgaXMgbm90IHBvc3NpYmxlXG5cdFx0XHQhbW9kdWxlLmhvdC5fc2VsZkludmFsaWRhdGVkXG5cdFx0KSB7XG5cdFx0XHRvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMucHVzaCh7XG5cdFx0XHRcdG1vZHVsZTogb3V0ZGF0ZWRNb2R1bGVJZCxcblx0XHRcdFx0cmVxdWlyZTogbW9kdWxlLmhvdC5fcmVxdWlyZVNlbGYsXG5cdFx0XHRcdGVycm9ySGFuZGxlcjogbW9kdWxlLmhvdC5fc2VsZkFjY2VwdGVkXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHR2YXIgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXM7XG5cblx0cmV0dXJuIHtcblx0XHRkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjdXJyZW50VXBkYXRlUmVtb3ZlZENodW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChjaHVua0lkKSB7XG5cdFx0XHRcdGRlbGV0ZSBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF07XG5cdFx0XHR9KTtcblx0XHRcdGN1cnJlbnRVcGRhdGVSZW1vdmVkQ2h1bmtzID0gdW5kZWZpbmVkO1xuXG5cdFx0XHR2YXIgaWR4O1xuXHRcdFx0dmFyIHF1ZXVlID0gb3V0ZGF0ZWRNb2R1bGVzLnNsaWNlKCk7XG5cdFx0XHR3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSBxdWV1ZS5wb3AoKTtcblx0XHRcdFx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19yZXF1aXJlX18uY1ttb2R1bGVJZF07XG5cdFx0XHRcdGlmICghbW9kdWxlKSBjb250aW51ZTtcblxuXHRcdFx0XHR2YXIgZGF0YSA9IHt9O1xuXG5cdFx0XHRcdC8vIENhbGwgZGlzcG9zZSBoYW5kbGVyc1xuXHRcdFx0XHR2YXIgZGlzcG9zZUhhbmRsZXJzID0gbW9kdWxlLmhvdC5fZGlzcG9zZUhhbmRsZXJzO1xuXHRcdFx0XHRmb3IgKGogPSAwOyBqIDwgZGlzcG9zZUhhbmRsZXJzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0ZGlzcG9zZUhhbmRsZXJzW2pdLmNhbGwobnVsbCwgZGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5obXJEW21vZHVsZUlkXSA9IGRhdGE7XG5cblx0XHRcdFx0Ly8gZGlzYWJsZSBtb2R1bGUgKHRoaXMgZGlzYWJsZXMgcmVxdWlyZXMgZnJvbSB0aGlzIG1vZHVsZSlcblx0XHRcdFx0bW9kdWxlLmhvdC5hY3RpdmUgPSBmYWxzZTtcblxuXHRcdFx0XHQvLyByZW1vdmUgbW9kdWxlIGZyb20gY2FjaGVcblx0XHRcdFx0ZGVsZXRlIF9fd2VicGFja19yZXF1aXJlX18uY1ttb2R1bGVJZF07XG5cblx0XHRcdFx0Ly8gd2hlbiBkaXNwb3NpbmcgdGhlcmUgaXMgbm8gbmVlZCB0byBjYWxsIGRpc3Bvc2UgaGFuZGxlclxuXHRcdFx0XHRkZWxldGUgb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xuXG5cdFx0XHRcdC8vIHJlbW92ZSBcInBhcmVudHNcIiByZWZlcmVuY2VzIGZyb20gYWxsIGNoaWxkcmVuXG5cdFx0XHRcdGZvciAoaiA9IDA7IGogPCBtb2R1bGUuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHR2YXIgY2hpbGQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmNbbW9kdWxlLmNoaWxkcmVuW2pdXTtcblx0XHRcdFx0XHRpZiAoIWNoaWxkKSBjb250aW51ZTtcblx0XHRcdFx0XHRpZHggPSBjaGlsZC5wYXJlbnRzLmluZGV4T2YobW9kdWxlSWQpO1xuXHRcdFx0XHRcdGlmIChpZHggPj0gMCkge1xuXHRcdFx0XHRcdFx0Y2hpbGQucGFyZW50cy5zcGxpY2UoaWR4LCAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVtb3ZlIG91dGRhdGVkIGRlcGVuZGVuY3kgZnJvbSBtb2R1bGUgY2hpbGRyZW5cblx0XHRcdHZhciBkZXBlbmRlbmN5O1xuXHRcdFx0Zm9yICh2YXIgb3V0ZGF0ZWRNb2R1bGVJZCBpbiBvdXRkYXRlZERlcGVuZGVuY2llcykge1xuXHRcdFx0XHRpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG91dGRhdGVkRGVwZW5kZW5jaWVzLCBvdXRkYXRlZE1vZHVsZUlkKSkge1xuXHRcdFx0XHRcdG1vZHVsZSA9IF9fd2VicGFja19yZXF1aXJlX18uY1tvdXRkYXRlZE1vZHVsZUlkXTtcblx0XHRcdFx0XHRpZiAobW9kdWxlKSB7XG5cdFx0XHRcdFx0XHRtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyA9XG5cdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW291dGRhdGVkTW9kdWxlSWRdO1xuXHRcdFx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XHRcdGRlcGVuZGVuY3kgPSBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tqXTtcblx0XHRcdFx0XHRcdFx0aWR4ID0gbW9kdWxlLmNoaWxkcmVuLmluZGV4T2YoZGVwZW5kZW5jeSk7XG5cdFx0XHRcdFx0XHRcdGlmIChpZHggPj0gMCkgbW9kdWxlLmNoaWxkcmVuLnNwbGljZShpZHgsIDEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChyZXBvcnRFcnJvcikge1xuXHRcdFx0Ly8gaW5zZXJ0IG5ldyBjb2RlXG5cdFx0XHRmb3IgKHZhciB1cGRhdGVNb2R1bGVJZCBpbiBhcHBsaWVkVXBkYXRlKSB7XG5cdFx0XHRcdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm8oYXBwbGllZFVwZGF0ZSwgdXBkYXRlTW9kdWxlSWQpKSB7XG5cdFx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW3VwZGF0ZU1vZHVsZUlkXSA9IGFwcGxpZWRVcGRhdGVbdXBkYXRlTW9kdWxlSWRdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJ1biBuZXcgcnVudGltZSBtb2R1bGVzXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGN1cnJlbnRVcGRhdGVSdW50aW1lLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGN1cnJlbnRVcGRhdGVSdW50aW1lW2ldKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjYWxsIGFjY2VwdCBoYW5kbGVyc1xuXHRcdFx0Zm9yICh2YXIgb3V0ZGF0ZWRNb2R1bGVJZCBpbiBvdXRkYXRlZERlcGVuZGVuY2llcykge1xuXHRcdFx0XHRpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG91dGRhdGVkRGVwZW5kZW5jaWVzLCBvdXRkYXRlZE1vZHVsZUlkKSkge1xuXHRcdFx0XHRcdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmNbb3V0ZGF0ZWRNb2R1bGVJZF07XG5cdFx0XHRcdFx0aWYgKG1vZHVsZSkge1xuXHRcdFx0XHRcdFx0bW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMgPVxuXHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1tvdXRkYXRlZE1vZHVsZUlkXTtcblx0XHRcdFx0XHRcdHZhciBjYWxsYmFja3MgPSBbXTtcblx0XHRcdFx0XHRcdHZhciBlcnJvckhhbmRsZXJzID0gW107XG5cdFx0XHRcdFx0XHR2YXIgZGVwZW5kZW5jaWVzRm9yQ2FsbGJhY2tzID0gW107XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBkZXBlbmRlbmN5ID0gbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXNbal07XG5cdFx0XHRcdFx0XHRcdHZhciBhY2NlcHRDYWxsYmFjayA9XG5cdFx0XHRcdFx0XHRcdFx0bW9kdWxlLmhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwZW5kZW5jeV07XG5cdFx0XHRcdFx0XHRcdHZhciBlcnJvckhhbmRsZXIgPVxuXHRcdFx0XHRcdFx0XHRcdG1vZHVsZS5ob3QuX2FjY2VwdGVkRXJyb3JIYW5kbGVyc1tkZXBlbmRlbmN5XTtcblx0XHRcdFx0XHRcdFx0aWYgKGFjY2VwdENhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGNhbGxiYWNrcy5pbmRleE9mKGFjY2VwdENhbGxiYWNrKSAhPT0gLTEpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHRcdGNhbGxiYWNrcy5wdXNoKGFjY2VwdENhbGxiYWNrKTtcblx0XHRcdFx0XHRcdFx0XHRlcnJvckhhbmRsZXJzLnB1c2goZXJyb3JIYW5kbGVyKTtcblx0XHRcdFx0XHRcdFx0XHRkZXBlbmRlbmNpZXNGb3JDYWxsYmFja3MucHVzaChkZXBlbmRlbmN5KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgayA9IDA7IGsgPCBjYWxsYmFja3MubGVuZ3RoOyBrKyspIHtcblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRjYWxsYmFja3Nba10uY2FsbChudWxsLCBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llcyk7XG5cdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgZXJyb3JIYW5kbGVyc1trXSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRlcnJvckhhbmRsZXJzW2tdKGVyciwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBvdXRkYXRlZE1vZHVsZUlkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlcGVuZGVuY3lJZDogZGVwZW5kZW5jaWVzRm9yQ2FsbGJhY2tzW2tdXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyMikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkVycm9yZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRXJyb3JlZCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0eXBlOiBcImFjY2VwdC1lcnJvci1oYW5kbGVyLWVycm9yZWRcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBvdXRkYXRlZE1vZHVsZUlkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVwZW5kZW5jeUlkOiBkZXBlbmRlbmNpZXNGb3JDYWxsYmFja3Nba10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlcnJvcjogZXJyMixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9yaWdpbmFsRXJyb3I6IGVyclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICghb3B0aW9ucy5pZ25vcmVFcnJvcmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmVwb3J0RXJyb3IoZXJyMik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmVwb3J0RXJyb3IoZXJyKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkVycm9yZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwiYWNjZXB0LWVycm9yZWRcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogb3V0ZGF0ZWRNb2R1bGVJZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZXBlbmRlbmN5SWQ6IGRlcGVuZGVuY2llc0ZvckNhbGxiYWNrc1trXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlcnJvcjogZXJyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFvcHRpb25zLmlnbm9yZUVycm9yZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVwb3J0RXJyb3IoZXJyKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gTG9hZCBzZWxmIGFjY2VwdGVkIG1vZHVsZXNcblx0XHRcdGZvciAodmFyIG8gPSAwOyBvIDwgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzLmxlbmd0aDsgbysrKSB7XG5cdFx0XHRcdHZhciBpdGVtID0gb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzW29dO1xuXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSBpdGVtLm1vZHVsZTtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRpdGVtLnJlcXVpcmUobW9kdWxlSWQpO1xuXHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGl0ZW0uZXJyb3JIYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGl0ZW0uZXJyb3JIYW5kbGVyKGVyciwge1xuXHRcdFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZCxcblx0XHRcdFx0XHRcdFx0XHRtb2R1bGU6IF9fd2VicGFja19yZXF1aXJlX18uY1ttb2R1bGVJZF1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIyKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvcHRpb25zLm9uRXJyb3JlZCkge1xuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25FcnJvcmVkKHtcblx0XHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwic2VsZi1hY2NlcHQtZXJyb3ItaGFuZGxlci1lcnJvcmVkXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRlcnJvcjogZXJyMixcblx0XHRcdFx0XHRcdFx0XHRcdG9yaWdpbmFsRXJyb3I6IGVyclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmICghb3B0aW9ucy5pZ25vcmVFcnJvcmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVwb3J0RXJyb3IoZXJyMik7XG5cdFx0XHRcdFx0XHRcdFx0cmVwb3J0RXJyb3IoZXJyKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAob3B0aW9ucy5vbkVycm9yZWQpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwic2VsZi1hY2NlcHQtZXJyb3JlZFwiLFxuXHRcdFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZCxcblx0XHRcdFx0XHRcdFx0XHRlcnJvcjogZXJyXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKCFvcHRpb25zLmlnbm9yZUVycm9yZWQpIHtcblx0XHRcdFx0XHRcdFx0cmVwb3J0RXJyb3IoZXJyKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG91dGRhdGVkTW9kdWxlcztcblx0XHR9XG5cdH07XG59XG5fX3dlYnBhY2tfcmVxdWlyZV9fLmhtckkuanNvbnAgPSBmdW5jdGlvbiAobW9kdWxlSWQsIGFwcGx5SGFuZGxlcnMpIHtcblx0aWYgKCFjdXJyZW50VXBkYXRlKSB7XG5cdFx0Y3VycmVudFVwZGF0ZSA9IHt9O1xuXHRcdGN1cnJlbnRVcGRhdGVSdW50aW1lID0gW107XG5cdFx0Y3VycmVudFVwZGF0ZVJlbW92ZWRDaHVua3MgPSBbXTtcblx0XHRhcHBseUhhbmRsZXJzLnB1c2goYXBwbHlIYW5kbGVyKTtcblx0fVxuXHRpZiAoIV9fd2VicGFja19yZXF1aXJlX18ubyhjdXJyZW50VXBkYXRlLCBtb2R1bGVJZCkpIHtcblx0XHRjdXJyZW50VXBkYXRlW21vZHVsZUlkXSA9IF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF07XG5cdH1cbn07XG5fX3dlYnBhY2tfcmVxdWlyZV9fLmhtckMuanNvbnAgPSBmdW5jdGlvbiAoXG5cdGNodW5rSWRzLFxuXHRyZW1vdmVkQ2h1bmtzLFxuXHRyZW1vdmVkTW9kdWxlcyxcblx0cHJvbWlzZXMsXG5cdGFwcGx5SGFuZGxlcnMsXG5cdHVwZGF0ZWRNb2R1bGVzTGlzdFxuKSB7XG5cdGFwcGx5SGFuZGxlcnMucHVzaChhcHBseUhhbmRsZXIpO1xuXHRjdXJyZW50VXBkYXRlQ2h1bmtzID0ge307XG5cdGN1cnJlbnRVcGRhdGVSZW1vdmVkQ2h1bmtzID0gcmVtb3ZlZENodW5rcztcblx0Y3VycmVudFVwZGF0ZSA9IHJlbW92ZWRNb2R1bGVzLnJlZHVjZShmdW5jdGlvbiAob2JqLCBrZXkpIHtcblx0XHRvYmpba2V5XSA9IGZhbHNlO1xuXHRcdHJldHVybiBvYmo7XG5cdH0sIHt9KTtcblx0Y3VycmVudFVwZGF0ZVJ1bnRpbWUgPSBbXTtcblx0Y2h1bmtJZHMuZm9yRWFjaChmdW5jdGlvbiAoY2h1bmtJZCkge1xuXHRcdGlmIChcblx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmXG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gIT09IHVuZGVmaW5lZFxuXHRcdCkge1xuXHRcdFx0cHJvbWlzZXMucHVzaChsb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCwgdXBkYXRlZE1vZHVsZXNMaXN0KSk7XG5cdFx0XHRjdXJyZW50VXBkYXRlQ2h1bmtzW2NodW5rSWRdID0gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y3VycmVudFVwZGF0ZUNodW5rc1tjaHVua0lkXSA9IGZhbHNlO1xuXHRcdH1cblx0fSk7XG5cdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmYpIHtcblx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmYuanNvbnBIbXIgPSBmdW5jdGlvbiAoY2h1bmtJZCwgcHJvbWlzZXMpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0Y3VycmVudFVwZGF0ZUNodW5rcyAmJlxuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8oY3VycmVudFVwZGF0ZUNodW5rcywgY2h1bmtJZCkgJiZcblx0XHRcdFx0IWN1cnJlbnRVcGRhdGVDaHVua3NbY2h1bmtJZF1cblx0XHRcdCkge1xuXHRcdFx0XHRwcm9taXNlcy5wdXNoKGxvYWRVcGRhdGVDaHVuayhjaHVua0lkKSk7XG5cdFx0XHRcdGN1cnJlbnRVcGRhdGVDaHVua3NbY2h1bmtJZF0gPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cbn07XG5cbl9fd2VicGFja19yZXF1aXJlX18uaG1yTSA9ICgpID0+IHtcblx0aWYgKHR5cGVvZiBmZXRjaCA9PT0gXCJ1bmRlZmluZWRcIikgdGhyb3cgbmV3IEVycm9yKFwiTm8gYnJvd3NlciBzdXBwb3J0OiBuZWVkIGZldGNoIEFQSVwiKTtcblx0cmV0dXJuIGZldGNoKF9fd2VicGFja19yZXF1aXJlX18ucCArIF9fd2VicGFja19yZXF1aXJlX18uaG1yRigpKS50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSByZXR1cm47IC8vIG5vIHVwZGF0ZSBhdmFpbGFibGVcblx0XHRpZighcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmZXRjaCB1cGRhdGUgbWFuaWZlc3QgXCIgKyByZXNwb25zZS5zdGF0dXNUZXh0KTtcblx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuXHR9KTtcbn07XG5cbi8vIG5vIG9uIGNodW5rcyBsb2FkZWRcblxuLy8gbm8ganNvbnAgZnVuY3Rpb24iLCIiLCIvLyBtb2R1bGUgY2FjaGUgYXJlIHVzZWQgc28gZW50cnkgaW5saW5pbmcgaXMgZGlzYWJsZWRcbi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOlsiQW5zd2VyUGFuZWwiLCJtb3VudCIsIlJ1bnRpbWUiLCJMZXR0ZXJQYW5lbCIsImdhbWVGYWN0b3J5IiwiR2FtZVN0b3JlIiwibWFpbiIsImN4IiwiZ2FtZUlubmVyIiwicmVzdG9yZSIsImNoZWNrU2F2ZUFuZEFzayIsImxpc3RlbmVycyIsIm9uRmluaXNoIiwiZGF0YSIsImFsZXJ0IiwiSlNPTiIsInN0cmluZ2lmeSIsIm9uU3VycmVuZGVyIiwibmV4dCIsInNldFRpbWVvdXQiLCJnYW1lIiwidXBkYXRlIiwiZyIsImNyZWF0ZVNpZ25hbCIsImNyZWF0ZUVmZmVjdCIsInNhdmUiLCJnZXQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJHYW1lIiwiUm91bmQiLCJMZXR0ZXJQaWNrZXIiLCJSYW5kb21pemVyIiwiTUFYX1dPUkRTX0lOX1FVRVVFIiwiV29yZFBpY2tlciIsIm9wdGlvbnMiLCJwaWNrUmFuZG9tV29yZHMiLCJmb3JFYWNoIiwid29yZCIsInJhbmRvbWl6ZXIiLCJsZXR0ZXJQaWNrZXIiLCJyYW5kb21Xb3JkTGV0dGVycyIsInJhbmRvbWl6ZSIsInJvdW5kIiwiYWRkUm91bmQiLCJLRVkiLCJjb25zdHJ1Y3RvciIsInBhcnNlZERhdGEiLCJwYXJzZSIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJjb25maXJtIiwiXyIsImdhbWVTdGF0ZSIsImN1cnJlbnRSb3VuZEluZGV4Iiwicm91bmRzIiwibWFwIiwiciIsImN1cnJlbnRFcnJvcnMiLCJwaWNrZWRJbmRleGVzIiwiQXJyYXkiLCJmcm9tIiwidmFsdWVzIiwic3VycmVuZGVyIiwic2V0SXRlbSIsInNhdmVkUm91bmQiLCJuZXdSb3VuZCIsImluZGV4IiwiYWRkIiwiY3VycmVudFJvdW5kIiwibmV4dFJvdW5kIiwiTUFYX1JPVU5EX0VSUk9SUyIsIm1heEVycm9ycyIsIlNldCIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsInZpc2libGVSYW5kb21MZXR0ZXJzIiwibGV0dGVyIiwiZmlsdGVyIiwiX3JlZiIsImhhcyIsImd1ZXNzIiwicmFuZG9tTGV0dGVySW5kZXgiLCJndWVzc2VkTGV0dGVyIiwiY3VycmVudExldHRlciIsInNpemUiLCJndWVzc2VkUmlnaHQiLCJhY2NlcHRMZXR0ZXIiLCJ0cmlnZ2VyTWlzdGFrZSIsImluZm8iLCJjb3JyZWN0Um91bmRzIiwiZXJyb3JBbW91bnQiLCJyZWR1Y2UiLCJzdW0iLCJzb3J0ZWRCeUVycm9yc0Rlc2MiLCJzb3J0IiwiYSIsImIiLCJ3b3JzdFdvcmQiLCJwdXNoIiwibGV0dGVycyIsInNwbGl0IiwiZnJlc2hTZXQiLCJpdGVtIiwicGljayIsImNvbGxlY3Rpb24iLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJXT1JEX1ZBUklBTlRTIiwid29yZHMiLCJnZXRSYW5kb21Xb3JkcyIsImFtb3VudCIsImNob3NlbldvcmRzIiwia2V5cyIsIndvcmRQaWNrZXIiLCJ3b3JkQ29sbGVjdGlvbiIsImNyZWF0ZUNvbXBvbmVudCIsImZuIiwiRWwiLCJodG1sRWwiLCJuZXciLCJ0YWdOYW1lIiwiZWwiLCJjcmVhdGVFbGVtZW50IiwiYXR0ciIsImF0dHJOYW1lIiwiYXR0clZhbHVlIiwic2V0QXR0cmlidXRlIiwiYXR0ckR5biIsInJlbW92ZUF0dHJpYnV0ZSIsInZhbHVlIiwib24iLCJldmVudE5hbWUiLCJjYiIsImFkZEV2ZW50TGlzdGVuZXIiLCJ0ZXh0Iiwibm9kZSIsImNyZWF0ZVRleHROb2RlIiwiYXBwZW5kQ2hpbGQiLCJ0ZXh0RHluIiwiZiIsInRleHRDb250ZW50IiwiY2hpbGQiLCJpdGVyIiwiaXRlbXNJdGVyIiwibWFwcGVyIiwiaXRlckR5biIsImRpc3Bvc2VycyIsIml0ZXJFbmQiLCJjcmVhdGVDb21tZW50IiwiZGlzcG9zZXIiLCJpbnNlcnRCZWZvcmUiLCJyZW1vdmUiLCJyb290IiwiU2lnbmFsIiwiaWQiLCJydW5uaW5nRWZmZWN0SWQiLCJzaWduYWxTdWJzIiwic2V0Iiwic2lnbmFsVmFsdWVzIiwic3ViSWRzIiwic3ViSWQiLCJydW5FZmZlY3QiLCJNYXAiLCJlZmZlY3RzIiwic2lnbmFsSWQiLCJTeW1ib2wiLCJlZmZlY3QiLCJlZmZlY3RJZCIsInByZXZFZmZlY3RJZCIsIkxldHRlckJ0biIsInNsaWNlIiwiaXNJbnZhbGlkIiwicHJvcHMiLCJ3aW5kb3ciLCJlIiwiY2hhciIsImNvZGUiLCJ0b0xvd2VyQ2FzZSIsImludmFsaWRJbmRleGVzSW5uZXIiLCJpbnZhbGlkSW5kZXhlcyIsImZvdW5kIiwiZmluZCIsIl9yZWYyIiwibm90SW52YWxpZCIsImlzVmFsaWQiLCJ0cmlnZ2VySW52YWxpZEluZGV4IiwiaWkiLCJkZWxldGUiLCJfcmVmMyJdLCJzb3VyY2VSb290IjoiIn0=