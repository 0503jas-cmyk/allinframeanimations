// Resolve src/kitA/sound/chN.json specs against timing + layout -> story2/cues/chN.json
import fs from 'fs';
const root = new URL('..', import.meta.url).pathname;
const layout = fs.readFileSync(root + 'src/data/layout.ts', 'utf8');
const durs = JSON.parse(fs.readFileSync(root + 'src/data/durations.json', 'utf8'));
for (const n of process.argv.slice(2).map(Number)) {
  const lead = +layout.match(new RegExp(`\\b${n}: \\{lead: (\\d+)`))[1];
  const tail = +layout.match(new RegExp(`\\b${n}: \\{lead: \\d+, tail: (\\d+)`))[1];
  const total = lead + durs[n] + tail;
  const tim = Object.fromEntries(JSON.parse(fs.readFileSync(root + `src/data/timing/ch${n}.json`, 'utf8')).map((s) => [s.id, s]));
  const spec = JSON.parse(fs.readFileSync(root + `src/kitA/sound/ch${n}.json`, 'utf8'));
  const r = (x) => {
    if (typeof x === 'number') return x;
    if (x === 'END') return total;
    const s = tim[x.id];
    if (!s) throw new Error('unknown id ' + x.id);
    return +(lead + (x.end ? s.end : s.start) + (x.off || 0)).toFixed(3);
  };
  const out = {
    music: spec.music.map((m) => ({from: r(m.from), to: r(m.to), mood: m.mood})),
    beds: spec.beds.map((m) => ({from: r(m.from), to: r(m.to), name: m.name, gain: m.gain})),
    sfx: spec.sfx.map((m) => ({t: r(m.at), name: m.name, gain: m.gain})).sort((a, b) => a.t - b.t),
  };
  fs.writeFileSync(root + `story2/cues/ch${n}.json`, JSON.stringify(out, null, 1));
  console.log('ch' + n, 'sfx', out.sfx.length, 'total', total);
}
