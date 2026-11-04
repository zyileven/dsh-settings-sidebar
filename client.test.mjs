import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./client.js', import.meta.url), 'utf8');
const ID = 'local-settings-sidebar';
const KEY = '@local/dsh-settings-sidebar/visibility-v2';
function boot(storage = new Map()) {
  let definition, failWrite = false;
  const listeners = new Map(), effects = [], queues = [];
  const slots = new Map();
  const add = (name, options, component = () => null) => {
    const entry = { options, component };
    slots.set(name, [...(slots.get(name) || []), entry]);
    return entry;
  };
  for (const name of ['main', 'sidebar.panellist', 'settings.section', 'shell.overlay', 'sidebar.settings']) slots.set(name, []);
  for (const key of ['plugins', 'mcp-manager', 'schedules', 'xmanrui-dsh-im']) add('main', { key });
  for (const [id, label] of [['plugins', '插件'], ['mcp-manager', '大肥鱼军械库'], ['schedules', '自动化任务']]) add('sidebar.panellist', { id, label });
  for (const [id, label] of [['general', '通用设置'], ['dafeiyu', '大肥鱼'], ['plugins', '内置插件'], ['xmanrui-dsh-im', 'IM机器人']]) add('settings.section', { id, label });
  const opened = [], selected = [], panelListeners = new Set();
  let panel = { activePanelId: null }, settingsOpen = false;
  const navigate = id => {
    assert(id === null || slots.get('main').some(entry => entry.options.key === id));
    selected.push(id);
    panel = { activePanelId: id };
    for (const listener of panelListeners) listener();
  };
  const instance = { actions: {
    openSection(id) { opened.push(id); settingsOpen = true; },
    close() { settingsOpen = false; },
  } };
  add('sidebar.settings', {}).store = { create: () => instance };
  const emit = key => listeners.get('slots/changed')?.(key);
  const createSnapshotStore = initial => {
    let state = initial;
    return { getSnapshot: () => state, update(fn) { const next = structuredClone(state); fn(next); state = next; } };
  };
  runInNewContext(source, {
    window: { __ModuleLoader__: { load: value => { definition = value; } } },
    queueMicrotask: fn => queues.push(fn), console: { error() {} },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem(key, value) { if (failWrite) throw new Error('storage blocked'); storage.set(key, value); } },
  });
  const plugin = definition.factory(name => name === 'react' ? {
    createElement: (type, props, ...children) => ({ type, props, children }), useState: () => ['', () => {}],
  } : { createSnapshotStore });
  const ctx = {
    effect(fn) { const dispose = fn(); if (dispose) effects.push(dispose); },
    on(key, fn) { listeners.set(key, fn); },
    locale: { register: () => () => {}, bind: ns => key => ns === 'sidebar' ? ({ 'panels.label': '全局面板', 'panels.more': '更多' })[key] : key === 'title' ? '侧栏菜单管理' : key },
    layout: { selectPanel: navigate, panelInfo: {
      getSnapshot: () => panel,
      subscribe(listener) { panelListeners.add(listener); return () => panelListeners.delete(listener); },
    } },
    slots: {
      spec: key => slots.has(key), entriesOfSlot: key => slots.get(key) || [],
      register(options, component) {
        assert(!slots.get(options.name).some(entry => (entry.options.id ?? entry.options.key) === (options.id ?? options.key)));
        const entry = add(options.name, options, component); entry.inject = options.inject;
        emit(options.name);
        return () => { slots.set(options.name, slots.get(options.name).filter(item => item !== entry)); emit(options.name); };
      },
      inject(key, fn) { const dispose = fn(); effects.push(dispose); },
    },
  };
  plugin.apply(ctx);
  const flush = () => { let turns = 0; while (queues.length) { assert(++turns < 40, 'reconciliation converges'); queues.shift()(); } };
  flush();
  const manager = slots.get('main').find(entry => entry.options.key === ID).inject();
  const style = () => {
    const entry = slots.get('shell.overlay').find(entry => entry.options.id === ID);
    const props = entry.inject();
    return entry.component({ useMenus: selector => selector(props.hooks.menus.getSnapshot()) }).children.join('');
  };
  return { slots, manager, storage, selected, opened, flush, style, emit, add, navigate,
    currentPanel: () => panel.activePanelId,
    settingsOpen: () => settingsOpen,
    closeSettings: () => instance.actions.close(),
    panelListenerCount: () => panelListeners.size,
    state: () => manager.hooks.menus.getSnapshot(),
    toggle(id) { manager.toggle(id); flush(); },
    failWrites() { failWrite = true; },
    stop() { for (const dispose of effects.reverse()) dispose(); flush(); },
  };
}

