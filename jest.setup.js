import '@testing-library/jest-dom';

jest.mock('next/image', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('img', props),
  };
});

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock(
  'react-diagnostics',
  () => ({
    withDiagnostics: {
      detailed: (Component) => Component,
    },
  }),
  { virtual: true }
);

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
