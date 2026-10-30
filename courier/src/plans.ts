import {Shot, Actor} from './Stage';

const bike = (x: any, o: any = {}, y: any = 630, s: any = 1): Actor => ({k: 'bike', who: undefined, x, y, s, o});
const juno = (x: any, y: any, s: any, mood: any = 'normal', extra: Partial<Actor> = {}): Actor => ({k: 'juno', who: 'JUNO', x, y, s, mood, ...extra});
const bolt = (x: any, y: any, s: any, mood: any = 'normal', extra: Partial<Actor> = {}): Actor => ({k: 'bolt', who: 'BOLT', x, y, s, mood, ...extra});
const crane = (x: any, y: any, s: any, mood: any = 'smug', extra: Partial<Actor> = {}): Actor => ({k: 'crane', who: 'CRANE', x, y, s, mood, ...extra});
const ada = (x: any, y: any, s: any, extra: Partial<Actor> = {}): Actor => ({k: 'ada', who: 'ADA', x, y, s, ...extra});
const horde = (n: number, x0: number, x1: number, y: number, o: any = {}, s = 0.8, flip = false): Actor => ({k: 'horde', x: 0, y, s, flip, o: {n, x0, x1, ...o}});
const text = (t: string, x: any, y: any, o: any = {}, extra: Partial<Actor> = {}): Actor => ({k: 'text', x, y, s: 1, o: {text: t, ...o}, ...extra});
const radio = (x: any, y: any, s: any): Actor => ({k: 'radio', who: 'ADA', x, y, s});

export const PILLS: Record<string, string> = {
  s01: 'DEAD CITY|3 YEARS AFTER',
  s02: 'HAVEN DISPATCH|CALLING',
  s03: '11:02 PM|OLD PHARMACY, FIFTH',
  s04: 'THE DEAD MALL|DO NOT MAKE NOISE',
  s05: 'THE HOLLOW|MAYOR CRANE',
  s06: 'HIGHWAY 9|7 HOURS TO SUNRISE',
  s07: '3:40 AM|SERVICE TUNNEL',
  s08: 'THE RAIL YARD|BIG BETTY',
  s09: '4:55 AM|THE TRADE',
  s10: '5:30 AM|OVERPASS',
  s11: 'SUNRISE|800 METRES',
  s12: 'HAVEN TOWER|DAY ONE',
};