test('uses sidebar names, includes all native panels and the manager, and separates plugin settings', () => {
  const app = boot(), rows = app.state().rows;
  assert.equal(rows.find(row => row.id === 'panel:mcp-manager').label, '大肥鱼军械库');
  assert(!rows.some(row => row.label === '大肥鱼'));
  for (const id of ['panel:plugins', 'panel:schedules', `panel:${ID}`, 'chrome:more', 'settings:plugins']) assert(rows.some(row => row.id === id));
});
test('all native entries, including Plugins and this manager, can be hidden and restored without deleting Settings', () => {
  const app = boot();
  for (const id of ['panel:mcp-manager', 'panel:plugins', 'panel:schedules', `panel:${ID}`, 'chrome:more']) app.toggle(id);
  for (const row of app.state().rows.filter(row => row.provided)) assert.equal(row.visible, false);
  assert(app.style().includes('nav[aria-label="全局面板"] button[aria-label="大肥鱼军械库"]'));
  assert(app.style().includes('button[aria-label="插件"]'));
  assert(app.slots.get('settings.section').some(entry => entry.options.id === ID));
  assert(app.slots.get('main').some(entry => entry.options.key === ID));
  for (const id of ['panel:mcp-manager', 'panel:plugins', 'panel:schedules', `panel:${ID}`, 'chrome:more']) app.toggle(id);
  assert(!app.style().includes('display:none!important'));
});
test('settings shortcuts register once, open their section, and disappear on removal; native pages stay native', () => {
  const app = boot();
  app.toggle('settings:general');
  assert.equal(app.slots.get('sidebar.panellist').filter(entry => entry.options.id === `${ID}:general`).length, 1);
  app.navigate(`${ID}:general`);
  assert.equal(app.opened.at(-1), 'general');
  app.toggle('panel:xmanrui-dsh-im');
  assert.equal(app.slots.get('sidebar.panellist').filter(entry => entry.options.id === 'xmanrui-dsh-im').length, 1);
  app.closeSettings();
  app.navigate('xmanrui-dsh-im');
  assert.equal(app.settingsOpen(), false);
  assert.equal(app.selected.at(-1), 'xmanrui-dsh-im');
  app.toggle('settings:general');
  assert(!app.slots.get('sidebar.panellist').some(entry => entry.options.id === `${ID}:general`));
});
test('visibility survives reload and migrates existing saved pins', () => {
  const storage = new Map([['@local/dsh-settings-sidebar/pins-v1', '["general","xmanrui-dsh-im"]']]);
  let app = boot(storage);
  assert(app.state().rows.find(row => row.id === 'settings:general').visible);
  assert(app.state().rows.find(row => row.id === 'panel:xmanrui-dsh-im').visible);
  app.toggle('panel:mcp-manager'); app.toggle(`panel:${ID}`); app.stop();
  app = boot(storage);
  assert.equal(app.state().rows.find(row => row.id === 'panel:mcp-manager').visible, false);
  assert.equal(app.state().rows.find(row => row.id === `panel:${ID}`).visible, false);
  assert.equal(JSON.parse(storage.get(KEY)).version, 2);
});
test('failed writes preserve visible state; invalid saved preferences report errors', () => {
  const app = boot(); app.failWrites(); app.toggle('panel:plugins');
  assert.equal(app.state().error, 'storageError');
  assert.equal(app.state().rows.find(row => row.id === 'panel:plugins').visible, true);
  const invalid = boot(new Map([[KEY, '{"version":2,"visibility":{"panel:plugins":"false"}}']]));
  assert.equal(invalid.state().error, 'loadError');
});
test('live sidebar names update and CSS label punctuation cannot become a selector', () => {
  const app = boot();
  const entry = app.slots.get('sidebar.panellist').find(entry => entry.options.id === 'mcp-manager');
  entry.options.label = 'A"] , button { color:red }\\\n';
  app.emit('slots/changed'); app.emit('sidebar.panellist'); app.flush();
  app.toggle('panel:mcp-manager');
  assert(app.style().includes('A\\22 ] , button { color:red }\\5c \\a '));
  assert(!app.style().includes('aria-label="A"] , button'));
});
test('unload disposes policy styles and optional registrations without removing original panels', () => {
  const app = boot(); app.toggle('settings:general'); app.toggle('panel:plugins'); app.stop();
  assert.equal(app.slots.get('shell.overlay').length, 0);
  assert.equal(app.slots.get('sidebar.panellist').length, 3);
  assert.equal(app.slots.get('settings.section').length, 4);
  assert.equal(app.panelListenerCount(), 0);
});
test('modal shortcuts preserve the current main page through opening, closing, and repeated clicks', () => {
  const app = boot();
  app.toggle('settings:general'); app.toggle('settings:plugins');
  for (const previous of ['plugins', 'schedules', null, ID]) {
    app.navigate(previous);
    for (const section of ['general', 'plugins', 'general']) {
      app.navigate(`${ID}:${section}`);
      assert.equal(app.currentPanel(), previous);
      assert.equal(app.settingsOpen(), true);
      assert.equal(app.opened.at(-1), section);
      app.closeSettings();
      assert.equal(app.currentPanel(), previous);
      assert.equal(app.settingsOpen(), false);
    }
  }
});
test('each manager row offers only its visibility switch', () => {
  const app = boot();
  const entry = app.slots.get('main').find(item => item.options.key === ID);
  const props = { ...entry.inject(), useMenus: selector => selector(app.state()) };
  const buttons = [];
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'button') buttons.push(node);
    for (const child of node.children || []) walk(child);
  };
  walk(entry.component(props));
  assert.equal(buttons.length, app.state().rows.length);
  assert(buttons.every(node => node.props.role === 'switch'));
});
test('a removed previous page returns to the conversation instead of an absent panel', () => {
  const app = boot();
  app.toggle('settings:general');
  app.navigate('schedules');
  app.slots.set('main', app.slots.get('main').filter(entry => entry.options.key !== 'schedules'));
  app.navigate(`${ID}:general`);
  assert.equal(app.currentPanel(), null);
  assert.equal(app.opened.at(-1), 'general');
});
