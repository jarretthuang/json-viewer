import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './page';

describe('CUJ regression coverage', () => {
  test('app loads and JSON tree renders from editor sample', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('jsonviewer.io')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /example/i }));
    await user.click(screen.getByText('View'));

    expect(await screen.findByLabelText(/json viewer tree/i)).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  test('expand and collapse toolbar interactions work', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /example/i }));
    await user.click(screen.getByText('View'));

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
    await user.click(screen.getByText('View'));
    await user.click(screen.getByRole('button', { name: /expand/i }));

    expect(screen.queryByText('taglib-uri')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /unescape/i }));
    expect(await screen.findByText('taglib-uri')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /undo unescape/i }));
    await waitFor(() => {
      expect(screen.queryByText('taglib-uri')).not.toBeInTheDocument();
    });
  });

  test('mobile/nav expanded panel visibility toggles', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('MoreHorizIcon'));
    expect(await screen.findByText('JSON Viewer')).toBeInTheDocument();

    await user.click(screen.getByTestId('CloseIcon'));
    await waitFor(() => {
      expect(screen.queryByText('JSON Viewer')).not.toBeInTheDocument();
    });
  });
});