export const PLANS: Record<string, Shot[]> = {
  s01: [
    {at: 0, bg: 'dawnCity', sp: 1.2, fx: ['speed'], a: [bike([-420, 640], {speed: 1.4})]},
    {at: 19, bg: 'dawnCity', sp: 1.5, sh: 1, fx: ['speed'], a: [horde(5, 1900, 1250, 800, {}, 0.8, true), bike(640, {lean: -6, bm: 'scared'}), text('HONK!', 960, 330, {size: 240, col: '#f2b84b', stroke: 10}, {vis: [0.2, 2.5], rot: [-6, 4]})]},
    {at: 31, bg: 'dawnCity', sp: 2.4, sh: 0.6, fx: ['speed'], a: [horde(8, -250, 200, 800, {run: true}, 0.8), bike([560, 760], {speed: 2})]},
    {at: 40, bg: 'dawnCity', sp: 2.0, fx: ['speed'], a: [horde(6, -250, 150, 800, {run: true}), bike(620, {jump: 320, speed: 1.6, lean: -10, bm: 'scared', jm: 'happy'}), text('JUMP!', 960, 260, {size: 200, col: '#fff', stroke: 10}, {vis: [0.6, 3]})]},
    {at: 45, bg: 'roof', z: [1.18, 1], a: [bike(700, {speed: 0.3, jm: 'happy', bm: 'happy'}, 640, 1.05)]},
    {at: 57, bg: 'black', z: [1, 1.08], a: [text('THE LAST', 960, 480, {size: 200, col: '#f5f5f0', stroke: 8}, {s: [0.8, 1]}), text('COURIER', 960, 720, {size: 280, col: '#f2b84b', stroke: 10}, {s: [0.8, 1]})]},
  ],
  s02: [
    {at: 0, bg: 'roof', z: [1, 1.1], a: [{k: 'old', x: 1480, y: 520, s: 1.5}, bike(520, {speed: 0.2, jm: 'happy', bm: 'happy'}, 640, 1.0), text('PEACHES', 1480, 300, {size: 110, col: '#f2b84b', stroke: 8}, {vis: [2, 7]})]},
    {at: 14, bg: 'roof', z: [1.05, 1], a: [juno(430, 600, 1.3), bolt(980, 740, 1.2, 'normal'), radio(1500, 640, 1.5)]},
    {at: 34, bg: 'overpass', z: [1, 1.1], a: [juno(560, 620, 1.5, 'normal'), radio(1450, 560, 2.1), bolt(1000, 860, 0.9)]},
    {at: 51, bg: 'roof', a: [bolt(1000, 640, 1.6, 'scared', {rot: [0, -6]}), juno(420, 640, 1.2, 'sad'), radio(1560, 660, 1.4)]},
    {at: 57, bg: 'roof', dim: 0.15, z: [1, 1.2], a: [juno(960, 620, 1.9, 'sad', {rot: [0, 3]})]},
    {at: 82, bg: 'dawnCity', sp: 2, fx: ['speed'], a: [bike([-300, 2300], {speed: 2})]},
  ],
  s03: [
    {at: 0, bg: 'pharmacy', z: [1, 1.08], a: [{k: 'cooler', x: 1500, y: 520, s: 1.6, o: {glow: 1}}, juno(380, 620, 1.4, 'normal'), bolt(1000, 720, 1.4, 'scared')]},
    {at: 24, bg: 'pharmacy', z: [1, 1.2], dim: 0.35, a: [{k: 'cooler', x: 960, y: 560, s: [3.2, 3.6], rot: [-2, 2], o: {glow: 1}}]},
    {at: 33, bg: 'pharmacy', sh: 1.2, tint: '#e0483e', a: [juno(430, 640, 1.4, 'scared'), bolt(1100, 740, 1.4, 'scared'), text('???', 1500, 300, {size: 200, col: '#e0483e', stroke: 8}, {vis: [3, 9]})]},
    {at: 43, bg: 'pharmacy', sh: 1.4, a: [juno(480, 640, 1.3, 'scared'), bolt(980, 720, 1.2, 'scared'), {k: 'zombie', x: 1400, y: [1300, 760], s: 1.3, rot: 0}, {k: 'zombie', x: 1700, y: [1400, 800], s: 1.2}, {k: 'zombie', x: 1100, y: [1500, 840], s: 1.1}, text('GROAAAN', 1100, 220, {size: 150, col: '#7fa86a', stroke: 8}, {vis: [0, 5]})]},
    {at: 55, bg: 'nightHwy', sp: 2.2, fx: ['speed'], sh: 0.6, a: [horde(7, -300, 100, 800, {run: true}, 0.8), bike([-250, 760], {speed: 2})]},
  ],
  s04: [
    {at: 0, bg: 'mall', z: [1, 1.1], a: [horde(10, 900, 900, 800, {}, 0.8), bike(420, {speed: 0.2, jm: 'normal'}, 650, 0.95)]},
    {at: 14, bg: 'mall', tint: '#4a6aff', a: [horde(10, 900, 900, 800, {}, 0.8), bike([420, 900], {speed: 0.3, jm: 'scared', bm: 'scared'}, 650, 0.95), text('SHHHH', 960, 240, {size: 200, col: '#f5f5f0', stroke: 8}, {vis: [0, 3]})]},
    {at: 21, bg: 'mall', sh: 0.8, a: [horde(10, 900, 900, 800, {run: true, arms: 1}, 0.8), bike(900, {speed: 0.1, jm: 'scared', bm: 'scared'}, 650, 0.95), text('SQUEAK!', 960, 260, {size: 220, col: '#e0483e', stroke: 10}, {vis: [0, 2.5], rot: [-4, 4]})]},
    {at: 30, bg: 'mall', sh: 1.2, fx: ['speed'], a: [horde(9, -200, 400, 800, {run: true}, 0.8), bike([500, 1500], {speed: 2, jump: 120, lean: -4, jm: 'scared'}, 650, 0.95)]},
    {at: 39, bg: 'mall', z: [1, 1.15], a: [bolt(960, 640, [1.8, 2.2], 'happy', {o: {props: false}}), text('HACKING...', 960, 220, {size: 140, col: '#5dff9e', stroke: 8}, {vis: [0, 4]})]},
    {at: 43, bg: 'mall', a: [horde(10, 700, 1900, 800, {}, 0.8), bike(420, {speed: 0.2, jm: 'happy', bm: 'happy'}, 650, 0.95), text('♪ ♫ ♪', 1450, 300, {size: 200, col: '#f2b84b', stroke: 8}, {rot: [-10, 10]})]},
    {at: 54, bg: 'nightHwy', sp: 2.0, fx: ['speed'], a: [bike([-300, 760], {speed: 2, jm: 'happy', bm: 'happy'})]},
  ],
  s05: [
    {at: 0, bg: 'nightHwy', sp: 0.4, a: [{k: 'bus', x: [2400, 1250], y: 710, s: 1.05}, horde(10, 2500, 1750, 840, {}, 0.7, true), bike(420, {speed: 0.2, jm: 'scared', bm: 'scared'}, 650, 0.9)]},
    {at: 5, bg: 'nightHwy', tint: '#7a1a2a', z: [1, 1.1], a: [crane(1380, 560, 1.6), {k: 'bus', x: 900, y: 880, s: 0.45}]},
    {at: 15, bg: 'nightHwy', a: [juno(480, 620, 1.3, 'scared'), {k: 'bus', x: 1350, y: 700, s: 1.0}]},
    {at: 17, bg: 'nightHwy', tint: '#7a1a2a', a: [crane(1380, 560, 1.6, 'smug'), juno(380, 780, 0.8, 'normal')]},
    {at: 21, bg: 'nightHwy', a: [{k: 'bus', x: 1300, y: 710, s: 1.05}, horde(10, 1900, 1900, 840, {}, 0.7, true), bike(420, {speed: 0.2}, 650, 0.9), text('♪ ♫', 700, 300, {size: 160, col: '#f2b84b', stroke: 6}, {rot: [-12, 12]})]},
    {at: 26, bg: 'nightHwy', tint: '#7a1a2a', z: [1.1, 1], a: [crane(1380, 560, 1.7, 'smug')]},
    {at: 41, bg: 'nightHwy', a: [juno(480, 620, 1.4, 'sad'), bolt(1000, 760, 1.2, 'scared'), {k: 'bus', x: 1650, y: 760, s: 0.5}]},
    {at: 48, bg: 'nightHwy', tint: '#7a1a2a', a: [crane(1380, 560, 1.7, 'smug')]},
    {at: 52, bg: 'nightHwy', a: [juno(480, 620, 1.5, 'angry'), bolt(1000, 760, 1.2, 'normal')]},
    {at: 56, bg: 'nightHwy', tint: '#7a1a2a', z: [1, 1.2], a: [crane(1380, 560, 1.8, 'angry')]},
    {at: 60, bg: 'nightHwy', sp: 1.2, sh: 1.2, fx: ['red', 'speed'], a: [{k: 'bus', x: 1500, y: 710, s: 1.05}, horde(12, 1700, 300, 840, {run: true}, 0.7, true), bike(420, {speed: 1.5, jm: 'scared', bm: 'scared'}, 650, 0.9)]},
  ],
  s06: [
    {at: 0, bg: 'nightHwy', sp: 2.2, sh: 0.8, fx: ['speed'], a: [{k: 'bus', x: [-500, -300], y: 710, s: 0.9}, bike(740, {speed: 2, bp: true, jm: 'angry', bm: 'happy'}, 650, 1.0)]},
    {at: 18, bg: 'bridge', sp: 1.6, fx: ['speed'], a: [bike([300, 720], {speed: 1.8, bp: true, bm: 'scared', jm: 'scared'}, 660, 1.0), text('10 METRES', 1400, 540, {size: 100, col: '#e0483e', stroke: 8}, {vis: [0, 12]})]},
    {at: 34, bg: 'bridge', sp: 0.3, z: [1, 1.3], a: [bike([500, 1500], {speed: 0.8, jump: 300, lean: -12, bp: true, bm: 'happy', jm: 'happy'}, 650, 1.0), crane(1650, 240, 0.6, 'angry', {vis: [0, 12]})]},
    {at: 45, bg: 'bridge', sp: 0, a: [{k: 'bus', x: [-300, 350], y: 700, s: 1}, crane(1350, 560, 1.5, 'smug')]},
  ],
  s07: [
    {at: 0, bg: 'tunnel', z: [1, 1.08], a: [juno(520, 620, 1.4, 'normal'), bolt(1380, 720, 1.4, 'normal'), {k: 'cooler', x: 960, y: 880, s: 1.0, o: {glow: 1}}]},
    {at: 21, bg: 'tunnel', z: [1, 1.18], a: [juno(960, 620, [1.9, 2.1], 'sad', {rot: [0, 2]})]},
    {at: 38, bg: 'tunnel', z: [1, 1.1], a: [{k: 'cooler', x: 760, y: 700, s: 2.4, o: {glow: 1}}, juno(1450, 640, 1.2, 'normal'), bolt([1700, 1050], 700, 1.5, 'scared')]},
    {at: 51, bg: 'tunnel', dim: 0.3, sh: 0.4, a: [juno(520, 620, 1.4, 'scared'), bolt(1380, 720, 1.4, 'scared'), text('...BOOM...', 960, 220, {size: 110, col: '#e0483e', stroke: 8}, {vis: [0, 6]})]},
  ],
  s08: [
    {at: 0, bg: 'yard', sp: 0.25, z: [1, 1.1], a: [horde(12, 800, 800, 800, {}, 0.75), bike(420, {speed: 0.2, jm: 'scared', bm: 'scared'}, 650, 0.9)]},
    {at: 8, bg: 'yard', sh: 1.2, a: [horde(12, 800, 800, 800, {}, 0.75), {k: 'betty', x: 1350, y: [1100, 330], s: 1.7}, bike(420, {speed: 0.2, jm: 'scared', bm: 'scared'}, 650, 0.9), text('BETTY', 1350, 160, {size: 160, col: '#e0483e', stroke: 10}, {vis: [3, 20]})]},
    {at: 28, bg: 'yard', sp: 2, sh: 1, fx: ['speed'], a: [{k: 'betty', x: [1700, 1000], y: 360, s: 1.5, o: {swing: 1}}, bike(540, {speed: 2, jm: 'scared', bm: 'scared'}, 650, 0.95)]},
    {at: 42, bg: 'yard', z: [1, 1.2], a: [bolt(960, 620, [1.8, 2.1], 'scared'), text('HORNS!', 960, 200, {size: 150, col: '#f2b84b', stroke: 8}, {vis: [3, 9]})]},
    {at: 52, bg: 'yard', sh: 1.4, a: [{k: 'betty', x: 1250, y: [360, 1300], s: 1.5, rot: [0, -40]}, bolt([600, 1300], [300, 460], 1.1, 'scared', {o: {props: true}}), horde(10, 300, 1200, 800, {run: true}), text('HONK HONK HONK', 960, 200, {size: 120, col: '#f2b84b', stroke: 8}, {vis: [0, 8]})]},
    {at: 62, bg: 'yard', a: [juno(420, 640, 1.3, 'scared'), crane(1400, 560, 1.5, 'smug'), bolt(960, [380, 440], 0.9, 'scared', {rot: [-8, 8]})]},
    {at: 70, bg: 'yard', a: [juno(420, 700, 1.2, 'sad'), {k: 'bus', x: 1500, y: 720, s: 0.9}, horde(6, 1000, 900, 840, {}, 0.7)]},
  ],
  s09: [
    {at: 0, bg: 'nightHwy', dim: 0.15, a: [juno(480, 660, 1.5, 'sad'), crane(1400, 560, 1.5, 'smug'), {k: 'cage', x: 960, y: 520, s: 1.1}, bolt(960, 590, 0.6, 'scared')]},
    {at: 25, bg: 'nightHwy', z: [1, 1.12], a: [{k: 'cooler', x: 960, y: 620, s: 2.6, o: {open: [0, 1], glow: 1}}, crane(1620, 460, 1.0, 'smug')]},
    {at: 36, bg: 'nightHwy', dim: 0.2, a: [{k: 'note', x: 700, y: 520, s: [1.4, 2.2], rot: [-6, -2]}, crane(1500, 560, 1.5, 'scared')]},
    {at: 43, bg: 'nightHwy', z: [1, 1.2], a: [juno(960, 600, 1.9, 'scared', {rot: [0, 2]})]},
    {at: 53, bg: 'nightHwy', sp: 2.3, sh: 1, fx: ['speed'], a: [{k: 'bus', x: [-400, -100], y: 710, s: 0.9}, bike([-250, 820], {speed: 2.2, jm: 'angry', bm: 'scared'}, 650, 1.0)]},
  ],
  s10: [
    {at: 0, bg: 'overpass', a: [juno(480, 620, 1.4, 'sad'), bolt(1000, 760, 1.2, 'sad', {o: {look: 0.2}}), radio(1560, 640, 1.8)]},
    {at: 30, bg: 'storybook', z: [1, 1.08], a: [ada(700, 600, 1.6, {o: {v: 'mom'}, who: undefined}), bolt(1250, 760, 0.8, 'happy', {who: undefined}), {k: 'baby', x: 960, y: 900, s: 1.1}]},
    {at: 47, bg: 'overpass', z: [1, 1.15], a: [juno(520, 620, 1.7, 'sad'), bolt(1400, 740, 1.4, 'sad')]},
    {at: 62, bg: 'overpass', tint: '#ff9a4a', z: [1, 1.1], a: [juno(520, 620, 1.5, 'normal', {o: {look: 0.8}}), radio(1500, 640, 1.8), text('♪ BOOM ... BOOM', 1200, 220, {size: 90, col: '#e0483e', stroke: 6}, {vis: [4, 25]})]},
    {at: 87, bg: 'dawnCity', sp: 0.1, z: [1, 1.1], a: [bike(700, {speed: 0.1, jm: 'angry', bm: 'normal'}, 650, 1.1), text('DELIVER ME.', 960, 300, {size: 150, col: '#f2b84b', stroke: 10}, {vis: [1, 10]})]},
  ],
  s11: [
    {at: 0, bg: 'haven', sp: 1.2, z: [1, 1.1], fx: ['speed'], a: [horde(8, -300, 500, 830, {run: true}, 0.75), horde(8, 2300, 1400, 830, {run: true}, 0.75, true), bike(960, {speed: 1.6}, 680, 0.9)]},
    {at: 11, bg: 'haven', sp: 2.4, sh: 1, fx: ['speed'], a: [horde(10, -400, 300, 830, {run: true}, 0.75), bike([760, 860], {speed: 2.2, lean: -4, bm: 'scared'}, 680, 0.9), crane(1600, 260, 0.7, 'angry', {who: 'CRANE'})]},
    {at: 37, bg: 'haven', z: [1, 1.15], a: [bolt(900, 640, [1.8, 2.0], 'happy'), {k: 'tower', x: 1650, y: 700, s: 1.3}, juno(300, 740, 0.8, 'scared')]},
    {at: 53, bg: 'haven', sh: 0.8, fx: ['speed'], a: [bolt([560, 1500], [620, 300], 1.1, 'happy', {o: {props: true}}), {k: 'tower', x: 1650, y: 700, s: 1.3}, juno(300, 740, 1.0, 'scared')]},
    {at: 66, bg: 'haven', sh: 1.6, z: [1, 1.2], a: [{k: 'tower', x: 1500, y: 780, s: 2.0, o: {hot: 1}}, bolt(1500, 270, 0.9, 'happy', {o: {props: true}}), horde(12, 300, 1300, 830, {run: true}, 0.75), text('HONK!!', 960, 220, {size: 200, col: '#f2b84b', stroke: 10}, {vis: [0, 8]})]},
    {at: 76, bg: 'haven', sp: 1.5, fx: ['flash', 'speed'], sh: 1, a: [{k: 'bus', x: 650, y: 740, s: 0.9}, horde(14, 1200, 700, 830, {run: true}, 0.75, true), bike([200, 1800], {speed: 2.4, jm: 'happy'}, 680, 0.9)]},
  ],
  s12: [
    {at: 0, bg: 'havenIn', a: [juno(480, 640, 1.5, 'sad'), ada(1400, 640, 1.5, {mood: 'happy'})]},
    {at: 11, bg: 'sunriseWin', z: [1, 1.08], a: [juno(960, 760, 1.2, 'sad', {o: {look: 0.6}})]},
    {at: 20, bg: 'haven', a: [{k: 'crowd', x: 200, y: 800, s: 1.0, o: {n: 14, gap: 120}}, text('DAY 100', 960, 220, {size: 160, col: '#f2b84b', stroke: 10}, {vis: [0, 10]}), ada(1500, 720, 0.8, {mood: 'happy', op: 0.0})]},
    {at: 36, bg: 'haven', a: [bike([200, 900], {speed: 0.2, jm: 'sad', nobolt: true}, 700, 1.0), bolt(1450, 880, 0.9, 'sad', {rot: 70})]},
    {at: 43, bg: 'haven', z: [1, 1.2], a: [juno(480, 640, 1.5, 'happy'), bolt(1400, 820, 1.3, 'normal', {rot: 80})]},
    {at: 52, bg: 'sunriseWin', z: [1, 1.15], a: [juno(960, 640, 2.1, 'happy')]},
    {at: 63, bg: 'black', a: [radio(960, 460, 1.6), text('NEW JOB', 960, 760, {size: 100, col: '#f5f5f0', stroke: 6}, {s: [0.9, 1]}), text('PACKAGE 4,418', 960, 900, {size: 130, col: '#f2b84b', stroke: 8}, {s: [0.9, 1]}), text('THE END', 960, 1010, {size: 56, col: '#aab', stroke: 0}, {vis: [14, 40]})]},
  ],
};
