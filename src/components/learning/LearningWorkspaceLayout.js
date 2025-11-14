import React, { useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const DEFAULT_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 576,
  xxs: 0
};

export const DEFAULT_COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};

const BASE_LAYOUTS = {
  lg: [
    { i: 'video', x: 0, y: 0, w: 4, h: 12, minW: 3, minH: 8 },
    { i: 'text', x: 4, y: 0, w: 4, h: 12, minW: 3, minH: 8 },
    { i: 'chat', x: 8, y: 0, w: 4, h: 12, minW: 3, minH: 8 },
    { i: 'assignment', x: 8, y: 12, w: 4, h: 7, minW: 3, minH: 5 }
  ],
  md: [
    { i: 'video', x: 0, y: 0, w: 5, h: 12, minW: 3, minH: 8 },
    { i: 'text', x: 5, y: 0, w: 5, h: 12, minW: 3, minH: 8 },
    { i: 'chat', x: 0, y: 12, w: 5, h: 12, minW: 3, minH: 8 },
    { i: 'assignment', x: 5, y: 12, w: 5, h: 7, minW: 3, minH: 5 }
  ],
  sm: [
    { i: 'video', x: 0, y: 0, w: 6, h: 12, minW: 3, minH: 8 },
    { i: 'text', x: 0, y: 12, w: 6, h: 12, minW: 3, minH: 8 },
    { i: 'chat', x: 0, y: 24, w: 6, h: 12, minW: 3, minH: 8 },
    { i: 'assignment', x: 0, y: 36, w: 6, h: 7, minW: 3, minH: 5 }
  ],
  xs: [
    { i: 'video', x: 0, y: 0, w: 4, h: 12, minW: 2, minH: 8 },
    { i: 'text', x: 0, y: 12, w: 4, h: 12, minW: 2, minH: 8 },
    { i: 'chat', x: 0, y: 24, w: 4, h: 12, minW: 2, minH: 8 },
    { i: 'assignment', x: 0, y: 36, w: 4, h: 7, minW: 2, minH: 5 }
  ],
  xxs: [
    { i: 'video', x: 0, y: 0, w: 2, h: 12, minW: 1, minH: 8 },
    { i: 'text', x: 0, y: 12, w: 2, h: 12, minW: 1, minH: 8 },
    { i: 'chat', x: 0, y: 24, w: 2, h: 12, minW: 1, minH: 8 },
    { i: 'assignment', x: 0, y: 36, w: 2, h: 7, minW: 1, minH: 5 }
  ]
};

const WIDGET_KEYS = ['video', 'text', 'chat', 'assignment'];

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const ensureLayoutArray = (layouts, breakpoint) => {
  if (layouts && Array.isArray(layouts[breakpoint])) {
    return deepClone(layouts[breakpoint]);
  }
  return deepClone(BASE_LAYOUTS[breakpoint]);
};

const enforceWidgetPresence = (layoutItems, includeAssignment, breakpoint) => {
  const requiredKeys = includeAssignment ? WIDGET_KEYS : WIDGET_KEYS.filter(key => key !== 'assignment');
  const baseItems = BASE_LAYOUTS[breakpoint];

  const filtered = layoutItems
    .filter(item => requiredKeys.includes(item.i))
    .map(item => {
      const base = baseItems.find(baseItem => baseItem.i === item.i);
      return {
        ...item,
        minW: item.minW ?? base?.minW ?? 1,
        minH: item.minH ?? base?.minH ?? 1
      };
    });

  requiredKeys.forEach(key => {
    if (!filtered.some(item => item.i === key)) {
      const baseItem = baseItems.find(base => base.i === key);
      if (baseItem) {
        filtered.push({ ...baseItem });
      }
    }
  });

  return filtered;
};

export const normalizeLayouts = (layouts, includeAssignment) => {
  const normalized = {};

  Object.keys(BASE_LAYOUTS).forEach(breakpoint => {
    const layoutItems = ensureLayoutArray(layouts, breakpoint);
    normalized[breakpoint] = enforceWidgetPresence(layoutItems, includeAssignment, breakpoint);
  });

  return normalized;
};

export const createDefaultLayouts = (includeAssignment = false) =>
  normalizeLayouts(undefined, includeAssignment);

const LearningWorkspaceLayout = ({
  widgets,
  layouts,
  hasAssignment,
  onLayoutsChange,
  rowHeight = 40,
  margin = [16, 16],
  containerPadding = [0, 0]
}) => {
  const activeWidgetKeys = useMemo(() => {
    const base = ['video', 'text', 'chat'];
    if (hasAssignment && widgets.assignment) {
      base.push('assignment');
    }
    return base.filter(key => !!widgets[key]);
  }, [hasAssignment, widgets]);

  return (
    <div className="learning-workspace-layout">
      <ResponsiveGridLayout
        className="workspace-grid"
        layouts={layouts}
        breakpoints={DEFAULT_BREAKPOINTS}
        cols={DEFAULT_COLS}
        rowHeight={rowHeight}
        margin={margin}
        containerPadding={containerPadding}
        compactType="vertical"
        draggableHandle=".workspace-widget-handle"
        preventCollision={false}
        resizeHandles={['s', 'w', 'e', 'n', 'sw', 'se', 'nw', 'ne']}
        onLayoutChange={(_, allLayouts) => {
          if (onLayoutsChange) {
            onLayoutsChange(allLayouts);
          }
        }}
      >
        {activeWidgetKeys.map(key => (
          <div key={key} className="workspace-grid-item h-full">
            {widgets[key]}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default LearningWorkspaceLayout;

