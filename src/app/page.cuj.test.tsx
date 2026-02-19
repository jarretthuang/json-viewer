import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './page';

describe('CUJ regression coverage', () => {
  test('app loads and JSON tree renders from editor sample', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('jsonviewer.io')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /example/i }));
    await user.click(screen.getByRole('tab', { name: /^view$/i }));

    expect(await screen.findByLabelText(/json viewer tree/i)).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  test('expand and collapse toolbar interactions work', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /example/i }));
    await user.click(screen.getByRole('tab', { name: /^view$/i }));

    const tree = await screen.findByLabelText(/json viewer tree/i);

    await user.click(screen.getByRole('button', { name: /expand/i }));
    expect(await within(tree).findByText('web-app')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /collapse/i }));
    await waitFor(() => {
      expect(within(tree).queryByText('web-app')).not.toBeInTheDocument();
    });
  });

  test('unescape/undo path toggles nested JSON visibility', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /example/i }));
    await user.click(screen.getByRole('tab', { name: /^view$/i }));
    await user.click(screen.getByRole('button', { name: /expand/i }));

    expect(screen.queryByText('taglib-uri')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /unescape/i }));
    expect(await screen.findByText('taglib-uri')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /undo unescape/i }));
    await waitFor(() => {
      expect(screen.queryByText('taglib-uri')).not.toBeInTheDocument();
    });
  });

  test('tree Enter/Space toggles expansion and does not start inline edit', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /example/i }));
    await user.click(screen.getByRole('tab', { name: /^view$/i }));

    await user.click(screen.getByText('JSON'));
    await user.keyboard('{Enter}');

    expect(await screen.findByText('web-app')).toBeInTheDocument();
    expect(screen.queryByLabelText(/edit key JSON/i)).not.toBeInTheDocument();

    await user.keyboard(' ');
    await waitFor(() => {
      expect(screen.queryByText('web-app')).not.toBeInTheDocument();
    });
  });

  test('nav controls expose accessible button labels', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go forward/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share url/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /more options/i })).toBeInTheDocument();
  });

  test('mobile/nav expanded panel visibility toggles', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /more options/i }));
    expect(await screen.findByRole('dialog', { name: /json viewer information/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close information panel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /json viewer information/i })).not.toBeInTheDocument();
    });
  });
});
