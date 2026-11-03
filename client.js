window.__ModuleLoader__.load({
  id: '@local/dsh-settings-sidebar',
  factory(require) {
    const React = require('react');
    const { createSnapshotStore } = require('@deepseek-ai/dsh-client-store');
    const h = React.createElement;
    const ID = 'local-settings-sidebar';
    const NS = ID;
    const STORAGE = '@local/dsh-settings-sidebar/visibility-v2';
    const LEGACY_STORAGE = '@local/dsh-settings-sidebar/pins-v1';
    const aliases = { dafeiyu: 'mcp-manager', 'dsh-workbuddy2api-gateway': 'workbuddy2api-gateway-panel' };
    // Escape menu labels as CSS strings rather than interpreting them as selectors.
    const cssString = value => '"' + value.replace(/[\\"\u0000-\u001f\u007f]/g, char => `\\${char.codePointAt(0).toString(16)} `) + '"';
    const dictionaries = {
      zh: {
        title: '侧栏菜单管理', intro: '统一管理左侧功能菜单，包括原有菜单和本插件。',
        hint: '开关立即生效，名称与侧边栏一致。隐藏本插件后，仍可从「设置 → 侧栏菜单管理」恢复。选择保存在当前客户端中。',
        native: '主页面', modal: '设置弹窗', launcher: '侧栏菜单入口',
        search: '搜索菜单', empty: '没有匹配的菜单',
        pinned: '显示 {count} 项', all: '侧栏菜单', toggle: '在侧栏显示：{name}',
        open: '打开', back: '返回菜单管理', opening: '正在打开对应设置…',
        failed: '无法打开设置。请重新打开设置弹窗或重启应用后重试。',
        storageError: '无法保存菜单选择，请检查当前客户端的本地存储是否可用。',
        loadError: '已保存的菜单选择无法读取。重新勾选可保存新的选择。',
        foot: '仅控制功能菜单在主界面侧栏中的显示，不停用插件，也不移除设置中的入口。',
      },
      en: {
        title: 'Sidebar menus', intro: 'Manage every sidebar panel, including existing entries and this plugin.',
        hint: 'Changes appear immediately, using the same names as the sidebar. Restore this plugin from Settings → Sidebar menus. Choices stay in this client.',
        native: 'Main page', modal: 'Settings dialog', launcher: 'Sidebar menu launcher',
        search: 'Search menus', empty: 'No matching menus',
        pinned: '{count} visible', all: 'Sidebar menus', toggle: 'Show in sidebar: {name}',
        open: 'Open', back: 'Back to menu management', opening: 'Opening the matching Settings section…',
        failed: 'Could not open Settings. Reopen Settings or restart the application and try again.',
        storageError: 'Could not save menu choices. Check that local storage is available in this client.',
        loadError: 'Saved choices could not be read. Select menus again to save new choices.',
        foot: 'Only sidebar panel visibility changes. Plugins remain enabled and Settings entries remain available.',
      },
    };
    const css = `
      .ssm-page{box-sizing:border-box;height:100%;overflow:auto;padding:clamp(24px,4vw,56px);color:var(--dsw-alias-label-primary);font-family:inherit}
      .ssm-inner{max-width:880px;margin:0 auto}.ssm-settings{height:auto;padding:8px 0}
      .ssm-page h1{font-size:24px;line-height:1.4;font-weight:600;margin:0 0 12px}
      .ssm-page p{font-size:14px;line-height:1.7;margin:0 0 8px;color:var(--dsw-alias-label-secondary)}
      .ssm-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:28px 0 12px}
      .ssm-search{box-sizing:border-box;width:min(300px,65%);height:36px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:0 12px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px}
      .ssm-count{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
      .ssm-list{border-top:1px solid var(--dsw-alias-border-l1)}
      .ssm-row{min-height:64px;display:flex;align-items:center;gap:14px;padding:12px 0;box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l1)}
      .ssm-name{flex:1;min-width:0;font-size:14px;overflow-wrap:anywhere}.ssm-mode{display:block;margin-top:4px;font-size:12px;color:var(--dsw-alias-label-secondary)}
      .ssm-button{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);padding:7px 12px;font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
      .ssm-button:hover{background:var(--dsw-alias-bg-layer-2)}
      .ssm-switch{width:34px;height:20px;border:1px solid var(--dsw-alias-border-l2);border-radius:20px;position:relative;cursor:pointer;background:var(--dsw-alias-bg-layer-2);padding:0;flex:none}
      .ssm-switch::after{content:'';position:absolute;top:3px;left:3px;width:12px;height:12px;border-radius:50%;background:var(--dsw-alias-label-secondary);transition:transform .15s ease-out}
      .ssm-switch[aria-checked=true]{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
      .ssm-switch[aria-checked=true]::after{transform:translateX(14px);background:var(--dsw-alias-bg-base)}
      .ssm-page :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}
      .ssm-error{color:var(--dsw-alias-state-error-primary)!important;margin-top:12px!important}
      .ssm-foot{margin-top:18px!important;font-size:12px!important}.ssm-empty{padding:28px 0}
      @media(prefers-reduced-motion:reduce){.ssm-switch::after{transition:none}}
    `;
    function MenuIcon({ size = 18 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', 'aria-hidden': true },
        h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 3 }), h('path', { d: 'M9 4v16m4-11h4m-4 6h4' }));
    }
    function Manager(props) {
      const { rows, error } = props.useMenus(s => s);
      const [query, setQuery] = React.useState('');
      const matches = rows.filter(row => row.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
      return h('section', { className: `ssm-page${props.embedded ? ' ssm-settings' : ''}`, 'aria-label': props.t('title') },
        h('div', { className: 'ssm-inner' },
          h('h1', null, props.t('title')), h('p', null, props.t('intro')), h('p', null, props.t('hint')),
          h('div', { className: 'ssm-toolbar' },
            h('input', { className: 'ssm-search', type: 'search', value: query, 'aria-label': props.t('search'), placeholder: props.t('search'), onChange: e => setQuery(e.target.value) }),
            h('span', { className: 'ssm-count' }, props.t('pinned', { count: rows.filter(row => row.visible).length }))),
          error && h('p', { className: 'ssm-error', role: 'alert' }, props.t(error)),
          h('div', { className: 'ssm-list', 'aria-label': props.t('all') },
            matches.length === 0 && h('p', { className: 'ssm-empty' }, props.t('empty')),
            ...matches.map(row => h('div', { key: row.id, className: 'ssm-row' },
              h(MenuIcon, { size: 18 }),
              h('div', { className: 'ssm-name' }, row.label, h('span', { className: 'ssm-mode' }, props.t(row.launcher ? 'launcher' : row.target ? 'native' : 'modal'))),
              !row.launcher && h('button', { type: 'button', className: 'ssm-button', onClick: () => props.open(row.id) }, props.t('open')),
              h('button', { type: 'button', className: 'ssm-switch', role: 'switch', 'aria-label': props.t('toggle', { name: row.label }), 'aria-checked': row.visible, onClick: () => props.toggle(row.id) })))),
          h('p', { className: 'ssm-foot' }, props.t('foot'))));
    }
    function PolicyStyles(props) {
      const { rows, navLabel } = props.useMenus(s => s);
      // Scope to the host's global-panel nav, never Settings or workspace controls.
      const selectors = rows.filter(row => row.provided && !row.visible).map(row => `nav[aria-label=${cssString(navLabel)}] button[aria-label=${cssString(row.label)}]`);
      return h('style', { 'data-plugin': ID }, css + (selectors.length ? `${selectors.join(',')}{display:none!important}` : ''));
    }
    function Redirect(props) {
      const [failed, setFailed] = React.useState(false);
      React.useEffect(() => { setFailed(!props.open()); }, [props.open]);
      return h('section', { className: 'ssm-page' }, h('h1', null, props.label),
        h('p', { role: failed ? 'alert' : 'status', className: failed ? 'ssm-error' : undefined }, props.t(failed ? 'failed' : 'opening')),
        h('button', { type: 'button', className: 'ssm-button', onClick: () => setFailed(!props.open()) }, props.t('open')),
        ' ', h('button', { type: 'button', className: 'ssm-button', onClick: props.back }, props.t('back')));
    }
    return {
      inject: ['slots', 'locale', 'layout'],
      apply(ctx) {
        for (const [language, dict] of Object.entries(dictionaries)) ctx.effect(() => ctx.locale.register(NS, language, dict));
        const t = ctx.locale.bind(NS), sidebarT = ctx.locale.bind('sidebar');
        const entries = key => ctx.slots.entriesOfSlot(key);
        const labelOf = entry => typeof entry.options.label === 'function' ? entry.options.label() : entry.options.label ?? entry.options.id;
        const targetOf = id => {
          const key = aliases[id] || id;
          return id !== 'plugins' && entries('main').some(entry => entry.options.key === key) ? key : null;
        };
        let visibility = {}, initialError = null;
        try {
          const raw = localStorage.getItem(STORAGE);
          if (raw !== null) {
            const value = JSON.parse(raw);
            if (value?.version !== 2 || !value.visibility || Array.isArray(value.visibility) || typeof value.visibility !== 'object' || !Object.values(value.visibility).every(v => typeof v === 'boolean')) throw new Error('Invalid sidebar visibility');
            visibility = value.visibility;
          } else {
            const old = JSON.parse(localStorage.getItem(LEGACY_STORAGE) || '[]');
            if (!Array.isArray(old) || !old.every(id => typeof id === 'string')) throw new Error('Invalid saved pins');
            for (const id of old) {
              const target = targetOf(id);
              visibility[target ? `panel:${target}` : `settings:${id}`] = true;
            }
          }
        } catch (error) {
          console.error('Could not read sidebar visibility', error);
          initialError = 'loadError';
        }
        const menus = createSnapshotStore({ rows: [], visibility, navLabel: sidebarT('panels.label'), error: initialError });
        const registrations = new Map();
        let previousPanel = ctx.layout.panelInfo.getSnapshot().activePanelId;
        if (previousPanel?.startsWith(`${ID}:`)) previousPanel = null;
        let disposed = false, queued = false, signature = '';
        function openShortcut(sectionId) {
          const target = previousPanel !== null && !entries('main').some(entry => entry.options.key === previousPanel) ? null : previousPanel;
          ctx.layout.selectPanel(target);
          const opened = openSettings(sectionId);
          if (!opened) menus.update(d => { d.error = 'failed'; });
          return opened;
        }
        function followPanel() {
          const active = ctx.layout.panelInfo.getSnapshot().activePanelId;
          const shortcut = [...registrations.values()].find(entry => entry.sectionId && entry.panelId === active);
          if (shortcut) openShortcut(shortcut.sectionId);
          else previousPanel = active;
        }
        function openSettings(id) {
          if (!entries('settings.section').some(entry => entry.options.id === id)) return false;
          const handle = entries('sidebar.settings')[0]?.store;
          if (!handle || typeof handle === 'function') return false;
          const instance = handle.create();
          if (instance !== handle.create() || typeof instance.actions.openSection !== 'function') return false;
          instance.actions.openSection(id);
          return true;
        }
        function open(id) {
          const row = menus.getSnapshot().rows.find(item => item.id === id);
          if (!row || row.launcher) return false;
          if (row.target) {
            const handle = entries('sidebar.settings')[0]?.store;
            if (handle && typeof handle !== 'function') {
              const instance = handle.create();
              if (instance === handle.create()) instance.actions.close();
            }
            ctx.layout.selectPanel(row.target);
            return true;
          }
          const opened = openSettings(row.sectionId);
          if (!opened) menus.update(d => { d.error = 'failed'; });
          return opened;
        }
        function toggle(id) {
          const state = menus.getSnapshot(), row = state.rows.find(item => item.id === id);
          if (!row) return;
          const next = { ...state.visibility, [id]: !row.visible };
          try { localStorage.setItem(STORAGE, JSON.stringify({ version: 2, visibility: next })); }
          catch (error) {
            console.error('Could not save sidebar visibility', error);
            menus.update(d => { d.error = 'storageError'; });
            return;
          }
          menus.update(d => { d.visibility = next; d.error = null; });
          reconcile();
        }
        const managerInject = () => ({ t, hooks: { menus }, open, toggle });
        function reconcile() {
          if (disposed || !ctx.slots.spec('main') || !ctx.slots.spec('sidebar.panellist')) return;
          const ownPanelIds = new Set([...registrations.values()].map(registration => registration.panelId));
          const sidebar = entries('sidebar.panellist').filter(entry => !ownPanelIds.has(entry.options.id));
          const rowsById = new Map(sidebar.map(entry => {
            const target = entry.options.id, id = `panel:${target}`;
            return [id, { id, target, label: labelOf(entry), provided: true, defaultVisible: true }];
          }));
          for (const entry of entries('settings.section')) {
            const sectionId = entry.options.id, target = targetOf(sectionId);
            const id = target ? `panel:${target}` : `settings:${sectionId}`;
            // Sidebar metadata owns the name when a Settings section opens that panel.
            if (!rowsById.has(id)) rowsById.set(id, { id, sectionId, target, label: labelOf(entry), provided: false, defaultVisible: false });
          }
          rowsById.set('chrome:more', { id: 'chrome:more', label: sidebarT('panels.more'), launcher: true, provided: true, defaultVisible: true });
          const prefs = menus.getSnapshot().visibility;
          const rows = [...rowsById.values()].map(row => ({ ...row, visible: Object.hasOwn(prefs, row.id) ? prefs[row.id] : row.defaultVisible }));
          const navLabel = sidebarT('panels.label');
          const nextSignature = JSON.stringify([rows, navLabel]);
          if (signature !== nextSignature) {
            signature = nextSignature;
            menus.update(d => { d.rows = rows; d.navLabel = navLabel; });
          }
          const wanted = new Map(rows.filter(row => row.visible && !row.provided).map(row => [row.id, row]));
          for (const [id, registration] of registrations) {
            if (!wanted.has(id) || registration.signature !== JSON.stringify(wanted.get(id))) {
              registration.dispose();
              registrations.delete(id);
            }
          }
          for (const [id, row] of wanted) {
            if (registrations.has(id)) continue;
            const disposers = [], panelId = row.target || `${ID}:${row.sectionId}`;
            try {
              if (!row.target) disposers.push(ctx.slots.register({ name: 'main', key: panelId, inject: () => ({
                t, label: row.label, back: () => ctx.layout.selectPanel(previousPanel), open: () => openShortcut(row.sectionId),
              }) }, Redirect));
              disposers.push(ctx.slots.register({ name: 'sidebar.panellist', id: panelId, label: row.label, order: 30 + rows.indexOf(row) }, MenuIcon));
            } catch (error) {
              for (const dispose of disposers.reverse()) dispose();
              console.error('Could not register sidebar menu', error);
              menus.update(d => { d.error = 'failed'; });
              continue;
            }
            registrations.set(id, { panelId, sectionId: row.target ? null : row.sectionId, signature: JSON.stringify(row), dispose: () => { for (const dispose of [...disposers].reverse()) dispose(); } });
          }
        }
        function schedule() {
          if (queued || disposed) return;
          queued = true;
          queueMicrotask(() => { queued = false; reconcile(); });
        }
        ctx.effect(() => () => {
          disposed = true;
          for (const registration of registrations.values()) registration.dispose();
          registrations.clear();
        });
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: ID, inject: managerInject }, Manager));
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: ID, order: 20, label: () => t('title') }, MenuIcon));
        ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: ID, order: 110, label: () => t('title'), inject: () => ({ ...managerInject(), embedded: true }) }, Manager));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name: 'shell.overlay', id: ID, inject: () => ({ hooks: { menus } }) }, PolicyStyles));
        ctx.on('slots/changed', key => { if (['settings.section', 'sidebar.panellist', 'main'].includes(key)) schedule(); });
        ctx.on('locale/change', schedule);
        // Modal shortcuts restore the previous main selection before opening Settings.
        ctx.effect(() => ctx.layout.panelInfo.subscribe(followPanel));
        schedule();
      },
    };
  },
});
